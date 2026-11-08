"""Platform settings helpers (extra admins, blocked slugs)."""
from __future__ import annotations

import json
from typing import List

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.platform_setting import PlatformSetting

KEY_ADMINS = "extra_admin_emails"
KEY_BLOCKED_SLUGS = "blocked_slugs"

BUILTIN_RESERVED = {
    "www",
    "app",
    "api",
    "admin",
    "static",
    "cdn",
    "mail",
    "m",
    "mix",
    "localhost",
}


def _get(db: Session, key: str) -> str:
    row = db.query(PlatformSetting).filter(PlatformSetting.key == key).first()
    return row.value if row else ""


def _set(db: Session, key: str, value: str) -> None:
    row = db.query(PlatformSetting).filter(PlatformSetting.key == key).first()
    if not row:
        row = PlatformSetting(key=key, value=value)
        db.add(row)
    else:
        row.value = value
    db.commit()


def _list_json(raw: str) -> List[str]:
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(x).strip().lower() for x in data if str(x).strip()]
    except json.JSONDecodeError:
        pass
    return [x.strip().lower() for x in raw.split(",") if x.strip()]


def extra_admin_emails(db: Session) -> List[str]:
    return _list_json(_get(db, KEY_ADMINS))


def all_admin_emails(db: Session) -> List[str]:
    env = settings.get_platform_admin_emails()
    extras = extra_admin_emails(db)
    out: List[str] = []
    for e in env + extras:
        if e and e not in out:
            out.append(e)
    return out


def is_platform_admin(db: Session, email: str) -> bool:
    return email.strip().lower() in all_admin_emails(db)


def add_admin_email(db: Session, email: str) -> List[str]:
    email = email.strip().lower()
    current = extra_admin_emails(db)
    if email not in current and email not in settings.get_platform_admin_emails():
        current.append(email)
        _set(db, KEY_ADMINS, json.dumps(current))
    return all_admin_emails(db)


def remove_admin_email(db: Session, email: str) -> List[str]:
    email = email.strip().lower()
    if email in settings.get_platform_admin_emails():
        raise ValueError("Ky email vjen nga .env dhe nuk hiqet nga UI")
    current = [e for e in extra_admin_emails(db) if e != email]
    _set(db, KEY_ADMINS, json.dumps(current))
    return all_admin_emails(db)


def blocked_slugs(db: Session) -> List[str]:
    return _list_json(_get(db, KEY_BLOCKED_SLUGS))


def all_reserved_slugs(db: Session) -> set[str]:
    return BUILTIN_RESERVED | set(blocked_slugs(db))


def add_blocked_slug(db: Session, slug: str) -> List[str]:
    slug = slug.strip().lower()
    current = blocked_slugs(db)
    if slug and slug not in current:
        current.append(slug)
        _set(db, KEY_BLOCKED_SLUGS, json.dumps(current))
    return sorted(all_reserved_slugs(db))


def remove_blocked_slug(db: Session, slug: str) -> List[str]:
    slug = slug.strip().lower()
    if slug in BUILTIN_RESERVED:
        raise ValueError("Slug i rezervuar i sistemit")
    current = [s for s in blocked_slugs(db) if s != slug]
    _set(db, KEY_BLOCKED_SLUGS, json.dumps(current))
    return sorted(all_reserved_slugs(db))
