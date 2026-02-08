"""
Plan Model
"""
from sqlalchemy import Column, String, Integer, Numeric, Boolean

from app.db.base import Base


class Plan(Base):
    __tablename__ = "plans"

    id = Column(String(20), primary_key=True)  # e.g., "p10", "p30", "p100"
    name = Column(String(100), nullable=False)
    car_limit = Column(Integer, nullable=False)
    price_monthly = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)