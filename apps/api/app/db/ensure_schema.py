"""Add missing columns without Alembic (safe for local/dev)."""
from sqlalchemy import text

from app.db.base import engine

_ALTERS = [
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS brand_primary VARCHAR(7) DEFAULT '#0f6e6a'",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS brand_accent VARCHAR(7) DEFAULT '#e07a3d'",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS hero_title VARCHAR(200)",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS hero_subtitle TEXT",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS page_sections TEXT",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS listed_on_market BOOLEAN DEFAULT FALSE",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ",
    "ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS requester_email VARCHAR(255)",
    "ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
    """
    CREATE TABLE IF NOT EXISTS platform_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )
    """,
]


def ensure_schema() -> None:
    with engine.begin() as conn:
        for stmt in _ALTERS:
            # driver SQL avoids SQLAlchemy treating ":true" in JSON as binds
            conn.exec_driver_sql(stmt)
