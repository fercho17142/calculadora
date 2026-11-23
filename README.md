# BetCalculator Pro

Aplicación web profesional para **calcular, administrar y simular estrategias matemáticas de apuestas deportivas con cuotas decimales**.

> ⚠️ **Aviso legal**: esta herramienta es exclusivamente de cálculo y simulación matemática. **No garantiza ganancias ni recomienda apuestas.** Los resultados deportivos son impredecibles.

## ✨ Funcionalidades

- **Calculadora de apuestas**: determina capital a apostar, victorias necesarias para alcanzar una meta y cuántas derrotas se toleran.
- **Motor matemático** con 4 modalidades:
  1. Apuesta fija
  2. Reinversión total
  3. Reinversión de ganancias
  4. Porcentaje del capital
- **Simulador** de secuencias de apuestas (hasta N apuestas) con resultados editables.
- **Módulo de escenarios** comparando 8W, 7W/1L, 6W/2L, etc.
- **Módulo de probabilidades** (probabilidad implícita, estimada, binomial de alcanzar la meta).
- **Dashboard** con indicadores y gráficas interactivas (Recharts).
- **Historial** con CRUD, filtros por fecha y exportación a Excel y PDF.
- **API REST** documentada.
- **Pruebas automatizadas** (unitarias, integración, E2E con Playwright).

## 🧰 Stack tecnológico

| Capa       | Tecnología                                  |
| ---------- | ------------------------------------------- |
| Frontend   | React, Vite, JavaScript, Tailwind CSS, Recharts, Lucide React |
| Backend    | Node.js, Express.js, API REST               |
| Base datos | PostgreSQL, Prisma ORM                      |
| Herramientas | Docker, Docker Compose, Git/GitHub, `.env` |

## 📱 App iOS (SwiftUI)

Además de la web, el repositorio incluye una **app iOS nativa en SwiftUI** que consume la misma API REST:

- Ruta: `ios/`
- Requiere macOS + Xcode 15 y un dispositivo/simulador con iOS 16+.
- La compilación está automatizada con **GitHub Actions** (`.github/workflows/ios-build.yml`).
- URL de la API configurable en `ios/BetCalculator/Info.plist` (clave `API_BASE_URL`).

Ver [`ios/README.md`](ios/README.md) para instrucciones de compilación y ejecución.

## 📁 Estructura de carpetas

```
BetCalculator-Pro/
├── client/                 # Frontend React + Vite
├── server/                 # Backend Node.js + Express
│   ├── prisma/             # Esquema de base de datos
│   ├── src/
│   │   ├── engine/         # Motor matemático puro
│   │   ├── routes/         # Rutas de la API REST
│   │   ├── services/       # Lógica de historial
│   │   └── utils/          # Utilidades
│   └── tests/              # Pruebas unitarias e integración
├── ios/                    # App iOS nativa (SwiftUI)
├── .github/workflows/      # CI: compilación iOS con GitHub Actions
├── tests/e2e/              # Pruebas E2E con Playwright
├── docs/                   # Documentación técnica
├── docker-compose.yml
└── .env.example
```

## 🚀 Instalación y ejecución

### Requisitos

- Node.js >= 18
- npm >= 9
- Docker y Docker Compose (opcional, para PostgreSQL)

### Opción A — Ejecución completa con Docker

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000/api
- PostgreSQL: localhost:5432

### Opción B — Ejecución local (desarrollo)

1. **Backend**

```bash
cd server
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init   # requiere PostgreSQL en ejecución
npm run dev
```

2. **Frontend** (en otra terminal)

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

> El backend funciona incluso sin PostgreSQL: si la base de datos no está disponible, el módulo de historial usa un almacenamiento en memoria (no persistente) como respaldo.

## 🧪 Pruebas

```bash
# Unitarias e integración (backend)
cd server
npm test

# E2E con Playwright
cd tests/e2e
npm install
npx playwright install chromium
npx playwright test
```

## 📐 Fórmulas matemáticas

- **Retorno bruto** = `Apuesta × Cuota`
- **Ganancia neta (victoria)** = `Apuesta × (Cuota - 1)`
- **Pérdida (derrota)** = `-Apuesta`
- **Capital final** = `Capital inicial + Σ ganancias netas - Σ pérdidas`
- **Probabilidad implícita** = `(1 / Cuota) × 100`

### Modalidades

| Modalidad | Cálculo de la apuesta |
| --------- | --------------------- |
| Apuesta fija | Apuesta constante = `Capital inicial × % riesgo` (limitada al saldo disponible) |
| Reinversión total | Se apuesta todo el saldo disponible en cada apuesta |
| Reinversión de ganancias | Se conserva el capital inicial; se apuestan solo las ganancias acumuladas |
| Porcentaje del capital | `Saldo disponible × % riesgo` en cada apuesta |

## 🔒 Validaciones

- Cuota debe ser `> 1.00`.
- No se permiten valores negativos.
- La apuesta nunca supera el capital disponible.
- Redondeo monetario a 2 decimales con corrección de errores de punto flotante.
- Validaciones en tiempo real en el frontend.

## 📚 Documentación

Ver [`docs/DOCUMENTACION_TECNICA.md`](docs/DOCUMENTACION_TECNICA.md) para la especificación detallada, endpoints de la API y casos de prueba.
