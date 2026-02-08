"""
Company Schemas
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from uuid import UUID
from datetime import datetime


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


class CompanyResponse(CompanyBase):
    """Company response"""
    id: UUID
    slug: str
    logo_path: Optional[str]
    cover_path: Optional[str]
    is_published: bool
    created_at: datetime
    updated_at: datetime

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

    class Config:
        from_attributes = True