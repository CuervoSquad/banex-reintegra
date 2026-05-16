from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.models.audit import AuditLog
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse

MAX_FAILED_ATTEMPTS = 5


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def login(self, credentials: LoginRequest, ip: str, user_agent: str) -> TokenResponse:
        user = self.user_repo.get_by_email(credentials.email)

        if not user or not user.is_active:
            self._write_audit(None, "auth.login", ip, user_agent, "failure", {"reason": "user_not_found"})
            raise ValueError("Credenciales incorrectas")

        if user.locked_until and user.locked_until > datetime.now(timezone.utc):
            raise ValueError("Cuenta bloqueada temporalmente por intentos fallidos")

        if not verify_password(credentials.password, user.hashed_password):
            self.user_repo.increment_failed_attempts(user)
            if user.failed_attempts >= MAX_FAILED_ATTEMPTS:
                from datetime import timedelta
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
                self.db.commit()
            self._write_audit(str(user.id), "auth.login", ip, user_agent, "failure", {"reason": "bad_password"})
            raise ValueError("Credenciales incorrectas")

        self.user_repo.reset_failed_attempts(user)
        self.user_repo.update_last_login(user)
        self._write_audit(str(user.id), "auth.login", ip, user_agent, "success")

        access_token = create_access_token(str(user.id), user.role.name)
        refresh_token = create_refresh_token(str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    def refresh(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError("Token de refresco inválido")

        import uuid
        user = self.user_repo.get_by_id(uuid.UUID(payload["sub"]))
        if not user or not user.is_active:
            raise ValueError("Usuario no encontrado o inactivo")

        new_access = create_access_token(str(user.id), user.role.name)
        new_refresh = create_refresh_token(str(user.id))
        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    def _write_audit(self, user_id, action, ip, user_agent, status, payload=None):
        log = AuditLog(
            user_id=user_id,
            action=action,
            entity="users",
            ip_address=ip,
            user_agent=user_agent,
            payload=payload,
            status=status,
        )
        self.db.add(log)
        self.db.commit()
