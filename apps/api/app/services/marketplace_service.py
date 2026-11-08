"""
Public marketplace search helpers
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.models.booking import Booking, BookingStatus
from app.models.car import Car, CarStatus, FuelType, TransmissionType
from app.models.company import Company


def _fold_al(value: str) -> str:
    return value.lower().translate(str.maketrans({"ë": "e", "ç": "c"}))


def _enum_or_str(enum_cls, value: Optional[str]):
    if not value:
        return None
    try:
        return enum_cls(value.lower())
    except ValueError:
        return None


def search_public_cars(
    db: Session,
    *,
    city: Optional[str] = None,
    q: Optional[str] = None,
    transmission: Optional[str] = None,
    fuel: Optional[str] = None,
    seats_min: Optional[int] = None,
    price_min: Optional[Decimal] = None,
    price_max: Optional[Decimal] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    sort: str = "newest",
    skip: int = 0,
    limit: int = 20,
):
    query = (
        db.query(Car)
        .join(Company, Car.company_id == Company.id)
        .options(joinedload(Car.photos), joinedload(Car.company))
        .filter(
            Car.is_published.is_(True),
            Car.status == CarStatus.ACTIVE,
            Company.is_published.is_(True),
            Company.listed_on_market.is_(True),
            Company.is_suspended.is_(False),
            Company.deleted_at.is_(None),
        )
    )

    if city:
        folded = f"%{_fold_al(city)}%"
        city_col = func.translate(func.lower(Company.city), "ëç", "ec")
        loc_col = func.translate(func.lower(Car.location_text), "ëç", "ec")
        query = query.filter(or_(city_col.ilike(folded), loc_col.ilike(folded)))

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Car.title.ilike(like),
                Car.make.ilike(like),
                Car.model.ilike(like),
                Company.name.ilike(like),
            )
        )

    transmission_enum = _enum_or_str(TransmissionType, transmission)
    if transmission_enum:
        query = query.filter(Car.transmission == transmission_enum)

    fuel_enum = _enum_or_str(FuelType, fuel)
    if fuel_enum:
        query = query.filter(Car.fuel == fuel_enum)

    if seats_min is not None:
        query = query.filter(Car.seats >= seats_min)

    if price_min is not None:
        query = query.filter(Car.price_per_day >= price_min)

    if price_max is not None:
        query = query.filter(Car.price_per_day <= price_max)

    if date_from and date_to and date_to >= date_from:
        busy = (
            db.query(Booking.car_id)
            .filter(
                Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.ACTIVE]),
                Booking.date_from <= date_to,
                Booking.date_to >= date_from,
            )
            .subquery()
        )
        query = query.filter(~Car.id.in_(busy))

    if sort == "price_asc":
        query = query.order_by(Car.price_per_day.asc(), Car.created_at.desc())
    elif sort == "price_desc":
        query = query.order_by(Car.price_per_day.desc(), Car.created_at.desc())
    else:
        query = query.order_by(Car.created_at.desc())

    total = query.count()
    cars = query.offset(skip).limit(limit).all()
    return cars, total


def list_public_cities(db: Session, limit: int = 50) -> list[dict]:
    rows = (
        db.query(Company.city, func.count(Company.id).label("companies"))
        .filter(
            Company.is_published.is_(True),
            Company.listed_on_market.is_(True),
            Company.is_suspended.is_(False),
            Company.deleted_at.is_(None),
            Company.city.isnot(None),
            Company.city != "",
        )
        .group_by(Company.city)
        .order_by(func.count(Company.id).desc(), Company.city.asc())
        .limit(limit)
        .all()
    )
    return [{"city": city, "companies": companies} for city, companies in rows]
