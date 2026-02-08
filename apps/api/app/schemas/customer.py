"""
Customer Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class CustomerBase(BaseModel):
    """Base customer fields"""
    name: str = Field(..., min_length=2, max_length=200)
    phone: str = Field(..., min_length=5, max_length=50)
    id_number: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None


class CustomerCreate(CustomerBase):
    """Create customer"""
    pass


class CustomerUpdate(BaseModel):
    """Update customer"""
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    phone: Optional[str] = Field(None, min_length=5, max_length=50)
    id_number: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None


class CustomerResponse(CustomerBase):
    """Customer response"""
    id: UUID
    company_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True