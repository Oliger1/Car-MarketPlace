"""
Auth Router
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    ForgotPassword,
    ResetPassword,
    LoginResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.core.security import create_access_token
from app.core.rate_limit import limiter
from fastapi import Request

router = APIRouter()


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def register(
        request: Request,
        data: UserRegister,
        response: Response,
        db: Session = Depends(get_db)
):
    """
    Regjistro kompani të re me owner user
    """
    # Create company and user
    user = AuthService.register_company(db, data)

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})

    # Set cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7  # 7 days
    )

    return LoginResponse(
        user=UserResponse.model_validate(user),
        message="Regjistrimi u krye me sukses"
    )


@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(
        request: Request,
        data: UserLogin,
        response: Response,
        db: Session = Depends(get_db)
):
    """
    Hyr në llogari
    """
    # Authenticate user
    user = AuthService.authenticate_user(db, data.email, data.password)

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})

    # Set cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7  # 7 days
    )

    return LoginResponse(
        user=UserResponse.model_validate(user),
        message="Hyrje e suksesshme"
    )


@router.post("/logout")
async def logout(response: Response):
    """
    Dil nga llogaria
    """
    # Clear cookie
    response.delete_cookie(key="access_token")

    return {"message": "Dolët me sukses"}


@router.post("/forgot-password")
@limiter.limit("3/hour")
async def forgot_password(
        request: Request,
        data: ForgotPassword,
        db: Session = Depends(get_db)
):
    """
    Dërgo token për rivendosje fjalëkalimi
    """
    token = AuthService.initiate_password_reset(db, data.email)

    # In production, send email with token
    # For MVP, return token directly (remove in production!)
    return {
        "message": "Nëse email-i ekziston, do të merrni një link për rivendosje",
        "token": token  # REMOVE THIS IN PRODUCTION!
    }


@router.post("/reset-password")
async def reset_password(
        data: ResetPassword,
        db: Session = Depends(get_db)
):
    """
    Rivendos fjalëkalimin me token
    """
    AuthService.reset_password(db, data.token, data.new_password)

    return {"message": "Fjalëkalimi u ndryshua me sukses"}