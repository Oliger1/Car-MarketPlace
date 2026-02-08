"""
Database base configuration
Import all models here so SQLAlchemy can create tables
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.ENVIRONMENT == "development"
)

# Create base class
Base = declarative_base()

# Import all models to register them with Base
# This ensures all tables are created when Base.metadata.create_all() is called
from app.models.plan import Plan
from app.models.company import Company
from app.models.company_slug import CompanySlug
from app.models.user import User
from app.models.subscription import Subscription
from app.models.invoice import Invoice
from app.models.car import Car
from app.models.car_photo import CarPhoto
from app.models.customer import Customer
from app.models.booking import Booking
from app.models.booking_request import BookingRequest