import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, SmallInteger, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class UploadSession(Base):
    __tablename__ = "upload_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    period_month: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    period_year: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    exchange_rate: Mapped[Decimal] = mapped_column(Numeric(14, 6), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    row_count: Mapped[int | None] = mapped_column(Integer)
    rejected_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    validation_summary: Mapped[dict | None] = mapped_column(JSONB)
    error_message: Mapped[str | None] = mapped_column(Text)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    rows: Mapped[list["UploadRow"]] = relationship("UploadRow", back_populates="session", cascade="all, delete-orphan")
    reports: Mapped[list["MonthlyReport"]] = relationship("MonthlyReport", back_populates="session")


class UploadRow(Base):
    __tablename__ = "upload_rows"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("upload_sessions.id", ondelete="CASCADE"), nullable=False
    )
    user_identifier: Mapped[str] = mapped_column(String(255), nullable=False)
    merchant_name: Mapped[str | None] = mapped_column(String(255))
    amount_bs: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    amount_usdt: Mapped[Decimal | None] = mapped_column(Numeric(14, 6))
    exchange_rate: Mapped[Decimal | None] = mapped_column(Numeric(14, 6))
    transaction_date: Mapped[date | None] = mapped_column(Date)
    raw_data: Mapped[dict | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    session: Mapped["UploadSession"] = relationship("UploadSession", back_populates="rows")
