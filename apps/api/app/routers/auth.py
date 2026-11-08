"""
Auth Router
"""
from fastapi import APIRouter, Depends, status, Response, BackgroundTasks, Request
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
from app.services.email_service import EmailService
from app.core.security import create_access_token
from app.core.rate_limit import limiter
from app.core.config import settings


COOKIE_MAX_AGE = 60 * 60 * 24 * 7


def set_auth_cookie(response: Response, token: str) -> None:
    kwargs = {
        "key": "access_token",
        "value": token,
        "httponly": True,
        "secure": settings.is_production,
        "samesite": "lax",
        "path": "/",
        "max_age": COOKIE_MAX_AGE,
    }
    domain = settings.cookie_domain()
    if domain:
        kwargs["domain"] = domain
    response.set_cookie(**kwargs)


def clear_auth_cookie(response: Response) -> None:
    kwargs = {"key": "access_token", "path": "/"}
    domain = settings.cookie_domain()
    if domain:
        kwargs["domain"] = domain
    response.delete_cookie(**kwargs)


router = APIRouter()


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def register(
        request: Request,
        data: UserRegister,
        response: Response,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db)
):
    """
    Regjistro kompani të re me owner user
    """
    user = AuthService.register_company(db, data)

    access_token = create_access_token(data={"sub": str(user.id)})
    set_auth_cookie(response, access_token)

    background_tasks.add_task(EmailService.send_welcome, user.email, data.company_name)

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
    user = AuthService.authenticate_user(db, data.email, data.password)

    access_token = create_access_token(data={"sub": str(user.id)})
    set_auth_cookie(response, access_token)

    return LoginResponse(
        user=UserResponse.model_validate(user),
        message="Hyrje e suksesshme"
    )


@router.post("/logout")
async def logout(response: Response):
    """
    Dil nga llogaria
    """
    clear_auth_cookie(response)

    return {"message": "Dolët me sukses"}


@router.post("/forgot-password")
@limiter.limit("3/hour")
async def forgot_password(
        request: Request,
        data: ForgotPassword,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db)
):
    """
    Dërgo token për rivendosje fjalëkalimi
    """
    token = AuthService.initiate_password_reset(db, data.email)
    payload = {
        "message": "Nëse email-i ekziston, do të merrni një link për rivendosje",
    }
    if token:
        reset_url = f"{settings.APP_URL.rstrip('/')}/reset-password?token={token}"
        background_tasks.add_task(EmailService.send_password_reset, data.email, reset_url)
        if not settings.is_production:
            payload["token"] = token
            payload["reset_url"] = reset_url
    return payload


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
