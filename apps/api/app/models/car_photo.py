"""
Car Photo Model
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.base import Base


class CarPhoto(Base):
    __tablename__ = "car_photos"
    __table_args__ = (Index("ix_car_photos_car_order", "car_id", "sort_order"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    car_id = Column(
        UUID(as_uuid=True), ForeignKey("cars.id", ondelete="CASCADE"), nullable=False, index=True
    )
    company_id = Column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    path = Column(String(500), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)
    alt_text = Column(String(255))

    car = relationship("Car", back_populates="photos")
    company = relationship("Company")