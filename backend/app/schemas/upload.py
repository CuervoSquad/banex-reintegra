import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class UploadSessionCreate(BaseModel):
    period_month: int = Field(ge=1, le=12)
    period_year: int = Field(ge=2020)
    exchange_rate: Decimal = Field(gt=0)


class UploadSessionResponse(BaseModel):
    id: uuid.UUID
    filename: str
    period_month: int
    period_year: int
    exchange_rate: Decimal
    status: str
    row_count: int | None
    rejected_count: int = 0
    validation_summary: dict | None = None
    error_message: str | None
    processed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UploadRowResponse(BaseModel):
    id: int
    user_identifier: str
    merchant_name: str | None
    amount_bs: Decimal
    amount_usdt: Decimal | None
    exchange_rate: Decimal | None
    transaction_date: str | None

    model_config = {"from_attributes": True}
