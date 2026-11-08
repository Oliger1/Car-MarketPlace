"""
Booking Request Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime, date


class BookingRequestCreate(BaseModel):
    """Create booking request (public)"""
    company_slug: str
    car_slug: Optional[str] = None
    requester_name: str = Field(..., min_length=2, max_length=200)
    requester_phone: str = Field(..., min_length=5, max_length=50)
    requester_email: EmailStr
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    message: Optional[str] = Field(None, max_length=1000)


class BookingRequestUpdate(BaseModel):
    """Update booking request status"""
    status: str = Field(..., pattern="^(new|contacted|converted|spam)$")


class BookingRequestResponse(BaseModel):
    """Booking request response"""
    id: UUID
    company_id: UUID
    car_id: Optional[UUID]
    requester_name: str
    requester_phone: str
    requester_email: Optional[str] = None
    date_from: Optional[date]
    date_to: Optional[date]
    message: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class BookingRequestConvert(BaseModel):
    """Convert booking request to booking"""
    customer_id: Optional[UUID] = None
    date_from: date
    date_to: date
    price_total: Optional[float] = Field(None, ge=0)
    deposit_amount: Optional[float] = Field(None, ge=0)
