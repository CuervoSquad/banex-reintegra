from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.cashback_level import CashbackLevel
from app.schemas.level import LevelResponse, LevelUpdate


class LevelService:
    def __init__(self, db: Session):
        self.db = db

    def list_active(self) -> list[LevelResponse]:
        levels = (
            self.db.query(CashbackLevel)
            .filter(CashbackLevel.is_active == True)
            .order_by(CashbackLevel.min_amount_bs)
            .all()
        )
        return [LevelResponse.model_validate(l) for l in levels]

    def list_all(self) -> list[LevelResponse]:
        levels = self.db.query(CashbackLevel).order_by(CashbackLevel.min_amount_bs).all()
        return [LevelResponse.model_validate(l) for l in levels]

    def update(self, level_id: int, data: LevelUpdate) -> LevelResponse:
        level = self.db.query(CashbackLevel).filter(CashbackLevel.id == level_id).first()
        if not level:
            raise LookupError(f"Nivel {level_id} no encontrado")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(level, field, value)
        self.db.commit()
        self.db.refresh(level)
        return LevelResponse.model_validate(level)

    def find_for_amount(self, amount_bs: Decimal) -> CashbackLevel | None:
        levels = (
            self.db.query(CashbackLevel)
            .filter(CashbackLevel.is_active == True)
            .order_by(CashbackLevel.min_amount_bs.desc())
            .all()
        )
        for level in levels:
            if amount_bs >= level.min_amount_bs:
                if level.max_amount_bs is None or amount_bs <= level.max_amount_bs:
                    return level
        return None
