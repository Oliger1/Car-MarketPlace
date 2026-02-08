"""
Billing Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class PlanResponse(BaseModel):
    """Plan response"""
    id: str
    name: str
    car_limit: int
    price_monthly: Decimal
    is_active: bool

    class Config:
        from_attributes = True


class SubscriptionResponse(BaseModel):
    """Subscription response"""
    id: UUID
    company_id: UUID
    plan_id: str
    plan: PlanResponse
    status: str
    trial_until: Optional[datetime]
    active_until: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChoosePlan(BaseModel):
    """Choose plan request"""
    plan_id: str = Field(..., pattern="^(p10|p30|p100)$")


class InvoiceResponse(BaseModel):
    """Invoice response"""
    id: UUID
    company_id: UUID
    amount: Decimal
    currency: str
    status: str
    issued_at: datetime
    due_date: datetime
    paid_at: Optional[datetime]
    notes: Optional[str]

    class Config:
        from_attributes = True