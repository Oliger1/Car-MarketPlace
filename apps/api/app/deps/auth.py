"""
Auth Dependencies
"""
from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.db.session import get_db
from app.models.user import User, UserRole
from app.core.security import decode_access_token


async def get_current_user(
        access_token: Optional[str] = Cookie(None),
        db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT cookie
    """
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nuk jeni të kyçur",
        )

    # Decode token
    payload = decode_access_token(access_token)
    user_id: str = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token nuk është i vlefshëm",
        )

    # Get user from database
    user = db.query(User).filter(User.id == UUID(user_id)).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Përdoruesi nuk u gjet",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Përdoruesi është çaktivizuar",
        )

    return user


def require_role(allowed_roles: List[str]):
    """
    Dependency factory to check user role
    Usage: current_user = Depends(require_role(["owner", "staff"]))
    """

    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Nuk keni leje për këtë veprim",
            )
        return current_user

    return role_checker


# Shortcuts
async def require_owner(current_user: User = Depends(get_current_user)) -> User:
    """Require OWNER role"""
    if current_user.role != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm pronari mund të kryejë këtë veprim",
        )
    return current_user


async def require_staff_or_owner(current_user: User = Depends(get_current_user)) -> User:
    """Require STAFF or OWNER role"""
    if current_user.role not in [UserRole.OWNER, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nuk keni leje për këtë veprim",
        )
    return current_user