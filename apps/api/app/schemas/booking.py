"""
Booking Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal


class BookingBase(BaseModel):
    """Base booking fields"""
    date_from: date
    date_to: date
    notes: Optional[str] = None


class BookingCreate(BookingBase):
    """Create booking"""
    car_id: UUID
    customer_id: Optional[UUID] = None
    price_total: Optional[Decimal] = Field(None, ge=0)
    deposit_amount: Optional[Decimal] = Field(None, ge=0)
    currency: str = Field(default="EUR")
    status: Optional[str] = Field(default="requested")


class BookingUpdate(BaseModel):
    """Update booking"""
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    status: Optional[str] = Field(None, pattern="^(requested|confirmed|active|completed|cancelled)$")
    price_total: Optional[Decimal] = Field(None, ge=0)
    deposit_amount: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None


class BookingResponse(BookingBase):
    """Booking response"""
    id: UUID
    company_id: UUID
    car_id: UUID
    customer_id: Optional[UUID]
    request_id: Optional[UUID]
    status: str
    price_total: Optional[Decimal]
    deposit_amount: Optional[Decimal]
    currency: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True