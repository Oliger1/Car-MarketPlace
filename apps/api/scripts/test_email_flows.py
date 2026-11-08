"""
Test transactional email flows for klient / partner / admin.

Captures send_email calls (no Resend needed). Run from apps/api:
  .venv/Scripts/python.exe scripts/test_email_flows.py
"""
from __future__ import annotations

import os
import sys
import uuid
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

# Prefer apps/api/.env via pydantic; ensure local DB if unset
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql://postgres:oliger@localhost:5432/mix?sslmode=disable",
)


def main() -> int:
    from fastapi.testclient import TestClient

    import app.services.email_service as email_mod
    from app.main import app
    from app.core.config import settings
    from app.core.rate_limit import limiter

    captured: list[dict] = []

    def fake_send(to: str, subject: str, html: str) -> bool:
        captured.append({"to": to, "subject": subject, "html": html})
        return True

    email_mod.send_email = fake_send  # type: ignore[assignment]

    # Avoid slowapi blocking the smoke (register/forgot are tight).
    limiter.enabled = False

    client = TestClient(app)
    suffix = uuid.uuid4().hex[:8]
    partner_email = f"partner-{suffix}@example.com"
    client_email = f"klient-{suffix}@example.com"
    slug = f"mail-{suffix}"
    failures: list[str] = []

    def expect(label: str, predicate, detail: str = "") -> None:
        ok = any(predicate(m) for m in captured)
        status = "OK" if ok else "FAIL"
        print(f"  [{status}] {label}" + (f" — {detail}" if detail and not ok else ""))
        if not ok:
            failures.append(label)

    def dump_captured(title: str) -> None:
        print(f"\n== {title} ({len(captured)} emails) ==")
        for i, m in enumerate(captured, 1):
            print(f"  {i}. to={m['to']} | {m['subject']}")

    print("RESEND_API_KEY set:", bool(settings.RESEND_API_KEY))
    print("APP_URL:", settings.APP_URL)
    print("PLATFORM_ADMIN:", settings.get_platform_admin_emails())

    # --- Partner: register → welcome ---
    captured.clear()
    r = client.post(
        "/api/auth/register",
        json={
            "company_name": f"Mail Co {suffix}",
            "slug": slug,
            "city": "Tirane",
            "email": partner_email,
            "password": "smoke-pass-1",
            "phone": "+355690000001",
        },
    )
    if r.status_code != 201:
        print("REGISTER FAIL", r.status_code, r.text)
        return 1
    partner_cookie = r.cookies.get("access_token") or r.cookies.get("token")
    # cookie name may vary — keep jar from client
    dump_captured("Partner register")
    expect(
        "Partner ← welcome",
        lambda m: m["to"] == partner_email and "Mirë se vini" in m["subject"],
    )

    # --- Partner: forgot password → reset ---
    captured.clear()
    r = client.post("/api/auth/forgot-password", json={"email": partner_email})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("reset_url"), body
    dump_captured("Partner forgot-password")
    expect(
        "Partner ← password reset",
        lambda m: m["to"] == partner_email and "Rivendosja" in m["subject"],
    )

    # Publish company + car for public request
    from app.db.session import SessionLocal
    from app.models.company import Company
    from app.models.car import Car, CarStatus, FuelType, TransmissionType
    from app.models.user import User, UserRole

    db = SessionLocal()
    company = db.query(Company).filter(Company.slug == slug).first()
    company.is_published = True
    company.listed_on_market = True
    company.is_suspended = False
    car = Car(
        company_id=company.id,
        title="Mail Golf",
        slug="mail-golf",
        make="VW",
        model="Golf",
        year=2023,
        transmission=TransmissionType.AUTOMATIC,
        fuel=FuelType.PETROL,
        seats=5,
        price_per_day=40,
        deposit_amount=200,
        currency="EUR",
        status=CarStatus.ACTIVE,
        is_published=True,
    )
    db.add(car)
    db.commit()
    company_id = str(company.id)
    db.close()

    d1 = (date.today() + timedelta(days=14)).isoformat()
    d2 = (date.today() + timedelta(days=16)).isoformat()

    # --- Klient + Partner: booking request ---
    captured.clear()
    r = client.post(
        "/api/public/booking-request",
        json={
            "company_slug": slug,
            "car_slug": "mail-golf",
            "requester_name": "Klient Test",
            "requester_phone": "+355691111111",
            "requester_email": client_email,
            "date_from": d1,
            "date_to": d2,
            "message": "email flow test",
        },
    )
    assert r.status_code == 201, r.text
    rid = r.json()["id"]
    dump_captured("Booking request (klient+partner)")
    expect(
        "Klient ← request ack",
        lambda m: m["to"] == client_email and "Kërkesa juaj u mor" in m["subject"],
    )
    expect(
        "Partner ← request notify",
        lambda m: m["to"] == partner_email and "Kërkesë e re" in m["subject"],
    )

    # Re-login partner to refresh cookies if needed
    r = client.post(
        "/api/auth/login",
        json={"email": partner_email, "password": "smoke-pass-1"},
    )
    assert r.status_code == 200, r.text

    # --- Klient: convert → confirmed ---
    captured.clear()
    r = client.post(
        f"/api/booking-requests/{rid}/convert",
        json={"date_from": d1, "date_to": d2, "price_total": 80},
    )
    assert r.status_code == 200, r.text
    booking_id = r.json()["id"]
    dump_captured("Convert → booking confirmed")
    expect(
        "Klient ← booking confirmed",
        lambda m: m["to"] == client_email and "konfirmua" in m["subject"].lower(),
    )

    # --- Klient: cancel booking ---
    captured.clear()
    r = client.delete(f"/api/bookings/{booking_id}")
    assert r.status_code == 204, r.text
    dump_captured("Cancel booking")
    expect(
        "Klient ← booking cancelled",
        lambda m: m["to"] == client_email and "anulua" in m["subject"].lower(),
    )

    # --- Admin: invoice + suspend ---
    # Ensure admin user can login
    r = client.post(
        "/api/auth/login",
        json={"email": "admin@mix.al", "password": "admin123"},
    )
    if r.status_code != 200:
        print("ADMIN LOGIN FAIL", r.status_code, r.text)
        print("  (seed admin@mix.al / admin123; PLATFORM_ADMIN_EMAILS must include it)")
        failures.append("Admin login")
    else:
        captured.clear()
        r = client.post(
            f"/api/admin/companies/{company_id}/subscription",
            json={
                "plan_id": "p10",
                "status": "active",
                "create_invoice": True,
                "invoice_notes": "email flow cash",
            },
        )
        if r.status_code != 200:
            print("INVOICE FAIL", r.status_code, r.text)
            failures.append("Admin invoice API")
        else:
            dump_captured("Admin create invoice")
            expect(
                "Partner ← invoice issued",
                lambda m: m["to"] == partner_email and "Faturë" in m["subject"],
            )

        captured.clear()
        r = client.patch(
            f"/api/admin/companies/{company_id}",
            json={"is_suspended": True},
        )
        if r.status_code != 200:
            print("SUSPEND FAIL", r.status_code, r.text)
            failures.append("Admin suspend API")
        else:
            dump_captured("Admin suspend company")
            expect(
                "Partner ← account suspended",
                lambda m: m["to"] == partner_email and "pezullua" in m["subject"].lower(),
            )

    print("\n======= SUMMARY =======")
    if failures:
        print("FAILED:")
        for f in failures:
            print(f"  - {f}")
        return 1

    print("All email flows OK for klient / partner / admin")
    print(
        "Note: RESEND_API_KEY unset → production send is no-op; "
        "this test verified wiring + templates via capture."
        if not settings.RESEND_API_KEY
        else "RESEND_API_KEY is set — live sends would go out on these endpoints."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
