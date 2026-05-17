import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class CashbackStream(Base):
    __tablename__ = "cashback_streams"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    qr_payment_id: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    merchant_name: Mapped[str] = mapped_column(String(180), nullable=False)
    payment_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    cashback_total: Mapped[Decimal] = mapped_column(Numeric(14, 6), nullable=False)
    stream_rate_per_second: Mapped[Decimal] = mapped_column(Numeric(14, 8), nullable=False)
    streamed_claimed_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 6),
        nullable=False,
        default=Decimal("0"),
    )
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    contract_address: Mapped[str | None] = mapped_column(String(120))
    chain_tx_hash: Mapped[str | None] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user: Mapped["User"] = relationship("User", back_populates="cashback_streams")
