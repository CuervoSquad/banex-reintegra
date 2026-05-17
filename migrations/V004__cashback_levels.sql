-- =============================================================
-- BanexReintegra: Niveles de cashback configurables
-- =============================================================

CREATE TABLE IF NOT EXISTS cashback_levels (
    id             SERIAL       PRIMARY KEY,
    name           VARCHAR(50)  NOT NULL,
    min_amount_bs  NUMERIC(14,2) NOT NULL CHECK (min_amount_bs >= 0),
    max_amount_bs  NUMERIC(14,2),                          -- NULL = sin límite superior
    percentage     NUMERIC(5,4) NOT NULL CHECK (percentage > 0 AND percentage <= 1),
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_cashback_levels_updated_at ON cashback_levels;
CREATE TRIGGER trg_cashback_levels_updated_at
    BEFORE UPDATE ON cashback_levels
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Niveles iniciales según el documento de requerimientos
INSERT INTO cashback_levels (name, min_amount_bs, max_amount_bs, percentage) VALUES
    ('Nivel 1', 0,       999.99,  0.0100),
    ('Nivel 2', 1000.00, 2999.99, 0.0150),
    ('Nivel 3', 3000.00, NULL,    0.0200)
ON CONFLICT DO NOTHING;
