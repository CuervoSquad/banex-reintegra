from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_role
from app.db.database import get_db
from app.schemas.level import LevelResponse, LevelUpdate
from app.services.level_service import LevelService

router = APIRouter(prefix="/levels", tags=["levels"])


@router.get("", response_model=list[LevelResponse])
def list_levels(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return LevelService(db).list_all()


@router.patch("/{level_id}", response_model=LevelResponse)
def update_level(
    level_id: int,
    data: LevelUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    try:
        return LevelService(db).update(level_id, data)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
