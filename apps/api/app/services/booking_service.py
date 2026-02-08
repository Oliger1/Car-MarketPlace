"""
Booking Service
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status
from uuid import UUID
from datetime import date
from typing import List, Optional

from app.models.booking import Booking, BookingStatus
from app.models.car import Car
from app.schemas.booking import BookingCreate, BookingUpdate


class BookingService:
    """Booking management service"""

    @staticmethod
    def check_overlap(
            db: Session,
            car_id: UUID,
            date_from: date,
            date_to: date,
            exclude_booking_id: Optional[UUID] = None
    ) -> bool:
        """
        Check if booking dates overlap with existing confirmed/active bookings
        Returns True if overlap exists (booking NOT allowed)
        """
        query = db.query(Booking).filter(
            Booking.car_id == car_id,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.ACTIVE]),
            or_(
                # New booking starts during existing booking
                and_(
                    Booking.date_from <= date_from,
                    Booking.date_to >= date_from
                ),
                # New booking ends during existing booking
                and_(
                    Booking.date_from <= date_to,
                    Booking.date_to >= date_to
                ),
                # New booking contains existing booking
                and_(
                    Booking.date_from >= date_from,
                    Booking.date_to <= date_to
                )
            )
        )

        if exclude_booking_id:
            query = query.filter(Booking.id != exclude_booking_id)

        return query.first() is not None

    @staticmethod
    def create_booking(db: Session, company_id: UUID, data: BookingCreate) -> Booking:
        """Create booking"""
        # Verify car belongs to company
        car = db.query(Car).filter(
            Car.id == data.car_id,
            Car.company_id == company_id
        ).first()

        if not car:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Makina nuk u gjet"
            )

        # Validate dates
        if data.date_to < data.date_from:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data e mbarimit duhet të jetë pas datës së fillimit"
            )

        # Check overlap for confirmed/active bookings
        if data.status in ["confirmed", "active"]:
            if BookingService.check_overlap(db, data.car_id, data.date_from, data.date_to):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Makina është e zënë për datat e zgjedhura"
                )

        # Create booking
        booking = Booking(
            company_id=company_id,
            **data.model_dump()
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)

        return booking

    @staticmethod
    def update_booking(
            db: Session,
            booking_id: UUID,
            company_id: UUID,
            data: BookingUpdate
    ) -> Booking:
        """Update booking"""
        booking = db.query(Booking).filter(
            Booking.id == booking_id,
            Booking.company_id == company_id
        ).first()

        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rezervimi nuk u gjet"
            )

        # If changing dates or status to confirmed/active, check overlap
        check_dates = data.date_from or booking.date_from
        check_to = data.date_to or booking.date_to
        check_status = data.status or booking.status.value

        if check_status in ["confirmed", "active"]:
            if BookingService.check_overlap(
                    db,
                    booking.car_id,
                    check_dates,
                    check_to,
                    exclude_booking_id=booking_id
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Makina është e zënë për datat e zgjedhura"
                )

        # Update fields
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(booking, field, value)

        db.commit()
        db.refresh(booking)

        return booking

    @staticmethod
    def get_bookings(
            db: Session,
            company_id: UUID,
            status: Optional[str] = None,
            car_id: Optional[UUID] = None,
            skip: int = 0,
            limit: int = 50
    ) -> tuple[List[Booking], int]:
        """Get company's bookings"""
        query = db.query(Booking).filter(Booking.company_id == company_id)

        if status:
            query = query.filter(Booking.status == status)

        if car_id:
            query = query.filter(Booking.car_id == car_id)

        total = query.count()
        bookings = query.order_by(Booking.date_from.desc()).offset(skip).limit(limit).all()

        return bookings, total

    @staticmethod
    def get_unavailable_dates(
            db: Session,
            car_id: UUID,
            date_from: Optional[date] = None,
            date_to: Optional[date] = None
    ) -> List[dict]:
        """
        Get unavailable date ranges for a car
        """
        query = db.query(Booking).filter(
            Booking.car_id == car_id,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.ACTIVE])
        )

        if date_from:
            query = query.filter(Booking.date_to >= date_from)

        if date_to:
            query = query.filter(Booking.date_from <= date_to)

        bookings = query.all()

        return [
            {
                "from": booking.date_from.isoformat(),
                "to": booking.date_to.isoformat()
            }
            for booking in bookings
        ]