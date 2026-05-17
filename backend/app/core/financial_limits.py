"""
Límites financieros centralizados del sistema BanexReintegra.
Cambiar estos valores requiere aprobación de compliance.
"""
from decimal import Decimal

# ── Límites por transacción QR ────────────────────────────────────────────────
MAX_PAYMENT_AMOUNT_BS = Decimal("50000")   # Bs 50.000 por transacción
MIN_PAYMENT_AMOUNT_BS = Decimal("1")       # Bs 1 mínimo

# ── Límites diarios por usuario ───────────────────────────────────────────────
MAX_DAILY_STREAMS = 20                     # máximo streams QR por día
MAX_DAILY_AMOUNT_BS = Decimal("100000")    # Bs 100.000 acumulado por día

# ── Límites de cashback ───────────────────────────────────────────────────────
MAX_CASHBACK_PERCENTAGE = Decimal("0.05")  # 5% máximo absoluto (aunque niveles lo limiten)
MAX_CASHBACK_PER_STREAM_BS = Decimal("2500")  # Bs 2.500 de cashback por stream

# ── Stream ────────────────────────────────────────────────────────────────────
MIN_STREAM_DURATION_SECONDS = 60
MAX_STREAM_DURATION_SECONDS = 86400        # 24 horas máximo

# ── Merchant ──────────────────────────────────────────────────────────────────
MAX_MERCHANT_NAME_LENGTH = 100
ALLOWED_MERCHANT_CHARS_PATTERN = r"^[\w\s\-\.\,\#\&\(\)áéíóúÁÉÍÓÚñÑüÜ]+$"

# ── Claim ─────────────────────────────────────────────────────────────────────
MIN_CLAIMABLE_AMOUNT_BS = Decimal("0.01")  # mínimo para hacer claim
