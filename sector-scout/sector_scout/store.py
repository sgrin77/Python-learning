"""SQLite knowledge base: every item seen and every practice extracted.

Doubles as a cache, so re-running within the same week does not pay to
re-analyze items that were already processed."""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from .analyze import ItemExtraction, Practice
from .models import Item

SCHEMA = """
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    sector TEXT NOT NULL,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT,
    source TEXT,
    published TEXT,
    text_source TEXT,
    chars INTEGER,
    first_seen TEXT NOT NULL,
    analyzed_with TEXT,
    analyzed_at TEXT,
    relevant INTEGER,
    summary TEXT
);
CREATE TABLE IF NOT EXISTS practices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT NOT NULL REFERENCES items(id),
    sector TEXT NOT NULL,
    title TEXT NOT NULL,
    practice TEXT NOT NULL,
    why_it_works TEXT,
    how_to_apply TEXT,
    evidence TEXT,
    tags TEXT,
    confidence TEXT,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS practices_item ON practices(item_id);
CREATE INDEX IF NOT EXISTS practices_sector ON practices(sector);
"""

FTS_SCHEMA = """
CREATE VIRTUAL TABLE IF NOT EXISTS practices_fts USING fts5(
    title, practice, why_it_works, evidence, tags,
    content='practices', content_rowid='id'
);
CREATE TRIGGER IF NOT EXISTS practices_ai AFTER INSERT ON practices BEGIN
    INSERT INTO practices_fts(rowid, title, practice, why_it_works, evidence, tags)
    VALUES (new.id, new.title, new.practice, new.why_it_works, new.evidence, new.tags);
END;
CREATE TRIGGER IF NOT EXISTS practices_ad AFTER DELETE ON practices BEGIN
    INSERT INTO practices_fts(practices_fts, rowid, title, practice, why_it_works, evidence, tags)
    VALUES ('delete', old.id, old.title, old.practice, old.why_it_works, old.evidence, old.tags);
END;
"""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class Store:
    def __init__(self, path: str | Path) -> None:
        path = Path(path)
        if str(path) != ":memory:":
            path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(path))
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(SCHEMA)
        try:
            self.conn.executescript(FTS_SCHEMA)
            self.has_fts = True
        except sqlite3.OperationalError:  # SQLite built without FTS5
            self.has_fts = False
        self.conn.commit()

    def close(self) -> None:
        self.conn.close()

    # -- items ---------------------------------------------------------------
    def upsert_item(self, item: Item) -> None:
        self.conn.execute(
            """INSERT INTO items (id, sector, kind, title, url, source, published,
                                  text_source, chars, first_seen)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET
                   url=excluded.url,
                   text_source=COALESCE(excluded.text_source, items.text_source),
                   chars=COALESCE(excluded.chars, items.chars)""",
            (item.id, item.sector, item.kind, item.title, item.url, item.source,
             item.published.isoformat() if item.published else None,
             item.text_source or None, len(item.text) or None, _now()),
        )
        self.conn.commit()

    def cached_extraction(self, item_id: str, analyzer: str) -> ItemExtraction | None:
        row = self.conn.execute(
            "SELECT analyzed_with, relevant, summary FROM items WHERE id = ?", (item_id,)
        ).fetchone()
        if not row or row["analyzed_with"] != analyzer:
            return None
        practices = [
            Practice(
                title=r["title"], practice=r["practice"], why_it_works=r["why_it_works"] or "",
                how_to_apply=json.loads(r["how_to_apply"] or "[]"), evidence=r["evidence"] or "",
                tags=json.loads(r["tags"] or "[]"), confidence=r["confidence"] or "low",
            )
            for r in self.conn.execute(
                "SELECT * FROM practices WHERE item_id = ? ORDER BY id", (item_id,)
            )
        ]
        return ItemExtraction(relevant=bool(row["relevant"]), summary=row["summary"] or "",
                              practices=practices)

    def text_source(self, item_id: str) -> str:
        row = self.conn.execute("SELECT text_source FROM items WHERE id = ?",
                                (item_id,)).fetchone()
        return (row["text_source"] or "") if row else ""

    def save_extraction(self, item: Item, extraction: ItemExtraction, analyzer: str) -> None:
        with self.conn:
            self.conn.execute("DELETE FROM practices WHERE item_id = ?", (item.id,))
            self.conn.execute(
                """UPDATE items SET analyzed_with = ?, analyzed_at = ?, relevant = ?, summary = ?
                   WHERE id = ?""",
                (analyzer, _now(), int(extraction.relevant), extraction.summary, item.id),
            )
            for p in extraction.practices:
                self.conn.execute(
                    """INSERT INTO practices (item_id, sector, title, practice, why_it_works,
                           how_to_apply, evidence, tags, confidence, created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (item.id, item.sector, p.title, p.practice, p.why_it_works,
                     json.dumps(p.how_to_apply), p.evidence, json.dumps(p.tags),
                     p.confidence, _now()),
                )

    # -- search ----------------------------------------------------------------
    def search(self, query: str, sector: str | None = None, limit: int = 20) -> list[dict]:
        params: list = []
        if self.has_fts and query.strip():
            terms = " ".join(f'"{t}"' for t in query.replace('"', " ").split())
            sql = """SELECT p.*, i.title AS item_title, i.url, i.source, i.published
                     FROM practices_fts f JOIN practices p ON p.id = f.rowid
                     JOIN items i ON i.id = p.item_id
                     WHERE practices_fts MATCH ?"""
            params.append(terms)
            order = " ORDER BY bm25(practices_fts)"
        else:
            like = f"%{query.strip()}%"
            sql = """SELECT p.*, i.title AS item_title, i.url, i.source, i.published
                     FROM practices p JOIN items i ON i.id = p.item_id
                     WHERE (p.title LIKE ? OR p.practice LIKE ? OR p.tags LIKE ?)"""
            params += [like, like, like]
            order = " ORDER BY p.created_at DESC"
        if sector:
            sql += " AND p.sector = ?"
            params.append(sector)
        rows = self.conn.execute(sql + order + " LIMIT ?", (*params, limit)).fetchall()
        return [dict(r) for r in rows]

    def stats(self) -> dict[str, int]:
        q = self.conn.execute
        return {
            "items": q("SELECT COUNT(*) FROM items").fetchone()[0],
            "analyzed": q("SELECT COUNT(*) FROM items WHERE analyzed_at IS NOT NULL").fetchone()[0],
            "practices": q("SELECT COUNT(*) FROM practices").fetchone()[0],
        }
