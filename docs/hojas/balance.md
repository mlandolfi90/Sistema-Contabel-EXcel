# Hoja: BALANCE

> Estado de Situación Financiera en USD.  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:B39` (39 filas × 2 columnas).

## Estructura visual

- **A1** título.
- **A2** fecha.
- **A4-B19** ACTIVOS (Líquidos + Inventarios + CxC).
- **A21-B26** PASIVOS.
- **A28-B37** PATRIMONIO.
- **A39** CUADRE.
- Paneles congelados: filas 1-3.
- Orden: posición 17.
- Color de pestaña: `#548235` (verde).
- Visible, no protegida.

## Celdas estáticas (labels)

Títulos y labels estándar de un balance: `ACTIVOS`, `Activos Líquidos`, `Billetera USD`, `Zelle`, `Cuenta Corriente Negocio`, `Banco de Venezuela`, `Oficina Bs Efectivo`, `Billetera Bs Personal`, `Binance Socio03`, `Subtotal Activos Líquidos`, `Inventarios` → `Bolsillo Oro`, `Cuentas por Cobrar` → `CxC (saldos positivos en 1302)`, `TOTAL ACTIVOS`, `PASIVOS` → `CxP (saldos negativos en 1302)`, `Utilidad Distribuible`, `TOTAL PASIVOS`, `PATRIMONIO` → `Capital / Aportes Socios`, `Cta. Corriente Socio03/Socio01/Socio02`, `Resultado del Ejercicio`, `TOTAL PATRIMONIO`, `TOTAL PASIVO + PATRIMONIO`, `CUADRE (debe ser 0)`.

## Fórmulas (23 en total)

| # | Celda | Fórmula | Qué calcula | Formato |
|---|---|---|---|---|
| 1 | B2 | `=TODAY()` *(R5: ahora valor estático)* | Fecha del balance | dd/mm/yyyy |
| 2-8 | B6:B12 | `=IFERROR(XLOOKUP("<cuenta>",SALDOS_Y_ENTIDADES!B3:B22,SALDOS_Y_ENTIDADES!K3:K22),0)` *(R2: cambió de col N a col K)* | Saldo USD histórico de cada cuenta líquida | `#,##0.00;(...);-` |
| 9 | B13 | `=SUM(B6:B12)` | Subtotal activos líquidos | |
| 10 | B15 | `=IFERROR(XLOOKUP("Bolsillo Oro",SALDOS_Y_ENTIDADES!B3:B22,SALDOS_Y_ENTIDADES!K3:K22),0)` *(R2)* | Inventario oro (histórico) | |
| 11 | B17 | `=SUMIF(SALDOS_Y_ENTIDADES!T3:T9,">0",SALDOS_Y_ENTIDADES!T3:T9)` | CxC = suma saldos positivos | |
| 12 | B19 | `=B13+B15+B17` | TOTAL ACTIVOS | |
| 13 | B23 | `=ABS(SUMIF(SALDOS_Y_ENTIDADES!T3:T9,"<0",SALDOS_Y_ENTIDADES!T3:T9))` | CxP = \|suma saldos negativos\| | |
| 14 | B24 | `=IFERROR(XLOOKUP("Utilidad Distribuible",SALDOS_Y_ENTIDADES!B3:B22,SALDOS_Y_ENTIDADES!K3:K22),0)` | Utilidad Distribuible | |
| 15 | B26 | `=B23+B24` | TOTAL PASIVOS | |
| 16 | B29 | `=IFERROR(XLOOKUP("Capital / Aportes Socios",SALDOS_Y_ENTIDADES!B3:B22,SALDOS_Y_ENTIDADES!K3:K22),0)` | Capital |
| 17 | B30 | `=IFERROR(XLOOKUP("Cta. Corriente Socio03",SALDOS_Y_ENTIDADES!B3:B22,SALDOS_Y_ENTIDADES!K3:K22),0)` | Cta. Corriente Socio03 |
| 18 | B31 | `=IFERROR(XLOOKUP("Cta. Corriente Socio01",...),0)` | Cta. Corriente Socio01 |
| 19 | B32 | `=IFERROR(XLOOKUP("Cta. Corriente Socio02",...),0)` | Cta. Corriente Socio02 |
| 20 | B33 | `=SUMIFS(SALDOS_Y_ENTIDADES!K3:K22,SALDOS_Y_ENTIDADES!D3:D22,"Ingreso")-SUMIFS(SALDOS_Y_ENTIDADES!K3:K22,SALDOS_Y_ENTIDADES!D3:D22,"Gasto")` | Resultado = Ingresos - Gastos | |
| 21 | B35 | `=SUM(B29:B33)` *(R2: cambió de B29:B34 para excluir ganancia latente nueva)* | TOTAL PATRIMONIO | |
| 22 | B37 | `=B26+B35` | TOTAL PASIVO + PATRIMONIO | |
| 23 | B39 | `=B19-B37` | **CUADRE** (debe ser 0) | |

### Nuevas filas en R2

- **A34/B34 (nuevos):** Fila informativa "Ganancia Latente por Revalorización" — informativa, no suma al total patrimonio.

## Validaciones de datos

Ninguna.

## Formato condicional

Ninguno detectado.

## Protección

Hoja **NO protegida**.

## Riesgos / estado actual

1. ~~**CUADRE era 26.83**~~ → **Corregido en R2 a 0** al cambiar fórmulas de col N (mercado) a col K (histórico) en B6:B12 y B15. Ahora el balance cuadra.
2. **Nombres de cuenta hardcoded** en 19 de 23 fórmulas. Frágil si se renombran cuentas.
3. `=TODAY()` en B2 → convertido a estático en R5.
