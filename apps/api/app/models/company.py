"""
Company Model
"""
from sqlalchemy import Column, String, Text, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    city = Column(String(100), nullable=False)
    description = Column(Text)
    phone = Column(String(50))
    whatsapp = Column(String(50))
    website_url = Column(String(255))
    logo_path = Column(String(500))
    cover_path = Column(String(500))
    brand_primary = Column(String(7), default="#0f6e6a")
    brand_accent = Column(String(7), default="#e07a3d")
    hero_title = Column(String(200))
    hero_subtitle = Column(Text)
    page_sections = Column(Text)
    is_published = Column(Boolean, default=False, nullable=False)  # subdomain live
    listed_on_market = Column(Boolean, default=False, nullable=False)  # appears on Mix marketplace
    is_suspended = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    cars = relationship("Car", back_populates="company", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="company", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="company", cascade="all, delete-orphan")
    booking_requests = relationship(
        "BookingRequest", back_populates="company", cascade="all, delete-orphan"
    )
    subscription = relationship(
        "Subscription", back_populates="company", uselist=False, cascade="all, delete-orphan"
    )
    invoices = relationship("Invoice", back_populates="company", cascade="all, delete-orphan")
    slug_history = relationship(
        "CompanySlug", back_populates="company", cascade="all, delete-orphan"
    )