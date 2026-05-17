import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_role
from app.db.database import get_db
from app.models.user import User
from app.schemas.upload import UploadSessionResponse
from app.services.upload_service import UploadService

router = APIRouter(prefix="/uploads", tags=["uploads"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("", response_model=UploadSessionResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    period_month: int = Form(..., ge=1, le=12),
    period_year: int = Form(..., ge=2020),
    exchange_rate: Decimal = Form(..., gt=0),
    current_user: User = Depends(require_role("admin", "operator")),
    db: Session = Depends(get_db),
):
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Archivo demasiado grande (máx 10 MB)")

    svc = UploadService(db)
    session = svc.create_session(
        user=current_user,
        filename=file.filename or "archivo",
        period_month=period_month,
        period_year=period_year,
        exchange_rate=exchange_rate,
    )
    return svc.process_file(session, content, file.filename or "archivo")


@router.get("", response_model=list[UploadSessionResponse])
def list_uploads(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "operator")),
):
    return UploadService(db).list_sessions()


@router.get("/{session_id}", response_model=UploadSessionResponse)
def get_upload(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "operator")),
):
    try:
        session = UploadService(db).get_session(session_id)
        return UploadSessionResponse.model_validate(session)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
