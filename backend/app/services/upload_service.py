import io
import re
import unicodedata
import uuid
from datetime import datetime, timezone
from decimal import Decimal

import pandas as pd
from sqlalchemy.orm import Session

from app.models.upload_session import UploadRow, UploadSession
from app.models.user import User
from app.schemas.upload import UploadSessionResponse

REQUIRED_COLUMNS = {"user_identifier"}
OPTIONAL_COLUMNS = {"merchant_name", "exchange_rate", "transaction_date", "amount_usdt"}

COLUMN_ALIASES = {
    "usuario": "user_identifier",
    "cuenta": "user_identifier",
    "user_id": "user_identifier",
    "id_usuario": "user_identifier",
    "identificacion_usuario": "user_identifier",
    "identificador_usuario": "user_identifier",
    "codigo_usuario": "user_identifier",
    "cliente": "user_identifier",
    "id_cliente": "user_identifier",
    "monto_bs": "amount_bs",
    "monto": "amount_bs",
    "importe_bs": "amount_bs",
    "consumo_bs": "amount_bs",
    "consumo_total_bs": "amount_bs",
    "total_consumo_bs": "amount_bs",
    "monto_consumido_bs": "amount_bs",
    "monto_total_bs": "amount_bs",
    "monto_total_consumido_bs": "amount_bs",
    "monto_en_bs": "amount_bs",
    "monto_en_bolivianos": "amount_bs",
    "importe_en_bs": "amount_bs",
    "importe_en_bolivianos": "amount_bs",
    "consumo_en_bs": "amount_bs",
    "consumo_en_bolivianos": "amount_bs",
    "monto_total_consumido": "amount_bs",
    "total_monto_bs": "amount_bs",
    "total_bs": "amount_bs",
    "total_amount_bs": "amount_bs",
    "total_consumed_bs": "amount_bs",
    "amount_usd": "amount_usdt",
    "amount_usdt": "amount_usdt",
    "crypto_quantity": "amount_usdt",
    "cantidad_crypto": "amount_usdt",
    "cantidad_cripto": "amount_usdt",
    "cantidad_usdt": "amount_usdt",
    "monto_usdt": "amount_usdt",
    "importe_usdt": "amount_usdt",
    "consumo_usdt": "amount_usdt",
    "consumo_total_usdt": "amount_usdt",
    "monto_consumido_usdt": "amount_usdt",
    "monto_total_usdt": "amount_usdt",
    "total_amount_usdt": "amount_usdt",
    "equivalente_usdt": "amount_usdt",
    "comercio": "merchant_name",
    "product": "merchant_name",
    "producto": "merchant_name",
    "tipo_cambio": "exchange_rate",
    "tipo_de_cambio": "exchange_rate",
    "tc": "exchange_rate",
    "tasa": "exchange_rate",
    "fecha": "transaction_date",
    "fecha_transaccion": "transaction_date",
    "local_time": "transaction_date",
    "created_at": "transaction_date",
    "fecha_local": "transaction_date",
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
            rows, validation_summary = self._build_rows(df, session)
            if not rows:
                raise ValueError("El archivo no contiene filas válidas para procesar")

            self.db.bulk_save_objects(rows)
            session.row_count = len(rows)
            session.rejected_count = int(validation_summary["rejected_count"])
            session.validation_summary = validation_summary
            session.status = "done"
            session.processed_at = datetime.now(timezone.utc)
        except Exception as exc:
            session.status = "error"
            session.error_message = str(exc)
            session.validation_summary = session.validation_summary or {"errors": [str(exc)]}

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
        df.columns = [self._normalize_column_name(c) for c in df.columns]
        df.rename(columns=COLUMN_ALIASES, inplace=True)
        return df

    def _validate_columns(self, df: pd.DataFrame) -> None:
        missing = REQUIRED_COLUMNS - set(df.columns)
        has_amount = "amount_bs" in df.columns or "amount_usdt" in df.columns
        if missing or not has_amount:
            detected = ", ".join(df.columns)
            amount_help = (
                "El archivo debe incluir amount_bs/monto_bs o amount_usdt/crypto_quantity "
                "para poder calcular el reporte."
            )
            raise ValueError(
                f"Columnas requeridas faltantes: {missing}. "
                f"El archivo debe contener: user_identifier (o usuario/cuenta), amount_bs (o monto_bs). "
                f"{amount_help} "
                f"Columnas detectadas: {detected}"
            )

    def _normalize_column_name(self, column: object) -> str:
        text = str(column).strip().lower()
        text = unicodedata.normalize("NFKD", text)
        text = "".join(ch for ch in text if not unicodedata.combining(ch))
        text = text.replace("bs.", "bs").replace("bss", "bs")
        text = text.replace("bolivianos", "bs").replace("boliviano", "bs")
        text = text.replace("u$d", "usdt").replace("usd", "usdt")
        text = re.sub(r"[^a-z0-9]+", "_", text)
        text = re.sub(r"_+", "_", text).strip("_")
        return text

    def _build_rows(self, df: pd.DataFrame, session: UploadSession) -> tuple[list[UploadRow], dict]:
        rows = []
        rejected: list[dict] = []
        seen_keys: set[tuple] = set()
        default_exchange = Decimal(session.exchange_rate)

        for index, row in df.iterrows():
            amount = row.get("amount_bs")
            amount_usdt = row.get("amount_usdt")
            user_id = str(row.get("user_identifier", "")).strip()
            if not user_id:
                rejected.append({"row": int(index) + 2, "reason": "Usuario vacío"})
                continue

            exchange = row.get("exchange_rate")
            try:
                exchange_decimal = (
                    self._decimal_from_cell(exchange, Decimal("0.000001"))
                    if exchange is not None and not pd.isna(exchange)
                    else default_exchange
                )
                if exchange_decimal <= 0:
                    raise ValueError
            except Exception:
                rejected.append({"row": int(index) + 2, "reason": "Tipo de cambio inválido"})
                continue

            try:
                amount_usdt_decimal = (
                    self._decimal_from_cell(amount_usdt, Decimal("0.000001"))
                    if amount_usdt is not None and not pd.isna(amount_usdt)
                    else None
                )
            except Exception:
                rejected.append({"row": int(index) + 2, "reason": "Monto USDT inválido"})
                continue

            try:
                amount_decimal = (
                    self._decimal_from_cell(amount, Decimal("0.01"))
                    if amount is not None and not pd.isna(amount)
                    else (amount_usdt_decimal * exchange_decimal).quantize(Decimal("0.01"))
                    if amount_usdt_decimal is not None
                    else None
                )
                if amount_decimal is None:
                    rejected.append({"row": int(index) + 2, "reason": "Debe tener monto Bs. o monto USDT"})
                    continue
                if amount_decimal <= 0:
                    rejected.append({"row": int(index) + 2, "reason": "Monto Bs. debe ser mayor a cero"})
                    continue
            except Exception:
                rejected.append({"row": int(index) + 2, "reason": "Monto Bs. inválido"})
                continue

            tx_date = row.get("transaction_date")
            merchant_name = (
                str(row["merchant_name"]).strip()
                if "merchant_name" in df.columns and not pd.isna(row.get("merchant_name"))
                else None
            )

            try:
                amount_usdt_decimal = (
                    amount_usdt_decimal
                    if amount_usdt_decimal is not None
                    else (amount_decimal / exchange_decimal).quantize(Decimal("0.000001"))
                )
                if amount_usdt_decimal <= 0:
                    raise ValueError
            except Exception:
                rejected.append({"row": int(index) + 2, "reason": "Monto USDT inválido"})
                continue

            try:
                transaction_date = pd.to_datetime(tx_date).date() if tx_date is not None and not pd.isna(tx_date) else None
            except Exception:
                rejected.append({"row": int(index) + 2, "reason": "Fecha de transacción inválida"})
                continue

            dedupe_key = (user_id, str(amount_decimal), str(amount_usdt_decimal), str(transaction_date), merchant_name)
            if dedupe_key in seen_keys:
                rejected.append({"row": int(index) + 2, "reason": "Fila duplicada dentro del archivo"})
                continue
            seen_keys.add(dedupe_key)

            rows.append(
                UploadRow(
                    session_id=session.id,
                    user_identifier=user_id,
                    merchant_name=merchant_name,
                    amount_bs=amount_decimal,
                    amount_usdt=amount_usdt_decimal,
                    exchange_rate=exchange_decimal,
                    transaction_date=transaction_date,
                    raw_data=self._sanitize_raw_data(row.to_dict()),
                )
            )

        validation_summary = {
            "input_rows": int(len(df)),
            "accepted_count": int(len(rows)),
            "rejected_count": int(len(rejected)),
            "rejected_rows": rejected[:100],
            "rejected_rows_truncated": len(rejected) > 100,
            "columns": list(df.columns),
        }
        return rows, validation_summary

    def _decimal_from_cell(self, value, quant: Decimal) -> Decimal:
        if isinstance(value, Decimal):
            return value.quantize(quant)
        text = str(value).strip().replace(",", ".")
        return Decimal(text).quantize(quant)

    def _sanitize_raw_data(self, raw: dict) -> dict:
        clean = {}
        for key, value in raw.items():
            if pd.isna(value):
                clean[key] = None
            elif hasattr(value, "isoformat"):
                clean[key] = value.isoformat()
            elif hasattr(value, "item"):
                clean[key] = value.item()
            else:
                clean[key] = value
        return clean
