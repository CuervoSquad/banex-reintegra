from .celery_app import celery_app
from .example_worker import example_task


@celery_app.task(name="workers.example_task")
def run_example_task(payload):
    return example_task(payload)


@celery_app.task(name="workers.generate_report")
def generate_report_task(session_id: str, user_id: str):
    from uuid import UUID

    from app.db.database import SessionLocal
    from app.repositories.user_repository import UserRepository
    from app.services.report_service import ReportService

    db = SessionLocal()
    try:
        user = UserRepository(db).get_by_id(UUID(user_id))
        if not user:
            raise ValueError("Usuario no encontrado")
        report = ReportService(db).generate(UUID(session_id), user)
        return {"report_id": str(report.id), "session_id": session_id, "total_users": report.total_users}
    finally:
        db.close()
