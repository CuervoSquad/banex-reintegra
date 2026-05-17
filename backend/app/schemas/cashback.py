import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class QRPaymentCreate(BaseModel):
    qr_payment_id: str | None = Field(default=None, max_length=120)
    merchant_name: str = Field(..., min_length=2, max_length=180)
    payment_amount: Decimal = Field(..., gt=0, decimal_places=2)
    cashback_percentage: Decimal = Field(default=Decimal("0.03"), gt=0, le=1)
    duration_seconds: int = Field(default=3600, ge=60, le=2_592_000)
    contract_address: str | None = Field(default=None, max_length=120)
    chain_tx_hash: str | None = Field(default=None, max_length=120)


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
