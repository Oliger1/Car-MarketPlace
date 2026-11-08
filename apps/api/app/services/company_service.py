"""
Company Service
"""
import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional

from app.models.company import Company
from app.models.company_slug import CompanySlug
from app.schemas.company import CompanyUpdate


class CompanyService:
    """Company management service"""

    @staticmethod
    def get_company(db: Session, company_id: UUID) -> Company:
        """Get company by ID"""
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kompania nuk u gjet"
            )
        return company

    @staticmethod
    def get_company_by_slug(db: Session, slug: str) -> Company:
        """Get company by slug (with redirect support)"""
        company = db.query(Company).filter(Company.slug == slug).first()

        if not company:
            # Check slug history for redirect
            old_slug = db.query(CompanySlug).filter(CompanySlug.old_slug == slug).first()
            if old_slug:
                company = db.query(Company).filter(Company.id == old_slug.company_id).first()
                if company:
                    # Return company with redirect flag
                    company._redirect_to = company.slug
                    return company

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kompania nuk u gjet"
            )

        return company

    @staticmethod
    def update_company(db: Session, company_id: UUID, data: CompanyUpdate) -> Company:
        """Update company"""
        company = CompanyService.get_company(db, company_id)

        # Handle slug change
        if data.slug and data.slug != company.slug:
            # Check if new slug is available
            existing = db.query(Company).filter(
                Company.slug == data.slug,
                Company.id != company_id
            ).first()

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Slug-u është i zënë tashmë"
                )

            # Store old slug for redirects
            old_slug = CompanySlug(
                company_id=company.id,
                old_slug=company.slug
            )
            db.add(old_slug)

        # Update fields
        for field, value in data.model_dump(exclude_unset=True).items():
            if field == "page_sections" and value is not None:
                value = json.dumps(value)
            setattr(company, field, value)

        # Closing the storefront also removes the company from Mix search.
        if not company.is_published:
            company.listed_on_market = False

        db.commit()
        db.refresh(company)

        return company

    @staticmethod
    def search_companies(
            db: Session,
            city: Optional[str] = None,
            q: Optional[str] = None,
            skip: int = 0,
            limit: int = 20
    ) -> tuple[List[Company], int]:
        """
        Search published companies
        Returns (companies, total_count)
        """
        query = db.query(Company).filter(
            Company.is_published.is_(True),
            Company.listed_on_market.is_(True),
            Company.is_suspended.is_(False),
            Company.deleted_at.is_(None),
        )

        # Filter by city
        if city:
            query = query.filter(Company.city.ilike(f"%{city}%"))

        # Search by name
        if q:
            query = query.filter(Company.name.ilike(f"%{q}%"))

        # Get total count
        total = query.count()

        # Paginate
        companies = query.order_by(Company.name).offset(skip).limit(limit).all()

        return companies, total