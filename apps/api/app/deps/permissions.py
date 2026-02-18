from __future__ import annotations
from fastapi import Depends, HTTPException, status
from app.core.rbac import has_perm

from app.deps.auth import get_current_user  

def require_perm(permission: str):
    def _dep(user = Depends(get_current_user)):
        roles = getattr(user, "roles", None) or getattr(user, "role", None)
        if isinstance(roles, str):
            roles = [roles]
        if not roles or not has_perm(roles, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permission: {permission}",
            )
        return user
    return _dep
