# Hoja: !CACHE!

> Hoja interna auxiliar con métricas globales del mayor. **NO EDITAR manualmente.**  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:B6` (6 filas × 2 columnas).

## Estructura visual

- 4 métricas de una línea: contador de lotes, sumas globales Debe/Haber, cuadre.
- Orden: posición 27.
- Color de pestaña: `#808080` (gris — señal de hoja técnica).
- Visible.
- **R5:** Protección activada.

## Celdas estáticas

| Celda | Valor |
|---|---|
| A1 | HOJA INTERNA — NO EDITAR |
| A3 | Contador de lotes: |
| A4 | Total Debe USD (global): |
| A5 | Total Haber USD (global): |
| A6 | Cuadre total: |

## Fórmulas (4)

| # | Celda | Fórmula original | Estado actual |
|---|---|---|---|
| 1 | B3 | `=COUNTA(tb_mayor[ID_Lote])` | Sin cambios — Cuenta filas con ID_Lote |
| 2 | B4 | ~~`=SUM(tb_mayor[Debe_USD])`~~ | **R1:** `=SUMIFS(tb_mayor[Debe_USD],tb_mayor[Estado_Registro],"Activo")` — ahora filtra por Estado=Activo |
| 3 | B5 | ~~`=SUM(tb_mayor[Haber_USD])`~~ | **R1:** `=SUMIFS(tb_mayor[Haber_USD],tb_mayor[Estado_Registro],"Activo")` — ahora filtra por Estado=Activo |
| 4 | B6 | `=IF(ABS(B4-B5)<0.01,"✓ OK","✗ Descuadre: "&TEXT(B4-B5,"#,##0.00"))` | Indicador cuadre |

## Validaciones de datos

Ninguna.

## Formato condicional

Ninguno detectado.

## Protección

**R5:** ahora protegida (antes era abierta pese al aviso en A1).

## Riesgos / estado actual

1. ~~**Descuadre global -3.17**~~ (provenía de L003 anulado que la fórmula sumaba) → **Corregido en R1** al agregar filtro `Estado=Activo` en B4/B5.
2. ~~**Sin protección de hoja**~~ → **Corregido en R5**.

## Propósito

Sanity check rápido del libro. Si `B6` muestra descuadre significa que los asientos no balancean a nivel global (incluyendo solo Activos), lo cual indicaría un bug o corrupción de datos.
