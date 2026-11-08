"""
Booking Requests Router
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from uuid import UUID

from app.db.session import get_db
from app.deps.auth import require_staff_or_owner
from app.deps.tenant import require_company_id
from app.deps.pagination import get_pagination_params, PaginationParams
from app.models.user import User
from app.models.booking_request import BookingRequest, BookingRequestStatus
from app.models.booking import Booking
from app.models.company import Company
from app.schemas.booking_request import (
    BookingRequestResponse,
    BookingRequestUpdate,
    BookingRequestConvert,
)
from app.schemas.booking import BookingResponse
from app.services.booking_request_service import BookingRequestService
from app.services.email_service import EmailService

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
    request = db.query(BookingRequest).filter(
        BookingRequest.id == request_id,
        BookingRequest.company_id == company_id
    ).first()

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kërkesa nuk u gjet"
        )

    try:
        request.status = BookingRequestStatus(data.status)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status i pavlefshëm")

    db.commit()
    db.refresh(request)

    return BookingRequestResponse.model_validate(request)


@router.post("/{request_id}/convert", response_model=BookingResponse)
async def convert_to_booking(
        request_id: UUID,
        data: BookingRequestConvert,
        background_tasks: BackgroundTasks,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Konverto kërkesën në rezervim
    """
    booking = BookingRequestService.convert_to_booking(db, request_id, company_id, data)

    booking = (
        db.query(Booking)
        .options(joinedload(Booking.customer), joinedload(Booking.car))
        .filter(Booking.id == booking.id)
        .first()
    )
    company = db.query(Company).filter(Company.id == company_id).first()
    req = db.query(BookingRequest).filter(BookingRequest.id == request_id).first()

    client_email = None
    client_name = "Klient"
    if booking and booking.customer and booking.customer.email:
        client_email = booking.customer.email
        client_name = booking.customer.name
    elif req and req.requester_email:
        client_email = req.requester_email
        client_name = req.requester_name

    if client_email and booking:
        background_tasks.add_task(
            EmailService.send_booking_confirmed,
            client_email,
            client_name,
            company.name if company else "",
            str(booking.date_from),
            str(booking.date_to),
            booking.car.title if booking.car else None,
        )

    return BookingResponse.model_validate(booking)
