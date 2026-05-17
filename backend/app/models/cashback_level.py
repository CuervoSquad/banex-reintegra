import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class CashbackLevel(Base):
    __tablename__ = "cashback_levels"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    min_amount_bs: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    max_amount_bs: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    percentage: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
