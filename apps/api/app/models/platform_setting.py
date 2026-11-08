"""Key/value platform settings (admins list, blocked slugs) — no Alembic."""
from sqlalchemy import Column, String, Text, DateTime, func

from app.db.base import Base


class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False, default="")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
