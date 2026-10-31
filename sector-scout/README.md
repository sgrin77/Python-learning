# Sector Scout

Scrapes news and podcasts for the sectors you care about, has Claude pull out
the **best practices** (concrete, repeatable things operators are doing, with
evidence), and writes a weekly digest you can read on your phone or get by email.

Every practice it finds also goes into a local, searchable knowledge base, so
over time you build your own playbook per sector.

## What a digest contains

For each sector:

- **Theme of the week** in one sentence
- **Top practices** (3 to 7), each with what to do, why it matters, first steps,
  a strength rating (strong / emerging / anecdotal) and numbered citations
- **Signals to watch** and **pitfalls to avoid**
- **Sources**: every article and episode cited, with links

Then **cross-sector ideas**: practices from one sector that another could borrow.

## How it works

```
news searches (Google News, Bing News)  ─┐
your own RSS feeds                       ├─> fetch full text ──> Claude: extract practices per item
podcast search (Apple Podcasts directory)│     (articles, transcripts,      │
your own podcast feeds                  ─┘      or show notes)              v
                                                         Claude: rank, merge and cite per sector
                                                                            │
                                         knowledge base (SQLite) <──────────┤
                                                                            v
                                                  digests/YYYY-MM-DD.md + .html (+ optional email)
```

- **News:** Google News and Bing News search feeds for each of your queries, plus
  any publisher RSS feeds you add. Article pages are downloaded and the main text
  is extracted.
- **Podcasts:** shows are discovered by searching the Apple Podcasts directory
  (plus any feeds you list). For each recent episode it uses, in order: the
  published transcript (Podcasting 2.0 `<podcast:transcript>`), local audio
  transcription if you turn it on, or the show notes.
- **Claude:** one call per item extracts 0 to 3 practices (most news has none),
  then one call per sector ranks and merges them into the briefing.
- **Without an API key** it still runs and produces keyword highlights, so you
  can try it for free.

## Quick start

```bash
cd sector-scout
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...      # from console.anthropic.com

python -m sector_scout run --dry-run --max-items 20   # see what it finds, and the cost estimate
python -m sector_scout run --sectors real_estate      # one sector first
python -m sector_scout run                            # all sectors
```

Open `digests/latest.html` in a browser, or read `digests/latest.md`.

Search everything collected so far:

```bash
python -m sector_scout search "renewal"
python -m sector_scout search "due diligence" --sector real_estate
```

## Choose your sectors

Edit [`sectors.yaml`](sectors.yaml). Each sector has:

| Field | What it does |
| --- | --- |
| `name` | Heading in the digest |
| `focus` | Who the advice is for. The sharper this is, the better the practices |
| `news_queries` | Search phrases for the news providers |
| `rss_feeds` | Optional trade publication or blog feeds (best full text) |
| `podcast_search_terms` | Used to discover shows; the top few per term are followed |
| `podcast_feeds` | Optional podcast RSS feeds you always want included |

Tips:

- Phrase queries the way a practitioner would search for advice
  ("property management lessons") rather than as topics ("property management").
- Adding 2 or 3 good `rss_feeds` per sector does more for quality than adding
  more search queries.
- `python -m sector_scout sectors` lists what is configured.

## Cost

Defaults use Claude Opus 5.5 for both steps. With 6 sectors, a weekly run is
roughly **$4 to $8**, mostly the per-item extraction. `--dry-run` prints an
estimate for your actual configuration before you spend anything, and items
already analyzed are never paid for twice.

To cut the extraction cost by roughly 40x, set this in `sectors.yaml`:

```yaml
settings:
  extract_model: claude-haiku-5-5
```

Other levers: fewer sectors or queries, `max_items_per_sector`, or
`--max-items` for a trial run.

## Run it every week automatically

The repo includes [a GitHub Actions workflow](../.github/workflows/sector-scout.yml)
that runs every Monday, commits the digest to `sector-scout/digests/`, shows it
on the run's summary page, and keeps the knowledge base between runs.

1. In GitHub: **Settings > Secrets and variables > Actions > New repository secret**,
   add `ANTHROPIC_API_KEY`.
2. Optional email: add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
   and `DIGEST_TO` (comma separated). For Gmail use `smtp.gmail.com`, port `587`,
   and an [app password](https://support.google.com/accounts/answer/185833).
3. Run it once by hand from the **Actions** tab (**Sector Scout digest > Run workflow**).

The schedule only starts once the workflow is on the default branch.

To email from your own machine instead: set the same variables and run
`python -m sector_scout run --email`.

## Podcast transcription (optional)

Many shows publish transcripts; for the rest, Sector Scout uses show notes. To
transcribe audio locally instead:

```bash
pip install faster-whisper
python -m sector_scout run --transcribe
```

This is CPU heavy (minutes per episode), so it is off by default.

## Being a good citizen

- Identifies itself with a descriptive User-Agent, honors `robots.txt` for
  article pages, waits between requests to the same site, and caps download sizes.
- Stores only what it needs: metadata, a summary, and the extracted practices.
  Full article text is not kept.
- Paywalled articles fall back to the feed snippet.

## Known limits

- **Google News** links are redirects. The `googlenewsdecoder` package resolves
  them to publisher URLs; if Google changes that mechanism, those items fall back
  to headline only (they are listed but not analyzed). Bing results and your own
  feeds are unaffected.
- **Bing News RSS** is an undocumented feature. If it stops returning results,
  the run log shows `bing: 0 results` and you can drop it from `news_providers`.
- Claude only sees what the sources say. Each practice is cited so you can
  check it before acting on it.

## Development

```bash
pip install -r requirements.txt pytest
python -m pytest
```

Tests run fully offline against fixtures in `tests/fixtures` with a fake fetcher
and a fake Claude client.

| Module | Role |
| --- | --- |
| `sources/news.py`, `sources/podcasts.py` | Discovery and feed parsing |
| `fetcher.py` | Polite HTTP client |
| `textutil.py` | Article extraction, transcript parsing, keyword fallback |
| `analyze.py` | Prompts and output schemas for Claude |
| `llm.py` | Anthropic SDK wrapper: structured output, refusal fallback, cost tracking |
| `store.py` | SQLite knowledge base and cache |
| `pipeline.py` | Orchestration |
| `digest.py` | Markdown and HTML rendering |
