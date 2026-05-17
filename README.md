# BanexReintegra

Sistema de cashback y reintegros para pagos QR con Banexcoin. El proyecto calcula reintegros por nivel de consumo, permite liberar cashback en tiempo real y genera reportes operativos para pagos masivos en USDT.

## Propuesta

BanexReintegra convierte cada pago QR en una oportunidad de fidelizacion:

- El usuario paga con QR.
- El sistema suma su consumo mensual.
- Segun su nivel, aplica un porcentaje de cashback.
- El reintegro se calcula en bolivianos y puede convertirse a USDT.
- El cashback puede liberarse en tiempo real, segundo a segundo.
- Los operadores pueden cargar transacciones, generar reportes y exportar archivos para BanexTransfer.

## Formula principal

```txt
Reintegro Bs = Monto QR o consumo mensual * % Cashback
Reintegro USDT = Reintegro Bs / Tipo de cambio
Cashback por segundo = Reintegro total / Duracion del stream
Cashback reclamable = Cashback liberado - Cashback ya reclamado
```

Ejemplo:

```txt
Pago QR: Bs 248
Nivel: 1.5%
Reintegro: 248 * 0.015 = Bs 3.72

Tipo de cambio: Bs 6.96
Reintegro USDT: 3.72 / 6.96 = 0.5345 USDT
```

## Niveles de cashback

| Nivel | Consumo mensual | Cashback |
| --- | ---: | ---: |
| Nivel 1 | Bs 0 - Bs 999.99 | 1.0% |
| Nivel 2 | Bs 1,000 - Bs 2,999.99 | 1.5% |
| Nivel 3 | Bs 3,000 o mas | 2.0% |

La idea de negocio es simple: mas consumo QR, mejor nivel y mayor reintegro.

## Funcionalidades

- Autenticacion con JWT.
- Roles de acceso: `admin`, `operator` y `viewer`.
- Configuracion de niveles de cashback.
- Carga de transacciones desde CSV o Excel.
- Validacion de montos, tipo de cambio y filas duplicadas.
- Calculo mensual de reintegros por usuario.
- Cashback stream en tiempo real por pago QR.
- Claim de cashback acumulado.
- Exportacion de reportes operativos.
- Exportacion compatible con BanexTransfer.
- Auditoria de acciones criticas.
- Frontend web en React.
- App mobile en Expo/React Native.
- Backend en FastAPI.

## Arquitectura

```txt
banex-reintegra/
├── backend/       API FastAPI, servicios, modelos, workers
├── frontend/      Dashboard web React + Vite
├── mobile/        App mobile Expo
├── migrations/    Esquema SQL y seeds
├── docker/        Configuracion auxiliar
└── contracts/     Base para contratos/protocolo
```

## Flujo de reintegro mensual

1. El operador carga un archivo CSV o Excel con transacciones QR.
2. El sistema normaliza columnas y valida montos.
3. Las transacciones se agrupan por usuario.
4. Se calcula el consumo mensual total en Bs.
5. Se identifica el nivel correspondiente.
6. Se aplica el porcentaje de reintegro.
7. Se calcula el equivalente en USDT.
8. Se genera un reporte mensual.
9. Se exporta un CSV operativo o un archivo para BanexTransfer.

## Flujo de cashback en tiempo real

1. Se registra un pago QR.
2. El backend calcula el cashback total:

```txt
cashback_total = payment_amount * cashback_percentage
```

3. Se define la duracion del stream.
4. El sistema calcula la tasa por segundo:

```txt
stream_rate_per_second = cashback_total / duration_seconds
```

5. El usuario ve como el cashback se libera progresivamente.
6. Puede reclamar solo el monto ya liberado.
7. El sistema evita reclamos duplicados o superiores al cashback total.

## Seguridad

BanexReintegra usa una estrategia de seguridad por capas:

- Password hashing con `bcrypt`.
- Access token y refresh token con JWT.
- Tokens firmados con `SECRET_KEY`.
- Revocacion de tokens mediante blacklist en Redis.
- Bloqueo temporal despues de intentos fallidos de login.
- Control de permisos por rol.
- Auditoria de operaciones sensibles.
- Validacion de usuario activo.
- Proteccion contra duplicidad de pagos QR.
- Verificacion de propiedad antes de reclamar cashback.

## Roles

| Rol | Permisos principales |
| --- | --- |
| `admin` | Configurar niveles, cargar archivos, generar reportes, exportar pagos |
| `operator` | Cargar archivos, generar reportes, operar reintegros |
| `viewer` | Consultar reportes y resultados |

## Tecnologias

Backend:

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Redis
- Celery/RQ
- JWT
- bcrypt

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router

Mobile:

- Expo
- React Native
- TypeScript

Infraestructura:

- Docker Compose
- PostgreSQL
- Redis
- Flyway
- Logstash

## Instalacion rapida

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd banex-reintegra
```

### 2. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Editar `backend/.env` y cambiar `SECRET_KEY` por un valor seguro:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Levantar servicios base

```bash
docker compose up -d postgres redis backend
```

La API queda disponible en:

```txt
http://localhost:8000
```

Documentacion Swagger en desarrollo:

```txt
http://localhost:8000/api/docs
```

### 4. Levantar frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```txt
http://localhost:5173
```

### 5. Levantar mobile

```bash
cd mobile
npm install
npm start
```

## Endpoints principales

Autenticacion:

```txt
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Cashback stream:

```txt
POST /api/v1/cashback/qr-payments
GET  /api/v1/cashback/streams/current
GET  /api/v1/cashback/streams
POST /api/v1/cashback/streams/{stream_id}/claim
```

Niveles:

```txt
GET   /api/v1/levels
PATCH /api/v1/levels/{level_id}
```

Cargas:

```txt
POST /api/v1/uploads
GET  /api/v1/uploads
GET  /api/v1/uploads/{session_id}
```

Reportes:

```txt
POST /api/v1/reports/generate/{session_id}
GET  /api/v1/reports
GET  /api/v1/reports/{report_id}
GET  /api/v1/reports/{report_id}/export/csv
GET  /api/v1/reports/{report_id}/export/banextransfer
```

## Formato esperado para carga de transacciones

Columnas recomendadas:

```txt
user_identifier
amount_bs
amount_usdt
exchange_rate
merchant_name
transaction_date
```

Tambien se aceptan alias como `usuario`, `cuenta`, `monto_bs`, `monto_usdt` o `crypto_quantity`.

## Demo sugerida para pitch

1. Mostrar login y dashboard.
2. Entrar a configuracion de niveles.
3. Explicar tabla de niveles.
4. Crear un pago QR demo.
5. Mostrar el cashback calculado.
6. Mostrar el stream liberandose segundo a segundo.
7. Aceptar cashback acumulado.
8. Cargar archivo mensual de transacciones.
9. Generar reporte de reintegros.
10. Exportar archivo BanexTransfer.

Mensaje clave:

```txt
BanexReintegra automatiza el ciclo completo: pago QR, nivel de fidelidad, calculo de cashback, liberacion en tiempo real, reporte operativo y pago masivo en USDT.
```

## Estado del proyecto

Proyecto en desarrollo para demo y validacion de arquitectura. Antes de usar en produccion se recomienda:

- Cambiar todas las claves de desarrollo.
- Configurar HTTPS.
- Revisar CORS por dominio final.
- Ejecutar migraciones en ambiente controlado.
- Agregar pruebas automatizadas de seguridad y calculo financiero.
- Revisar politicas de almacenamiento de tokens en frontend.
