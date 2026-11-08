"""
Authentication Service
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from uuid import UUID

from app.models.user import User, UserRole
from app.models.company import Company
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.plan import Plan
from app.core.security import verify_password, get_password_hash, create_password_reset_token
from app.schemas.auth import UserRegister


class AuthService:
    """Authentication service"""

    @staticmethod
    def register_company(db: Session, data: UserRegister) -> User:
        """
        Register new company with owner user
        Creates: Company + Owner User + Trial Subscription
        """
        # Check if email exists
        existing_user = db.query(User).filter(User.email == data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email-i është i regjistruar tashmë"
            )

        # Check if slug exists
        existing_company = db.query(Company).filter(Company.slug == data.slug).first()
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug-u është i zënë tashmë"
            )

        # Get starter plan
        starter_plan = db.query(Plan).filter(Plan.id == "p10").first()
        if not starter_plan:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Plan not found"
            )

        # Create company
        company = Company(
            name=data.company_name,
            slug=data.slug,
            city=data.city,
            phone=data.phone,
            whatsapp=data.whatsapp,
            is_published=False
        )
        db.add(company)
        db.flush()

        # Create owner user
        user = User(
            company_id=company.id,
            email=data.email,
            password_hash=get_password_hash(data.password),
            role=UserRole.OWNER,
            is_active=True
        )
        db.add(user)

        # Create trial subscription (30 days)
        subscription = Subscription(
            company_id=company.id,
            plan_id=starter_plan.id,
            status=SubscriptionStatus.TRIALING,
            trial_until=datetime.utcnow() + timedelta(days=30)
        )
        db.add(subscription)

        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        """
        Authenticate user by email and password
        """
        user = db.query(User).filter(User.email == email).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ose fjalëkalim i gabuar"
            )

        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ose fjalëkalim i gabuar"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Llogaria është e çaktivizuar"
            )

        return user

    @staticmethod
    def initiate_password_reset(db: Session, email: str) -> str | None:
        """Create password reset token without revealing whether the email exists."""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None

        token = create_password_reset_token(email)
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
        db.commit()
        return token

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> None:
        """
        Reset password using token
        """
        user = db.query(User).filter(
            User.reset_token == token,
            User.reset_token_expires > datetime.utcnow()
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token-i nuk është i vlefshëm ose ka skaduar"
            )

        # Update password
        user.password_hash = get_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires = None

        db.commit()