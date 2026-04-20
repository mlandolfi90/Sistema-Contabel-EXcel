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
- **Todo es configurable desde JSON**: los estados viven en `v2/config/workflow.json`, los tipos de ancla en `v2/config/anchor-types.json`, y los nodos reales del sistema en `v2/schema.json`. Para agregar un estado o tipo nuevo se edita JSON, no código.
- Al abrir la v2, lee los Issues + configs + schema y renderiza todo dinámicamente.
- Crear / mover / cerrar tarjetas desde el HTML actualiza los Issues vía API REST de GitHub.

### Cómo habilitarla (primera vez)

1. Entrá a **[→ panel v2](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v2/)**. Sin token, ya ves las tarjetas en modo lectura.
2. Para crear/mover tarjetas necesitás un **Personal Access Token** de GitHub:
   - Ir a https://github.com/settings/tokens?type=beta
   - *Generate new token* (fine-grained)
   - Nombre: `Panel Contable`
   - Expiración: 1 año (o la que prefieras)
   - Repository access: *Only select repositories* → `Sistema-Contabel-EXcel`
   - Permissions → Repository → **Issues: Read and write**, **Contents: Read and write** (este último para guardar `layout.json`, `draft.json`, `schema.json`)
   - Generar y copiar el token
3. Pegá el token en el campo de la barra superior del panel y pulsá **Guardar token**.
4. El token queda en `localStorage` de ese navegador (nunca se sube a ningún lado).
5. Ya podés crear, mover, retroceder y rechazar tarjetas directamente desde la UI.

### Acciones disponibles en cada tarjeta

| Botón | Acción | Estados desde los que se puede |
|---|---|---|
| `←` | Retroceder al estado anterior | diseño, listo, implementada |
| `✕` | Rechazar (pide motivo, lo guarda como comentario del Issue) | idea, diseño, listo |
| `→` o `✓` o `↻` | Avanzar al estado siguiente del workflow | todos |
| `⌫` | Archivar (cerrar el Issue en GitHub) | todos |

### Uso diario

1. Abrí la v2 desde cualquier dispositivo (una sola vez por dispositivo tenés que pegar el token).
2. En **Ideas de cambio**: título + nota + estado + anclas → **Crear Issue**.
3. Mover tarjetas con los botones de cada tarjeta (ver tabla de arriba).
4. Al rechazar una idea, se pide el **motivo** y se guarda como comentario del Issue (trazable en GitHub).
5. **Copiar prompt VBA** arma el prompt con todas las tarjetas en estado `listo` para pegar en Claude.

---

## Mapa contable (vista de grafo)

URL: https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v2/mapa.html

Grafo interactivo con todos los nodos del sistema (hojas, macros, tablas, reglas, cuentas/socios) + los Issues flotando conectados a su ancla. Permite:

- **Arrastrar** nodos y guardar posiciones en `v2/layout.json`.
- **Agregar nodos custom** al borrador (`draft.json`).
- **Crear conexiones custom** entre nodos (modo "click origen → click destino").
- **Editar** nodos y conexiones (doble-click).
- **Eliminar** nodos/conexiones.
- **Aplicar borrador al esquema oficial** (mergea `draft.json` en `schema.json`).
- **Descartar borrador** (vuelve al esquema oficial).
- **Crear ideas ancladas** a un nodo seleccionado (genera Issue real en GitHub).

Requiere token con permiso `Contents: Read and write` para guardar layout, borrador y schema.

---

## v1 — Panel original (localStorage)

### Uso rápido

1. Abrir el [panel v1](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v1/)
2. Capturar una idea en la pestaña **Ideas de cambio** con su título, notas y anclas
3. Moverla entre columnas: *Idea → En diseño → Listo para implementar*
4. Cuando esté lista, usar el botón **Copiar prompt VBA**

### Sincronización manual (solo v1)

