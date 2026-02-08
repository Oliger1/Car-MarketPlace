"""
Invoice Model
"""
from sqlalchemy import Column, String, Numeric, Text, DateTime, ForeignKey, Enum, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.base import Base


class InvoiceStatus(str, enum.Enum):
    ISSUED = "issued"
    PAID = "paid"
    VOID = "void"


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="EUR", nullable=False)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.ISSUED, nullable=False)
    issued_at = Column(DateTime(timezone=True), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text)

    company = relationship("Company", back_populates="invoices")