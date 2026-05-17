-- =============================================================
-- BanexReintegra: validacion de cargas y tipo de cambio por transaccion
-- =============================================================

ALTER TABLE upload_sessions
    ADD COLUMN IF NOT EXISTS rejected_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS validation_summary JSONB;

ALTER TABLE upload_rows
    ADD COLUMN IF NOT EXISTS amount_usdt NUMERIC(14,6);

CREATE INDEX IF NOT EXISTS idx_upload_rows_session_amounts
    ON upload_rows (session_id, user_identifier, amount_bs, amount_usdt);

CREATE UNIQUE INDEX IF NOT EXISTS uq_monthly_reports_session
    ON monthly_reports (session_id);
