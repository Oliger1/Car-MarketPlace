"""
Smoke checks for prod readiness: email infra, schema fields, templates, CORS helpers.

Run from apps/api:
  python scripts/smoke_verify.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

os.environ.setdefault("DATABASE_URL", "postgresql://mix:mixdev@localhost:5432/mix")


def main() -> int:
    errors: list[str] = []

    # --- settings ---
    from app.core.config import Settings

    s = Settings(
        RESEND_API_KEY="",
        EMAIL_FROM="Mix <test@example.com>",
        APP_URL="https://mix.al",
        DOMAIN="mix.al",
        ENVIRONMENT="production",
    )
    if "https://mix.al" not in s.get_allowed_origins():
        errors.append("CORS apex origin missing for DOMAIN=mix.al")
    regex = s.get_cors_origin_regex()
    if "mix\\.al" not in regex:
        errors.append(f"CORS regex missing domain: {regex}")
    if s.cookie_domain() != ".mix.al":
        errors.append(f"cookie_domain expected .mix.al got {s.cookie_domain()}")

    # --- templates ---
    from app.services.email_service import TEMPLATES_DIR, EmailService, render_template, send_email

    required = [
        "welcome.html",
        "reset.html",
        "request_ack.html",
        "request_partner.html",
        "booking_confirmed.html",
        "booking_cancelled.html",
        "invoice_issued.html",
        "account_suspended.html",
    ]
    for name in required:
        if not (TEMPLATES_DIR / name).exists():
            errors.append(f"missing template {name}")
        else:
            html = render_template(name, **{k: "x" for k in [
                "company_name", "app_url", "dashboard_url", "reset_url",
                "requester_name", "requester_phone", "requester_email",
                "date_from", "date_to", "message", "car_title",
                "amount", "currency", "due_date", "notes", "billing_url",
            ]})
            if "{{" in html:
                errors.append(f"unreplaced placeholders in {name}")

    # fail-soft without API key
    if send_email("nobody@example.com", "smoke", "<p>ok</p>") is not False:
        errors.append("send_email without key should return False")

    # high-level helpers callable
    EmailService.send_welcome("a@b.c", "Demo Co")
    EmailService.send_password_reset("a@b.c", "https://mix.al/reset-password?token=t")
    EmailService.send_request_ack("a@b.c", "Ana", "Demo", "2026-01-01", "2026-01-03")
    EmailService.send_request_partner("p@b.c", "Demo", "Ana", "+355", "a@b.c")
    EmailService.send_booking_confirmed("a@b.c", "Ana", "Demo", "2026-01-01", "2026-01-03", "Golf")
    EmailService.send_booking_cancelled("a@b.c", "Ana", "Demo", "2026-01-01", "2026-01-03")
    EmailService.send_invoice_issued("p@b.c", "Demo", "29.99", "EUR", "2026-01-15", "cash")
    EmailService.send_account_suspended("p@b.c", "Demo")

    # --- models / schemas (source + pydantic; avoid ORM circular import in script) ---
    from app.schemas.booking_request import BookingRequestCreate
    from app.schemas.customer import CustomerCreate

    br_src = (ROOT / "app" / "models" / "booking_request.py").read_text(encoding="utf-8")
    cu_src = (ROOT / "app" / "models" / "customer.py").read_text(encoding="utf-8")
    ensure_src = (ROOT / "app" / "db" / "ensure_schema.py").read_text(encoding="utf-8")

    if "requester_email" not in br_src:
        errors.append("BookingRequest.requester_email missing")
    if "email = Column" not in cu_src:
        errors.append("Customer.email missing")
    if "requester_email" not in ensure_src:
        errors.append("ensure_schema missing requester_email ALTER")
    if "customers ADD COLUMN IF NOT EXISTS email" not in ensure_src:
        errors.append("ensure_schema missing customers.email ALTER")

    try:
        BookingRequestCreate(
            company_slug="demo",
            requester_name="Ana Test",
            requester_phone="+355690000000",
            requester_email="ana@example.com",
        )
    except Exception as exc:  # noqa: BLE001
        errors.append(f"BookingRequestCreate failed: {exc}")

    try:
        CustomerCreate(name="Ana Test", phone="+355690000000", email="ana@example.com")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"CustomerCreate failed: {exc}")

    # seed should not pass listed_on_market to Car
    seed_path = ROOT / "scripts" / "seed.py"
    seed_src = seed_path.read_text(encoding="utf-8")
    if "listed_on_market=True,\n                **car_data" in seed_src or "listed_on_market=True,\n                **car_data" in seed_src.replace(" ", ""):
        errors.append("seed still sets listed_on_market on Car")
    # simpler check: Car( block shouldn't include listed_on_market
    if "Car(\n                company_id=company.id" in seed_src:
        car_block = seed_src.split("Car(", 1)[1].split(")", 1)[0]
        if "listed_on_market" in car_block:
            errors.append("seed Car(...) still has listed_on_market")

    # forgot-password uses APP_URL (static check on auth router)
    auth_src = (ROOT / "app" / "routers" / "auth.py").read_text(encoding="utf-8")
    if "APP_URL" not in auth_src or "send_password_reset" not in auth_src:
        errors.append("auth forgot-password not wired to APP_URL / email")

    # Caddy wildcard
    caddy = (ROOT.parents[1] / "infra" / "caddy" / "Caddyfile").read_text(encoding="utf-8")
    if "*.{$DOMAIN" not in caddy and "*.{$DOMAIN:" not in caddy:
        errors.append("Caddyfile missing wildcard site")

    deploy = (ROOT.parents[1] / ".github" / "workflows" / "deploy.yml").read_text(encoding="utf-8")
    if "alembic upgrade" in deploy.lower():
        errors.append("deploy.yml still calls alembic upgrade")
    if "/api/health" not in deploy:
        errors.append("deploy.yml missing health check")

    if errors:
        print("SMOKE FAIL")
        for e in errors:
            print(f"  - {e}")
        return 1

    print("SMOKE OK")
    print("  email templates + fail-soft")
    print("  requester_email / Customer.email schema")
    print("  CORS / cookie DOMAIN helpers")
    print("  Caddy wildcard + CI without Alembic")
    print("  auth reset uses APP_URL")
    print()
    print("Manual UI→API (with RESEND_API_KEY set):")
    print("  1. Register partner → welcome email")
    print("  2. Forgot password → reset link email")
    print("  3. Storefront booking request with email → partner + client")
    print("  4. Convert request → client confirmation")
    print("  5. Admin create invoice → partner email")
    print("  6. Open slug.DOMAIN storefront")
    print("  7. Admin suspend → removed from market + suspend email")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
