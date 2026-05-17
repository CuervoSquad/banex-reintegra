from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_role
from app.db.database import get_db
from app.schemas.level import LevelResponse, LevelUpdate
from app.models.user import User
from app.services.audit_service import write_audit
from app.services.level_service import LevelService

router = APIRouter(prefix="/levels", tags=["levels"])


@router.get("", response_model=list[LevelResponse])
def list_levels(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return LevelService(db).list_all()


@router.patch("/{level_id}", response_model=LevelResponse)
def update_level(
    request: Request,
    level_id: int,
    data: LevelUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    try:
        level = LevelService(db).update(level_id, data)
        write_audit(
            db,
            current_user.id,
            "levels.update",
            entity="cashback_levels",
            entity_id=str(level_id),
            payload=data.model_dump(exclude_none=True),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
        return level
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