`localStorage` no sincroniza solo. Si necesitás sincronización real entre dispositivos, conviene usar directamente la **v2**.

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
│   └── README.md
│
├── v1/                     📁 Panel legacy (localStorage)
│   └── index.html
│
└── v2/                     📁 Panel sincronizado con GitHub Issues
    ├── index.html          Panel Kanban
    ├── mapa.html           Mapa interactivo (Cytoscape)
    ├── schema.json         Nodos + relaciones del sistema contable (fuente de verdad)
    ├── draft.json          Borrador de cambios al mapa (pendientes de aplicar)
    ├── layout.json         Posiciones de nodos en el mapa
    ├── config/             Configuración dinámica
    │   ├── workflow.json   Estados del Kanban + transiciones + acciones (reject/back)
    │   ├── anchor-types.json Tipos de anclas disponibles
    │   └── ui.json         Orden de secciones en Estructura + textos UI
    ├── css/                Estilos (base, tags, panel, mapa)
    └── js/                 Módulos JavaScript (ES Modules)
        ├── github.js       Cliente API GitHub
        ├── schema-loader.js Carga y resolución schema+draft
        ├── config-loader.js Carga de configuración dinámica
        ├── mapa/           Módulos del mapa (main, state, graph-build, actions-*, draft-ops, layout-ops, ideas, modals, utils)
        └── panel/          Módulos del panel (main, state, auth, catalog, composer, actions, render-card, render-kanban, render-structure, views, utils)
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
    └──────────────────────────────────────────────────┘
                     (se puede reactivar)
```

## Convenciones del Kanban

| Estado | Label en GitHub | Qué significa |
|---|---|---|
| **Idea / por pensar** | `idea` | Se me ocurrió algo. Todavía no sé si es buena idea ni qué impacto tiene. |
| **En diseño** | `diseño` | Empecé a pensarlo en serio. Estoy definiendo alcance, riesgos, cómo se hace. |
| **Listo para implementar** | `listo` | Decidí hacerlo. Tengo claro qué cambio en qué lugar. Falta el código. |
| **✓ Implementada** | `implementada` | Ya se aplicó al libro Excel. Queda como historial. |
| **✕ Rechazada** | `rechazada` | Se descartó. El motivo queda como comentario del Issue. |

## Catálogo de nodos precargados

El sistema arranca con estos nodos cargados en `schema.json` (se pueden modificar desde el mapa):

- **11 macros operativas** — `GuardarLote`, `LimpiarRegistro`, `ActualizarTasaVigente`, `ActualizarTasaVigenteDesde`, `GenerarAsientoPacto`, `RevalorizarCuenta`, `LoteAnterior`, `LoteSiguiente`, `AccionSobreLoteVisible`, `CorregirLoteConID`, `DuplicarLoteConID`, más `Helpers` (colIdx + EscribirLinea)
- **6 hojas** — `REGISTRO_RAPIDO`, `LIBRO_MAYOR`, `TASAS`, `AUDITOR_LOTES`, `REPORTE_BARRIDO`, `SALDOS_Y_ENTIDADES`
- **10 tablas estructuradas** — `tb_registro_rapido`, `tb_mayor`, `tb_tasas_vigentes`, `tb_tasas_historial`, `tb_cuentas`, `tb_entidades`, `tb_divisas`, `tb_categorias`, `tb_segmentos`, `tb_clase_cuenta`
- **3 socios** — Socio01, Socio02, Socio03 (sus `Cta. Corriente` son contrapartida en asientos de pacto)
- **6 cuentas clave** — `Utilidad Distribuible`, `Cta. Corriente Socio01/Socio02/Socio03`, `Ganancia por Revalorización`, `Pérdida por Revalorización`
- **5 divisas** — USD (base), USDT, Bs, Oro, EUR
- **1 regla** — `AlertaSpread` (umbral 3%)

## Integración con Claude

Con el conector GitHub activo, pedile a Claude cosas como:

- *"Leé los Issues con label `listo` y generá el VBA correspondiente"*
- *"Creá un Issue con esta idea y etiquetalo `diseño` + `macro:GuardarLote`"*
- *"Mové el Issue #5 a `listo` si ya está definido el alcance"*
- *"Rechazá el Issue #7 con motivo: ya no aplica porque cambió el negocio"*

Claude lee y escribe los mismos Issues que ves en el panel v2, en tiempo real.
