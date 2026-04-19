# Panel de pre-diseño — Sistema Contable Multidivisa

Herramienta visual para iterar ideas de cambio sobre el libro Excel `Sistema_Contable_Automatico.xlsm` antes de ejecutarlas en VBA.

## Dos versiones disponibles

| Versión | URL | Almacenamiento | Sincroniza entre dispositivos |
|---|---|---|---|
| **v1** (legacy) | [→ panel v1](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/) | `localStorage` del navegador | No (manual via Export/Import JSON) |
| **v2** (recomendada) | [→ panel v2](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/v2/) | GitHub Issues del repo | Sí, automático |

Ambas comparten la misma UI (Flujo · Estructura · Kanban). La v2 usa los Issues del repo como fuente de verdad en lugar del `localStorage`.

---

## v2 — Panel sincronizado con GitHub Issues

### Qué cambia respecto de v1

- Cada tarjeta del Kanban **es un Issue del repo**.
- Las columnas se modelan con labels: `idea`, `diseño`, `listo`.
- Las anclas (macro/hoja/tabla/rango/regla) se modelan con labels tipo `macro:GuardarLote`, `hoja:REGISTRO_RAPIDO`, etc.
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
   - Permissions → Repository → **Issues: Read and write**
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

### Modo solo lectura (sin token)

Si entrás sin pegar token, ves todas las tarjetas existentes pero no podés modificarlas. Útil para compartir el panel con alguien que solo necesite consultar.

---

## v1 — Panel original (localStorage)

### Uso rápido

1. Abrir el [panel v1](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/)
2. Capturar una idea en la pestaña **Ideas de cambio** con su título, notas y anclas
3. Moverla entre columnas: *Idea → En diseño → Listo para implementar*
4. Cuando esté lista, usar el botón **Copiar prompt VBA**
5. Pegar en un chat con Claude → recibir el código VBA

### Sincronización manual (solo v1)

`localStorage` no sincroniza solo:

1. **Exportar JSON** en el dispositivo origen (descarga `data.json`)
2. Subir ese archivo al repo reemplazando el existente
3. En el otro dispositivo → **Importar JSON** pegando el contenido

Si necesitás sincronización real entre dispositivos, conviene usar directamente la **v2**.

---

## Qué contiene el repo

| Archivo | Función |
|---|---|
| `index.html` | Panel v1 (localStorage) — versión original |
| `v2/index.html` | Panel v2 (sincronizado con GitHub Issues) |
| `data.json` | Respaldo versionado de las tarjetas de v1 |
| `README.md` | Este archivo |
| `.gitignore` | Exclusiones de Git |
| `LICENSE` | Licencia del proyecto |

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

- **12 macros** — `GuardarLote`, `LimpiarRegistro`, `ActualizarTasaVigente`, `ActualizarTasaVigenteDesde`, `GenerarAsientoPacto`, `RevalorizarCuenta`, `LoteAnterior`, `LoteSiguiente`, `AccionSobreLoteVisible`, `CorregirLoteConID`, `DuplicarLoteConID`, `Helpers` (colIdx + EscribirLinea)
- **6 hojas** — `REGISTRO_RAPIDO`, `LIBRO_MAYOR`, `TASAS`, `AUDITOR_LOTES`, `REPORTE_BARRIDO`, `SALDOS_Y_ENTIDADES`
- **10 tablas estructuradas** — `tb_registro_rapido`, `tb_mayor`, `tb_tasas_vigentes`, `tb_tasas_historial`, `tb_cuentas`, `tb_entidades`, `tb_divisas`, `tb_categorias`, `tb_segmentos`, `tb_clase_cuenta`
- **5 rangos con nombre** — `IDs_Unicos`, `ListaCuentaActiva`, `ListaDivisaActiva`, `ListaSocios`, `ListaSegmentoActiva`
- **1 regla** — `AlertaSpread` (umbral 3%)

## Convenciones del Kanban

Los estados indican madurez, no prioridad:

| Estado | Label en GitHub (v2) | Qué significa |
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
- `03_Modulo3_Exportador_VBA.md`
- `04_Hoja3_REGISTRO_RAPIDO_Eventos.md`
- `Contructo_Sistema_ContableExcel.md`

No están en este repo público para mantener separada la información operativa detallada.
