# Panel de pre-diseño — Sistema Contable Multidivisa

Herramienta visual para iterar ideas de cambio sobre el libro Excel `Sistema_Contable_Automatico.xlsm` antes de ejecutarlas en VBA.

## Abrir el panel

**[→ https://mlandolfi90.github.io/Sistema-Contabel-EXcel/](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/)**

Disponible desde cualquier dispositivo (PC, tablet, celular). Las tarjetas que creás se guardan en el `localStorage` del navegador donde abras el panel.

## Qué contiene el repo

| Archivo | Función |
|---|---|
| `index.html` | Panel completo con 3 vistas sincronizadas (Flujo, Estructura, Kanban) |
| `data.json` | Respaldo versionado de las tarjetas de pre-diseño |
| `README.md` | Este archivo |
| `.gitignore` | Exclusiones de Git para archivos del sistema |
| `LICENSE` | Licencia del proyecto |

## Uso rápido

1. Abrir [el panel](https://mlandolfi90.github.io/Sistema-Contabel-EXcel/)
2. Capturar una idea en la pestaña **Ideas de cambio** con su título, notas y anclas (qué macro, hoja o tabla afecta)
3. Moverla entre columnas: *Idea → En diseño → Listo para implementar*
4. Cuando esté lista, usar el botón **Copiar prompt VBA**
5. Pegar en un chat con Claude → recibir el código VBA

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

## Sincronización entre dispositivos

`localStorage` no sincroniza solo. Dos maneras de hacerlo:

### Manual (cualquier plan)
1. **Exportar JSON** en el dispositivo origen (descarga `data.json`)
2. Subir ese archivo al repo reemplazando el existente (via GitHub web o via Claude con conector GitHub)
3. En el otro dispositivo → **Importar JSON** pegando el contenido

### Asistida por Claude (con conector GitHub activo)
Pedile a Claude:
- *"Leé el data.json del repo y generá el VBA de las ideas listas"*
- *"Commiteá mis ideas al repo con el data.json que te paso"*

Claude usa las herramientas de GitHub para leer y escribir `data.json` directamente.

## Catálogo de nodos precargados

El panel tiene hardcodeados los elementos reales del sistema contable:

- **12 macros** — `GuardarLote`, `LimpiarRegistro`, `ActualizarTasaVigente`, `ActualizarTasaVigenteDesde`, `GenerarAsientoPacto`, `RevalorizarCuenta`, `LoteAnterior`, `LoteSiguiente`, `AccionSobreLoteVisible`, `CorregirLoteConID`, `DuplicarLoteConID`, `Helpers` (colIdx + EscribirLinea)
- **6 hojas** — `REGISTRO_RAPIDO`, `LIBRO_MAYOR`, `TASAS`, `AUDITOR_LOTES`, `REPORTE_BARRIDO`, `SALDOS_Y_ENTIDADES`
- **10 tablas estructuradas** — `tb_registro_rapido`, `tb_mayor`, `tb_tasas_vigentes`, `tb_tasas_historial`, `tb_cuentas`, `tb_entidades`, `tb_divisas`, `tb_categorias`, `tb_segmentos`, `tb_clase_cuenta`
- **5 rangos con nombre** — `IDs_Unicos`, `ListaCuentaActiva`, `ListaDivisaActiva`, `ListaSocios`, `ListaSegmentoActiva`
- **1 regla** — `AlertaSpread` (umbral 3%)

## Convenciones del Kanban

Los estados indican madurez, no prioridad:

| Estado | Qué significa |
|---|---|
| **Idea / por pensar** | Se me ocurrió algo. Todavía no sé si es buena idea ni qué impacto tiene. |
| **En diseño** | Empecé a pensarlo en serio. Estoy definiendo alcance, riesgos, cómo se hace. |
| **Listo para implementar** | Decidí hacerlo. Tengo claro qué cambio en qué lugar. Falta el código. |

## Issues del repo como backup externo

Además del `data.json`, podés usar **GitHub Issues** como espejo externo de ideas maduras. Cada issue con label `listo` es una tarjeta que se puede generar como VBA. Útil si querés discutir una idea con alguien antes de ejecutarla.

## Arquitectura de referencia

La documentación completa del sistema contable (extraída por IA del libro Excel original) está en el proyecto de Claude del autor, en archivos `.md`:

- `00_Arquitectura_y_Datos_Maestros.md`
- `01_Modulo1_Nucleo_Contable.md`
- `02_Modulo2_Auditor_de_Lotes.md`
- `03_Modulo3_Exportador_VBA.md`
- `04_Hoja3_REGISTRO_RAPIDO_Eventos.md`
- `Contructo_Sistema_ContableExcel.md`

No están en este repo público para mantener separada la información operativa detallada.
