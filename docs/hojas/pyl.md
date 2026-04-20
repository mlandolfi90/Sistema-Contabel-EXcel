# Hoja: PyL

> Estado de Resultados (Profit & Loss) por período.  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:B17` (17 filas × 2 columnas).

## Estructura visual

- **A1** título.
- **A2-B3** período (Fecha_Inicio / Fecha_Fin).
- **A5-B8** INGRESOS.
- **A10-B15** GASTOS.
- **A17-B17** RESULTADO.
- Orden: posición 19.
- Color de pestaña: `#548235` (verde).
- Visible, no protegida.

## Celdas estáticas

| Celda | Valor |
|---|---|
| A1 | ESTADO DE RESULTADOS (P&L) |
| A2 | Fecha_Inicio: |
| A3 | Fecha_Fin: |
| A5 | INGRESOS |
| A6 | &nbsp;&nbsp;Utilidad en Operaciones (4100) |
| A7 | &nbsp;&nbsp;Ganancia por Revalorización (4200) |
| A8 | SUBTOTAL INGRESOS |
| A10 | GASTOS |
| A11 | &nbsp;&nbsp;Costo de Ventas (5100) |
| A12 | &nbsp;&nbsp;Gastos Operativos (5200) |
| A13 | &nbsp;&nbsp;Gastos Personales (5300) |
| A14 | &nbsp;&nbsp;Pérdida por Revalorización (5400) |
| A15 | SUBTOTAL GASTOS |
| A17 | RESULTADO DEL EJERCICIO |

## Fórmulas (11 en total)

### Período (2)

| # | Celda | Fórmula original | Estado actual |
|---|---|---|---|
| 1 | B2 | `=DATE(YEAR(TODAY()),MONTH(TODAY()),1)` | **R4:** valor estático + DV Date (2000-01-01 ≤ x ≤ TODAY()) |
| 2 | B3 | `=TODAY()` | **R4:** valor estático + DV Date |

### Ingresos (3)

Plantilla (saldo acreedor filtrado por período y Estado=Activo):

```
=SUMIFS(tb_mayor[Haber_USD],tb_mayor[Cuenta],"<cuenta>",tb_mayor[Fecha],">="&B2,tb_mayor[Fecha],"<="&B3,tb_mayor[Estado_Registro],"Activo")
 -SUMIFS(tb_mayor[Debe_USD],tb_mayor[Cuenta],"<cuenta>",tb_mayor[Fecha],">="&B2,tb_mayor[Fecha],"<="&B3,tb_mayor[Estado_Registro],"Activo")
```

| # | Celda | Cuenta |
|---|---|---|
| 3 | B6 | Utilidad en Operaciones |
| 4 | B7 | Ganancia por Revalorización |
| 5 | B8 | `=SUM(B6:B7)` |

### Gastos (5)

Plantilla simétrica (saldo deudor):

```
=SUMIFS(tb_mayor[Debe_USD], ...) - SUMIFS(tb_mayor[Haber_USD], ...)
```

| # | Celda | Cuenta |
|---|---|---|
| 6 | B11 | Costo de Ventas |
| 7 | B12 | Gastos Operativos |
| 8 | B13 | Gastos Personales |
| 9 | B14 | Pérdida por Revalorización |
| 10 | B15 | `=SUM(B11:B14)` |

### Resultado (1)

| # | Celda | Fórmula |
|---|---|---|
| 11 | B17 | `=B8-B15` |

## Validaciones de datos

- **R4 (nuevas):** `B2:B3` ahora tienen DV Date entre `2000-01-01` y `TODAY()`.

## Formato condicional

Ninguno detectado.

## Protección

Hoja **NO protegida**.

## Riesgos detectados

1. ~~**Período rígido**~~ → **Parcialmente resuelto en R4**: ahora B2/B3 son valores estáticos editables (con DV Date). El usuario puede cambiar el período manualmente, pero no se ajusta solo.
2. **6 nombres de cuenta hardcoded** en los SUMIFS. Si cambia la denominación de una cuenta P&L, hay que editar fórmulas.
