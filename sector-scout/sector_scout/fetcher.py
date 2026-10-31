"""A polite HTTP client: identifies itself, honors robots.txt, spaces out
requests to the same host, retries transient failures, and caps download size."""

from __future__ import annotations

import logging
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

log = logging.getLogger(__name__)

MAX_PAGE_BYTES = 8 * 1024 * 1024
MAX_AUDIO_BYTES = 400 * 1024 * 1024


class FetchError(RuntimeError):
    pass


class BlockedByRobots(FetchError):
    pass


@dataclass
class Response:
    url: str  # final URL after redirects
    status: int
    content: bytes
    content_type: str

    @property
    def text(self) -> str:
        return self.content.decode(_charset(self.content_type) or "utf-8", errors="replace")


def _charset(content_type: str) -> str | None:
    for part in content_type.split(";"):
        part = part.strip()
        if part.lower().startswith("charset="):
            return part.split("=", 1)[1].strip("\"' ") or None
    return None


class Fetcher:
    def __init__(
        self,
        user_agent: str,
        delay_seconds: float = 1.0,
        respect_robots: bool = True,
        timeout: float = 20.0,
    ) -> None:
        self.user_agent = user_agent
        self.delay = delay_seconds
        self.respect_robots = respect_robots
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": user_agent,
            "Accept-Language": "en-US,en;q=0.8",
        })
        retry = Retry(
            total=3,
            backoff_factor=1.5,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=("GET", "HEAD"),
            respect_retry_after_header=True,
        )
        adapter = HTTPAdapter(max_retries=retry, pool_maxsize=16)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        self._robots: dict[str, RobotFileParser] = {}
        self._robots_lock = threading.Lock()
        self._host_locks: dict[str, threading.Lock] = {}
        self._host_last: dict[str, float] = {}
        self._locks_lock = threading.Lock()

    # -- politeness -----------------------------------------------------
    def _wait_for_host(self, host: str) -> None:
        with self._locks_lock:
            lock = self._host_locks.setdefault(host, threading.Lock())
        with lock:
            elapsed = time.monotonic() - self._host_last.get(host, 0.0)
            if elapsed < self.delay:
                time.sleep(self.delay - elapsed)
            self._host_last[host] = time.monotonic()

    def allowed(self, url: str) -> bool:
        if not self.respect_robots:
            return True
        parts = urlsplit(url)
        root = f"{parts.scheme}://{parts.netloc}"
        with self._robots_lock:
            parser = self._robots.get(root)
        if parser is None:
            parser = RobotFileParser()
            try:
                self._wait_for_host(parts.netloc)
                r = self.session.get(f"{root}/robots.txt", timeout=self.timeout)
                if r.status_code in (401, 403):
                    parser.disallow_all = True
                elif r.status_code >= 400:
                    parser.allow_all = True
                else:
                    parser.parse(r.text.splitlines())
            except requests.RequestException:
                parser.allow_all = True
            with self._robots_lock:
                self._robots[root] = parser
        return parser.can_fetch(self.user_agent, url)

    # -- fetching -------------------------------------------------------
    def get(self, url: str, *, check_robots: bool = False, params: dict | None = None,
            max_bytes: int = MAX_PAGE_BYTES) -> Response:
        if check_robots and not self.allowed(url):
            raise BlockedByRobots(f"robots.txt disallows {url}")
        self._wait_for_host(urlsplit(url).netloc)
        try:
            with self.session.get(url, params=params, timeout=self.timeout, stream=True) as r:
                if r.status_code >= 400:
                    raise FetchError(f"HTTP {r.status_code} for {url}")
                chunks, size = [], 0
                for chunk in r.iter_content(64 * 1024):
                    size += len(chunk)
                    if size > max_bytes:
                        raise FetchError(f"Response larger than {max_bytes} bytes: {url}")
                    chunks.append(chunk)
                return Response(
                    url=r.url,
                    status=r.status_code,
                    content=b"".join(chunks),
                    content_type=r.headers.get("Content-Type", ""),
                )
        except requests.RequestException as exc:
            raise FetchError(f"{type(exc).__name__} fetching {url}: {exc}") from exc

    def download(self, url: str, dest: Path, max_bytes: int = MAX_AUDIO_BYTES) -> Path:
        self._wait_for_host(urlsplit(url).netloc)
        try:
            with self.session.get(url, timeout=self.timeout, stream=True) as r:
                if r.status_code >= 400:
                    raise FetchError(f"HTTP {r.status_code} for {url}")
                size = 0
                with dest.open("wb") as fh:
                    for chunk in r.iter_content(256 * 1024):
                        size += len(chunk)
                        if size > max_bytes:
                            raise FetchError(f"Download larger than {max_bytes} bytes: {url}")
                        fh.write(chunk)
        except requests.RequestException as exc:
            raise FetchError(f"{type(exc).__name__} downloading {url}: {exc}") from exc
        return dest
