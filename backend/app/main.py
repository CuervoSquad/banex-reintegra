from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import background_routes, auth_routes

app = FastAPI(
    title="BanexReintegra API",
    description="API para cálculo automatizado de cashback Banexcoin",
    version="1.0.0",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["root"])
def root():
    return {"message": "BanexReintegra API funcionando correctamente"}


@app.get("/health", tags=["root"])
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}


app.include_router(auth_routes.router, prefix="/api/v1")
app.include_router(background_routes.router, prefix="/api/v1/background", tags=["background"])
