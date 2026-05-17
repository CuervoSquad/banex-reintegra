import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_DOWN

from sqlalchemy.orm import Session

from app.models.audit import AuditLog
from app.models.cashback_stream import CashbackStream
from app.models.user import User
from app.schemas.cashback import CashbackClaimResponse, CashbackStreamResponse, QRPaymentCreate

MONEY_QUANT = Decimal("0.000001")


class CashbackService:
    def __init__(self, db: Session):
        self.db = db

    def create_from_qr_payment(
        self,
        current_user: User,
        payload: QRPaymentCreate,
    ) -> CashbackStreamResponse:
        qr_payment_id = payload.qr_payment_id or f"QR-{uuid.uuid4().hex[:16].upper()}"
        existing = (
            self.db.query(CashbackStream)
            .filter(CashbackStream.qr_payment_id == qr_payment_id)
            .first()
        )
        if existing:
            raise ValueError("El pago QR ya tiene un stream de cashback")

        starts_at = datetime.now(timezone.utc)
        ends_at = starts_at + timedelta(seconds=payload.duration_seconds)
        cashback_total = (payload.payment_amount * payload.cashback_percentage).quantize(MONEY_QUANT)
        rate = (cashback_total / Decimal(payload.duration_seconds)).quantize(
            Decimal("0.00000001"),
            rounding=ROUND_DOWN,
        )

        stream = CashbackStream(
            user_id=current_user.id,
            qr_payment_id=qr_payment_id,
            merchant_name=payload.merchant_name,
            payment_amount=payload.payment_amount,
            cashback_total=cashback_total,
            stream_rate_per_second=rate,
            streamed_claimed_amount=Decimal("0"),
            status="active",
            starts_at=starts_at,
            ends_at=ends_at,
            contract_address=payload.contract_address,
            chain_tx_hash=payload.chain_tx_hash,
        )
        self.db.add(stream)
        self._write_audit(
            current_user,
            "cashback.stream.create",
            "success",
            {"qr_payment_id": qr_payment_id, "cashback_total": str(cashback_total)},
        )
        self.db.commit()
        self.db.refresh(stream)
        return self._to_response(stream)

    def get_current_stream(self, current_user: User) -> CashbackStreamResponse | None:
        stream = (
            self.db.query(CashbackStream)
            .filter(
                CashbackStream.user_id == current_user.id,
                CashbackStream.status.in_(("active", "completed")),
            )
            .order_by(CashbackStream.starts_at.desc())
            .first()
        )
        if not stream:
            return None
        return self._to_response(stream)

    def list_streams(self, current_user: User) -> list[CashbackStreamResponse]:
        streams = (
            self.db.query(CashbackStream)
            .filter(CashbackStream.user_id == current_user.id)
            .order_by(CashbackStream.starts_at.desc())
            .limit(20)
            .all()
        )
        return [self._to_response(stream) for stream in streams]

    def claim(self, current_user: User, stream_id: uuid.UUID) -> CashbackClaimResponse:
        stream = (
            self.db.query(CashbackStream)
            .filter(CashbackStream.id == stream_id, CashbackStream.user_id == current_user.id)
            .with_for_update()
            .first()
        )
        if not stream:
            raise LookupError("Stream de cashback no encontrado")
        if stream.status in ("claimed", "cancelled"):
            raise ValueError("El stream no permite nuevos claims")

        response_before_claim = self._to_response(stream)
        claimable = response_before_claim.claimable_amount
        if claimable <= Decimal("0"):
            raise ValueError("Aún no hay cashback disponible para aceptar")

        stream.streamed_claimed_amount = (stream.streamed_claimed_amount + claimable).quantize(
            MONEY_QUANT,
        )
        if stream.streamed_claimed_amount >= stream.cashback_total:
            stream.streamed_claimed_amount = stream.cashback_total
            stream.status = "claimed"
        elif datetime.now(timezone.utc) >= stream.ends_at:
            stream.status = "completed"

        self._write_audit(
            current_user,
            "cashback.stream.claim",
            "success",
            {"stream_id": str(stream.id), "claimed_now": str(claimable)},
        )
        self.db.commit()
        self.db.refresh(stream)

        return CashbackClaimResponse(stream=self._to_response(stream), claimed_now=claimable)

    def _to_response(self, stream: CashbackStream) -> CashbackStreamResponse:
        now = datetime.now(timezone.utc)
        streamed_amount = self._streamed_amount(stream, now)
        claimed_amount = Decimal(stream.streamed_claimed_amount or 0).quantize(MONEY_QUANT)
        claimable_amount = max(Decimal("0"), streamed_amount - claimed_amount).quantize(MONEY_QUANT)
        status = stream.status
        if status == "active" and now >= stream.ends_at:
            status = "completed"

        return CashbackStreamResponse(
            id=stream.id,
            qr_payment_id=stream.qr_payment_id,
            merchant_name=stream.merchant_name,
            payment_amount=stream.payment_amount,
            cashback_total=stream.cashback_total,
            streamed_amount=streamed_amount,
            claimed_amount=claimed_amount,
            claimable_amount=claimable_amount,
            stream_rate_per_second=stream.stream_rate_per_second,
            status=status,
            starts_at=stream.starts_at,
            ends_at=stream.ends_at,
            server_time=now,
            contract_address=stream.contract_address,
            chain_tx_hash=stream.chain_tx_hash,
        )

    def _streamed_amount(self, stream: CashbackStream, now: datetime) -> Decimal:
        if now <= stream.starts_at:
            return Decimal("0").quantize(MONEY_QUANT)

        elapsed_seconds = min(
            (now - stream.starts_at).total_seconds(),
            (stream.ends_at - stream.starts_at).total_seconds(),
        )
        elapsed = Decimal(str(elapsed_seconds))
        amount = Decimal(stream.stream_rate_per_second) * elapsed
        return min(Decimal(stream.cashback_total), amount).quantize(MONEY_QUANT)

    def _write_audit(self, user: User, action: str, status: str, payload: dict | None = None) -> None:
        self.db.add(
            AuditLog(
                user_id=user.id,
                action=action,
                entity="cashback_streams",
                payload=payload,
                status=status,
            ),
        )
