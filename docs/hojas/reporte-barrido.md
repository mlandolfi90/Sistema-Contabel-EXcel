# Hoja: REPORTE_BARRIDO

> Reporte para "barrer" (distribuir) la Utilidad Distribuible pendiente a los socios. Asistente de pacto.  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:E34` (34 filas × 5 columnas).

## Estructura visual

- **Fila 1** título; **fila 3** `RESUMEN`; **fila 4** total pendiente.
- **Filas 6-19 BLOQUE 1:** lotes con generación de utilidad (derrame FILTER desde A8).
- **Filas 20-24 BLOQUE 2:** participación por socio.
- **Filas 27-34 BLOQUE 3:** asistente de pacto (input para asignar USD a cada socio + cuadre).
- Orden: posición 25.
- Color de pestaña: `#ED7D31` (naranja).
- Visible, no protegida.

## Celdas estáticas clave

| Celda | Valor |
|---|---|
| A1 | REPORTE DE BARRIDO — UTILIDAD DISTRIBUIBLE PENDIENTE |
| A3 | RESUMEN |
| A4 | Utilidad Distribuible TOTAL pendiente: |
| A6 | BLOQUE 1 — Lotes con generación de utilidad (histórico) |
| A20 | BLOQUE 2 — Participación por socio |
| A21-C21 | Socio · Lotes donde participó · Ganancia común USD |
| A22-A24 | Socio01 · Socio02 · Socio03 |
| A27 | BLOQUE 3 — Asistente de pacto |
| A28-B28 | Socio · Asignar USD |
| A29-A31 | Socio01 · Socio02 · Socio03 |
| B29-B31 | (inputs de usuario) |
| A32 | TOTAL asignado |
| A33 | Pendiente total |
| A34 | Cuadre |

## Fórmulas (11 en total)

| # | Celda | Fórmula | Qué calcula |
|---|---|---|---|
| 1 | B4 | (valor que espeja `SALDOS_Y_ENTIDADES!AA3` o similar — utilidad distribuible total) | Total pendiente |
| 2 | A8 | Derrame FILTER de `tb_mayor` con `Categoria="Generación Utilidad"` y `Estado="Activo"` | Lotes con utilidad |
| 3 | B22 | *(R4)* `=SUMPRODUCT((tb_mayor[Cuenta]="Utilidad Distribuible")*(tb_mayor[Categoria]="Generación Utilidad")*(ISNUMBER(SEARCH(A22,tb_mayor[Socios_Participantes]))))` | Cantidad lotes donde participó Socio01 *(ahora usa referencia A22 en vez de literal)* |
| 4 | C22 | `=SALDOS_Y_ENTIDADES!Y3` | Ganancia común Socio01 |
| 5 | B23 | *(R4)* Igual con `SEARCH(A23,...)` | Lotes Socio02 |
| 6 | C23 | `=SALDOS_Y_ENTIDADES!Y4` | Ganancia común Socio02 |
| 7 | B24 | *(R4)* Igual con `SEARCH(A24,...)` | Lotes Socio03 |
| 8 | C24 | `=SALDOS_Y_ENTIDADES!Y5` | Ganancia común Socio03 |
| 9 | B32 | `=SUM(B29:B31)` | Total asignado |
| 10 | B33 | `=B4` | Pendiente total (espejo) |
| 11 | B34 | `=IF(ABS(B32-B33)<0.01,"✓ Cuadra","✗ Descuadre: "&TEXT(B32-B33,"#,##0.00")&" USD")` | Indicador cuadre |

## Validaciones de datos

- **R5 (nuevas):** `B29:B31` ahora tienen DV Decimal `≥ 0`.

## Formato condicional

No escaneado en esta pasada; hay indicador textual `Cuadra/Descuadre` en B34 que probablemente tiene CF.

## Protección

Hoja **NO protegida**.

## Relación con VBA

- `Módulo1.GenerarAsientoPacto` lee `B29:B31` (asignaciones) y `B33` (pendiente) y prellena el asiento de pacto en REGISTRO_RAPIDO.
- Requiere `|Total - Pendiente| ≤ 0.01` (usa `B34` como validación indirecta).

## Riesgos detectados

1. ~~**Socios hardcoded en B22/B23/B24**~~ → **Corregido en R4** (ahora referencian A22/A23/A24).
2. ~~**Inputs B29:B31 sin validación**~~ → **Corregido en R5** (DV Decimal ≥ 0).
3. **CF pendiente de verificar** en B34.
