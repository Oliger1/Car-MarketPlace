"""
Customer Service
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


class CustomerService:
    """Customer management service"""

    @staticmethod
    def create_customer(db: Session, company_id: UUID, data: CustomerCreate) -> Customer:
        """Create customer"""
        customer = Customer(
            company_id=company_id,
            **data.model_dump()
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

        return customer

    @staticmethod
    def get_customer(db: Session, customer_id: UUID, company_id: UUID) -> Customer:
        """Get customer"""
        customer = db.query(Customer).filter(
            Customer.id == customer_id,
            Customer.company_id == company_id
        ).first()

        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Klienti nuk u gjet"
            )

        return customer

    @staticmethod
    def update_customer(
            db: Session,
            customer_id: UUID,
            company_id: UUID,
            data: CustomerUpdate
    ) -> Customer:
        """Update customer"""
        customer = CustomerService.get_customer(db, customer_id, company_id)

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(customer, field, value)

        db.commit()
        db.refresh(customer)

        return customer

    @staticmethod
    def get_customers(
            db: Session,
            company_id: UUID,
            q: Optional[str] = None,
            skip: int = 0,
            limit: int = 50
    ) -> tuple[List[Customer], int]:
        """Get company's customers"""
        query = db.query(Customer).filter(Customer.company_id == company_id)

        if q:
            query = query.filter(
                or_(
                    Customer.name.ilike(f"%{q}%"),
                    Customer.phone.ilike(f"%{q}%")
                )
            )

        total = query.count()
        customers = query.order_by(Customer.name).offset(skip).limit(limit).all()

        return customers, total