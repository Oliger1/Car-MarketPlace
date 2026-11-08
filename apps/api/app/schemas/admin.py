"""
Admin schemas — platform ops
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class PlanCreate(BaseModel):
    id: str = Field(..., min_length=2, max_length=20, pattern="^[a-z0-9_-]+$")
    name: str = Field(..., min_length=2, max_length=100)
    car_limit: int = Field(..., ge=1, le=10000)
    price_monthly: Decimal = Field(..., ge=0)
    is_active: bool = True


class PlanUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    car_limit: Optional[int] = Field(None, ge=1, le=10000)
    price_monthly: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None


class AdminAssignSubscription(BaseModel):
    plan_id: str
    status: str = Field(default="active", pattern="^(trialing|active|past_due|suspended)$")
    active_until: Optional[datetime] = None
    trial_until: Optional[datetime] = None
    create_invoice: bool = True
    invoice_notes: Optional[str] = "Pagesë cash"


class AdminCompanyRow(BaseModel):
    id: UUID
    name: str
    slug: str
    city: str
    is_published: bool
    listed_on_market: bool = False
    is_suspended: bool = False
    deleted_at: Optional[datetime] = None
    visibility: str = "draft"  # draft | private | public | suspended | deleted
    plan_id: Optional[str] = None
    plan_name: Optional[str] = None
    subscription_status: Optional[str] = None
    trial_until: Optional[datetime] = None
    active_until: Optional[datetime] = None
    owner_email: Optional[str] = None


class AdminCompanyPatch(BaseModel):
    is_published: Optional[bool] = None
    listed_on_market: Optional[bool] = None
    is_suspended: Optional[bool] = None
    slug: Optional[str] = Field(None, min_length=2, max_length=100, pattern="^[a-z0-9-]+$")
    soft_delete: Optional[bool] = None  # True delete, False restore


class AdminCarRow(BaseModel):
    id: UUID
    title: str
    slug: str
    company_id: UUID
    company_name: str
    company_slug: str
    is_published: bool
    price_per_day: Decimal
    city: Optional[str] = None


class AdminCarPatch(BaseModel):
    is_published: Optional[bool] = None


class AdminInvoiceRow(BaseModel):
    id: UUID
    company_id: UUID
    company_name: str
    company_slug: str
    amount: Decimal
    currency: str
    status: str
    issued_at: datetime
    due_date: datetime
    paid_at: Optional[datetime] = None
    notes: Optional[str] = None
    active_until: Optional[datetime] = None


class AdminStats(BaseModel):
    companies_total: int
    companies_live: int
    companies_on_market: int
    companies_suspended: int
    cars_on_market: int
    requests_last_7_days: int
    invoices_open: int


class AdminEmailIn(BaseModel):
    email: str = Field(..., min_length=5, max_length=200)

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v:
            raise ValueError("Email i pavlefshëm")
        return v


class AdminSlugIn(BaseModel):
    slug: str = Field(..., min_length=2, max_length=100, pattern="^[a-z0-9-]+$")
