"""
Platform admin — companies, market, billing cash, stats, admins
"""
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.deps.auth import require_platform_admin
from app.deps.pagination import PaginationParams, get_pagination_params
from app.models.booking_request import BookingRequest
from app.models.car import Car, CarStatus
from app.models.company import Company
from app.models.company_slug import CompanySlug
from app.models.invoice import Invoice, InvoiceStatus
from app.models.plan import Plan
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.user import User, UserRole
from app.schemas.admin import (
    AdminAssignSubscription,
    AdminCarPatch,
    AdminCarRow,
    AdminCompanyPatch,
    AdminCompanyRow,
    AdminEmailIn,
    AdminInvoiceRow,
    AdminSlugIn,
    AdminStats,
    PlanCreate,
    PlanUpdate,
)
from app.schemas.billing import InvoiceResponse, PlanResponse, SubscriptionResponse
from app.services.billing_service import BillingService
from app.services.email_service import EmailService
from app.services import platform_service as platform

router = APIRouter()


def _visibility(c: Company) -> str:
    if c.deleted_at:
        return "deleted"
    if c.is_suspended:
        return "suspended"
    if c.is_published and c.listed_on_market:
        return "public"
    if c.is_published:
        return "private"
    return "draft"


def _company_row(db: Session, c: Company) -> AdminCompanyRow:
    owner = db.query(User).filter(User.company_id == c.id, User.role == UserRole.OWNER).first()
    sub = c.subscription
    return AdminCompanyRow(
        id=c.id,
        name=c.name,
        slug=c.slug,
        city=c.city,
        is_published=bool(c.is_published),
        listed_on_market=bool(getattr(c, "listed_on_market", False)),
        is_suspended=bool(getattr(c, "is_suspended", False)),
        deleted_at=getattr(c, "deleted_at", None),
        visibility=_visibility(c),
        plan_id=sub.plan_id if sub else None,
        plan_name=sub.plan.name if sub and sub.plan else None,
        subscription_status=sub.status.value if sub and hasattr(sub.status, "value") else (str(sub.status) if sub else None),
        trial_until=sub.trial_until if sub else None,
        active_until=sub.active_until if sub else None,
        owner_email=owner.email if owner else None,
    )


@router.get("/stats", response_model=AdminStats)
async def admin_stats(_: User = Depends(require_platform_admin), db: Session = Depends(get_db)):
    week_ago = datetime.utcnow() - timedelta(days=7)
    return AdminStats(
        companies_total=db.query(Company).filter(Company.deleted_at.is_(None)).count(),
        companies_live=db.query(Company).filter(Company.deleted_at.is_(None), Company.is_published.is_(True), Company.is_suspended.is_(False)).count(),
        companies_on_market=db.query(Company).filter(
            Company.deleted_at.is_(None),
            Company.is_suspended.is_(False),
            Company.is_published.is_(True),
            Company.listed_on_market.is_(True),
        ).count(),
        companies_suspended=db.query(Company).filter(Company.deleted_at.is_(None), Company.is_suspended.is_(True)).count(),
        cars_on_market=db.query(Car)
        .join(Company, Car.company_id == Company.id)
        .filter(
            Car.is_published.is_(True),
            Car.status == CarStatus.ACTIVE,
            Company.is_published.is_(True),
            Company.listed_on_market.is_(True),
            Company.is_suspended.is_(False),
            Company.deleted_at.is_(None),
        )
        .count(),
        requests_last_7_days=db.query(BookingRequest).filter(BookingRequest.created_at >= week_ago).count(),
        invoices_open=db.query(Invoice).filter(Invoice.status == InvoiceStatus.ISSUED).count(),
    )


@router.get("/plans", response_model=List[PlanResponse])
async def admin_list_plans(_: User = Depends(require_platform_admin), db: Session = Depends(get_db)):
    return [PlanResponse.model_validate(p) for p in db.query(Plan).order_by(Plan.price_monthly.asc()).all()]


