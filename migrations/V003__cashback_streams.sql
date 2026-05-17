-- =============================================================
-- BanexReintegra - STREAM: Cashback en tiempo real
-- =============================================================

CREATE TABLE IF NOT EXISTS cashback_streams (
    id                      UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    qr_payment_id           VARCHAR(120)   NOT NULL UNIQUE,
    merchant_name           VARCHAR(180)   NOT NULL,
    payment_amount          NUMERIC(14, 2) NOT NULL CHECK (payment_amount > 0),
    cashback_total          NUMERIC(14, 6) NOT NULL CHECK (cashback_total > 0),
    stream_rate_per_second  NUMERIC(14, 8) NOT NULL CHECK (stream_rate_per_second > 0),
    streamed_claimed_amount NUMERIC(14, 6) NOT NULL DEFAULT 0 CHECK (streamed_claimed_amount >= 0),
    status                  VARCHAR(20)    NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'claimed', 'cancelled')),
    starts_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    ends_at                 TIMESTAMPTZ    NOT NULL,
    contract_address        VARCHAR(120),
    chain_tx_hash           VARCHAR(120),
    created_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cashback_streams_user_status
    ON cashback_streams (user_id, status);

CREATE INDEX IF NOT EXISTS idx_cashback_streams_starts_at
    ON cashback_streams (starts_at DESC);

DROP TRIGGER IF EXISTS trg_cashback_streams_updated_at ON cashback_streams;
CREATE TRIGGER trg_cashback_streams_updated_at
    BEFORE UPDATE ON cashback_streams
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
