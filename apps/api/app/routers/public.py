"""
Public Router (no auth required)
"""
from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session, joinedload

from app.core.rate_limit import limiter
from app.db.session import get_db
from app.deps.pagination import PaginationParams, get_pagination_params
from app.models.car import Car, CarStatus
from app.models.company import Company
from app.models.user import User, UserRole
from app.schemas.booking_request import BookingRequestCreate
from app.schemas.car import CarPublic
from app.schemas.company import CompanyPublic
from app.services.booking_request_service import BookingRequestService
from app.services.booking_service import BookingService
from app.services.company_service import CompanyService
from app.services.email_service import EmailService
from app.services.marketplace_service import list_public_cities, search_public_cars

router = APIRouter()


def _car_public_payload(car: Car) -> dict:
    data = CarPublic.model_validate(car).model_dump()
    data["company_name"] = car.company.name if car.company else None
    data["company_slug"] = car.company.slug if car.company else None
    data["company_logo"] = car.company.logo_path if car.company else None
    return data


@router.get("/cities")
async def public_cities(db: Session = Depends(get_db)):
    """Lista e qyteteve me kompani të publikuara (për autocomplete)."""
    return {"data": list_public_cities(db)}


@router.get("/companies")
async def search_companies(
    city: Optional[str] = None,
    q: Optional[str] = None,
    pagination: PaginationParams = Depends(get_pagination_params),
    db: Session = Depends(get_db),
):
    companies, total = CompanyService.search_companies(
        db,
        city=city,
        q=q,
        skip=pagination.skip,
        limit=pagination.limit,
    )
    return {
        "data": [CompanyPublic.model_validate(c) for c in companies],
        "total": total,
        "page": pagination.page,
        "limit": pagination.limit,
        "pages": (total + pagination.limit - 1) // pagination.limit,
    }


@router.get("/cars")
async def search_cars(
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
    pagination: PaginationParams = Depends(get_pagination_params),
    db: Session = Depends(get_db),
):
    """
    Kërko makina (publik).
    sort: newest | price_asc | price_desc
    """
    if sort not in {"newest", "price_asc", "price_desc"}:
        sort = "newest"

    cars, total = search_public_cars(
        db,
        city=city,
        q=q,
        transmission=transmission,
        fuel=fuel,
        seats_min=seats_min,
        price_min=price_min,
        price_max=price_max,
        date_from=date_from,
        date_to=date_to,
        sort=sort,
        skip=pagination.skip,
        limit=pagination.limit,
    )

    return {
        "data": [_car_public_payload(car) for car in cars],
        "total": total,
        "page": pagination.page,
        "limit": pagination.limit,
        "pages": (total + pagination.limit - 1) // pagination.limit if pagination.limit else 0,
    }


@router.get("/company/{slug}", response_model=CompanyPublic)
async def get_company(slug: str, db: Session = Depends(get_db)):
    company = CompanyService.get_company_by_slug(db, slug)

    if hasattr(company, "_redirect_to"):
        raise HTTPException(
            status_code=status.HTTP_301_MOVED_PERMANENTLY,
            detail=f"Redirect to /c/{company._redirect_to}",
            headers={"Location": f"/c/{company._redirect_to}"},
        )

    if not company.is_published or company.is_suspended or company.deleted_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kompania nuk është e publikuar")

    return CompanyPublic.model_validate(company)


@router.get("/company/{slug}/cars")
async def get_company_cars(
    slug: str,
    sort: str = "newest",
    pagination: PaginationParams = Depends(get_pagination_params),
    db: Session = Depends(get_db),
):
    company = CompanyService.get_company_by_slug(db, slug)

    if not company.is_published or company.is_suspended or company.deleted_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kompania nuk është e publikuar")

    query = (
        db.query(Car)
        .options(joinedload(Car.photos), joinedload(Car.company))
        .filter(
            Car.company_id == company.id,
            Car.is_published.is_(True),
            Car.status == CarStatus.ACTIVE,
        )
    )
    if sort == "price_asc":
        query = query.order_by(Car.price_per_day.asc())
    elif sort == "price_desc":
        query = query.order_by(Car.price_per_day.desc())
    else:
        query = query.order_by(Car.created_at.desc())

    total = query.count()
    cars = query.offset(pagination.skip).limit(pagination.limit).all()

    return {
        "data": [_car_public_payload(c) for c in cars],
        "total": total,
        "page": pagination.page,
        "limit": pagination.limit,
    }


@router.get("/company/{company_slug}/car/{car_slug}", response_model=CarPublic)
async def get_car(company_slug: str, car_slug: str, db: Session = Depends(get_db)):
    company = CompanyService.get_company_by_slug(db, company_slug)

    if not company.is_published or company.is_suspended or company.deleted_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kompania nuk është e publikuar")

    car = (
        db.query(Car)
        .options(joinedload(Car.photos))
        .filter(
            Car.company_id == company.id,
            Car.slug == car_slug,
            Car.is_published.is_(True),
            Car.status == CarStatus.ACTIVE,
        )
        .first()
    )

    if not car:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Makina nuk u gjet")

    payload = CarPublic.model_validate(car).model_dump()
    payload["unavailable_ranges"] = BookingService.get_unavailable_dates(db, car.id)
    return payload


@router.get("/company/{company_slug}/car/{car_slug}/availability")
async def get_car_availability(
    company_slug: str,
    car_slug: str,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
):
    company = CompanyService.get_company_by_slug(db, company_slug)

    car = db.query(Car).filter(Car.company_id == company.id, Car.slug == car_slug).first()
    if not car:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Makina nuk u gjet")

    unavailable = BookingService.get_unavailable_dates(db, car.id, date_from=date_from, date_to=date_to)
    return {"car_id": str(car.id), "unavailable_ranges": unavailable}


@router.post("/booking-request", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def create_booking_request(
    request: Request,
    data: BookingRequestCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    booking_request = BookingRequestService.create_request(db, data, request)

    company = db.query(Company).filter(Company.id == booking_request.company_id).first()
    company_name = company.name if company else data.company_slug
    date_from = str(booking_request.date_from) if booking_request.date_from else None
    date_to = str(booking_request.date_to) if booking_request.date_to else None

    if booking_request.requester_email:
        background_tasks.add_task(
            EmailService.send_request_ack,
            booking_request.requester_email,
            booking_request.requester_name,
            company_name,
            date_from,
            date_to,
        )

    owner = (
        db.query(User)
        .filter(User.company_id == booking_request.company_id, User.role == UserRole.OWNER, User.is_active.is_(True))
        .first()
    )
    if owner and owner.email:
        background_tasks.add_task(
            EmailService.send_request_partner,
            owner.email,
            company_name,
            booking_request.requester_name,
            booking_request.requester_phone,
            booking_request.requester_email or "",
            date_from,
            date_to,
            booking_request.message,
        )

    return {
        "message": "Kërkesa u dërgua me sukses. Do të kontaktoheni së shpejti.",
        "id": str(booking_request.id),
    }
