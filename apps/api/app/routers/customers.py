"""
Customers Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.db.session import get_db
from app.deps.auth import require_staff_or_owner
from app.deps.tenant import require_company_id
from app.deps.pagination import get_pagination_params, PaginationParams
from app.models.user import User
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.services.customer_service import CustomerService

router = APIRouter()


@router.get("/")
async def list_customers(
        q: Optional[str] = None,
        pagination: PaginationParams = Depends(get_pagination_params),
        company_id: UUID = Depends(require_company_id),
        db: Session = Depends(get_db)
):
    """
    Listo klientët
    """
    customers, total = CustomerService.get_customers(
        db,
        company_id,
        q=q,
        skip=pagination.skip,
        limit=pagination.limit
    )

    return {
        "data": [CustomerResponse.model_validate(c) for c in customers],
        "total": total,
        "page": pagination.page,
        "limit": pagination.limit
    }


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
        data: CustomerCreate,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Krijo klient të ri
    """
    customer = CustomerService.create_customer(db, company_id, data)
    return CustomerResponse.model_validate(customer)


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
        customer_id: UUID,
        company_id: UUID = Depends(require_company_id),
        db: Session = Depends(get_db)
):
    """
    Merr detajet e klientit
    """
    customer = CustomerService.get_customer(db, customer_id, company_id)
    return CustomerResponse.model_validate(customer)


@router.patch("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
        customer_id: UUID,
        data: CustomerUpdate,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Përditëso klientin
    """
    customer = CustomerService.update_customer(db, customer_id, company_id, data)
    return CustomerResponse.model_validate(customer)