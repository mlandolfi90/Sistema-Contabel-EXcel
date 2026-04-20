# Sistema Contable Multidivisa V2 — Excel + VBA

> Libro de Excel con macros VBA para registro contable multidivisa, trazabilidad de lotes y distribución de utilidades entre socios.

## Inicio rápido

1. Descarga `v2/Sistema_Contable_Automatico.xlsm`
2. Habilita macros en Excel (Windows, escritorio)
3. Activa *"Confiar en acceso al modelo de objetos de VBA"* en Opciones → Centro de confianza
4. Lee [`docs/02-implementacion.md`](docs/02-implementacion.md) para construcción desde cero

## Estructura del repositorio

```
/
├── v2/                          ← Libro Excel (.xlsm) versión activa
├── v1/                          ← Versión anterior (referencia)
├── docs/
│   ├── 00-arquitectura.md       ← Visión general, hojas y flujo de datos
│   ├── 01-datos-maestros.md     ← Tablas estructuradas y rangos con nombre
│   ├── 02-implementacion.md     ← Guía paso a paso: construir desde cero
│   ├── 03-reglas-negocio.md     ← Validaciones, spreads, pacto, revalorización
│   ├── hojas/                   ← Documentación por hoja de Excel
│   │   ├── REGISTRO_RAPIDO.md
│   │   ├── LIBRO_MAYOR.md
│   │   ├── TASAS.md
│   │   ├── AUDITOR_LOTES.md
│   │   ├── CONFIG.md
│   │   ├── CONFIG_AUX.md
│   │   ├── SALDOS_Y_ENTIDADES.md
│   │   ├── REPORTE_BARRIDO.md
│   │   ├── BALANCE.md
│   │   ├── DASHBOARD.md
│   │   └── PyL_POR_SEGMENTO.md
│   └── vba/                     ← Código VBA exportado (texto plano)
│       ├── Modulo1.bas
│       ├── Modulo2.bas
│       ├── Modulo3.bas
│       └── Hoja3.cls
└── README.md                    ← Este archivo
```

## Versiones

| Tag | Descripción |
|-----|-------------|
| `v2.x` | Versión activa — multidivisa, auditor de lotes, PyL por segmento |
| `v1.x` | Versión anterior — referencia histórica |

## Requisitos

- Excel para Windows (escritorio) con VBA habilitado
- Funciones modernas: `XLOOKUP`, `FILTER`, `SORT`, `IFERROR`
- Excel 365 o Excel 2021+

## Socios configurados

Manuel · Andreina · Michelle

## Divisas soportadas

USD (base) · USDT · Bs · Oro · EUR
