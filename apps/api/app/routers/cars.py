"""
Cars Router
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.db.session import get_db
from app.deps.auth import require_staff_or_owner
from app.deps.tenant import require_company_id
from app.deps.pagination import get_pagination_params, PaginationParams
from app.models.user import User
from app.schemas.car import CarCreate, CarUpdate, CarResponse
from app.services.car_service import CarService
from app.services.photo_service import PhotoService

router = APIRouter()


@router.get("/")
async def list_cars(
        status: Optional[str] = None,
        pagination: PaginationParams = Depends(get_pagination_params),
        company_id: UUID = Depends(require_company_id),
        db: Session = Depends(get_db)
):
    """
    Listo makinat
    """
    cars, total = CarService.get_cars(
        db,
        company_id,
        status=status,
        skip=pagination.skip,
        limit=pagination.limit
    )

    return {
        "data": [CarResponse.model_validate(c) for c in cars],
        "total": total,
        "page": pagination.page,
        "limit": pagination.limit
    }


@router.post("/", response_model=CarResponse, status_code=status.HTTP_201_CREATED)
async def create_car(
        data: CarCreate,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Krijo makinë të re
    """
    car = CarService.create_car(db, company_id, data)
    return CarResponse.model_validate(car)


@router.get("/{car_id}", response_model=CarResponse)
async def get_car(
        car_id: UUID,
        company_id: UUID = Depends(require_company_id),
        db: Session = Depends(get_db)
):
    """
    Merr detajet e makinës
    """
    car = CarService.get_car(db, car_id, company_id)
    return CarResponse.model_validate(car)


@router.patch("/{car_id}", response_model=CarResponse)
async def update_car(
        car_id: UUID,
        data: CarUpdate,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Përditëso makinën
    """
    car = CarService.update_car(db, car_id, company_id, data)
    return CarResponse.model_validate(car)


@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_car(
        car_id: UUID,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Fshi makinën (soft delete)
    """
    CarService.delete_car(db, car_id, company_id)
    return None


@router.post("/{car_id}/photos")
async def upload_photo(
        car_id: UUID,
        file: UploadFile = File(...),
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Ngarko foto për makinën
    """
    photo = PhotoService.upload_car_photo(db, car_id, company_id, file)

    return {
        "id": str(photo.id),
        "path": photo.path,
        "sort_order": photo.sort_order
    }


@router.patch("/{car_id}/photos/reorder")
async def reorder_photos(
        car_id: UUID,
        photo_ids: List[UUID],
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Rirendis fotot
    """
    photos = PhotoService.reorder_photos(db, car_id, company_id, photo_ids)

    return {
        "message": "Fotot u rirenditën me sukses",
        "photos": [{"id": str(p.id), "sort_order": p.sort_order} for p in photos]
    }


@router.delete("/{car_id}/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
        car_id: UUID,
        photo_id: UUID,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_staff_or_owner),
        db: Session = Depends(get_db)
):
    """
    Fshi fotën
    """
    PhotoService.delete_photo(db, car_id, photo_id, company_id)
    return None