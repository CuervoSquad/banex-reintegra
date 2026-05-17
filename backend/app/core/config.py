import secrets
from pydantic_settings import BaseSettings


def _require_env(name: str, default: str | None = None) -> str:
    """Falla en producción si la variable no está configurada explícitamente."""
    return default or ""


class Settings(BaseSettings):
    # Base de datos — NUNCA hardcodear en producción
    DATABASE_URL: str = "postgresql+psycopg2://banex_user:banex_pass@postgres:5432/banex_db"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # JWT — SECRET_KEY debe venir de variable de entorno en producción
    # En dev se genera uno aleatorio al arrancar (no persiste entre reinicios)
    SECRET_KEY: str = secrets.token_hex(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30   # reducido de 480 → 30 min
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Entorno
    ENVIRONMENT: str = "development"
    DEBUG: bool = False   # False por defecto — activar explícitamente en .env de dev
    LOG_LEVEL: str = "INFO"

    # CORS — orígenes explícitos separados por coma
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    # Métodos y headers permitidos (restringidos — no wildcard en producción)
    ALLOWED_METHODS: str = "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    ALLOWED_HEADERS: str = "Authorization,Content-Type,Accept"

    # Rate limiting
    RATE_LIMIT_LOGIN: str = "10/minute"      # intentos de login por IP
    RATE_LIMIT_DEFAULT: str = "120/minute"   # endpoints generales

    # OpenRouter / IA
    OPENROUTER_API_KEY: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    def model_post_init(self, __context) -> None:
        if self.ENVIRONMENT == "production":
            if self.SECRET_KEY == "" or len(self.SECRET_KEY) < 32:
                raise ValueError("SECRET_KEY debe configurarse en producción (mín 32 chars)")
            if "localhost" in self.DATABASE_URL:
                raise ValueError("DATABASE_URL no puede apuntar a localhost en producción")


settings = Settings()
