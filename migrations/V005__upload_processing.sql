-- =============================================================
-- BanexReintegra: Carga de archivos y procesamiento de transacciones QR
-- =============================================================

-- Sesión de carga (un archivo CSV/Excel = una sesión)
CREATE TABLE IF NOT EXISTS upload_sessions (
    id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
    filename       VARCHAR(255) NOT NULL,
    period_month   SMALLINT     NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year    SMALLINT     NOT NULL CHECK (period_year >= 2020),
    exchange_rate  NUMERIC(14,6) NOT NULL CHECK (exchange_rate > 0),
    status         VARCHAR(20)  NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'done', 'error')),
    row_count      INTEGER,
    error_message  TEXT,
    processed_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upload_sessions_user
    ON upload_sessions (uploaded_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_period
    ON upload_sessions (period_year, period_month);

-- Filas individuales de transacción del archivo cargado
CREATE TABLE IF NOT EXISTS upload_rows (
    id               BIGSERIAL    PRIMARY KEY,
    session_id       UUID         NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
    user_identifier  VARCHAR(255) NOT NULL,
    merchant_name    VARCHAR(255),
    amount_bs        NUMERIC(14,2) NOT NULL CHECK (amount_bs > 0),
    exchange_rate    NUMERIC(14,6),
    transaction_date DATE,
    raw_data         JSONB,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upload_rows_session
    ON upload_rows (session_id);
CREATE INDEX IF NOT EXISTS idx_upload_rows_user
    ON upload_rows (session_id, user_identifier);
