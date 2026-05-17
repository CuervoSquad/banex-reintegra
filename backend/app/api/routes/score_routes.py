from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.score_service import ScoreService

router = APIRouter(prefix="/score", tags=["score"])


@router.get("/banexscore")
def get_banexscore(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ScoreService(db).calculate(current_user)
