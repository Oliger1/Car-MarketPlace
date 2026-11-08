"""
Booking Request Model (public leads)
"""
from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey, Enum, func
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.base import Base


class BookingRequestStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    CONVERTED = "converted"
    SPAM = "spam"


class BookingRequest(Base):
    __tablename__ = "booking_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    car_id = Column(
        UUID(as_uuid=True), ForeignKey("cars.id", ondelete="SET NULL"), nullable=True, index=True
    )
    requester_name = Column(String(200), nullable=False)
    requester_phone = Column(String(50), nullable=False)
    requester_email = Column(String(255), nullable=True)
    date_from = Column(Date, nullable=True)
    date_to = Column(Date, nullable=True)
    message = Column(Text)
    status = Column(Enum(BookingRequestStatus), default=BookingRequestStatus.NEW, nullable=False)
    source_ip = Column(INET)
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    company = relationship("Company", back_populates="booking_requests")
    car = relationship("Car", back_populates="booking_requests")