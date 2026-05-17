import uuid

from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def write_audit(
    db: Session,
    user_id: uuid.UUID | None,
    action: str,
    entity: str | None = None,
    entity_id: str | None = None,
    status: str = "success",
    payload: dict | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> None:
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        status=status,
        payload=payload,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(log)
    db.commit()
