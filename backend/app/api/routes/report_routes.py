import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.dependencies import require_role
from app.db.database import get_db
from app.models.user import User
from app.schemas.report import MonthlyReportResponse
from app.services.audit_service import write_audit
from app.services.report_service import ReportService
from workers.celery_app import celery_app
from workers.celery_tasks import generate_report_task

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post(
    "/generate/{session_id}",
    response_model=MonthlyReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_report(
    request: Request,
    session_id: uuid.UUID,
    current_user: User = Depends(require_role("admin", "operator")),
    db: Session = Depends(get_db),
):
    try:
        report = ReportService(db).generate(session_id, current_user)
        write_audit(
            db,
            current_user.id,
            "reports.generate",
            entity="monthly_reports",
            entity_id=str(report.id),
            payload={"session_id": str(session_id), "total_users": report.total_users},
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
        return report
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/generate/{session_id}/async", status_code=status.HTTP_202_ACCEPTED)
def enqueue_report_generation(
    request: Request,
    session_id: uuid.UUID,
    current_user: User = Depends(require_role("admin", "operator")),
    db: Session = Depends(get_db),
):
    task = generate_report_task.delay(str(session_id), str(current_user.id))
    write_audit(
        db,
        current_user.id,
        "reports.generate_async",
        entity="upload_sessions",
        entity_id=str(session_id),
        payload={"task_id": task.id},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return {"task_id": task.id, "status": "queued"}


@router.get("/tasks/{task_id}")
def get_report_task_status(
    task_id: str,
    _=Depends(require_role("admin", "operator")),
):
    result = celery_app.AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": result.status,
        "result": result.result if result.successful() else None,
    }


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
    request: Request,
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "operator", "viewer")),
):
    try:
        content = ReportService(db).export_csv(report_id)
        write_audit(
            db,
            current_user.id,
            "reports.export_csv",
            entity="monthly_reports",
            entity_id=str(report_id),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
        return Response(
            content=content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=reporte_{report_id}.csv"},
        )
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get("/{report_id}/export/banextransfer")
def export_banextransfer(
    request: Request,
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "operator")),
):
    try:
        content = ReportService(db).export_banextransfer(report_id)
        write_audit(
            db,
            current_user.id,
            "reports.export_banextransfer",
            entity="monthly_reports",
            entity_id=str(report_id),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
        return Response(
            content=content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=banextransfer_{report_id}.csv"},
        )
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
