"""Deliver Events to you: terminal, phone push (ntfy), email, Discord/Slack, desktop pop-up."""

from __future__ import annotations

import logging
import os
import platform
import shutil
import smtplib
import subprocess
from datetime import datetime
from email.message import EmailMessage

import requests

from .models import BUY, COVER, SELL, SHORT, Event

log = logging.getLogger(__name__)

NTFY_PRIORITY = {"high": 4, "default": 3, "low": 2}
NTFY_TAGS = {
    BUY: "chart_with_upwards_trend",
    COVER: "chart_with_upwards_trend",
    SELL: "chart_with_downwards_trend",
    SHORT: "chart_with_downwards_trend",
}


class ConsoleNotifier:
    def __init__(self, bell: bool = True):
        self.bell = bell

    def send(self, event: Event) -> None:
        stamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ring = "\a" if self.bell and event.priority == "high" else ""
        print(f"{ring}\n[{stamp}] *** {event.title} ***\n{event.body}\n", flush=True)


class NtfyNotifier:
    """Free push notifications to the ntfy phone app (https://ntfy.sh). No account needed.

    Anyone who knows the topic name can read it, so pick something long and random.
    """

    def __init__(self, topic: str, server: str = "https://ntfy.sh", token: str = ""):
        if not topic or topic.startswith("change-me"):
            raise ValueError("alerts.ntfy.topic must be set to your own random topic name")
        self.topic, self.server, self.token = topic, server.rstrip("/"), token

    def send(self, event: Event) -> None:
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        tag = "warning" if event.kind == "health" else NTFY_TAGS.get(event.action or "", "bell")
        resp = requests.post(
            self.server,
            json={
                "topic": self.topic,
                "title": event.title,
                "message": event.body,
                "priority": NTFY_PRIORITY.get(event.priority, 3),
                "tags": [tag],
            },
            headers=headers,
            timeout=15,
        )
        resp.raise_for_status()


class WebhookNotifier:
    """Discord or Slack incoming webhook, or any URL that accepts a JSON POST."""

    def __init__(self, url: str, style: str = "discord"):
        if not url:
            raise ValueError("alerts.webhook.url is empty")
        self.url, self.style = url, style

    def send(self, event: Event) -> None:
        text = f"**{event.title}**\n{event.body}"
        if self.style == "discord":
            payload = {"content": text[:2000]}
        elif self.style == "slack":
            payload = {"text": f"*{event.title}*\n{event.body}"}
        else:
            payload = {"title": event.title, "body": event.body, "kind": event.kind,
                       "priority": event.priority, "action": event.action, "symbol": event.symbol}
        requests.post(self.url, json=payload, timeout=15).raise_for_status()


class EmailNotifier:
    """Plain SMTP. For Gmail, create an App Password (Google Account > Security)."""

    def __init__(self, smtp_host: str, smtp_port: int, username: str, password: str,
                 from_addr: str, to_addrs: list[str], min_priority: str = "default"):
        self.smtp_host, self.smtp_port = smtp_host, int(smtp_port)
        self.username = username
        self.password = password or os.environ.get("MWTRACKER_SMTP_PASSWORD", "")
        self.from_addr = from_addr or username
        self.to_addrs = [a for a in to_addrs if a]
        self.min_rank = {"low": 0, "default": 1, "high": 2}[min_priority]
        if not self.to_addrs:
            raise ValueError("alerts.email.to_addrs is empty")

    def send(self, event: Event) -> None:
        if {"low": 0, "default": 1, "high": 2}[event.priority] < self.min_rank:
            return
        msg = EmailMessage()
        msg["Subject"] = f"[Trade alert] {event.title}"
        msg["From"] = self.from_addr
        msg["To"] = ", ".join(self.to_addrs)
        msg.set_content(event.body)
        with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=30) as smtp:
            smtp.starttls()
            if self.username:
                smtp.login(self.username, self.password)
            smtp.send_message(msg)


class DesktopNotifier:
    """Pop-up notification on macOS (osascript) or Linux (notify-send)."""

    def send(self, event: Event) -> None:
        system = platform.system()
        if system == "Darwin":
            script = (f"display notification {_applescript_str(event.body)} "
                      f"with title {_applescript_str(event.title)} sound name \"Glass\"")
            subprocess.run(["osascript", "-e", script], check=False)
        elif system == "Linux" and shutil.which("notify-send"):
            urgency = "critical" if event.priority == "high" else "normal"
            subprocess.run(["notify-send", "-u", urgency, event.title, event.body], check=False)
        else:
            log.debug("Desktop notifications not supported here; skipping")


def _applescript_str(text: str) -> str:
    return '"' + text.replace("\\", "\\\\").replace('"', '\\"') + '"'


class Dispatcher:
    """Sends each event to every channel. One broken channel never blocks the others."""

    def __init__(self, notifiers: list):
        self.notifiers = notifiers

    def send(self, event: Event) -> None:
        for notifier in self.notifiers:
            try:
                notifier.send(event)
            except Exception as exc:
                log.error("Alert via %s failed: %s", type(notifier).__name__, exc)


def build_notifiers(alerts_cfg: dict) -> list:
    """Create the channels switched on in the [alerts.*] config sections."""
    notifiers: list = []

    def section(name: str) -> dict:
        sec = alerts_cfg.get(name, {})
        return sec if sec.get("enabled") else {}

    if (c := alerts_cfg.get("console", {"enabled": True})).get("enabled", True):
        notifiers.append(ConsoleNotifier(bell=c.get("bell", True)))
    if c := section("ntfy"):
        notifiers.append(NtfyNotifier(c.get("topic", ""), c.get("server", "https://ntfy.sh"),
                                      c.get("token", "")))
    if c := section("webhook"):
        notifiers.append(WebhookNotifier(c.get("url", ""), c.get("style", "discord")))
    if c := section("email"):
        notifiers.append(EmailNotifier(
            c.get("smtp_host", "smtp.gmail.com"), c.get("smtp_port", 587), c.get("username", ""),
            c.get("password", ""), c.get("from_addr", ""), c.get("to_addrs", []),
            c.get("min_priority", "default"),
        ))
    if section("desktop"):
        notifiers.append(DesktopNotifier())
    return notifiers
