import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, SmallInteger, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class MonthlyReport(Base):
    __tablename__ = "monthly_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("upload_sessions.id", ondelete="CASCADE"), nullable=False
    )
    generated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    period_month: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    period_year: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    exchange_rate: Mapped[Decimal] = mapped_column(Numeric(14, 6), nullable=False)
    total_users: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_amount_bs: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    total_reintegro_usdt: Mapped[Decimal] = mapped_column(Numeric(14, 6), default=0, nullable=False)
    total_reintegro_bs: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    session: Mapped["UploadSession"] = relationship("UploadSession", back_populates="reports")
    rows: Mapped[list["ReportRow"]] = relationship("ReportRow", back_populates="report", cascade="all, delete-orphan")


class ReportRow(Base):
    __tablename__ = "report_rows"

    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("monthly_reports.id", ondelete="CASCADE"), nullable=False
    )
    user_identifier: Mapped[str] = mapped_column(String(255), nullable=False)
    total_amount_bs: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_amount_usdt: Mapped[Decimal] = mapped_column(Numeric(14, 6), nullable=False)
    level_id: Mapped[int | None] = mapped_column(ForeignKey("cashback_levels.id"))
    level_name: Mapped[str | None] = mapped_column(String(50))
    level_percentage: Mapped[Decimal | None] = mapped_column(Numeric(5, 4))
    reintegro_usdt: Mapped[Decimal] = mapped_column(Numeric(14, 6), nullable=False)
    reintegro_bs: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    exchange_rate: Mapped[Decimal] = mapped_column(Numeric(14, 6), nullable=False)

    report: Mapped["MonthlyReport"] = relationship("MonthlyReport", back_populates="rows")
