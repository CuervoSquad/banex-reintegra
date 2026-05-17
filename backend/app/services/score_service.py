from datetime import datetime, timezone, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.cashback_stream import CashbackStream
from app.models.user import User


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


class ScoreService:
    def __init__(self, db: Session):
        self.db = db

    def calculate(self, user: User) -> dict:
        now = datetime.now(timezone.utc)
        streams: list[CashbackStream] = (
            self.db.query(CashbackStream)
            .filter(CashbackStream.user_id == user.id)
            .order_by(CashbackStream.starts_at.asc())
            .all()
        )

        if not streams:
            return self._empty_score(user)

        # ── Factor 1: Antigüedad (meses desde primer pago) ───────────────────
        first = streams[0].starts_at.replace(tzinfo=timezone.utc) if streams[0].starts_at.tzinfo is None else streams[0].starts_at
        months_active = max(1, (now - first).days / 30)
        f_antiguedad = _clamp(months_active / 24 * 100)  # 24 meses = 100

        # ── Factor 2: Volumen total QR ────────────────────────────────────────
        total_bs = sum(float(s.payment_amount) for s in streams)
        f_volumen = _clamp(total_bs / 50_000 * 100)  # 50.000 Bs = 100

        # ── Factor 3: Consistencia (pagos en distintos meses) ────────────────
        meses_con_pagos = len({
            (s.starts_at.year, s.starts_at.month) for s in streams
        })
        f_consistencia = _clamp(meses_con_pagos / max(1, int(months_active)) * 100)

        # ── Factor 4: Variedad de comercios ──────────────────────────────────
        comercios_unicos = len({s.merchant_name for s in streams})
        f_variedad = _clamp(comercios_unicos / 10 * 100)  # 10+ comercios = 100

        # ── Factor 5: Sin mora (streams reclamados sin problemas) ─────────────
        claimed = [s for s in streams if s.status == "claimed"]
        f_sin_mora = _clamp(len(claimed) / max(1, len(streams)) * 100)

        factores = [
            {"label": "Antigüedad",         "valor": round(f_antiguedad)},
            {"label": "Volumen QR",          "valor": round(f_volumen)},
            {"label": "Consistencia",        "valor": round(f_consistencia)},
            {"label": "Variedad comercios",  "valor": round(f_variedad)},
            {"label": "Sin mora",            "valor": round(f_sin_mora)},
        ]

        pesos = [0.15, 0.30, 0.25, 0.15, 0.15]
        score_raw = sum(f["valor"] * p for f, p in zip(factores, pesos))
        score = round(score_raw * 10)  # 0–1000

        # ── Consumo del mes actual ────────────────────────────────────────────
        current_month_streams = [
            s for s in streams
            if s.starts_at.year == now.year and s.starts_at.month == now.month
        ]
        consumo_mes_bs = sum(float(s.payment_amount) for s in current_month_streams)

        # ── Nivel de crédito ─────────────────────────────────────────────────
        credit = self._credit_tier(score, total_bs, months_active)

        # ── Claims ZK disponibles ─────────────────────────────────────────────
        zk_claims = self._zk_claims(
            score, consumo_mes_bs, total_bs, months_active, f_sin_mora
        )

        return {
            "score": score,
            "factores": factores,
            "total_streams": len(streams),
            "total_bs": round(total_bs, 2),
            "consumo_mes_bs": round(consumo_mes_bs, 2),
            "meses_activo": round(months_active, 1),
            "comercios_unicos": comercios_unicos,
            "credit": credit,
            "zk_claims": zk_claims,
        }

    def _credit_tier(self, score: int, total_bs: float, months: float) -> dict:
        avg_monthly = total_bs / max(1, months)
        if score < 400:
            return {"elegible": False, "limite_bs": 0, "tasa_anual_pct": 0, "tier": "Sin historial suficiente"}
        elif score < 600:
            limite = round(avg_monthly * 0.5, 2)
            return {"elegible": True, "limite_bs": limite, "tasa_anual_pct": 18.0, "tier": "Básico"}
        elif score < 800:
            limite = round(avg_monthly * 1.0, 2)
            return {"elegible": True, "limite_bs": limite, "tasa_anual_pct": 12.0, "tier": "Estándar"}
        else:
            limite = round(avg_monthly * 2.0, 2)
            return {"elegible": True, "limite_bs": limite, "tasa_anual_pct": 7.5, "tier": "Premium"}

    def _zk_claims(
        self,
        score: int,
        consumo_mes: float,
        total_bs: float,
        months: float,
        sin_mora: float,
    ) -> list[dict]:
        return [
            {
                "id": "consumo_200",
                "label": "Consumo > 200 Bs este mes",
                "descripcion": "Sin revelar monto exacto",
                "cumple": consumo_mes >= 200,
            },
            {
                "id": "score_600",
                "label": "BanexScore ≥ 600 puntos",
                "descripcion": "Sin revelar historial completo",
                "cumple": score >= 600,
            },
            {
                "id": "sin_mora",
                "label": "Sin mora últimos 6 meses",
                "descripcion": "Sin revelar transacciones",
                "cumple": sin_mora >= 80,
            },
            {
                "id": "microcredito",
                "label": "Elegible para microcrédito",
                "descripcion": "Sin revelar ingresos ni identidad bancaria",
                "cumple": score >= 400,
            },
        ]

    def _empty_score(self, user: User) -> dict:
        return {
            "score": 0,
            "factores": [
                {"label": "Antigüedad",        "valor": 0},
                {"label": "Volumen QR",         "valor": 0},
                {"label": "Consistencia",       "valor": 0},
                {"label": "Variedad comercios", "valor": 0},
                {"label": "Sin mora",           "valor": 0},
            ],
            "total_streams": 0,
            "total_bs": 0,
            "consumo_mes_bs": 0,
            "meses_activo": 0,
            "comercios_unicos": 0,
            "credit": {"elegible": False, "limite_bs": 0, "tasa_anual_pct": 0, "tier": "Sin historial"},
            "zk_claims": [
                {"id": "consumo_200",  "label": "Consumo > 200 Bs este mes",      "descripcion": "Sin revelar monto exacto",             "cumple": False},
                {"id": "score_600",    "label": "BanexScore ≥ 600 puntos",         "descripcion": "Sin revelar historial completo",        "cumple": False},
                {"id": "sin_mora",     "label": "Sin mora últimos 6 meses",        "descripcion": "Sin revelar transacciones",             "cumple": False},
                {"id": "microcredito", "label": "Elegible para microcrédito",      "descripcion": "Sin revelar ingresos ni identidad bancaria", "cumple": False},
            ],
        }