@router.post("/plans", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_plan(data: PlanCreate, _: User = Depends(require_platform_admin), db: Session = Depends(get_db)):
    if db.query(Plan).filter(Plan.id == data.id).first():
        raise HTTPException(status_code=400, detail="Plani me këtë ID ekziston")
    plan = Plan(**data.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return PlanResponse.model_validate(plan)


@router.patch("/plans/{plan_id}", response_model=PlanResponse)
async def admin_update_plan(plan_id: str, data: PlanUpdate, _: User = Depends(require_platform_admin), db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plani nuk u gjet")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(plan, key, value)
    db.commit()
    db.refresh(plan)
    return PlanResponse.model_validate(plan)


@router.get("/companies")
async def admin_list_companies(
    pagination: PaginationParams = Depends(get_pagination_params),
    q: Optional[str] = None,
    visibility: Optional[str] = None,
    _: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Company).options(joinedload(Company.subscription).joinedload(Subscription.plan))
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Company.name.ilike(like), Company.slug.ilike(like), Company.city.ilike(like)))
    if visibility == "deleted":
        query = query.filter(Company.deleted_at.isnot(None))
    elif visibility == "suspended":
        query = query.filter(Company.deleted_at.is_(None), Company.is_suspended.is_(True))
    elif visibility == "public":
        query = query.filter(
            Company.deleted_at.is_(None),
            Company.is_suspended.is_(False),
            Company.is_published.is_(True),
            Company.listed_on_market.is_(True),
        )
    elif visibility == "private":
        query = query.filter(
            Company.deleted_at.is_(None),
            Company.is_suspended.is_(False),
            Company.is_published.is_(True),
            Company.listed_on_market.is_(False),
        )
    elif visibility == "draft":
        query = query.filter(Company.deleted_at.is_(None), Company.is_suspended.is_(False), Company.is_published.is_(False))
    else:
        query = query.filter(Company.deleted_at.is_(None))

    total = query.count()
    companies = query.order_by(Company.created_at.desc()).offset(pagination.skip).limit(pagination.limit).all()
    return {
        "data": [_company_row(db, c) for c in companies],
        "total": total,
        "page": pagination.page,
        "limit": pagination.limit,
    }


@router.patch("/companies/{company_id}", response_model=AdminCompanyRow)
async def admin_patch_company(
    company_id: UUID,
    data: AdminCompanyPatch,
    background_tasks: BackgroundTasks,
    _: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    company = (
        db.query(Company)
        .options(joinedload(Company.subscription).joinedload(Subscription.plan))
        .filter(Company.id == company_id)
        .first()
    )
    if not company:
        raise HTTPException(status_code=404, detail="Kompania nuk u gjet")

    was_suspended = bool(getattr(company, "is_suspended", False))

    if data.soft_delete is True:
        company.deleted_at = datetime.utcnow()
        company.is_published = False
        company.listed_on_market = False
    elif data.soft_delete is False:
        company.deleted_at = None

    if data.is_suspended is not None:
        company.is_suspended = data.is_suspended
        if data.is_suspended:
            company.listed_on_market = False

    if data.is_published is not None:
        company.is_published = data.is_published
        if not data.is_published:
            company.listed_on_market = False

    if data.listed_on_market is not None:
        if data.listed_on_market and not company.is_published:
            raise HTTPException(status_code=400, detail="Aktivizo faqen live para se ta vendosësh në treg")
        if data.listed_on_market and company.is_suspended:
            raise HTTPException(status_code=400, detail="Kompania është e pezulluar")
        company.listed_on_market = data.listed_on_market

    if data.slug and data.slug != company.slug:
        slug = data.slug.lower()
        if slug in platform.all_reserved_slugs(db):
            raise HTTPException(status_code=400, detail="Slug i rezervuar / i bllokuar")
        existing = db.query(Company).filter(Company.slug == slug, Company.id != company.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug-u është i zënë")
        db.add(CompanySlug(company_id=company.id, old_slug=company.slug))
        company.slug = slug

    db.commit()
    db.refresh(company)

    if data.is_suspended is True and not was_suspended:
        owner = db.query(User).filter(User.company_id == company.id, User.role == UserRole.OWNER).first()
        if owner and owner.email:
            background_tasks.add_task(EmailService.send_account_suspended, owner.email, company.name)

    company = (
        db.query(Company)
        .options(joinedload(Company.subscription).joinedload(Subscription.plan))
        .filter(Company.id == company_id)
        .first()
    )
    return _company_row(db, company)


@router.post("/companies/{company_id}/subscription", response_model=SubscriptionResponse)
async def admin_assign_subscription(
    company_id: UUID,
    data: AdminAssignSubscription,
    background_tasks: BackgroundTasks,
    _: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Kompania nuk u gjet")

    plan = db.query(Plan).filter(Plan.id == data.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plani nuk u gjet")

    try:
        status_enum = SubscriptionStatus(data.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Status i pavlefshëm")

    subscription = db.query(Subscription).filter(Subscription.company_id == company_id).first()
    if not subscription:
        subscription = Subscription(company_id=company_id, plan_id=plan.id)
        db.add(subscription)

    subscription.plan_id = plan.id
    subscription.status = status_enum
    now = datetime.utcnow()
    if data.active_until is not None:
        subscription.active_until = data.active_until
    elif status_enum == SubscriptionStatus.ACTIVE and not subscription.active_until:
        subscription.active_until = now + timedelta(days=30)
    if data.trial_until is not None:
        subscription.trial_until = data.trial_until

    invoice_for_email: Optional[Invoice] = None
    # Cash invoice whenever asked — not only when status is already "active"
    if data.create_invoice:
        if status_enum == SubscriptionStatus.ACTIVE and not subscription.active_until:
            subscription.active_until = now + timedelta(days=30)
        invoice_for_email = Invoice(
            company_id=company_id,
            amount=plan.price_monthly,
            currency="EUR",
            status=InvoiceStatus.ISSUED,
            issued_at=now,
            due_date=now + timedelta(days=7),
            notes=(data.invoice_notes or "Pagesë cash") + f" · plan {plan.name}",
        )
        db.add(invoice_for_email)

    db.commit()

    if invoice_for_email is not None:
        owner = db.query(User).filter(User.company_id == company_id, User.role == UserRole.OWNER).first()
        if owner and owner.email:
            background_tasks.add_task(
                EmailService.send_invoice_issued,
                owner.email,
                company.name,
                str(invoice_for_email.amount),
                invoice_for_email.currency,
                invoice_for_email.due_date.strftime("%Y-%m-%d"),
                invoice_for_email.notes,
            )

    subscription = BillingService.get_subscription(db, company_id)
    return SubscriptionResponse.model_validate(subscription)


@router.get("/cars")
async def admin_list_cars(
    pagination: PaginationParams = Depends(get_pagination_params),
    q: Optional[str] = None,
    published: Optional[bool] = None,
    _: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Car).options(joinedload(Car.company)).join(Company, Car.company_id == Company.id)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Car.title.ilike(like), Car.slug.ilike(like), Company.name.ilike(like)))
    if published is not None:
        query = query.filter(Car.is_published.is_(published))
    total = query.count()
    cars = query.order_by(Car.created_at.desc()).offset(pagination.skip).limit(pagination.limit).all()
    rows = [
        AdminCarRow(
            id=car.id,
            title=car.title,
            slug=car.slug,
            company_id=car.company_id,
            company_name=car.company.name if car.company else "",
            company_slug=car.company.slug if car.company else "",
            is_published=car.is_published,
            price_per_day=car.price_per_day,
            city=car.company.city if car.company else None,
        )
        for car in cars
    ]
    return {"data": rows, "total": total, "page": pagination.page, "limit": pagination.limit}


@router.patch("/cars/{car_id}", response_model=AdminCarRow)
async def admin_patch_car(
    car_id: UUID,
    data: AdminCarPatch,
    _: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    car = db.query(Car).options(joinedload(Car.company)).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Makina nuk u gjet")
    if data.is_published is not None:
        car.is_published = data.is_published
    db.commit()
    db.refresh(car)
    return AdminCarRow(
        id=car.id,
        title=car.title,
        slug=car.slug,
        company_id=car.company_id,
        company_name=car.company.name if car.company else "",
        company_slug=car.company.slug if car.company else "",
        is_published=car.is_published,
        price_per_day=car.price_per_day,
        city=car.company.city if car.company else None,
    )


@router.get("/invoices")
async def admin_list_invoices(
    pagination: PaginationParams = Depends(get_pagination_params),
    status_filter: Optional[str] = None,
    _: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Invoice).options(joinedload(Invoice.company)).join(Company, Invoice.company_id == Company.id)
    if status_filter:
        try:
            query = query.filter(Invoice.status == InvoiceStatus(status_filter))
        except ValueError:
            raise HTTPException(status_code=400, detail="Status fature i pavlefshëm")
    total = query.count()
    invoices = query.order_by(Invoice.issued_at.desc()).offset(pagination.skip).limit(pagination.limit).all()
    rows = []
    for inv in invoices:
        sub = db.query(Subscription).filter(Subscription.company_id == inv.company_id).first()
        rows.append(
            AdminInvoiceRow(
                id=inv.id,
                company_id=inv.company_id,
                company_name=inv.company.name if inv.company else "",
                company_slug=inv.company.slug if inv.company else "",
                amount=inv.amount,
                currency=inv.currency,
                status=inv.status.value if hasattr(inv.status, "value") else str(inv.status),
                issued_at=inv.issued_at,
                due_date=inv.due_date,
                paid_at=inv.paid_at,
                notes=inv.notes,
                active_until=sub.active_until if sub else None,
            )
        )
    return {"data": rows, "total": total, "page": pagination.page, "limit": pagination.limit}


@router.post("/invoices/{invoice_id}/mark-paid", response_model=InvoiceResponse)
async def admin_mark_invoice_paid(invoice_id: UUID, _: User = Depends(require_platform_admin), db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Fatura nuk u gjet")
    invoice.status = InvoiceStatus.PAID
    invoice.paid_at = datetime.utcnow()
    if invoice.notes:
        if "cash" not in invoice.notes.lower():
            invoice.notes = f"{invoice.notes} · pagesë cash"
    else:
        invoice.notes = "Pagesë cash"
    db.commit()
    db.refresh(invoice)
    return InvoiceResponse.model_validate(invoice)


@router.get("/admins")
async def admin_list_admins(_: User = Depends(require_platform_admin), db: Session = Depends(get_db)):
    from app.core.config import settings as cfg

    return {
        "env": cfg.get_platform_admin_emails(),
        "extra": platform.extra_admin_emails(db),
        "all": platform.all_admin_emails(db),
    }


@router.post("/admins")
async def admin_add_admin(data: AdminEmailIn, _: User = Depends(require_platform_admin), db: Session = Depends(get_db)):
    emails = platform.add_admin_email(db, data.email)
    return {"all": emails}


@router.delete("/admins/{email}")
async def admin_remove_admin(email: str, _: User = Depends(require_platform_admin), db: Session = Depends(get_db)):
    try:
        emails = platform.remove_admin_email(db, email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"all": emails}


@router.get("/slugs")
async def admin_list_slugs(_: User = Depends(require_platform_admin), db: Session = Depends(get_db)):
    return {
        "builtin": sorted(platform.BUILTIN_RESERVED),
        "blocked": platform.blocked_slugs(db),
        "all": sorted(platform.all_reserved_slugs(db)),
    }


@router.post("/slugs/block")
async def admin_block_slug(data: AdminSlugIn, _: User = Depends(require_platform_admin), db: Session = Depends(get_db)):
    return {"all": platform.add_blocked_slug(db, data.slug)}


@router.delete("/slugs/block/{slug}")
async def admin_unblock_slug(slug: str, _: User = Depends(require_platform_admin), db: Session = Depends(get_db)):
    try:
        return {"all": platform.remove_blocked_slug(db, slug)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
