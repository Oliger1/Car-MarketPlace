"""
Transactional email via Resend HTTP API (fail-soft).
Missing RESEND_API_KEY → log + no-op (dev-safe).
"""
from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Optional

from app.core.config import settings

logger = logging.getLogger("app.email")

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates" / "email"
RESEND_URL = "https://api.resend.com/emails"


def _load_template(name: str) -> str:
    filename = name if name.endswith(".html") else f"{name}.html"
    path = TEMPLATES_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Email template missing: {filename}")
    return path.read_text(encoding="utf-8")


def render_template(name: str, **ctx: Any) -> str:
    html = _load_template(name)
    for key, value in ctx.items():
        html = html.replace("{{" + key + "}}", "" if value is None else str(value))
    return html


def send_email(to: str, subject: str, html: str) -> bool:
    """Send email via Resend. Returns True on success; fail-soft otherwise."""
    if not to or not to.strip():
        logger.info("email skipped: empty recipient subject=%s", subject)
        return False

    if not settings.RESEND_API_KEY:
        logger.info(
            "email no-op (RESEND_API_KEY unset): to=%s subject=%s",
            to,
            subject,
        )
        return False

    payload = {
        "from": settings.EMAIL_FROM,
        "to": [to.strip()],
        "subject": subject,
        "html": html,
    }
    req = urllib.request.Request(
        RESEND_URL,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            ok = 200 <= resp.status < 300
            if not ok:
                logger.warning("email failed status=%s to=%s subject=%s", resp.status, to, subject)
            return ok
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        logger.warning("email HTTPError to=%s subject=%s detail=%s", to, subject, detail)
        return False
    except Exception as exc:  # noqa: BLE001 — fail-soft for background tasks
        logger.warning("email error to=%s subject=%s err=%s", to, subject, exc)
        return False


def send_template(to: str, subject: str, template: str, **ctx: Any) -> bool:
    return send_email(to, subject, render_template(template, **ctx))


class EmailService:
    """High-level transactional emails (Albanian copy)."""

    @staticmethod
    def send_welcome(to: str, company_name: str) -> bool:
        app_url = settings.APP_URL.rstrip("/")
        return send_template(
            to,
            "Mirë se vini në Mix — prova juaj filloi",
            "welcome",
            company_name=company_name,
            app_url=app_url,
            dashboard_url=f"{app_url}/dashboard",
        )

    @staticmethod
    def send_password_reset(to: str, reset_url: str) -> bool:
        return send_template(
            to,
            "Rivendosja e fjalëkalimit — Mix",
            "reset",
            reset_url=reset_url,
            app_url=settings.APP_URL.rstrip("/"),
        )

    @staticmethod
    def send_request_ack(
        to: str,
        requester_name: str,
        company_name: str,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
    ) -> bool:
        return send_template(
            to,
            f"Kërkesa juaj u mor — {company_name}",
            "request_ack",
            requester_name=requester_name,
            company_name=company_name,
            date_from=date_from or "—",
            date_to=date_to or "—",
            app_url=settings.APP_URL.rstrip("/"),
        )

    @staticmethod
    def send_request_partner(
        to: str,
        company_name: str,
        requester_name: str,
        requester_phone: str,
        requester_email: str,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        message: Optional[str] = None,
    ) -> bool:
        app_url = settings.APP_URL.rstrip("/")
        return send_template(
            to,
            "Kërkesë e re rezervimi — Mix",
            "request_partner",
            company_name=company_name,
            requester_name=requester_name,
            requester_phone=requester_phone,
            requester_email=requester_email or "—",
            date_from=date_from or "—",
            date_to=date_to or "—",
            message=message or "—",
            dashboard_url=f"{app_url}/dashboard/booking-requests",
            app_url=app_url,
        )

    @staticmethod
    def send_booking_confirmed(
        to: str,
        requester_name: str,
        company_name: str,
        date_from: str,
        date_to: str,
        car_title: Optional[str] = None,
    ) -> bool:
        return send_template(
            to,
            f"Rezervimi u konfirmua — {company_name}",
            "booking_confirmed",
            requester_name=requester_name,
            company_name=company_name,
            date_from=date_from,
            date_to=date_to,
            car_title=car_title or "Makina",
            app_url=settings.APP_URL.rstrip("/"),
        )

    @staticmethod
    def send_booking_cancelled(
        to: str,
        requester_name: str,
        company_name: str,
        date_from: str,
        date_to: str,
    ) -> bool:
        return send_template(
            to,
            f"Rezervimi u anulua — {company_name}",
            "booking_cancelled",
            requester_name=requester_name,
            company_name=company_name,
            date_from=date_from,
            date_to=date_to,
            app_url=settings.APP_URL.rstrip("/"),
        )

    @staticmethod
    def send_invoice_issued(
        to: str,
        company_name: str,
        amount: str,
        currency: str,
        due_date: str,
        notes: Optional[str] = None,
    ) -> bool:
        app_url = settings.APP_URL.rstrip("/")
        return send_template(
            to,
            "Faturë e re — Mix",
            "invoice_issued",
            company_name=company_name,
            amount=amount,
            currency=currency,
            due_date=due_date,
            notes=notes or "—",
            billing_url=f"{app_url}/dashboard/billing",
            app_url=app_url,
        )

    @staticmethod
    def send_account_suspended(to: str, company_name: str) -> bool:
        app_url = settings.APP_URL.rstrip("/")
        return send_template(
            to,
            "Llogaria u pezullua — Mix",
            "account_suspended",
            company_name=company_name,
            app_url=app_url,
        )
