"""
Bookings Router
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
from app.schemas.booking import BookingCreate, BookingUpdate, BookingResponse
from app.services.booking_service import BookingService

router = APIRouter()


@router.get("/")
async def list_bookings(
        status: Optional[str] = None,
        car_id: Optional[UUID] = None,
        pagination: PaginationParams = Depends(get_pagination_params),
        company_id: UUID = Depends(require_company_id),
        db: Session = Depends(get_db)
):
    """
    Listo rezervimet
    """
    bookings, total = BookingService.get_bookings(
        db,
        company_id,
        status=status,
        car_id=car_id,
        skip=pagination.skip,
        limit=pagination.limit
    )

    return {
        "data": [BookingResponse.model_validate(b) for b in bookings],
        "total": total,
        "page": pagination.page,
        "limit": pagination.limit
    }


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
        data: BookingCreate,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Krijo rezervim të ri
    """
    booking = BookingService.create_booking(db, company_id, data)
    return BookingResponse.model_validate(booking)


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
        booking_id: UUID,
        company_id: UUID = Depends(require_company_id),
        db: Session = Depends(get_db)
):
    """
    Merr detajet e rezervimit
    """
    from app.models.booking import Booking

    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.company_id == company_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rezervimi nuk u gjet"
        )

    return BookingResponse.model_validate(booking)


@router.patch("/{booking_id}", response_model=BookingResponse)
async def update_booking(
        booking_id: UUID,
        data: BookingUpdate,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Përditëso rezervimin
    """
    booking = BookingService.update_booking(db, booking_id, company_id, data)
    return BookingResponse.model_validate(booking)


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
        booking_id: UUID,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Anulo rezervimin
    """
    from app.models.booking import Booking, BookingStatus

    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.company_id == company_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rezervimi nuk u gjet"
        )

    booking.status = BookingStatus.CANCELLED
    db.commit()

    return None