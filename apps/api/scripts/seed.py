"""
Seed database with marketplace demo data
"""
import os
import sys
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base import Base, engine
from app.db.ensure_schema import ensure_schema
from app.db.session import SessionLocal
from app.models.car import Car, CarStatus, FuelType, TransmissionType
from app.models.car_photo import CarPhoto
from app.models.company import Company
from app.models.plan import Plan
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.user import User, UserRole

PHOTO_URLS = {
    "vw-golf-8": "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
    "mercedes-c-class": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
    "dacia-duster": "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
    "toyota-yaris": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80",
    "bmw-x3": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
}


def download_photo(slug: str, dest: Path) -> bool:
    url = PHOTO_URLS.get(slug)
    if not url or dest.exists():
        return dest.exists()
    try:
        dest.parent.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(url, headers={"User-Agent": "MixSeed/1.0"})
        with urllib.request.urlopen(req, timeout=20) as resp, open(dest, "wb") as out:
            out.write(resp.read())
        return True
    except Exception as exc:
        print(f"  photo {slug}: {exc}")
        return False


def ensure_car_photo(db, car: Car, company: Company):
    if car.photos:
        return
    upload_root = Path(settings.UPLOAD_DIR)
    rel = Path("cars") / str(company.id) / f"{car.slug}.jpg"
    abs_path = upload_root / rel
    if download_photo(car.slug, abs_path):
        db.add(
            CarPhoto(
                car_id=car.id,
                company_id=company.id,
                path=str(rel).replace("\\", "/"),
                sort_order=0,
                alt_text=car.title,
            )
        )


def ensure_company_fleet(db, company: Company, cars_data: list[dict]):
    for car_data in cars_data:
        car = (
            db.query(Car)
            .filter(Car.company_id == company.id, Car.slug == car_data["slug"])
            .first()
        )
        if not car:
            car = Car(
                company_id=company.id,
                currency="EUR",
                status=CarStatus.ACTIVE,
                is_published=True,
                **car_data,
            )
            db.add(car)
            db.flush()
            print(f"  car: {car.title}")
        ensure_car_photo(db, car, company)


