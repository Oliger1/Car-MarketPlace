"""
Public Router (no auth required)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date

from app.db.session import get_db
from app.deps.pagination import get_pagination_params, PaginationParams
from app.schemas.company import CompanyPublic
from app.schemas.car import CarPublic, CarAvailability
from app.schemas.booking_request import BookingRequestCreate
from app.services.company_service import CompanyService
from app.services.car_service import CarService
from app.services.booking_service import BookingService
from app.services.booking_request_service import BookingRequestService
from app.models.car import Car
from app.core.rate_limit import limiter

router = APIRouter()


@router.get("/companies")
async def search_companies(
        city: Optional[str] = None,
        q: Optional[str] = None,
        pagination: PaginationParams = Depends(get_pagination_params),
        db: Session = Depends(get_db)
):
    """
    Kërko kompani (publik)
    """
    companies, total = CompanyService.search_companies(
        db,
        city=city,
        q=q,
        skip=pagination.skip,
        limit=pagination.limit
    )

    return {
        "data": [CompanyPublic.model_validate(c) for c in companies],
        "total": total,
        "page": pagination.page,
        "limit": pagination.limit,
        "pages": (total + pagination.limit - 1) // pagination.limit
    }


@router.get("/cars")
async def search_cars(
        city: Optional[str] = None,
        q: Optional[str] = None,
        pagination: PaginationParams = Depends(get_pagination_params),
        db: Session = Depends(get_db)
):
    """
    Kërko makina nga të gjitha kompanitë (publik)
    """
    from app.models.company import Company
    from sqlalchemy import or_

    query = db.query(Car).join(
        Company, Car.company_id == Company.id
    ).filter(
        Car.is_published == True,
        Car.status == "active",
        Company.is_published == True,
    )

    if city:
        query = query.filter(Company.city.ilike(f"%{city}%"))

    if q:
        query = query.filter(
            or_(
                Car.title.ilike(f"%{q}%"),
                Car.make.ilike(f"%{q}%"),
                Car.model.ilike(f"%{q}%"),
            )
        )

    total = query.count()
    cars = query.order_by(Car.created_at.desc()).offset(pagination.skip).limit(pagination.limit).all()

    # Build response with company info
    result = []
    for car in cars:
        car_data = CarPublic.model_validate(car).model_dump()
        car_data["company_name"] = car.company.name if car.company else None
        car_data["company_slug"] = car.company.slug if car.company else None
        car_data["company_logo"] = car.company.logo_path if car.company else None
        result.append(car_data)

    return {
        "data": result,
        "total": total,
        "page": pagination.page,
        "limit": pagination.limit,
    }


@router.get("/company/{slug}", response_model=CompanyPublic)
async def get_company(slug: str, db: Session = Depends(get_db)):
    """
    Merr profilin e kompanisë (publik)
    """
    company = CompanyService.get_company_by_slug(db, slug)

    # Check if this is a redirect
    if hasattr(company, '_redirect_to'):
        raise HTTPException(
            status_code=status.HTTP_301_MOVED_PERMANENTLY,
            detail=f"Redirect to /c/{company._redirect_to}",
            headers={"Location": f"/c/{company._redirect_to}"}
        )

    if not company.is_published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kompania nuk është e publikuar"
        )

    return CompanyPublic.model_validate(company)


@router.get("/company/{slug}/cars")
async def get_company_cars(
        slug: str,
        pagination: PaginationParams = Depends(get_pagination_params),
        db: Session = Depends(get_db)
):
    """
    Merr makinat e kompanisë (publik)
    """
    company = CompanyService.get_company_by_slug(db, slug)

    if not company.is_published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kompania nuk është e publikuar"
        )

    # Get published active cars
    query = db.query(Car).filter(
        Car.company_id == company.id,
        Car.is_published == True,
        Car.status == "active"
    )

    total = query.count()
    cars = query.offset(pagination.skip).limit(pagination.limit).all()

    return {
        "data": [CarPublic.model_validate(c) for c in cars],
        "total": total,
        "page": pagination.page,
        "limit": pagination.limit
    }


@router.get("/company/{company_slug}/car/{car_slug}", response_model=CarPublic)
async def get_car(
        company_slug: str,
        car_slug: str,
        db: Session = Depends(get_db)
):
    """
    Merr detajet e makinës (publik)
    """
    company = CompanyService.get_company_by_slug(db, company_slug)

    if not company.is_published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kompania nuk është e publikuar"
        )

    car = db.query(Car).filter(
        Car.company_id == company.id,
        Car.slug == car_slug,
        Car.is_published == True,
        Car.status == "active"
    ).first()

    if not car:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Makina nuk u gjet"
        )

    return CarPublic.model_validate(car)


@router.get("/company/{company_slug}/car/{car_slug}/availability")
async def get_car_availability(
        company_slug: str,
        car_slug: str,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        db: Session = Depends(get_db)
):
    """
    Merr disponueshmërinë e makinës
    """
    company = CompanyService.get_company_by_slug(db, company_slug)

    car = db.query(Car).filter(
        Car.company_id == company.id,
        Car.slug == car_slug
    ).first()

    if not car:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Makina nuk u gjet"
        )

    unavailable = BookingService.get_unavailable_dates(
        db,
        car.id,
        date_from=date_from,
        date_to=date_to
    )

    return {
        "car_id": str(car.id),
        "unavailable_ranges": unavailable
    }


@router.post("/booking-request", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def create_booking_request(
        request: Request,
        data: BookingRequestCreate,
        db: Session = Depends(get_db)
):
    """
    Krijo kërkesë për rezervim (publik)
    """
    booking_request = BookingRequestService.create_request(db, data, request)

    return {
        "message": "Kërkesa u dërgua me sukses. Do të kontaktoheni së shpejti.",
        "id": str(booking_request.id)
    }
