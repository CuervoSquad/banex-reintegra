import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.cashback import CashbackClaimResponse, CashbackStreamResponse, QRPaymentCreate
from app.services.cashback_service import CashbackService

router = APIRouter(prefix="/cashback", tags=["cashback"])
limiter = Limiter(key_func=get_remote_address)


def _ctx(request: Request) -> tuple[str, str]:
    ip = request.client.host if request.client else "unknown"
    ua = request.headers.get("user-agent", "")
    return ip, ua


@router.post(
    "/qr-payments",
    response_model=CashbackStreamResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("30/minute")
def create_qr_cashback_stream(
    request: Request,
    payload: QRPaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip, ua = _ctx(request)
    try:
        return CashbackService(db).create_from_qr_payment(current_user, payload, ip=ip, user_agent=ua)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.get("/streams/current", response_model=CashbackStreamResponse)
def current_cashback_stream(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stream = CashbackService(db).get_current_stream(current_user)
    if not stream:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay stream activo")
    return stream


@router.get("/streams", response_model=list[CashbackStreamResponse])
def list_cashback_streams(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return CashbackService(db).list_streams(current_user)


@router.post(
    "/streams/{stream_id}/claim",
    response_model=CashbackClaimResponse,
)
@limiter.limit("10/minute")
def claim_cashback_stream(
    request: Request,
    stream_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip, ua = _ctx(request)
    try:
        return CashbackService(db).claim(current_user, stream_id, ip=ip, user_agent=ua)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
