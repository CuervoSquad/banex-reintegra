from decimal import Decimal
from pydantic import BaseModel, Field


class LevelResponse(BaseModel):
    id: int
    name: str
    min_amount_bs: Decimal
    max_amount_bs: Decimal | None
    percentage: Decimal
    is_active: bool

    model_config = {"from_attributes": True}


class LevelUpdate(BaseModel):
    name: str | None = None
    min_amount_bs: Decimal | None = Field(default=None, ge=0)
    max_amount_bs: Decimal | None = None
    percentage: Decimal | None = Field(default=None, gt=0, le=1)
    is_active: bool | None = None
