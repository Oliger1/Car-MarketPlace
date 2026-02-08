"""
Car Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal


class CarPhotoBase(BaseModel):
    """Car photo base"""
    path: str
    alt_text: Optional[str] = None


class CarPhotoResponse(CarPhotoBase):
    """Car photo response"""
    id: UUID
    sort_order: int

    class Config:
        from_attributes = True


class CarBase(BaseModel):
    """Base car fields"""
    title: str = Field(..., min_length=2, max_length=200)
    make: str = Field(..., min_length=1, max_length=50)
    model: str = Field(..., min_length=1, max_length=50)
    year: int = Field(..., ge=1900, le=2100)
    transmission: str = Field(..., pattern="^(manual|automatic)$")
    fuel: str = Field(..., pattern="^(petrol|diesel|hybrid|electric)$")
    seats: int = Field(..., ge=1, le=20)
    price_per_day: Decimal = Field(..., ge=0)
    deposit_amount: Decimal = Field(..., ge=0)
    currency: str = Field(default="EUR", pattern="^(EUR|ALL|USD)$")
    description: Optional[str] = None
    location_text: Optional[str] = Field(None, max_length=255)


class CarCreate(CarBase):
    """Create car"""
    slug: str = Field(..., min_length=2, max_length=100, pattern="^[a-z0-9-]+$")
    status: Optional[str] = Field(default="active", pattern="^(active|inactive|maintenance)$")


class CarUpdate(BaseModel):
    """Update car"""
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    slug: Optional[str] = Field(None, min_length=2, max_length=100, pattern="^[a-z0-9-]+$")
    make: Optional[str] = Field(None, min_length=1, max_length=50)
    model: Optional[str] = Field(None, min_length=1, max_length=50)
    year: Optional[int] = Field(None, ge=1900, le=2100)
    transmission: Optional[str] = Field(None, pattern="^(manual|automatic)$")
    fuel: Optional[str] = Field(None, pattern="^(petrol|diesel|hybrid|electric)$")
    seats: Optional[int] = Field(None, ge=1, le=20)
    price_per_day: Optional[Decimal] = Field(None, ge=0)
    deposit_amount: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = Field(None, pattern="^(EUR|ALL|USD)$")
    status: Optional[str] = Field(None, pattern="^(active|inactive|maintenance)$")
    description: Optional[str] = None
    location_text: Optional[str] = Field(None, max_length=255)
    is_published: Optional[bool] = None


class CarResponse(CarBase):
    """Car response"""
    id: UUID
    company_id: UUID
    slug: str
    status: str
    is_published: bool
    photos: List[CarPhotoResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CarPublic(BaseModel):
    """Public car info"""
    id: UUID
    slug: str
    title: str
    make: str
    model: str
    year: int
    transmission: str
    fuel: str
    seats: int
    price_per_day: Decimal
    deposit_amount: Decimal
    currency: str
    description: Optional[str]
    location_text: Optional[str]
    photos: List[CarPhotoResponse] = []

    class Config:
        from_attributes = True


class CarAvailability(BaseModel):
    """Car availability response"""
    car_id: UUID
    unavailable_ranges: List[dict]  # [{"from": "2025-02-10", "to": "2025-02-15"}, ...]