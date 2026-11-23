# BetCalculator Pro — Documentación técnica

## 1. Resumen

BetCalculator Pro es una aplicación web para **calcular, administrar y simular estrategias matemáticas de apuestas deportivas con cuotas decimales**. Es una herramienta de cálculo/simulación: **no garantiza ganancias ni recomienda apuestas**.

## 2. Arquitectura

```
┌─────────────────┐      HTTP/JSON      ┌──────────────────────┐      Prisma      ┌────────────┐
│  Frontend React │  ────────────────▶  │  Backend Node/Express │  ─────────────▶  │ PostgreSQL │
│  (Vite + Tailwind│                    │  (API REST + motor)  │                  │            │
│  + Recharts)    │                    └──────────────────────┘                  └────────────┘
└─────────────────┘
```

- **client/**: SPA React con Tailwind CSS, Recharts y Lucide React. Consume la API vía Axios.
- **server/**: API REST Express. Contiene el **motor matemático puro** (`src/engine/`), rutas (`src/routes/`) y servicios (`src/services/`).
- **Base de datos**: PostgreSQL vía Prisma ORM. Si no hay conexión, el historial usa un respaldo en memoria (modo desarrollo).

## 3. Motor matemático

### Fórmulas

| Concepto | Fórmula |
| -------- | ------- |
| Retorno bruto | `Apuesta × Cuota` |
| Ganancia neta (victoria) | `Apuesta × (Cuota − 1)` |
| Pérdida (derrota) | `−Apuesta` |
| Capital final | `Capital inicial + Σ ganancias netas − Σ pérdidas` |
| Rentabilidad | `(Ganancia neta / Capital inicial) × 100` |
| Probabilidad implícita | `(1 / Cuota) × 100` |

### Modalidades

| ID | Modalidad | Cálculo de la apuesta |
| -- | --------- | --------------------- |
| `fixed` | Apuesta fija | `Capital inicial × % riesgo`, limitada al saldo disponible |
| `total` | Reinversión total | Se apuesta todo el saldo disponible |
| `profit` | Reinversión de ganancias | Se conserva el capital inicial; se apuesta la ganancia acumulada (con apuesta semilla inicial) |
| `percentage` | Porcentaje del capital | `Saldo disponible × % riesgo` |

### Reglas de seguridad matemática

- La apuesta **nunca supera el capital disponible**.
- Si el saldo es 0, la apuesta se marca como `sin_fondos`.
- Redondeo a 2 decimales con corrección de error de punto flotante (`Math.round((v + Number.EPSILON) * 100) / 100`).
- Diferenciación explícita de: **retorno bruto**, **ganancia neta**, **capital disponible** y **beneficio acumulado**.

### Escenarios

Para cada combinación `W victorias / L derrotas` se calculan dos variantes:

- **Mejor caso**: todas las victorias primero (máxima capitalización).
- **Peor caso**: todas las derrotas primero.

### Probabilidades

La probabilidad de alcanzar la meta se calcula como `P(X ≥ k)` con distribución binomial, donde `k` es el número mínimo de victorias que permiten alcanzar la meta (determinado por simulación).

## 4. API REST

Base URL: `http://localhost:4000/api`

| Método | Endpoint | Descripción |
| ------ | -------- | ----------- |
| GET | `/health` | Estado del servicio y de la base de datos |
| GET | `/calculate/modes` | Lista las modalidades de apuesta |
| POST | `/calculate/simulate` | Ejecuta una simulación `{ config, results? }` |
| POST | `/scenarios` | Comparación de escenarios `{ config }` |
| POST | `/probabilities` | Cálculo de probabilidades `{ config, estimatedProbability }` |
| GET | `/history` | Lista el historial (filtros `from`, `to`) |
| GET | `/history/status` | Estado de la persistencia |
| GET | `/history/:id` | Consulta un registro |
| POST | `/history` | Crea un registro |
| PUT | `/history/:id` | Actualiza un registro |
| DELETE | `/history/:id` | Elimina un registro |
| GET | `/history/export?format=csv\|xlsx\|pdf` | Exporta el historial |

### Ejemplo de petición

```bash
curl -X POST http://localhost:4000/api/calculate/simulate \
  -H "Content-Type: application/json" \
  -d '{"config":{"initialCapital":10000,"odd":2,"totalBets":8,"goal":1000000,"mode":"fixed","riskPercent":10,"wins":4}}'
```

## 5. Base de datos

Modelo Prisma: `HistoryRecord` (tabla `history_records`).

| Campo | Tipo | Descripción |
| ----- | ---- | ----------- |
| `id` | Int | Clave primaria autoincremental |
| `initialCapital` | Float | Capital inicial |
| `odd` | Float | Cuota decimal |
| `totalBets` | Int | Número total de apuestas |
| `goal` | Float | Meta económica |
| `mode` | String | Modalidad |
| `riskPercent` | Float | % de riesgo |
| `wins` / `losses` | Int | Victorias / derrotas |
| `finalCapital` | Float | Capital final |
| `netGain` | Float | Ganancia neta |
| `profitability` | Float | Rentabilidad % |
| `totalStaked` | Float | Total apostado |
| `totalReturned` | Float | Total recuperado |
| `goalAchieved` | Boolean | ¿Alcanzó la meta? |
| `resultsJson` | Text | Detalle de la simulación |
| `createdAt` / `updatedAt` | DateTime | Auditoría |

Migración: `npx prisma migrate dev --name init`.

## 6. Pruebas de software

### Unitarias (caja blanca)

- [`server/tests/mathEngine.test.js`](../server/tests/mathEngine.test.js): validaciones, apuesta fija, reinversión total, porcentaje del capital, reinversión de ganancias, capital insuficiente, fórmulas puras.
- [`server/tests/scenarios.test.js`](../server/tests/scenarios.test.js): generación de escenarios, mejor/peor caso.
- [`server/tests/probabilities.test.js`](../server/tests/probabilities.test.js): probabilidad implícita, binomial, meta alcanzable.

### Integración (API, caja gris)

- [`server/tests/api.test.js`](../server/tests/api.test.js): health, modos, simulación, validación de errores, escenarios, probabilidades y CRUD de historial.

### Caja negra (formularios)

- Pruebas E2E de Playwright verifican la carga del dashboard, el formulario del simulador, el toggle de resultados, escenarios, probabilidades e historial.

### E2E (Playwright)

- [`tests/e2e/betcalculator.spec.js`](../tests/e2e/betcalculator.spec.js)

**Casos de prueba incluidos**: victorias, derrotas, cuotas diferentes y capital insuficiente (ver tests unitarios del motor).

## 7. Despliegue con Docker

```bash
cp .env.example .env
docker compose up --build
```

Servicios:

- `db`: PostgreSQL 16 (persistencia en volumen `pgdata`).
- `server`: API en `:4000`, ejecuta `prisma migrate deploy` al iniciar.
- `client`: frontend Vite en `:5173`.

## 8. Variables de entorno

Ver [`.env.example`](../.env.example) (raíz), [`server/.env.example`](../server/.env.example) y [`client/.env.example`](../client/.env.example).

## 9. Aviso de responsabilidad

La aplicación es exclusivamente una herramienta de cálculo y simulación. Los resultados matemáticos no constituyen asesoramiento financiero ni de apuestas, y no garantizan resultados deportivos.
