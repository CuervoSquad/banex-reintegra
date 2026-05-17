import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_role
from app.db.database import get_db
from app.models.user import User
from app.schemas.report import MonthlyReportResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post(
    "/generate/{session_id}",
    response_model=MonthlyReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_report(
    session_id: uuid.UUID,
    current_user: User = Depends(require_role("admin", "operator")),
    db: Session = Depends(get_db),
):
    try:
        return ReportService(db).generate(session_id, current_user)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("", response_model=list[MonthlyReportResponse])
def list_reports(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "operator", "viewer")),
):
    return ReportService(db).list_reports()


@router.get("/{report_id}", response_model=MonthlyReportResponse)
def get_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "operator", "viewer")),
):
    try:
        svc = ReportService(db)
        report = svc.get_report(report_id)
        from app.models.monthly_report import ReportRow
        report.rows = db.query(ReportRow).filter(ReportRow.report_id == report_id).all()
        return MonthlyReportResponse.model_validate(report)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get("/{report_id}/export/csv")
def export_csv(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "operator", "viewer")),
):
    try:
        content = ReportService(db).export_csv(report_id)
        return Response(
            content=content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=reporte_{report_id}.csv"},
        )
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get("/{report_id}/export/banextransfer")
def export_banextransfer(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "operator")),
):
    try:
        content = ReportService(db).export_banextransfer(report_id)
        return Response(
            content=content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=banextransfer_{report_id}.csv"},
        )
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
