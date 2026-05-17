-- =============================================================
-- BanexReintegra - Sprint 1: Seeds de datos de prueba
-- =============================================================

-- Usuarios de prueba por rol
-- Contraseñas: Admin1234! / Operator1234! / Viewer1234!
INSERT INTO users (id, role_id, email, username, hashed_password, full_name, is_active, is_verified)
VALUES
    (
        uuid_generate_v4(), 1,
        'admin@banexcoin.com', 'admin',
        '$2b$12$89tEZjDQgqYzf0GreDIdx.YvsbcX6U.vU.NhUzh3W3Q/dddbdMl4K',
        'Administrador Sistema', true, true
    ),
    (
        uuid_generate_v4(), 2,
        'operator@banexcoin.com', 'operator',
        '$2b$12$L9/PiBwOgefgo/UWK2BJEuWnPYELRMk3yy.wvSTKr3Z1q3XFsFlMC',
        'Operador Cashback', true, true
    ),
    (
        uuid_generate_v4(), 3,
        'viewer@banexcoin.com', 'viewer',
        '$2b$12$XS7A.Z3.Zt.ZcigavFLz2ekQUxTqjCF/l5fKSNxQxybcrtzAhjWHi',
        'Auditor Solo Lectura', true, true
    )
ON CONFLICT (email) DO NOTHING;
