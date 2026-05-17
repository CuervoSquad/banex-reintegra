from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.security import decode_token, is_blacklisted
from app.api.routes import background_routes, auth_routes, cashback_routes, level_routes, upload_routes, report_routes, chat_routes

PUBLIC_PATHS = {"/", "/health", "/api/docs", "/api/redoc", "/openapi.json"}
# /api/v1/chat requiere auth — no está en PUBLIC_PREFIXES
PUBLIC_PREFIXES = ("/api/v1/auth/",)

# Rate limiter global
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])

app = FastAPI(
    title="BanexReintegra API",
    description="API para cálculo automatizado de cashback Banexcoin",
    version="1.0.0",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=[m.strip() for m in settings.ALLOWED_METHODS.split(",")],
    allow_headers=[h.strip() for h in settings.ALLOWED_HEADERS.split(",")],
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)

    path = request.url.path
    if not path.startswith("/api/"):
        return await call_next(request)
    if path in PUBLIC_PATHS or any(path.startswith(p) for p in PUBLIC_PREFIXES):
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})

    token = auth_header.split(" ", 1)[1]
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise ValueError
        jti = payload.get("jti")
        if jti and is_blacklisted(jti):
            return JSONResponse(status_code=401, content={"detail": "Token revocado"})
    except ValueError:
        return JSONResponse(status_code=401, content={"detail": "Token inválido o expirado"})

    return await call_next(request)


@app.get("/", tags=["root"])
def root():
    return {"message": "BanexReintegra API"}


@app.get("/health", tags=["root"])
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}


app.include_router(auth_routes.router, prefix="/api/v1")
app.include_router(cashback_routes.router, prefix="/api/v1")
app.include_router(level_routes.router, prefix="/api/v1")
app.include_router(upload_routes.router, prefix="/api/v1")
app.include_router(report_routes.router, prefix="/api/v1")
app.include_router(background_routes.router, prefix="/api/v1/background", tags=["background"])
app.include_router(chat_routes.router, prefix="/api/v1")
