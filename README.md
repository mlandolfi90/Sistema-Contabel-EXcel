# Panel de pre-diseño — Sistema Contable Multidivisa

Herramienta visual para iterar ideas de cambio sobre el libro Excel `Sistema_Contable_Automatico.xlsm` antes de ejecutarlas en VBA.

## Dos versiones disponibles

| Versión | URL | Almacenamiento | Sincroniza entre dispositivos |
|---|---|---|---|
| **v1** (legacy) | [→ panel v1](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v1/) | `localStorage` del navegador | No (manual via Export/Import JSON) |
| **v2** (recomendada) | [→ panel v2](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v2/) | GitHub Issues + `schema.json` | Sí, automático |
| **v2 + Mapa** | [→ mapa contable](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v2/mapa.html) | GitHub Issues + `schema.json` + `draft.json` + `layout.json` | Sí, automático |

La v2 usa los Issues del repo como fuente de verdad para las ideas, y `schema.json` como catálogo del sistema contable. El **mapa** es una vista extra (grafo interactivo) sobre los mismos datos.

---

## 📁 Documentación técnica del sistema

En la carpeta [`/docs/`](./docs/) están los archivos que describen qué hace el código VBA del libro Excel:

| Archivo | Qué contiene |
|---|---|
| [`docs/00-arquitectura-y-datos-maestros.md`](./docs/00-arquitectura-y-datos-maestros.md) | Visión general, hojas, tablas, datos maestros, reglas de negocio |
| [`docs/01-modulo-nucleo-contable.md`](./docs/01-modulo-nucleo-contable.md) | Módulo1.bas — `GuardarLote`, `ActualizarTasaVigente`, `GenerarAsientoPacto`, `RevalorizarCuenta` |
| [`docs/02-modulo-auditor-lotes.md`](./docs/02-modulo-auditor-lotes.md) | Módulo2.bas — `LoteAnterior`, `LoteSiguiente`, `CorregirLoteConID`, `DuplicarLoteConID` |
| [`docs/03-hoja-registro-rapido.md`](./docs/03-hoja-registro-rapido.md) | Hoja3.cls — eventos de `REGISTRO_RAPIDO` (selección múltiple de socios) |

---

## v2 — Panel sincronizado con GitHub Issues

### Qué cambia respecto de v1

- Cada tarjeta del Kanban **es un Issue del repo**.
- Las columnas se modelan con labels: `idea`, `diseño`, `listo`, `implementada`, `rechazada`.
- Las anclas (macro/hoja/tabla/rango/regla/socio/cuenta) se modelan con labels tipo `macro:GuardarLote`, `hoja:REGISTRO_RAPIDO`, etc.
- **Todo es configurable desde JSON**: los estados viven en `v2/config/workflow.json`, los tipos de ancla en `v2/config/anchor-types.json`, y los nodos reales del sistema en `v2/schema.json`.
- Crear / mover / cerrar tarjetas desde el HTML actualiza los Issues vía API REST de GitHub.

### Acciones disponibles en cada tarjeta

| Botón | Acción | Estados desde los que se puede |
|---|---|---|
| `←` | Retroceder al estado anterior | diseño, listo, implementada |
| `✕` | Rechazar (pide motivo, lo guarda como comentario del Issue) | idea, diseño, listo |
| `→` o `✓` o `↻` | Avanzar al estado siguiente del workflow | todos |
| `⌫` | Archivar (cerrar el Issue en GitHub) | todos |

---

## Mapa contable (vista de grafo)

URL: https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v2/mapa.html

Grafo interactivo con todos los nodos del sistema (hojas, macros, tablas, reglas, cuentas/socios) + los Issues flotando conectados a su ancla.

---

## Qué contiene el repo

```
/
├── index.html              Redirect automático a /v2/
├── README.md               Este archivo
├── LICENSE · .gitignore
│
├── docs/                   📁 Documentación técnica del libro Excel
│   ├── 00-arquitectura-y-datos-maestros.md
│   ├── 01-modulo-nucleo-contable.md
│   ├── 02-modulo-auditor-lotes.md
│   ├── 03-hoja-registro-rapido.md
│   ├── hojas/              (17 archivos, 1 por hoja del libro)
│   └── README.md
│
├── v1/                     📁 Panel legacy (localStorage)
│
└── v2/                     📁 Panel sincronizado con GitHub Issues
    ├── index.html · mapa.html
    ├── schema.json · draft.json · layout.json
    ├── config/             (workflow + anchor-types + ui)
    ├── css/                (base · tags · panel · mapa)
    └── js/
        ├── github.js · schema-loader.js · config-loader.js
        ├── mapa/           (10 módulos)
        └── panel/          (10 módulos)
```

---

## Flujo de trabajo

```
Capturar idea     Madurarla      Definir impacto    Generar VBA      Resultado
     ↓                ↓                ↓                ↓                ↓
 Idea / por  →   En diseño  →  Listo implementar → Copiar prompt → Implementada
   pensar       ↑       ↓         ↑       ↓           para Claude       ↓
    ↑    ↓      │       │         │       │                         (historial)
    │    └──────┴───────┴─────────┴───────┴─── ✕ Rechazada (con motivo)
    │                                                  │
    └───────────────────────────────────────────────────┘
                     (se puede reactivar)
```

## Convenciones del Kanban

| Estado | Label en GitHub | Qué significa |
|---|---|---|
| **Idea / por pensar** | `idea` | Se me ocurrió algo. Todavía no sé si es buena idea ni qué impacto tiene. |
| **En diseño** | `diseño` | Empecé a pensarlo en serio. Estoy definiendo alcance, riesgos, cómo se hace. |
| **Listo para implementar** | `listo` | Decidí hacerlo. Tengo claro qué cambio en qué lugar. |
| **✓ Implementada** | `implementada` | Ya se aplicó al libro Excel. Queda como historial. |
| **✕ Rechazada** | `rechazada` | Se descartó. El motivo queda como comentario del Issue. |

## Catálogo de nodos precargados

El sistema arranca con estos nodos cargados en `schema.json`:

- **11 macros operativas** — `GuardarLote`, `LimpiarRegistro`, `ActualizarTasaVigente`, `ActualizarTasaVigenteDesde`, `GenerarAsientoPacto`, `RevalorizarCuenta`, `LoteAnterior`, `LoteSiguiente`, `AccionSobreLoteVisible`, `CorregirLoteConID`, `DuplicarLoteConID`, más `Helpers`.
- **6 hojas** — `REGISTRO_RAPIDO`, `LIBRO_MAYOR`, `TASAS`, `AUDITOR_LOTES`, `REPORTE_BARRIDO`, `SALDOS_Y_ENTIDADES`.
- **10 tablas estructuradas** — `tb_registro_rapido`, `tb_mayor`, `tb_tasas_vigentes`, `tb_tasas_historial`, `tb_cuentas`, `tb_entidades`, `tb_divisas`, `tb_categorias`, `tb_segmentos`, `tb_clase_cuenta`.
- **3 socios** — Socio01, Socio02, Socio03 (sus `Cta. Corriente` son contrapartida en asientos de pacto).
- **6 cuentas clave** — `Utilidad Distribuible`, `Cta. Corriente Socio01/Socio02/Socio03`, `Ganancia por Revalorización`, `Pérdida por Revalorización`.
- **5 divisas** — USD (base), USDT, Bs, Oro, EUR.
- **1 regla** — `AlertaSpread` (umbral 3%).
