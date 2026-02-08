"""
Tenant Scoping Dependencies
"""
from fastapi import Depends, HTTPException, status
from uuid import UUID

from app.deps.auth import get_current_user
from app.models.user import User


async def get_current_company_id(
    current_user: User = Depends(get_current_user)
) -> UUID:
    """
    Get company_id for current authenticated user
    This is the core tenant isolation dependency
    """
    return current_user.company_id


async def require_company_id(
    company_id: UUID = Depends(get_current_company_id)
) -> UUID:
    """
    Dependency that ensures company_id is present
    Use this in all tenant-scoped endpoints
    """
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company context is required",
        )
    return company_id