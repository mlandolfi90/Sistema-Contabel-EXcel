# Panel de pre-diseño — Sistema Contable Multidivisa

Herramienta visual para iterar ideas de cambio sobre el libro Excel `Sistema_Contable_Automatico.xlsm` antes de ejecutarlas en VBA.

## Dos versiones disponibles

| Versión | URL | Almacenamiento | Sincroniza entre dispositivos |
|---|---|---|---|
| **v1** (legacy) | [→ panel v1](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v1/) | `localStorage` del navegador | No (manual via Export/Import JSON) |
| **v2** (recomendada) | [→ panel v2](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v2/) | GitHub Issues del repo | Sí, automático |
| **v2 + Mapa** | [→ mapa contable](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v2/mapa.html) | GitHub Issues + `layout.json` | Sí, automático |

La v2 usa los Issues del repo como fuente de verdad. El **mapa** es una vista extra (grafo interactivo) sobre los mismos Issues.

---

## v2 — Panel sincronizado con GitHub Issues

### Qué cambia respecto de v1

- Cada tarjeta del Kanban **es un Issue del repo**.
- Las columnas se modelan con labels: `idea`, `diseño`, `listo`.
- Las anclas (macro/hoja/tabla/rango/regla/cuenta) se modelan con labels tipo `macro:GuardarLote`, `hoja:REGISTRO_RAPIDO`, etc.
- Al abrir la v2, lee los Issues y los muestra como tarjetas.
- Crear / mover / cerrar tarjetas desde el HTML actualiza los Issues vía API REST de GitHub.
- Sincroniza automáticamente entre todos los dispositivos y con Claude (que ve los mismos Issues).

### Cómo habilitarla (primera vez)

1. Entrá a **[→ panel v2](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v2/)**. Sin token, ya ves las tarjetas en modo lectura.
2. Para crear/mover tarjetas necesitás un **Personal Access Token** de GitHub:
   - Ir a https://github.com/settings/tokens?type=beta
   - *Generate new token* (fine-grained)
   - Nombre: `Panel Contable`
   - Expiración: 1 año (o la que prefieras)
   - Repository access: *Only select repositories* → `Sistema-Contabel-EXcel`
   - Permissions → Repository → **Issues: Read and write**, **Contents: Read and write** (este último para guardar `layout.json` del mapa)
   - Generar y copiar el token
3. Pegá el token en el campo de la barra superior del panel y pulsá **Guardar token**.
4. El token queda en `localStorage` de ese navegador (nunca se sube a ningún lado).
5. Ya podés crear, mover y cerrar tarjetas directamente desde la UI.

### Uso diario

1. Abrí la v2 desde cualquier dispositivo (una sola vez por dispositivo tenés que pegar el token).
2. En **Ideas de cambio**: título + nota + estado + anclas → **Crear Issue**.
3. Para avanzar el estado de una tarjeta: clic en la flecha `→` de la tarjeta.
4. Para cerrar una idea implementada: clic en la `×` (cierra el Issue, no lo borra).
5. **Copiar prompt VBA** arma el prompt con todas las tarjetas en estado `listo` para pegar en Claude.

---

## Mapa contable (vista de grafo)

URL: https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v2/mapa.html

Grafo interactivo con todos los nodos del sistema (hojas, macros, tablas, reglas, cuentas/socios) + los Issues flotando conectados a su ancla. Permite:

- **Arrastrar** nodos y guardar posiciones en `v2/layout.json`.
- **Agregar nodos custom** (solo visuales, no tocan el sistema real).
- **Crear conexiones custom** entre nodos (modo "click origen → click destino").
- **Crear ideas ancladas** a un nodo seleccionado (genera Issue real en GitHub).
- **Eliminar** nodos/conexiones custom (los del sistema base están protegidos).

Requiere token con permiso `Contents: Read and write` para guardar layout.

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

| Archivo | Función |
|---|---|
| `index.html` | Redirect automático a `v2/` |
| `v1/index.html` | Panel v1 (localStorage) — legacy |
| `v2/index.html` | Panel v2 sincronizado con Issues |
| `v2/mapa.html` | Mapa contable interactivo (grafo) |
| `v2/layout.json` | Posiciones de nodos + nodos/conexiones custom del mapa |
| `data.json` | Legacy (vacío, ya no se usa) |
| `README.md` | Este archivo |
| `.gitignore` · `LICENSE` | Técnicos |

---

## Flujo de trabajo

```
Capturar idea         Madurarla           Definir impacto      Generar VBA
     ↓                    ↓                    ↓                    ↓
Idea/por pensar  →   En diseño      →   Listo implementar  →  Claude
                                              │
                                              ↓
                                    Código VBA para pegar
                                         en Excel
```

## Catálogo de nodos precargados

El panel tiene hardcodeados los elementos reales del sistema contable:

- **11 macros operativas** — `GuardarLote`, `LimpiarRegistro`, `ActualizarTasaVigente`, `ActualizarTasaVigenteDesde`, `GenerarAsientoPacto`, `RevalorizarCuenta`, `LoteAnterior`, `LoteSiguiente`, `AccionSobreLoteVisible`, `CorregirLoteConID`, `DuplicarLoteConID`, más `Helpers` (colIdx + EscribirLinea)
- **6 hojas** — `REGISTRO_RAPIDO`, `LIBRO_MAYOR`, `TASAS`, `AUDITOR_LOTES`, `REPORTE_BARRIDO`, `SALDOS_Y_ENTIDADES`
- **10 tablas estructuradas** — `tb_registro_rapido`, `tb_mayor`, `tb_tasas_vigentes`, `tb_tasas_historial`, `tb_cuentas`, `tb_entidades`, `tb_divisas`, `tb_categorias`, `tb_segmentos`, `tb_clase_cuenta`
- **3 socios** — Socio01, Socio02, Socio03 (sus `Cta. Corriente` son contrapartida en asientos de pacto)
- **2 cuentas clave** — `Utilidad Distribuible`, `Ganancia/Pérdida por Revalorización`
- **5 divisas** — USD (base), USDT, Bs, Oro, EUR
- **1 regla** — `AlertaSpread` (umbral 3%)

## Convenciones del Kanban

| Estado | Label en GitHub | Qué significa |
|---|---|---|
| **Idea / por pensar** | `idea` | Se me ocurrió algo. Todavía no sé si es buena idea ni qué impacto tiene. |
| **En diseño** | `diseño` | Empecé a pensarlo en serio. Estoy definiendo alcance, riesgos, cómo se hace. |
| **Listo para implementar** | `listo` | Decidí hacerlo. Tengo claro qué cambio en qué lugar. Falta el código. |

## Integración con Claude

Con el conector GitHub activo, pedile a Claude cosas como:

- *"Leé los Issues con label `listo` y generá el VBA correspondiente"*
- *"Creá un Issue con esta idea y etiquetalo `diseño` + `macro:GuardarLote`"*
- *"Mové el Issue #5 a `listo` si ya está definido el alcance"*

Claude lee y escribe los mismos Issues que ves en el panel v2, en tiempo real.

## Arquitectura de referencia

La documentación completa del sistema contable (extraída por IA del libro Excel original) está en el proyecto de Claude del autor, en archivos `.md`:

- `00_Arquitectura_y_Datos_Maestros.md`
- `01_Modulo1_Nucleo_Contable.md`
- `02_Modulo2_Auditor_de_Lotes.md`
- `04_Hoja3_REGISTRO_RAPIDO_Eventos.md`
- `Contructo_Sistema_ContableExcel.md`

No están en este repo público para mantener separada la información operativa detallada.
