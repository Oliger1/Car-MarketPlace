"""
Custom validators
"""
import re
from typing import Optional


def validate_phone(phone: str) -> bool:
    """
    Validate phone number (Albanian format)
    Accepts: +355..., 06..., 07..., etc
    """
    # Remove spaces and hyphens
    phone = phone.replace(" ", "").replace("-", "")

    # Check formats
    patterns = [
        r'^\+355\d{8,9}$',  # +355 format
        r'^0[67]\d{7,8}$',  # 06/07 format
    ]

    return any(re.match(pattern, phone) for pattern in patterns)


def validate_slug(slug: str) -> bool:
    """
    Validate slug format (lowercase, alphanumeric, hyphens)
    """
    pattern = r'^[a-z0-9-]+$'
    return bool(re.match(pattern, slug))


def validate_year(year: int) -> bool:
    """
    Validate car year
    """
    from datetime import datetime
    current_year = datetime.now().year
    return 1900 <= year <= current_year + 1