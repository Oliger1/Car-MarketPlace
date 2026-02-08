"""
Booking Model
"""
from sqlalchemy import (
    Column,
    String,
    Numeric,
    Text,
    Date,
    DateTime,
    ForeignKey,
    Enum,
    func,
    Index,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.base import Base


class BookingStatus(str, enum.Enum):
    REQUESTED = "requested"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        Index("ix_bookings_car_status_dates", "car_id", "status", "date_from", "date_to"),
        CheckConstraint("date_to >= date_from", name="check_booking_dates"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    car_id = Column(
        UUID(as_uuid=True), ForeignKey("cars.id", ondelete="RESTRICT"), nullable=False
    )
    customer_id = Column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True
    )
    request_id = Column(
        UUID(as_uuid=True), ForeignKey("booking_requests.id", ondelete="SET NULL"), nullable=True
    )
    date_from = Column(Date, nullable=False)
    date_to = Column(Date, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.REQUESTED, nullable=False)
    price_total = Column(Numeric(10, 2))
    deposit_amount = Column(Numeric(10, 2))
    currency = Column(String(3), default="EUR", nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    company = relationship("Company", back_populates="bookings")
    car = relationship("Car", back_populates="bookings")
    customer = relationship("Customer", back_populates="bookings")