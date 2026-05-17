import io
import uuid
from datetime import datetime, timezone
from decimal import Decimal

import pandas as pd
from sqlalchemy.orm import Session

from app.models.upload_session import UploadRow, UploadSession
from app.models.user import User
from app.schemas.upload import UploadSessionResponse

REQUIRED_COLUMNS = {"user_identifier", "amount_bs"}
OPTIONAL_COLUMNS = {"merchant_name", "exchange_rate", "transaction_date"}

COLUMN_ALIASES = {
    "usuario": "user_identifier",
    "cuenta": "user_identifier",
    "user_id": "user_identifier",
    "id_usuario": "user_identifier",
    "monto_bs": "amount_bs",
    "monto": "amount_bs",
    "importe_bs": "amount_bs",
    "comercio": "merchant_name",
    "tipo_cambio": "exchange_rate",
    "tasa": "exchange_rate",
    "fecha": "transaction_date",
    "fecha_transaccion": "transaction_date",
}


class UploadService:
    def __init__(self, db: Session):
        self.db = db

    def create_session(
        self,
        user: User,
        filename: str,
        period_month: int,
        period_year: int,
        exchange_rate: Decimal,
    ) -> UploadSession:
        session = UploadSession(
            uploaded_by=user.id,
            filename=filename,
            period_month=period_month,
            period_year=period_year,
            exchange_rate=exchange_rate,
            status="pending",
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def process_file(
        self,
        session: UploadSession,
        file_bytes: bytes,
        filename: str,
    ) -> UploadSessionResponse:
        session.status = "processing"
        self.db.commit()

        try:
            df = self._read_file(file_bytes, filename)
            df = self._normalize_columns(df)
            self._validate_columns(df)
            rows = self._build_rows(df, session)

            self.db.bulk_save_objects(rows)
            session.row_count = len(rows)
            session.status = "done"
            session.processed_at = datetime.now(timezone.utc)
        except Exception as exc:
            session.status = "error"
            session.error_message = str(exc)

        self.db.commit()
        self.db.refresh(session)
        return UploadSessionResponse.model_validate(session)

    def list_sessions(self) -> list[UploadSessionResponse]:
        sessions = (
            self.db.query(UploadSession)
            .order_by(UploadSession.created_at.desc())
            .limit(50)
            .all()
        )
        return [UploadSessionResponse.model_validate(s) for s in sessions]

    def get_session(self, session_id: uuid.UUID) -> UploadSession:
        session = self.db.query(UploadSession).filter(UploadSession.id == session_id).first()
        if not session:
            raise LookupError("Sesión de carga no encontrada")
        return session

    def _read_file(self, file_bytes: bytes, filename: str) -> pd.DataFrame:
        lower = filename.lower()
        if lower.endswith(".csv"):
            return pd.read_csv(io.BytesIO(file_bytes))
        if lower.endswith((".xlsx", ".xls")):
            return pd.read_excel(io.BytesIO(file_bytes))
        raise ValueError("Formato de archivo no soportado. Use CSV o Excel (.xlsx, .xls)")

    def _normalize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        df.rename(columns=COLUMN_ALIASES, inplace=True)
        return df

    def _validate_columns(self, df: pd.DataFrame) -> None:
        missing = REQUIRED_COLUMNS - set(df.columns)
        if missing:
            raise ValueError(
                f"Columnas requeridas faltantes: {missing}. "
                f"El archivo debe contener: user_identifier (o usuario/cuenta), amount_bs (o monto_bs)"
            )

    def _build_rows(self, df: pd.DataFrame, session: UploadSession) -> list[UploadRow]:
        rows = []
        for _, row in df.iterrows():
            amount = row.get("amount_bs")
            user_id = str(row.get("user_identifier", "")).strip()
            if not user_id or pd.isna(amount):
                continue

            try:
                amount_decimal = Decimal(str(float(amount))).quantize(Decimal("0.01"))
                if amount_decimal <= 0:
                    continue
            except Exception:
                continue

            exchange = row.get("exchange_rate")
            tx_date = row.get("transaction_date")

            rows.append(
                UploadRow(
                    session_id=session.id,
                    user_identifier=user_id,
                    merchant_name=str(row["merchant_name"]) if "merchant_name" in df.columns and not pd.isna(row.get("merchant_name")) else None,
                    amount_bs=amount_decimal,
                    exchange_rate=Decimal(str(float(exchange))).quantize(Decimal("0.000001")) if exchange is not None and not pd.isna(exchange) else None,
                    transaction_date=pd.to_datetime(tx_date).date() if tx_date is not None and not pd.isna(tx_date) else None,
                    raw_data=row.to_dict(),
                )
            )
        return rows
