-- =============================================================
-- BanexReintegra - Sprint 1: Esquema inicial de base de datos
-- Motor: PostgreSQL 15
-- =============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABLA: roles
-- =============================================================
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roles_name ON roles (name);

-- =============================================================
-- TABLA: users
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id         INTEGER      NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    email           VARCHAR(255) NOT NULL UNIQUE,
    username        VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN      NOT NULL DEFAULT FALSE,
    failed_attempts SMALLINT     NOT NULL DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_role_id  ON users (role_id);

-- =============================================================
-- TABLA: audit_logs
-- =============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    entity      VARCHAR(100),
    entity_id   VARCHAR(255),
    ip_address  INET,
    user_agent  TEXT,
    payload     JSONB,
    status      VARCHAR(20)  NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failure')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id   ON audit_logs (user_id);
CREATE INDEX idx_audit_action    ON audit_logs (action);
CREATE INDEX idx_audit_created   ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_entity    ON audit_logs (entity, entity_id);

-- =============================================================
-- TRIGGER: updated_at automático
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- SEED: roles iniciales
-- =============================================================
INSERT INTO roles (name, description) VALUES
    ('admin',    'Administrador del sistema con acceso total'),
    ('operator', 'Operador que gestiona cashback y reportes'),
    ('viewer',   'Usuario de solo lectura para auditoría')
ON CONFLICT (name) DO NOTHING;