def seed():
    print("Seeding database...")
    # API startup usually already created tables/enums; ignore PG enum races.
    try:
        Base.metadata.create_all(bind=engine)
    except IntegrityError as exc:
        print(f"create_all: schema already present ({exc.__class__.__name__})")
    ensure_schema()
    db = SessionLocal()

    try:
        for plan_data in [
            {"id": "p10", "name": "Starter", "car_limit": 10, "price_monthly": 29.99, "is_active": True},
            {"id": "p30", "name": "Professional", "car_limit": 30, "price_monthly": 79.99, "is_active": True},
            {"id": "p100", "name": "Enterprise", "car_limit": 100, "price_monthly": 199.99, "is_active": True},
        ]:
            if not db.query(Plan).filter(Plan.id == plan_data["id"]).first():
                db.add(Plan(**plan_data))
                print(f"plan: {plan_data['name']}")
        db.commit()

        company = db.query(Company).filter(Company.slug == "demo-rent").first()
        if not company:
            company = Company(
                name="Demo Rent a Car",
                slug="demo-rent",
                city="Tirane",
                description="Flote e paster ne qender te Tiranes. Dorezim ne aeroport me porosi.",
                phone="+355692000000",
                whatsapp="+355692000000",
                is_published=True,
                listed_on_market=True,
            )
            db.add(company)
            db.flush()
            db.add(
                User(
                    company_id=company.id,
                    email="demo@mix.al",
                    password_hash=get_password_hash("demo123"),
                    role=UserRole.OWNER,
                    is_active=True,
                )
            )
            db.add(
                Subscription(
                    company_id=company.id,
                    plan_id="p10",
                    status=SubscriptionStatus.TRIALING,
                    trial_until=datetime.utcnow() + timedelta(days=30),
                )
            )
            print("company: Demo Rent a Car (demo@mix.al / demo123)")
        db.commit()
        db.refresh(company)

        ensure_company_fleet(
            db,
            company,
            [
                dict(
                    title="Volkswagen Golf 8",
                    slug="vw-golf-8",
                    make="Volkswagen",
                    model="Golf",
                    year=2023,
                    transmission=TransmissionType.AUTOMATIC,
                    fuel=FuelType.PETROL,
                    seats=5,
                    price_per_day=35,
                    deposit_amount=200,
                    location_text="Tirane",
                    description="Golf i paster, ideal per qytet.",
                ),
                dict(
                    title="Mercedes C-Class",
                    slug="mercedes-c-class",
                    make="Mercedes",
                    model="C-Class",
                    year=2022,
                    transmission=TransmissionType.AUTOMATIC,
                    fuel=FuelType.DIESEL,
                    seats=5,
                    price_per_day=70,
                    deposit_amount=400,
                    location_text="Tirane",
                    description="Komfort biznesi, automatik.",
                ),
                dict(
                    title="Dacia Duster",
                    slug="dacia-duster",
                    make="Dacia",
                    model="Duster",
                    year=2024,
                    transmission=TransmissionType.MANUAL,
                    fuel=FuelType.DIESEL,
                    seats=5,
                    price_per_day=40,
                    deposit_amount=250,
                    location_text="Tirane",
                    description="SUV praktik per udhetime.",
                ),
            ],
        )
        db.commit()

        company2 = db.query(Company).filter(Company.slug == "adriatik-rent").first()
        if not company2:
            company2 = Company(
                name="Adriatik Rent",
                slug="adriatik-rent",
                city="Durres",
                description="Qira prane plazhit — dorezim ne port dhe hotel.",
                phone="+355693000000",
                whatsapp="+355693000000",
                is_published=True,
                listed_on_market=True,
            )
            db.add(company2)
            db.flush()
            db.add(
                User(
                    company_id=company2.id,
                    email="adriatik@mix.al",
                    password_hash=get_password_hash("demo123"),
                    role=UserRole.OWNER,
                    is_active=True,
                )
            )
            db.add(
                Subscription(
                    company_id=company2.id,
                    plan_id="p10",
                    status=SubscriptionStatus.TRIALING,
                    trial_until=datetime.utcnow() + timedelta(days=30),
                )
            )
            print("company: Adriatik Rent (adriatik@mix.al / demo123)")
        db.commit()
        db.refresh(company2)

        ensure_company_fleet(
            db,
            company2,
            [
                dict(
                    title="Toyota Yaris",
                    slug="toyota-yaris",
                    make="Toyota",
                    model="Yaris",
                    year=2023,
                    transmission=TransmissionType.AUTOMATIC,
                    fuel=FuelType.HYBRID,
                    seats=5,
                    price_per_day=28,
                    deposit_amount=150,
                    location_text="Durres",
                    description="Hibrid ekonomik.",
                ),
                dict(
                    title="BMW X3",
                    slug="bmw-x3",
                    make="BMW",
                    model="X3",
                    year=2021,
                    transmission=TransmissionType.AUTOMATIC,
                    fuel=FuelType.DIESEL,
                    seats=5,
                    price_per_day=85,
                    deposit_amount=500,
                    location_text="Durres",
                    description="SUV premium.",
                ),
            ],
        )
        db.commit()

        # Platform admin (cash / plans) — email must match PLATFORM_ADMIN_EMAILS
        admin_company = db.query(Company).filter(Company.slug == "mix-ops").first()
        if not admin_company:
            admin_company = Company(
                name="Mix Ops",
                slug="mix-ops",
                city="Tirane",
                description="Kompani interne per admin te platformes.",
                is_published=False,
            )
            db.add(admin_company)
            db.flush()
            db.add(
                Subscription(
                    company_id=admin_company.id,
                    plan_id="p100",
                    status=SubscriptionStatus.ACTIVE,
                )
            )
            print("company: Mix Ops")
        admin_user = db.query(User).filter(User.email == "admin@mix.al").first()
        if not admin_user:
            db.add(
                User(
                    company_id=admin_company.id,
                    email="admin@mix.al",
                    password_hash=get_password_hash("admin123"),
                    role=UserRole.OWNER,
                    is_active=True,
                )
            )
            print("admin: admin@mix.al / admin123")
        db.commit()
        print("Seed done.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
