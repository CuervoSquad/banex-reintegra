import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

BLACKLIST_PREFIX = "blacklist:"


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, role: str, extra: Optional[dict] = None) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": subject,
        "role": role,
        "jti": str(uuid.uuid4()),
        "exp": expire,
        "iat": now,
        "type": "access",
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": subject,
        "jti": str(uuid.uuid4()),
        "exp": expire,
        "iat": now,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise ValueError("Token inválido o expirado") from exc


def blacklist_token(jti: str, exp: int) -> None:
    try:
        from app.db.redis_client import redis_client
        ttl = exp - int(datetime.now(timezone.utc).timestamp())
        if ttl > 0:
            redis_client.setex(f"{BLACKLIST_PREFIX}{jti}", ttl, "1")
    except Exception:
        pass


def is_blacklisted(jti: str) -> bool:
    try:
        from app.db.redis_client import redis_client
        return redis_client.exists(f"{BLACKLIST_PREFIX}{jti}") == 1
    except Exception:
        return False
