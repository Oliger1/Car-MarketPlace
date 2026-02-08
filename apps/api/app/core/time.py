"""
Timezone and datetime utilities
"""
from datetime import datetime, date
from typing import Optional
import pytz
from app.core.config import settings


def get_timezone():
    """Get application timezone"""
    return pytz.timezone(settings.TIMEZONE)


def utc_now() -> datetime:
    """Get current UTC time"""
    return datetime.utcnow()


def now_in_timezone() -> datetime:
    """Get current time in application timezone"""
    utc_time = utc_now()
    return utc_time.replace(tzinfo=pytz.UTC).astimezone(get_timezone())


def to_utc(dt: datetime) -> datetime:
    """Convert datetime to UTC"""
    if dt.tzinfo is None:
        # Assume it's in application timezone
        tz = get_timezone()
        dt = tz.localize(dt)
    return dt.astimezone(pytz.UTC)


def to_local(dt: datetime) -> datetime:
    """Convert datetime to local timezone"""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=pytz.UTC)
    return dt.astimezone(get_timezone())


def format_date(d: date) -> str:
    """Format date for display (Albanian format: DD/MM/YYYY)"""
    return d.strftime("%d/%m/%Y")


def format_datetime(dt: datetime) -> str:
    """Format datetime for display (Albanian format)"""
    local_dt = to_local(dt)
    return local_dt.strftime("%d/%m/%Y %H:%M")