"""
Billing Router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.deps.auth import require_owner
from app.deps.tenant import require_company_id
from app.deps.pagination import get_pagination_params, PaginationParams
from app.models.user import User
from app.models.invoice import Invoice
from app.schemas.billing import (
    SubscriptionResponse,
    ChoosePlan,
    PlanResponse,
    InvoiceResponse,
)
from app.services.billing_service import BillingService
from fastapi import status as http_status

router = APIRouter()


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
        company_id: UUID = Depends(require_company_id),
        db: Session = Depends(get_db)
):
    """
    Merr subscription aktual
    """
    subscription = BillingService.get_subscription(db, company_id)
    return SubscriptionResponse.model_validate(subscription)


@router.post("/choose-plan", response_model=SubscriptionResponse)
async def choose_plan(
        data: ChoosePlan,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_owner),
        db: Session = Depends(get_db)
):
    """
    Self-serve plan change disabled — plans are assigned by platform admin (cash).
    """
    raise HTTPException(
        status_code=http_status.HTTP_403_FORBIDDEN,
        detail="Ndryshimi i planit bëhet nga administratori (pagesë cash). Kontaktoni Mix.",
    )


@router.get("/plans", response_model=List[PlanResponse])
async def get_plans(db: Session = Depends(get_db)):
    """
    Merr të gjitha planet
    """
    plans = BillingService.get_plans(db)
    return [PlanResponse.model_validate(p) for p in plans]


@router.get("/invoices")
async def get_invoices(
        pagination: PaginationParams = Depends(get_pagination_params),
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_owner),
        db: Session = Depends(get_db)
):
    """
    Merr faturat
    """
    query = db.query(Invoice).filter(Invoice.company_id == company_id)

    total = query.count()
    invoices = query.order_by(Invoice.issued_at.desc()).offset(pagination.skip).limit(pagination.limit).all()

    return {
        "data": [InvoiceResponse.model_validate(i) for i in invoices],
        "total": total,
        "page": pagination.page,
        "limit": pagination.limit
    }