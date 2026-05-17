import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_DOWN

from sqlalchemy.orm import Session

from app.core.financial_limits import (
    MAX_CASHBACK_PER_STREAM_BS,
    MAX_CASHBACK_PERCENTAGE,
    MAX_DAILY_AMOUNT_BS,
    MAX_DAILY_STREAMS,
    MIN_CLAIMABLE_AMOUNT_BS,
)
from app.models.audit import AuditLog
from app.models.cashback_stream import CashbackStream
from app.models.user import User
from app.schemas.cashback import CashbackClaimResponse, CashbackStreamResponse, QRPaymentCreate
from app.services.level_service import LevelService

MONEY_QUANT = Decimal("0.000001")
_today_start = lambda: datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)


class CashbackService:
    def __init__(self, db: Session):
        self.db = db
        self._level_svc = LevelService(db)

    # ── Crear stream ──────────────────────────────────────────────────────────

    def create_from_qr_payment(
        self,
        current_user: User,
        payload: QRPaymentCreate,
        ip: str = "unknown",
        user_agent: str = "",
    ) -> CashbackStreamResponse:
        self._check_velocity_limits(current_user)

        qr_payment_id = payload.qr_payment_id or f"QR-{uuid.uuid4().hex[:16].upper()}"
        existing = (
            self.db.query(CashbackStream)
            .filter(CashbackStream.qr_payment_id == qr_payment_id)
            .first()
        )
        if existing:
            raise ValueError("El pago QR ya tiene un stream de cashback")

        # ── Porcentaje calculado SERVER-SIDE — el cliente no lo controla ──────
        cashback_percentage = self._resolve_cashback_percentage(payload.payment_amount)

        cashback_total = (payload.payment_amount * cashback_percentage).quantize(MONEY_QUANT)
        if cashback_total > MAX_CASHBACK_PER_STREAM_BS:
            raise ValueError(
                f"El cashback del stream excede el límite permitido por transacción "
                f"(máx Bs {MAX_CASHBACK_PER_STREAM_BS})"
            )

        starts_at = datetime.now(timezone.utc)
        ends_at = starts_at + timedelta(seconds=payload.duration_seconds)
        rate = (cashback_total / Decimal(payload.duration_seconds)).quantize(
            Decimal("0.00000001"), rounding=ROUND_DOWN
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
            {
                "qr_payment_id": qr_payment_id,
                "payment_amount": str(payload.payment_amount),
                "cashback_percentage": str(cashback_percentage),
                "cashback_total": str(cashback_total),
                "merchant_name": payload.merchant_name,
            },
            ip=ip,
            user_agent=user_agent,
        )
        self.db.commit()
        self.db.refresh(stream)
        return self._to_response(stream)

    # ── Consultas ─────────────────────────────────────────────────────────────

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
        return self._to_response(stream) if stream else None

    def list_streams(self, current_user: User) -> list[CashbackStreamResponse]:
        streams = (
            self.db.query(CashbackStream)
            .filter(CashbackStream.user_id == current_user.id)
            .order_by(CashbackStream.starts_at.desc())
            .limit(20)
            .all()
        )
        return [self._to_response(s) for s in streams]

    # ── Claim ─────────────────────────────────────────────────────────────────

    def claim(
        self,
        current_user: User,
        stream_id: uuid.UUID,
        ip: str = "unknown",
        user_agent: str = "",
    ) -> CashbackClaimResponse:
        stream = (
            self.db.query(CashbackStream)
            .filter(
                CashbackStream.id == stream_id,
                CashbackStream.user_id == current_user.id,
            )
            .with_for_update()   # bloqueo pesimista — previene doble claim concurrente
            .first()
        )
        if not stream:
            raise LookupError("Stream de cashback no encontrado")
        if stream.status in ("claimed", "cancelled"):
            raise ValueError("El stream no permite nuevos claims")

        response_before = self._to_response(stream)
        claimable = response_before.claimable_amount
        if claimable < MIN_CLAIMABLE_AMOUNT_BS:
            raise ValueError(
                f"Monto mínimo para aceptar cashback: Bs {MIN_CLAIMABLE_AMOUNT_BS}"
            )

        stream.streamed_claimed_amount = (
            stream.streamed_claimed_amount + claimable
        ).quantize(MONEY_QUANT)
        if stream.streamed_claimed_amount >= stream.cashback_total:
            stream.streamed_claimed_amount = stream.cashback_total
            stream.status = "claimed"
        elif datetime.now(timezone.utc) >= stream.ends_at:
            stream.status = "completed"

        self._write_audit(
            current_user,
            "cashback.stream.claim",
            "success",
            {
                "stream_id": str(stream.id),
                "claimed_now": str(claimable),
                "total_claimed": str(stream.streamed_claimed_amount),
                "stream_status": stream.status,
            },
            ip=ip,
            user_agent=user_agent,
        )
        self.db.commit()
        self.db.refresh(stream)
        return CashbackClaimResponse(stream=self._to_response(stream), claimed_now=claimable)

    # ── Privados ──────────────────────────────────────────────────────────────

    def _resolve_cashback_percentage(self, payment_amount: Decimal) -> Decimal:
        """
        Calcula el porcentaje SERVER-SIDE desde la BD de niveles.
        El cliente nunca controla este valor.
        """
        level = self._level_svc.find_for_amount(payment_amount)
        if level is None:
            return Decimal("0")
        pct = Decimal(str(level.percentage))
        # Doble validación: nunca puede exceder el límite absoluto del sistema
        return min(pct, MAX_CASHBACK_PERCENTAGE)

    def _check_velocity_limits(self, user: User) -> None:
        """Previene abuso: límite de streams y monto acumulado diario."""
        today = _today_start()
        streams_today = (
            self.db.query(CashbackStream)
            .filter(
                CashbackStream.user_id == user.id,
                CashbackStream.starts_at >= today,
            )
            .all()
        )
        if len(streams_today) >= MAX_DAILY_STREAMS:
            self._write_audit(
                user, "cashback.velocity.blocked", "failure",
                {"reason": "max_daily_streams", "count": len(streams_today)},
            )
            raise ValueError(
                f"Límite diario alcanzado: máximo {MAX_DAILY_STREAMS} transacciones QR por día"
            )

        daily_amount = sum(Decimal(str(s.payment_amount)) for s in streams_today)
        if daily_amount >= MAX_DAILY_AMOUNT_BS:
            self._write_audit(
                user, "cashback.velocity.blocked", "failure",
                {"reason": "max_daily_amount", "daily_amount": str(daily_amount)},
            )
            raise ValueError(
                f"Límite diario alcanzado: máximo Bs {MAX_DAILY_AMOUNT_BS:,} en pagos QR por día"
            )

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
        amount = Decimal(str(stream.stream_rate_per_second)) * elapsed
        return min(Decimal(str(stream.cashback_total)), amount).quantize(MONEY_QUANT)

    def _write_audit(
        self,
        user: User,
        action: str,
        status: str,
        payload: dict | None = None,
        ip: str = "unknown",
        user_agent: str = "",
    ) -> None:
        self.db.add(AuditLog(
            user_id=user.id,
            action=action,
            entity="cashback_streams",
            ip_address=ip if ip != "unknown" else None,
            user_agent=user_agent or None,
            payload=payload,
            status=status,
        ))
