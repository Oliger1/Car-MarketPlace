"""
Car Service
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional

from app.models.car import Car, CarStatus
from app.models.subscription import Subscription
from app.models.booking import Booking, BookingStatus
from app.schemas.car import CarCreate, CarUpdate


class CarService:
    """Car management service"""

    @staticmethod
    def check_car_limit(db: Session, company_id: UUID, exclude_car_id: Optional[UUID] = None):
        """
        Check if company can add more cars based on subscription plan
        """
        # Get subscription
        subscription = db.query(Subscription).filter(
            Subscription.company_id == company_id
        ).first()

        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Nuk keni subscription aktiv"
            )

        # Count active cars
        query = db.query(Car).filter(
            Car.company_id == company_id,
            Car.status == CarStatus.ACTIVE
        )

        if exclude_car_id:
            query = query.filter(Car.id != exclude_car_id)

        active_cars = query.count()

        # Check limit
        plan = subscription.plan
        if active_cars >= plan.car_limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Keni arritur limitin e makinave ({plan.car_limit}). Ngrini planin për të shtuar më shumë."
            )

    @staticmethod
    def create_car(db: Session, company_id: UUID, data: CarCreate) -> Car:
        """Create new car"""
        # Check car limit if status is active
        if data.status == "active":
            CarService.check_car_limit(db, company_id)

        # Check slug uniqueness within company
        existing = db.query(Car).filter(
            Car.company_id == company_id,
            Car.slug == data.slug
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug-u është i zënë tashmë për këtë kompani"
            )

        # Create car
        car = Car(
            company_id=company_id,
            **data.model_dump()
        )
        db.add(car)
        db.commit()
        db.refresh(car)

        return car

    @staticmethod
    def get_car(db: Session, car_id: UUID, company_id: UUID) -> Car:
        """Get car by ID (tenant-scoped)"""
        car = db.query(Car).filter(
            Car.id == car_id,
            Car.company_id == company_id
        ).first()

        if not car:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Makina nuk u gjet"
            )

        return car

    @staticmethod
    def update_car(db: Session, car_id: UUID, company_id: UUID, data: CarUpdate) -> Car:
        """Update car"""
        car = CarService.get_car(db, car_id, company_id)

        # If changing to active, check car limit
        if data.status == "active" and car.status != CarStatus.ACTIVE:
            CarService.check_car_limit(db, company_id, exclude_car_id=car_id)

        # Update fields
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(car, field, value)

        db.commit()
        db.refresh(car)

        return car

    @staticmethod
    def delete_car(db: Session, car_id: UUID, company_id: UUID) -> None:
        """Soft delete car (set to inactive)"""
        car = CarService.get_car(db, car_id, company_id)

        # Check if car has active bookings
        active_bookings = db.query(Booking).filter(
            Booking.car_id == car_id,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.ACTIVE])
        ).count()

        if active_bookings > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nuk mund të fshini makinë me rezervime aktive"
            )

        # Soft delete (set to inactive)
        car.status = CarStatus.INACTIVE
        car.is_published = False

        db.commit()

    @staticmethod
    def get_cars(
            db: Session,
            company_id: UUID,
            status: Optional[str] = None,
            skip: int = 0,
            limit: int = 50
    ) -> tuple[List[Car], int]:
        """Get company's cars"""
        query = db.query(Car).filter(Car.company_id == company_id)

        if status:
            query = query.filter(Car.status == status)

        total = query.count()
        cars = query.order_by(Car.created_at.desc()).offset(skip).limit(limit).all()

        return cars, total