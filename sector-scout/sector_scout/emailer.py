"""Optional: email the digest over SMTP (works with Gmail app passwords,
Fastmail, Microsoft 365, SES, and most providers).

Environment variables:
    SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASSWORD,
    DIGEST_TO (comma separated), DIGEST_FROM (defaults to SMTP_USER)
"""

from __future__ import annotations

import os
import smtplib
import ssl
from dataclasses import dataclass
from email.message import EmailMessage


class EmailConfigError(RuntimeError):
    pass


@dataclass
class SmtpSettings:
    host: str
    port: int
    user: str
    password: str
    sender: str
    recipients: list[str]

    @classmethod
    def from_env(cls, env: dict[str, str] | None = None) -> "SmtpSettings":
        env = dict(os.environ if env is None else env)
        missing = [k for k in ("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "DIGEST_TO")
                   if not env.get(k)]
        if missing:
            raise EmailConfigError(f"Missing environment variable(s): {', '.join(missing)}")
        return cls(
            host=env["SMTP_HOST"],
            port=int(env.get("SMTP_PORT") or 587),
            user=env["SMTP_USER"],
            password=env["SMTP_PASSWORD"],
            sender=env.get("DIGEST_FROM") or env["SMTP_USER"],
            recipients=[a.strip() for a in env["DIGEST_TO"].split(",") if a.strip()],
        )


def build_message(subject: str, markdown: str, html: str, sender: str,
                  recipients: list[str]) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)
    msg.set_content(markdown)
    msg.add_alternative(html, subtype="html")
    return msg


def send(msg: EmailMessage, smtp: SmtpSettings) -> None:
    context = ssl.create_default_context()
    if smtp.port == 465:
        with smtplib.SMTP_SSL(smtp.host, smtp.port, context=context, timeout=30) as server:
            server.login(smtp.user, smtp.password)
            server.send_message(msg)
    else:
        with smtplib.SMTP(smtp.host, smtp.port, timeout=30) as server:
            server.starttls(context=context)
            server.login(smtp.user, smtp.password)
            server.send_message(msg)
