# Hoja: FLUJO_CAJA

> Flujo de caja por período, en USD.  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:D38` (38 filas × 4 columnas).

## Estructura visual

- **A1** título; **A2-B3** período.
- **Filas 5-15:** SALDOS POR CUENTA (8 cuentas cash + subtotal; col B inicio, C fin, D variación).
- **Filas 17-23:** ENTRADAS CASH por categoría.
- **Filas 25-34:** SALIDAS CASH por categoría.
- **Filas 36-38:** variación y conciliación.
- Orden: posición 21.
- Color de pestaña: `#548235` (verde).
- Visible, no protegida.

## Fórmulas (45 en total)

### Período (2)

| Celda | Original | Estado |
|---|---|---|
| B2 | `=DATE(YEAR(TODAY()),MONTH(TODAY()),1)` | **R4:** estático + DV Date |
| B3 | `=TODAY()` | **R4:** estático + DV Date |

### Saldos por cuenta (filas 7-14) — 27 fórmulas en B, C, D

Por cada una de **8 cuentas cash hardcoded** (`Binance Socio03`, `Banco de Venezuela`, `Billetera Bs Personal`, `Billetera USD`, `Zelle`, `Bolsillo Oro`, `Oficina Bs Efectivo`, `Cuenta Corriente Negocio`):

| Col | Plantilla fila 7 | Qué calcula |
|---|---|---|
| B | `=SUMIFS(tb_mayor[Debe_USD],tb_mayor[Cuenta],"<nombre>",tb_mayor[Fecha],"<"&$B$2,tb_mayor[Estado_Registro],"Activo")-SUMIFS(tb_mayor[Haber_USD],...,"<"&$B$2,...)` | Saldo al inicio del período (fecha < B2) |
| C | Igual con `"<="&$B$3` | Saldo al fin del período |
| D | `=C7-B7` | Variación |

Fila 15 contiene subtotales: `B15=SUM(B7:B14)`, `C15=SUM(C7:C14)`, `D15=SUM(D7:D14)`.

### ENTRADAS CASH (filas 19-23) — 5 fórmulas

Plantilla SUMPRODUCT con: `Categoria=X` AND `Fecha entre B2-B3` AND `tipo_operativo de cuenta IN {Físico, Electrónico}` → suma `Debe_USD`.

| Celda | Categoría |
|---|---|
| B19 | Venta/Cambio |
| B20 | Cobro de Tercero |
| B21 | Aporte Socio |
| B22 | Transferencia Interna |
| B23 | `=SUM(B19:B22)` total |

### SALIDAS CASH (filas 27-34) — 8 fórmulas

Misma plantilla pero sumando `Haber_USD` por categorías de salida.

| Celda | Categoría |
|---|---|
| B27 | Compra |
| B28 | Pago a Tercero |
| B29 | Gasto Operativo |
| B30 | Gasto Personal |
| B31 | Gasto Distribuible |
| B32 | Retiro Socio |
| B33 | Transferencia Interna |
| B34 | `=SUM(B27:B33)` total |

### Conciliación (filas 36-38) — 3 fórmulas

| Celda | Fórmula | Significado |
|---|---|---|
| B36 | `=B23-B34` | Flujo neto (Entradas - Salidas) |
| B37 | `=D15` | Variación observada en saldos cash |
| B38 | `=B37-B36` | Diferencia conciliación (debería ser ≈0) |

## Validaciones de datos

- **R4 (nuevas):** `B2:B3` con DV Date.

## Formato condicional

Ninguno detectado.

## Protección

Hoja **NO protegida**.

## Riesgos detectados

1. **Período rígido** — mismo issue que PyL (resuelto parcialmente en R4).
2. **8 cuentas cash hardcoded** en filas 7-14. Si se agrega una nueva cuenta cash, hay que editar manualmente.
3. **Inconsistencia de criterio**: las Entradas/Salidas filtran por `tipo_operativo IN {Físico, Electrónico}`, pero los saldos iniciales/finales (B/C) filtran por **nombre de cuenta** hardcoded. Dos criterios distintos para definir "cuenta cash".
