"""
Booking Requests Router
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
from app.schemas.booking_request import (
    BookingRequestResponse,
    BookingRequestUpdate,
    BookingRequestConvert,
)
from app.schemas.booking import BookingResponse
from app.services.booking_request_service import BookingRequestService

router = APIRouter()


@router.get("/")
async def list_booking_requests(
        status: Optional[str] = None,
        pagination: PaginationParams = Depends(get_pagination_params),
        company_id: UUID = Depends(require_company_id),
        db: Session = Depends(get_db)
):
    """
    Listo kërkesat për rezervim
    """
    requests, total = BookingRequestService.get_requests(
        db,
        company_id,
        status=status,
        skip=pagination.skip,
        limit=pagination.limit
    )

    return {
        "data": [BookingRequestResponse.model_validate(r) for r in requests],
        "total": total,
        "page": pagination.page,
        "limit": pagination.limit
    }


@router.get("/{request_id}", response_model=BookingRequestResponse)
async def get_booking_request(
        request_id: UUID,
        company_id: UUID = Depends(require_company_id),
        db: Session = Depends(get_db)
):
    """
    Merr detajet e kërkesës
    """
    from app.models.booking_request import BookingRequest

    request = db.query(BookingRequest).filter(
        BookingRequest.id == request_id,
        BookingRequest.company_id == company_id
    ).first()

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kërkesa nuk u gjet"
        )

    return BookingRequestResponse.model_validate(request)


@router.patch("/{request_id}", response_model=BookingRequestResponse)
async def update_booking_request(
        request_id: UUID,
        data: BookingRequestUpdate,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Përditëso statusin e kërkesës
    """
    from app.models.booking_request import BookingRequest

    request = db.query(BookingRequest).filter(
        BookingRequest.id == request_id,
        BookingRequest.company_id == company_id
    ).first()

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kërkesa nuk u gjet"
        )

    request.status = data.status
    db.commit()
    db.refresh(request)

    return BookingRequestResponse.model_validate(request)


@router.post("/{request_id}/convert", response_model=BookingResponse)
async def convert_to_booking(
        request_id: UUID,
        data: BookingRequestConvert,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Konverto kërkesën në rezervim
    """
    booking = BookingRequestService.convert_to_booking(db, request_id, company_id, data)
    return BookingResponse.model_validate(booking)