-- =============================================================
-- BanexReintegra: Reportes mensuales y filas por usuario
-- =============================================================

-- Reporte generado a partir de una sesión de carga
CREATE TABLE IF NOT EXISTS monthly_reports (
    id                    UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id            UUID         NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
    generated_by          UUID         REFERENCES users(id) ON DELETE SET NULL,
    period_month          SMALLINT     NOT NULL,
    period_year           SMALLINT     NOT NULL,
    exchange_rate         NUMERIC(14,6) NOT NULL,
    total_users           INTEGER      NOT NULL DEFAULT 0,
    total_amount_bs       NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_reintegro_usdt  NUMERIC(14,6) NOT NULL DEFAULT 0,
    total_reintegro_bs    NUMERIC(14,2) NOT NULL DEFAULT 0,
    generated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monthly_reports_session
    ON monthly_reports (session_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_period
    ON monthly_reports (period_year, period_month DESC);

-- Una fila por usuario dentro del reporte
CREATE TABLE IF NOT EXISTS report_rows (
    id                BIGSERIAL    PRIMARY KEY,
    report_id         UUID         NOT NULL REFERENCES monthly_reports(id) ON DELETE CASCADE,
    user_identifier   VARCHAR(255) NOT NULL,
    total_amount_bs   NUMERIC(14,2) NOT NULL,
    total_amount_usdt NUMERIC(14,6) NOT NULL,
    level_id          INTEGER      REFERENCES cashback_levels(id),
    level_name        VARCHAR(50),
    level_percentage  NUMERIC(5,4),
    reintegro_usdt    NUMERIC(14,6) NOT NULL,
    reintegro_bs      NUMERIC(14,2) NOT NULL,
    exchange_rate     NUMERIC(14,6) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_report_rows_report
    ON report_rows (report_id);
