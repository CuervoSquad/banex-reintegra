import csv
import io
import uuid
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.monthly_report import MonthlyReport, ReportRow
from app.models.upload_session import UploadRow, UploadSession
from app.models.user import User
from app.schemas.report import MonthlyReportResponse
from app.services.level_service import LevelService

QUANT2 = Decimal("0.01")
QUANT6 = Decimal("0.000001")


class ReportService:
    def __init__(self, db: Session):
        self.db = db
        self._levels = LevelService(db)

    def generate(self, session_id: uuid.UUID, user: User) -> MonthlyReportResponse:
        session: UploadSession = (
            self.db.query(UploadSession).filter(UploadSession.id == session_id).first()
        )
        if not session:
            raise LookupError("Sesión de carga no encontrada")
        if session.status != "done":
            raise ValueError("La sesión debe estar en estado 'done' para generar un reporte")

        existing_report = (
            self.db.query(MonthlyReport)
            .filter(MonthlyReport.session_id == session_id)
            .first()
        )
        if existing_report:
            existing_report.rows = (
                self.db.query(ReportRow).filter(ReportRow.report_id == existing_report.id).all()
            )
            return MonthlyReportResponse.model_validate(existing_report)

        amount_usdt_expr = func.coalesce(
            UploadRow.amount_usdt,
            UploadRow.amount_bs / func.coalesce(UploadRow.exchange_rate, session.exchange_rate),
        )
        totals = (
            self.db.query(
                UploadRow.user_identifier,
                func.sum(UploadRow.amount_bs).label("total_amount_bs"),
                func.sum(amount_usdt_expr).label("total_amount_usdt"),
            )
            .filter(UploadRow.session_id == session_id)
            .group_by(UploadRow.user_identifier)
            .all()
        )

        exchange_rate = Decimal(session.exchange_rate)
        report_rows = []
        total_reintegro_usdt = Decimal("0")
        total_reintegro_bs = Decimal("0")
        total_amount_bs = Decimal("0")

        for user_id, amount_bs_raw, amount_usdt_raw in totals:
            amount_bs = Decimal(amount_bs_raw).quantize(QUANT2, rounding=ROUND_HALF_UP)
            amount_usdt = Decimal(amount_usdt_raw).quantize(QUANT6, rounding=ROUND_HALF_UP)
            effective_exchange_rate = (
                (amount_bs / amount_usdt).quantize(QUANT6, rounding=ROUND_HALF_UP)
                if amount_usdt > 0
                else exchange_rate
            )
            level = self._levels.find_for_amount(amount_bs)
            percentage = Decimal(level.percentage) if level else Decimal("0")
            reintegro_bs = (amount_bs * percentage).quantize(QUANT2, rounding=ROUND_HALF_UP)
            reintegro_usdt = (reintegro_bs / effective_exchange_rate).quantize(QUANT6, rounding=ROUND_HALF_UP)

            report_rows.append(
                ReportRow(
                    user_identifier=user_id,
                    total_amount_bs=amount_bs.quantize(QUANT2),
                    total_amount_usdt=amount_usdt,
                    level_id=level.id if level else None,
                    level_name=level.name if level else None,
                    level_percentage=percentage if level else None,
                    reintegro_usdt=reintegro_usdt,
                    reintegro_bs=reintegro_bs,
                    exchange_rate=effective_exchange_rate,
                )
            )
            total_reintegro_usdt += reintegro_usdt
            total_reintegro_bs += reintegro_bs
            total_amount_bs += amount_bs

        report = MonthlyReport(
            session_id=session_id,
            generated_by=user.id,
            period_month=session.period_month,
            period_year=session.period_year,
            exchange_rate=exchange_rate,
            total_users=len(report_rows),
            total_amount_bs=total_amount_bs.quantize(QUANT2),
            total_reintegro_usdt=total_reintegro_usdt,
            total_reintegro_bs=total_reintegro_bs.quantize(QUANT2),
        )
        self.db.add(report)
        self.db.flush()

        for r in report_rows:
            r.report_id = report.id
        self.db.bulk_save_objects(report_rows)
        self.db.commit()
        self.db.refresh(report)

        report.rows = (
            self.db.query(ReportRow).filter(ReportRow.report_id == report.id).all()
        )
        return MonthlyReportResponse.model_validate(report)

    def list_reports(self) -> list[MonthlyReportResponse]:
        reports = (
            self.db.query(MonthlyReport)
            .order_by(MonthlyReport.generated_at.desc())
            .limit(50)
            .all()
        )
        return [MonthlyReportResponse.model_validate(r) for r in reports]

    def get_report(self, report_id: uuid.UUID) -> MonthlyReport:
        report = self.db.query(MonthlyReport).filter(MonthlyReport.id == report_id).first()
        if not report:
            raise LookupError("Reporte no encontrado")
        return report

    def export_csv(self, report_id: uuid.UUID) -> bytes:
        """Reporte operativo completo en CSV."""
        report = self.get_report(report_id)
        rows = self.db.query(ReportRow).filter(ReportRow.report_id == report_id).all()

        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow([
            "usuario",
            "consumo_total_bs",
            "consumo_total_usdt",
            "nivel_alcanzado",
            "porcentaje_reintegro",
            "reintegro_usdt",
            "reintegro_bs",
            "tipo_cambio",
        ])
        for row in rows:
            writer.writerow([
                row.user_identifier,
                row.total_amount_bs,
                row.total_amount_usdt,
                row.level_name or "Sin nivel",
                f"{float(row.level_percentage or 0) * 100:.2f}%" if row.level_percentage else "0%",
                row.reintegro_usdt,
                row.reintegro_bs,
                row.exchange_rate,
            ])
        return buf.getvalue().encode("utf-8-sig")  # BOM para Excel

    def export_banextransfer(self, report_id: uuid.UUID) -> bytes:
        """CSV compatible con BanexTransfer para pagos masivos en USDT."""
        rows = self.db.query(ReportRow).filter(ReportRow.report_id == report_id).all()

        buf = io.StringIO()
        writer = csv.writer(buf)
        # Formato BanexTransfer: cuenta_destino, monto_usdt, concepto
        writer.writerow(["cuenta_destino", "monto_usdt", "concepto"])
        for row in rows:
            if row.reintegro_usdt > 0:
                writer.writerow([
                    row.user_identifier,
                    row.reintegro_usdt,
                    f"Reintegro QR {row.level_name or 'N/A'}",
                ])
        return buf.getvalue().encode("utf-8-sig")
