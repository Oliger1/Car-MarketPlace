"""
Photo Service
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status, UploadFile
from uuid import UUID
import os
import uuid
from typing import List
import io
from PIL import Image

from app.models.car_photo import CarPhoto
from app.models.car import Car
from app.core.config import settings
from app.utils.images import verify_image, strip_exif


class PhotoService:
    """Photo management service"""

    @staticmethod
    def upload_car_photo(
            db: Session,
            car_id: UUID,
            company_id: UUID,
            file: UploadFile
    ) -> CarPhoto:
        """Upload car photo"""
        # Verify car exists and belongs to company
        car = db.query(Car).filter(
            Car.id == car_id,
            Car.company_id == company_id
        ).first()

        if not car:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Makina nuk u gjet"
            )

        # Check photo limit
        photo_count = db.query(CarPhoto).filter(CarPhoto.car_id == car_id).count()
        if photo_count >= settings.MAX_PHOTOS_PER_CAR:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maksimumi i fotove është {settings.MAX_PHOTOS_PER_CAR}"
            )

        # Validate file
        if file.content_type not in settings.get_allowed_image_types():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formati i fotove jo i vlefshëm. Përdorni JPG, PNG ose WEBP"
            )

        # Read file
        content = file.file.read()

        # Check size
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Fotoja është shumë e madhe. Maksimumi {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
            )

        # Verify it's a valid image
        if not verify_image(content):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File nuk është foto e vlefshme"
            )

        # Generate filename
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
        filename = f"{uuid.uuid4()}.{ext}"

        # Create directory
        upload_dir = os.path.join(settings.UPLOAD_DIR, "cars", str(car_id))
        os.makedirs(upload_dir, exist_ok=True)

        # Save file
        file_path = os.path.join(upload_dir, filename)
        with open(file_path, "wb") as f:
            f.write(content)

        # Strip EXIF
        strip_exif(file_path)

        # Get next sort order
        next_order = db.query(func.max(CarPhoto.sort_order)).filter(
            CarPhoto.car_id == car_id
        ).scalar() or 0

        # Create database record
        photo = CarPhoto(
            car_id=car_id,
            company_id=company_id,
            path=f"/uploads/cars/{car_id}/{filename}",
            sort_order=next_order + 1
        )
        db.add(photo)
        db.commit()
        db.refresh(photo)

        return photo

    @staticmethod
    def reorder_photos(
            db: Session,
            car_id: UUID,
            company_id: UUID,
            photo_ids: List[UUID]
    ) -> List[CarPhoto]:
        """Reorder car photos"""
        # Verify car
        car = db.query(Car).filter(
            Car.id == car_id,
            Car.company_id == company_id
        ).first()

        if not car:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Makina nuk u gjet"
            )

        # Get all photos
        photos = db.query(CarPhoto).filter(
            CarPhoto.car_id == car_id,
            CarPhoto.id.in_(photo_ids)
        ).all()

        if len(photos) != len(photo_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Disa foto nuk u gjetën"
            )

        # Update sort orders
        photo_map = {str(p.id): p for p in photos}
        for idx, photo_id in enumerate(photo_ids):
            photo_map[str(photo_id)].sort_order = idx

        db.commit()

        return photos

    @staticmethod
    def delete_photo(
            db: Session,
            car_id: UUID,
            photo_id: UUID,
            company_id: UUID
    ) -> None:
        """Delete car photo"""
        # Verify photo exists and belongs to company
        photo = db.query(CarPhoto).filter(
            CarPhoto.id == photo_id,
            CarPhoto.car_id == car_id,
            CarPhoto.company_id == company_id
        ).first()

        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fotoja nuk u gjet"
            )

        # Delete file from disk
        file_path = os.path.join(settings.UPLOAD_DIR, photo.path.lstrip('/uploads/'))
        if os.path.exists(file_path):
            os.remove(file_path)

        # Delete from database
        db.delete(photo)
        db.commit()