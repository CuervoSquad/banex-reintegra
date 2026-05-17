import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class ReportRowResponse(BaseModel):
    id: int
    user_identifier: str
    total_amount_bs: Decimal
    total_amount_usdt: Decimal
    level_name: str | None
    level_percentage: Decimal | None
    reintegro_usdt: Decimal
    reintegro_bs: Decimal
    exchange_rate: Decimal

    model_config = {"from_attributes": True}


class MonthlyReportResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    period_month: int
    period_year: int
    exchange_rate: Decimal
    total_users: int
    total_amount_bs: Decimal
    total_reintegro_usdt: Decimal
    total_reintegro_bs: Decimal
    generated_at: datetime
    rows: list[ReportRowResponse] = []

    model_config = {"from_attributes": True}
