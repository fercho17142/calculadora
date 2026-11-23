# BetCalculator Pro — App iOS (SwiftUI)

Aplicación iOS nativa escrita en **SwiftUI** que consume la API REST de BetCalculator Pro (el backend Node.js/Express ya existente en este repositorio).

## Características

- Dashboard con indicadores y gráficas nativas (Swift Charts, iOS 16+).
- Simulador de apuestas con resultados editables.
- Comparación de escenarios (mejor/peor caso).
- Módulo de probabilidades (implícita, estimada y binomial).
- Historial con CRUD (consultar, guardar, eliminar).
- Tema oscuro elegante y formato de moneda colombiana (COP).

## Requisitos

| Requisito | Versión |
| --------- | ------- |
| macOS con Xcode | 15.0 o superior |
| Swift | 5.9 |
| iOS (deployment target) | 16.0 |
| XcodeGen (opcional) | para regenerar el proyecto |

## Configuración de la API

La URL base se lee de la clave `API_BASE_URL` del archivo [`BetCalculator/Info.plist`](BetCalculator/Info.plist). Por defecto apunta a:

```
http://localhost:4001/api
```

- **Simulador iOS**: `localhost` apunta al Mac, por lo que funciona sin cambios.
- **Dispositivo físico**: cambia `API_BASE_URL` a la IP local del Mac en la red, por ejemplo `http://192.168.1.4:4001/api`.
- El backend debe estar en ejecución (`cd server && npm run dev`).

## Abrir y compilar

### Opción A — Con XcodeGen (recomendado en CI)

```bash
brew install xcodegen
cd ios
xcodegen generate
open BetCalculator.xcodeproj
```

### Opción B — Directamente con Xcode

Abre [`BetCalculator.xcodeproj`](BetCalculator.xcodeproj) y ejecuta el esquema `BetCalculator` sobre un simulador.

## Compilar por línea de comandos

```bash
cd ios
xcodebuild -project BetCalculator.xcodeproj -scheme BetCalculator \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO build
```

## GitHub Actions

El workflow [`.github/workflows/ios-build.yml`](../.github/workflows/ios-build.yml) ejecuta en cada `push`/`pull_request` a `main`:

1. Instala XcodeGen.
2. Genera el proyecto Xcode desde [`project.yml`](project.yml).
3. Compila para iOS Simulator y para dispositivo (sin firma).

## Estructura

```
ios/
├── project.yml                         # Definición del proyecto (XcodeGen)
├── BetCalculator.xcodeproj/            # Proyecto Xcode
│   └── project.pbxproj
└── BetCalculator/
    ├── BetCalculatorApp.swift          # Punto de entrada + TabView
    ├── Models.swift                    # Modelos Codable de la API
    ├── APIClient.swift                 # Cliente HTTP (URLSession)
    ├── SimulationStore.swift           # Estado observable compartido
    ├── Theme.swift                     # Paleta de colores
    ├── Components.swift                # Tarjetas y formateadores
    ├── DashboardView.swift
    ├── SimuladorView.swift
    ├── EscenariosView.swift
    ├── ProbabilidadesView.swift
    ├── HistorialView.swift
    ├── Info.plist
    └── Assets.xcassets
```

## Aviso

Esta aplicación es una herramienta de cálculo y simulación. No garantiza ganancias ni recomienda apuestas.
