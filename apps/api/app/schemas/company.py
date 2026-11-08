"""
Company Schemas
"""
from pydantic import BaseModel, Field, field_validator
from typing import Any, List, Optional
from uuid import UUID
from datetime import datetime
import json


DEFAULT_SECTIONS = [
    {"id": "hero", "on": True},
    {"id": "about", "on": True},
    {"id": "fleet", "on": True},
    {"id": "contact", "on": True},
]

ALLOWED_SECTION_IDS = {"hero", "about", "fleet", "contact"}


def normalize_sections(value: Any) -> List[dict]:
    raw = value
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            raw = None
    if not isinstance(raw, list) or not raw:
        return [dict(s) for s in DEFAULT_SECTIONS]
    out: List[dict] = []
    seen = set()
    for item in raw:
        if not isinstance(item, dict):
            continue
        sid = str(item.get("id") or "")
        if sid not in ALLOWED_SECTION_IDS or sid in seen:
            continue
        seen.add(sid)
        out.append({"id": sid, "on": bool(item.get("on", True))})
    for s in DEFAULT_SECTIONS:
        if s["id"] not in seen:
            out.append(dict(s))
    return out


class CompanyBase(BaseModel):
    """Base company fields"""
    name: str = Field(..., min_length=2, max_length=200)
    city: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=50)
    whatsapp: Optional[str] = Field(None, max_length=50)
    website_url: Optional[str] = None


class CompanyCreate(CompanyBase):
    """Create company"""
    slug: str = Field(..., min_length=2, max_length=100, pattern="^[a-z0-9-]+$")


class CompanyUpdate(BaseModel):
    """Update company"""
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    slug: Optional[str] = Field(None, min_length=2, max_length=100, pattern="^[a-z0-9-]+$")
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=50)
    whatsapp: Optional[str] = Field(None, max_length=50)
    website_url: Optional[str] = None
    is_published: Optional[bool] = None
    listed_on_market: Optional[bool] = None
    brand_primary: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    brand_accent: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    hero_title: Optional[str] = Field(None, max_length=200)
    hero_subtitle: Optional[str] = None
    page_sections: Optional[List[dict]] = None

    @field_validator("page_sections", mode="before")
    @classmethod
    def _sections(cls, v):
        if v is None:
            return v
        return normalize_sections(v)


class CompanyResponse(CompanyBase):
    """Company response"""
    id: UUID
    slug: str
    logo_path: Optional[str]
    cover_path: Optional[str]
    brand_primary: Optional[str] = "#0f6e6a"
    brand_accent: Optional[str] = "#e07a3d"
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    page_sections: List[dict] = Field(default_factory=lambda: [dict(s) for s in DEFAULT_SECTIONS])
    is_published: bool
    listed_on_market: bool = False
    created_at: datetime
    updated_at: datetime

    @field_validator("page_sections", mode="before")
    @classmethod
    def _sections(cls, v):
        return normalize_sections(v)

    class Config:
        from_attributes = True


class CompanyPublic(BaseModel):
    """Public company info"""
    name: str
    slug: str
    city: str
    description: Optional[str]
    phone: Optional[str]
    whatsapp: Optional[str]
    website_url: Optional[str]
    logo_path: Optional[str]
    cover_path: Optional[str]
    brand_primary: Optional[str] = "#0f6e6a"
    brand_accent: Optional[str] = "#e07a3d"
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    page_sections: List[dict] = Field(default_factory=lambda: [dict(s) for s in DEFAULT_SECTIONS])
    listed_on_market: bool = False

    @field_validator("page_sections", mode="before")
    @classmethod
    def _sections(cls, v):
        return normalize_sections(v)

    class Config:
        from_attributes = True
