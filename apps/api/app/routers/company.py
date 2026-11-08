"""
Company Router
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
import os
import uuid

from app.db.session import get_db
from app.deps.auth import require_owner
from app.deps.tenant import require_company_id
from app.models.user import User
from app.schemas.company import CompanyResponse, CompanyUpdate
from app.services.company_service import CompanyService
from app.core.config import settings
from app.utils.images import verify_image, strip_exif

router = APIRouter()


@router.get("/", response_model=CompanyResponse)
async def get_company(
        company_id: UUID = Depends(require_company_id),
        db: Session = Depends(get_db)
):
    """
    Merr të dhënat e kompanisë
    """
    company = CompanyService.get_company(db, company_id)
    return CompanyResponse.model_validate(company)


@router.patch("/", response_model=CompanyResponse)
async def update_company(
        data: CompanyUpdate,
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_owner),
        db: Session = Depends(get_db)
):
    """
    Përditëso të dhënat e kompanisë
    """
    company = CompanyService.update_company(db, company_id, data)
    return CompanyResponse.model_validate(company)


@router.post("/logo")
async def upload_logo(
        file: UploadFile = File(...),
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_owner),
        db: Session = Depends(get_db)
):
    """
    Ngarko logo e kompanisë
    """
    # Validate file
    if file.content_type not in settings.get_allowed_image_types():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formati i fotove jo i vlefshëm"
        )

    # Read file
    content = await file.read()

    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fotoja është shumë e madhe"
        )

    if not verify_image(content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File nuk është foto e vlefshme"
        )

    # Generate filename
    ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
    filename = f"logo_{uuid.uuid4()}.{ext}"

    # Create directory
    upload_dir = os.path.join(settings.UPLOAD_DIR, "companies", str(company_id))
    os.makedirs(upload_dir, exist_ok=True)

    # Save file
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # Strip EXIF
    strip_exif(file_path)

    # Update company
    company = CompanyService.get_company(db, company_id)

    # Delete old logo if exists
    if company.logo_path:
        old_path = os.path.join(settings.UPLOAD_DIR, company.logo_path.lstrip('/uploads/'))
        if os.path.exists(old_path):
            os.remove(old_path)

    company.logo_path = f"/uploads/companies/{company_id}/{filename}"
    db.commit()

    return {"path": company.logo_path}


@router.post("/cover")
async def upload_cover(
        file: UploadFile = File(...),
        company_id: UUID = Depends(require_company_id),
        current_user: User = Depends(require_owner),
        db: Session = Depends(get_db)
):
    """
    Ngarko cover photo e kompanisë
    """
    # Same logic as logo
    if file.content_type not in settings.get_allowed_image_types():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formati i fotove jo i vlefshëm"
        )

    content = await file.read()

    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fotoja është shumë e madhe"
        )

    if not verify_image(content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File nuk është foto e vlefshme"
        )

    ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
    filename = f"cover_{uuid.uuid4()}.{ext}"

    upload_dir = os.path.join(settings.UPLOAD_DIR, "companies", str(company_id))
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(content)

    strip_exif(file_path)

    company = CompanyService.get_company(db, company_id)

    if company.cover_path:
        old_path = os.path.join(settings.UPLOAD_DIR, company.cover_path.lstrip('/uploads/'))
        if os.path.exists(old_path):
            os.remove(old_path)

    company.cover_path = f"/uploads/companies/{company_id}/{filename}"
    db.commit()

    return {"path": company.cover_path}