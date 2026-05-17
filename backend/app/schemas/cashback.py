import re
import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator

from app.core.financial_limits import (
    MAX_MERCHANT_NAME_LENGTH,
    MAX_PAYMENT_AMOUNT_BS,
    MAX_STREAM_DURATION_SECONDS,
    MIN_PAYMENT_AMOUNT_BS,
    MIN_STREAM_DURATION_SECONDS,
    ALLOWED_MERCHANT_CHARS_PATTERN,
)

_MERCHANT_RE = re.compile(ALLOWED_MERCHANT_CHARS_PATTERN)


class QRPaymentCreate(BaseModel):
    qr_payment_id: str | None = Field(default=None, max_length=120)
    merchant_name: str = Field(..., min_length=2, max_length=MAX_MERCHANT_NAME_LENGTH)
    payment_amount: Decimal = Field(
        ...,
        gt=MIN_PAYMENT_AMOUNT_BS,
        le=MAX_PAYMENT_AMOUNT_BS,
        decimal_places=2,
    )
    # cashback_percentage ya NO es aceptado del cliente — se calcula server-side
    # según el nivel del usuario en la BD.
    duration_seconds: int = Field(
        default=3600,
        ge=MIN_STREAM_DURATION_SECONDS,
        le=MAX_STREAM_DURATION_SECONDS,
    )
    contract_address: str | None = Field(default=None, max_length=120)
    chain_tx_hash: str | None = Field(default=None, max_length=120)

    @field_validator("merchant_name")
    @classmethod
    def sanitize_merchant_name(cls, v: str) -> str:
        v = v.strip()
        if not _MERCHANT_RE.match(v):
            raise ValueError("merchant_name contiene caracteres no permitidos")
        return v

    @field_validator("payment_amount")
    @classmethod
    def validate_payment_amount(cls, v: Decimal) -> Decimal:
        if v != v.quantize(Decimal("0.01")):
            raise ValueError("payment_amount debe tener máximo 2 decimales")
        return v


class CashbackStreamResponse(BaseModel):
    id: uuid.UUID
    qr_payment_id: str
    merchant_name: str
    payment_amount: Decimal
    cashback_total: Decimal
    streamed_amount: Decimal
    claimed_amount: Decimal
    claimable_amount: Decimal
    stream_rate_per_second: Decimal
    status: str
    starts_at: datetime
    ends_at: datetime
    server_time: datetime
    contract_address: str | None = None
    chain_tx_hash: str | None = None

    model_config = {"from_attributes": True}


class CashbackClaimResponse(BaseModel):
    stream: CashbackStreamResponse
    claimed_now: Decimal
