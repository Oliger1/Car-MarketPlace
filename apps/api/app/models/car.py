"""
Car Model
"""
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    func,
    UniqueConstraint,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.base import Base


class CarStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"


class TransmissionType(str, enum.Enum):
    MANUAL = "manual"
    AUTOMATIC = "automatic"


class FuelType(str, enum.Enum):
    PETROL = "petrol"
    DIESEL = "diesel"
    HYBRID = "hybrid"
    ELECTRIC = "electric"


class Car(Base):
    __tablename__ = "cars"
    __table_args__ = (
        UniqueConstraint("company_id", "slug", name="uq_company_car_slug"),
        Index("ix_cars_company_status", "company_id", "status"),
        Index("ix_cars_company_published", "company_id", "is_published"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    slug = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    make = Column(String(50), nullable=False)
    model = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    transmission = Column(Enum(TransmissionType), nullable=False)
    fuel = Column(Enum(FuelType), nullable=False)
    seats = Column(Integer, nullable=False)
    price_per_day = Column(Numeric(10, 2), nullable=False)
    deposit_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="EUR", nullable=False)
    status = Column(Enum(CarStatus), default=CarStatus.ACTIVE, nullable=False)
    description = Column(Text)
    location_text = Column(String(255))
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    company = relationship("Company", back_populates="cars")
    photos = relationship(
        "CarPhoto", back_populates="car", order_by="CarPhoto.sort_order", cascade="all, delete-orphan"
    )
    bookings = relationship("Booking", back_populates="car")
    booking_requests = relationship("BookingRequest", back_populates="car")