"""One-shot live smoke against local Postgres + running API."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
import uuid
from datetime import date, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

API = os.environ.get("SMOKE_API", "http://127.0.0.1:8000")


def req(method: str, path: str, body=None, token: str | None = None):
    data = None if body is None else json.dumps(body).encode()
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(API + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=20) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else None, dict(resp.headers)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode()
        try:
            payload = json.loads(raw)
        except Exception:
            payload = raw
        return exc.code, payload, dict(exc.headers)


def main() -> int:
    from app.db.base import engine
    from app.db.ensure_schema import ensure_schema
    from sqlalchemy import text

    ensure_schema()
    with engine.connect() as conn:
        cols = {
            row[0]
            for row in conn.execute(
                text(
                    "SELECT table_name || '.' || column_name FROM information_schema.columns "
                    "WHERE (table_name='booking_requests' AND column_name='requester_email') "
                    "OR (table_name='customers' AND column_name='email')"
                )
            )
        }
    print("schema columns:", sorted(cols))
    assert "booking_requests.requester_email" in cols
    assert "customers.email" in cols

    status, health, _ = req("GET", "/api/health")
    print("health", status, health)
    assert status == 200

    suffix = uuid.uuid4().hex[:8]
    email = f"smoke-{suffix}@example.com"
    slug = f"smoke-{suffix}"
    status, reg, headers = req(
        "POST",
        "/api/auth/register",
        {
            "company_name": f"Smoke {suffix}",
            "slug": slug,
            "city": "Tirane",
            "email": email,
            "password": "smoke-pass-1",
            "phone": "+355690000001",
        },
    )
    print("register", status, reg if status >= 400 else reg.get("message") if isinstance(reg, dict) else reg)
    cookie = headers.get("Set-Cookie") or headers.get("set-cookie")
    print("set-cookie present:", bool(cookie))
    assert status == 201, reg

    status, forgot, _ = req("POST", "/api/auth/forgot-password", {"email": email})
    print("forgot", status, {k: forgot.get(k) for k in ("message", "reset_url", "token")} if isinstance(forgot, dict) else forgot)
    assert status == 200
    assert isinstance(forgot, dict) and forgot.get("reset_url", "").startswith("http")
    assert "token=" in forgot["reset_url"]

    # public request requires a published company — publish via DB
    from app.db.session import SessionLocal
    from app.models.company import Company
    from app.models.car import Car, CarStatus, FuelType, TransmissionType
    from app.models.user import User, UserRole
    from app.core.config import settings

    db = SessionLocal()
    company = db.query(Company).filter(Company.slug == slug).first()
    company.is_published = True
    company.listed_on_market = True
    car = Car(
        company_id=company.id,
        title="Smoke Golf",
        slug="smoke-golf",
        make="VW",
        model="Golf",
        year=2023,
        transmission=TransmissionType.AUTOMATIC,
        fuel=FuelType.PETROL,
        seats=5,
        price_per_day=40,
        currency="EUR",
        status=CarStatus.ACTIVE,
        is_published=True,
    )
    db.add(car)
    db.commit()
    owner = db.query(User).filter(User.company_id == company.id, User.role == UserRole.OWNER).first()
    db.close()

    d1 = (date.today() + timedelta(days=10)).isoformat()
    d2 = (date.today() + timedelta(days=12)).isoformat()
    status, created, _ = req(
        "POST",
        "/api/public/booking-request",
        {
            "company_slug": slug,
            "car_slug": "smoke-golf",
            "requester_name": "Klient Smoke",
            "requester_phone": "+355691111111",
            "requester_email": f"klient-{suffix}@example.com",
            "date_from": d1,
            "date_to": d2,
            "message": "smoke test",
        },
    )
    print("booking-request", status, created)
    assert status == 201, created

    # login to get cookie then convert — API uses cookie. We'll call service via session cookie.
    status, login, login_headers = req(
        "POST",
        "/api/auth/login",
        {"email": email, "password": "smoke-pass-1"},
    )
    print("login", status)
    assert status == 200
    raw_cookie = login_headers.get("Set-Cookie") or login_headers.get("set-cookie") or ""
    token_cookie = raw_cookie.split(";", 1)[0]

    def authed(method, path, body=None):
        data = None if body is None else json.dumps(body).encode()
        r = urllib.request.Request(
            API + path,
            data=data,
            headers={"Content-Type": "application/json", "Cookie": token_cookie},
            method=method,
        )
        try:
            with urllib.request.urlopen(r, timeout=20) as resp:
                raw = resp.read().decode()
                return resp.status, json.loads(raw) if raw else None
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode()
            try:
                payload = json.loads(raw)
            except Exception:
                payload = raw
            return exc.code, payload

    rid = created["id"]
    status, patched, = authed("PATCH", f"/api/booking-requests/{rid}", {"status": "contacted"})
    print("contacted", status, patched.get("status") if isinstance(patched, dict) else patched)
    assert status == 200 and patched["status"] in ("contacted", "CONTACTED")

    status, booking = authed(
        "POST",
        f"/api/booking-requests/{rid}/convert",
        {"date_from": d1, "date_to": d2, "price_total": 80},
    )
    print("convert", status, booking.get("id") if isinstance(booking, dict) else booking)
    assert status == 200, booking

    # request without car cannot convert
    status, bare, _ = req(
        "POST",
        "/api/public/booking-request",
        {
            "company_slug": slug,
            "requester_name": "Pa Makine",
            "requester_phone": "+355692222222",
            "requester_email": f"pamakine-{suffix}@example.com",
        },
    )
    print("request-no-car", status)
    assert status == 201
    status, blocked = authed(
        "POST",
        f"/api/booking-requests/{bare['id']}/convert",
        {"date_from": d1, "date_to": d2},
    )
    print("convert-blocked", status, blocked)
    assert status == 400

    print("email mode:", "live" if settings.RESEND_API_KEY else "no-op (no RESEND_API_KEY)")
    print("owner", owner.email)
    print("LIVE SMOKE OK", slug)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
