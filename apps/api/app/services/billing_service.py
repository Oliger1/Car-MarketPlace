"""
Billing Service
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.models.subscription import Subscription, SubscriptionStatus
from app.models.plan import Plan
from app.models.car import Car, CarStatus


class BillingService:
    """Billing and subscription service"""

    @staticmethod
    def get_subscription(db: Session, company_id: UUID) -> Subscription:
        """Get company subscription"""
        subscription = db.query(Subscription).filter(
            Subscription.company_id == company_id
        ).first()

        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription nuk u gjet"
            )

        return subscription

    @staticmethod
    def change_plan(db: Session, company_id: UUID, plan_id: str) -> Subscription:
        """Change subscription plan"""
        subscription = BillingService.get_subscription(db, company_id)

        # Get new plan
        new_plan = db.query(Plan).filter(Plan.id == plan_id).first()
        if not new_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plani nuk u gjet"
            )

        # Check if company has more active cars than new plan allows
        active_cars = db.query(Car).filter(
            Car.company_id == company_id,
            Car.status == CarStatus.ACTIVE
        ).count()

        if active_cars > new_plan.car_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Keni {active_cars} makina aktive. Plani {new_plan.name} lejon vetëm {new_plan.car_limit}. Çaktivizoni disa makina para se të ndryshoni planin."
            )

        # Update subscription
        subscription.plan_id = plan_id

        db.commit()
        db.refresh(subscription)

        return subscription

    @staticmethod
    def get_plans(db: Session) -> List[Plan]:
        """Get all active plans"""
        return db.query(Plan).filter(Plan.is_active == True).all()

    @staticmethod
    def check_subscription_active(db: Session, company_id: UUID) -> bool:
        """
        Check if subscription is active (for feature gating)
        Returns True if trialing or active
        """
        subscription = db.query(Subscription).filter(
            Subscription.company_id == company_id
        ).first()

        if not subscription:
            return False

        return subscription.status in [
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.ACTIVE
        ]