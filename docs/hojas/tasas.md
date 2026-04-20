# Hoja: TASAS

> Tipos de cambio vs USD + historial de tasas pactadas en cada transacción.  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:N14` (14 filas × 14 columnas).
- Dos tablas estructuradas separadas por columna vacía.

## Estructura visual

- `A1:F6` = `tb_tasas_vigentes` (tasa actual por divisa vs USD).
- `H1:N14` = `tb_tasas_historial` (log de tasas pactadas en cada transacción).
- Paneles congelados: fila 1.
- Orden: posición 7.
- Color de pestaña: `#5B9BD5` (azul).
- Visible, no protegida.

## Propósito

Centralizar tipos de cambio contra USD (moneda base) y llevar histórico de tasas pactadas por cada lote transaccional. Sirve como referencia para conversión a USD en `LIBRO_MAYOR` y detección de spreads entre tasa pactada vs vigente.

## `tb_tasas_vigentes` (A1:F6)

Columnas: `divisa`, `tasa_vs_USD`, `operacion`, `ultima_actualizacion`, `actualizada_por`, `fuente_ultima`.

| divisa | tasa_vs_USD | operacion | ultima_actualizacion | actualizada_por | fuente_ultima |
|---|---|---|---|---|---|
| USD | 1.0000 | Base | — | sistema | sistema |
| USDT | 1.0000 | Multiplicar | (era =TODAY(), ahora estático) | — | manual |
| Bs | 630.0000 | Dividir | (estático) | — | manual |
| Oro | 140.0000 | Multiplicar | (estático) | — | manual |
| EUR | 1.0800 | Multiplicar | (estático) | — | manual |

**Nota sobre `operacion`**: indica cómo convertir a USD:
- `Base` = es USD, no hay conversión.
- `Multiplicar` = `USD = importe × tasa`.
- `Dividir` = `USD = importe / tasa`.

Bs usa `Dividir` (630 Bs = 1 USD). USDT/Oro/EUR usan `Multiplicar`.

## `tb_tasas_historial` (H1:N14)

Columnas: `fecha`, `ID_Lote`, `divisa`, `tasa_pactada`, `tasa_vigente`, `spread`, `tipo_origen`.

13 filas de historial (ver detalle en el archivo original). Ejemplo:

| fecha | ID_Lote | divisa | tasa_pactada | tasa_vigente | spread | tipo_origen |
|---|---|---|---|---|---|---|
| 46130 | L001 | Oro | 140 | 140 | 0 | transaccion |
| 46130 | L001 | USDT | 1 | 1 | 0 | transaccion |
| 46130 | L003 | Oro | 150 | 140 | 0.0714 | transaccion |
| 46130 | L004 | Bs | 650 | 630 | 0.0317 | transaccion |
| … | | | | | | |

El spread se calcula como `(tasa_pactada - tasa_vigente) / tasa_vigente`. Si `|spread| > 3%`, `Módulo1.GuardarLote` alerta al usuario.

## Fórmulas (estado original)

4 fórmulas idénticas `=TODAY()` en `D3:D6` (ahora convertidas a valor estático en R5):

| Celda | Fórmula original | Qué calculó |
|---|---|---|
| D3 | `=TODAY()` | Fecha de última actualización USDT |
| D4 | `=TODAY()` | Fecha de última actualización Bs |
| D5 | `=TODAY()` | Fecha de última actualización Oro |
| D6 | `=TODAY()` | Fecha de última actualización EUR |

**Observación conceptual:** usar `=TODAY()` aquí era incorrecto porque siempre mostraba hoy, no la fecha real de actualización. Por eso en R5 se convirtió a valor estático.

## Validaciones de datos

23 celdas con validación, agrupadas en **3 reglas únicas**:

| # | Rango | Tipo | Fuente |
|---|---|---|---|
| 1 | C2:C6 (`tb_tasas_vigentes[operacion]`) | List | `Base,Multiplicar,Dividir` |
| 2 | F2:F6 (`tb_tasas_vigentes[fuente_ultima]`) | List | `manual,api,sistema` |
| 3 | N2:N14 (`tb_tasas_historial[tipo_origen]`) | List | `transaccion,actualizacion_manual` |

## Formato condicional

Ninguno.

## Dropdowns

Los 3 dropdowns documentados en validaciones. Todos son listas literales in-cell.

## Protección

Hoja **NO protegida**.

## Anomalías detectadas

- `H7` tenía valor `0` con formato `h:mm:ss AM/PM` — fecha faltante para ese registro de L003/Bs. **Corregida en R5** (ahora valor `46130`).

## Riesgos / observaciones

1. La validación de N se extiende desde `N2` (no `N3`) hasta `N14` — cubre una celda más.
2. `A2:A6` (divisa) y `J3:J14` (divisa en histórico) no tienen validación propia — son solo parte de las tablas estructuradas.
3. `ultima_actualizacion` ahora es estático; cuando se actualice una tasa manualmente desde `Módulo1.ActualizarTasaVigenteDesde`, el VBA debe sobreescribir esa celda con la nueva fecha.
