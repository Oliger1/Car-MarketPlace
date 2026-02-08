"""
Booking Request Service
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Request
from uuid import UUID
from typing import List, Optional

from app.models.booking_request import BookingRequest, BookingRequestStatus
from app.models.booking import Booking, BookingStatus
from app.models.company import Company
from app.models.car import Car
from app.schemas.booking_request import BookingRequestCreate, BookingRequestConvert
from app.utils.ip import get_client_ip


class BookingRequestService:
    """Booking request service"""

    @staticmethod
    def create_request(
            db: Session,
            data: BookingRequestCreate,
            request: Request
    ) -> BookingRequest:
        """Create booking request (public endpoint)"""
        # Get company by slug
        company = db.query(Company).filter(Company.slug == data.company_slug).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kompania nuk u gjet"
            )

        # Get car if specified
        car_id = None
        if data.car_slug:
            car = db.query(Car).filter(
                Car.slug == data.car_slug,
                Car.company_id == company.id
            ).first()
            if car:
                car_id = car.id

        # Create request
        booking_request = BookingRequest(
            company_id=company.id,
            car_id=car_id,
            requester_name=data.requester_name,
            requester_phone=data.requester_phone,
            date_from=data.date_from,
            date_to=data.date_to,
            message=data.message,
            source_ip=get_client_ip(request),
            user_agent=request.headers.get("User-Agent")
        )

        db.add(booking_request)
        db.commit()
        db.refresh(booking_request)

        return booking_request

    @staticmethod
    def convert_to_booking(
            db: Session,
            request_id: UUID,
            company_id: UUID,
            data: BookingRequestConvert
    ) -> Booking:
        """Convert booking request to booking"""
        # Get request
        booking_request = db.query(BookingRequest).filter(
            BookingRequest.id == request_id,
            BookingRequest.company_id == company_id
        ).first()

        if not booking_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kërkesa nuk u gjet"
            )

        if not booking_request.car_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Kërkesa nuk ka makinë të specifikuar"
            )

        # Create booking
        booking = Booking(
            company_id=company_id,
            car_id=booking_request.car_id,
            customer_id=data.customer_id,
            request_id=request_id,
            date_from=data.date_from,
            date_to=data.date_to,
            price_total=data.price_total,
            deposit_amount=data.deposit_amount,
            status=BookingStatus.CONFIRMED
        )

        db.add(booking)

        # Update request status
        booking_request.status = BookingRequestStatus.CONVERTED

        db.commit()
        db.refresh(booking)

        return booking

    @staticmethod
    def get_requests(
            db: Session,
            company_id: UUID,
            status: Optional[str] = None,
            skip: int = 0,
            limit: int = 50
    ) -> tuple[List[BookingRequest], int]:
        """Get company's booking requests"""
        query = db.query(BookingRequest).filter(BookingRequest.company_id == company_id)

        if status:
            query = query.filter(BookingRequest.status == status)

        total = query.count()
        requests = query.order_by(BookingRequest.created_at.desc()).offset(skip).limit(limit).all()

        return requests, total