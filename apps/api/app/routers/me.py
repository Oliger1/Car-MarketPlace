"""
Me Router (current user info)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps.auth import get_current_user
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.company import CompanyResponse
from app.services.platform_service import is_platform_admin

router = APIRouter()


@router.get("/")
async def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {
        "user": UserResponse.model_validate(current_user),
        "company": CompanyResponse.model_validate(current_user.company),
        "is_platform_admin": is_platform_admin(db, current_user.email),
    }
