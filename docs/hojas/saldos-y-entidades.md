# Hoja: SALDOS_Y_ENTIDADES

> Motor de saldos: consolida desde `tb_mayor` los saldos por cuenta (Bloque A), CxC/CxP por entidad (Bloque B) y consolidado por socio (Bloque C). **Es el puente entre el mayor y los reportes finales** (BALANCE, DASHBOARD, REPORTE_BARRIDO).  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:AD22` (22 filas × 30 columnas).
- **373 fórmulas totales** en 3 bloques horizontales.

## Estructura visual

- **A1:P22** = Bloque A: saldos por cuenta (20 filas).
- **R1:V22** = Bloque B: matriz cuentas pendientes × entidad (7 filas).
- **X1:AD22** = Bloque C: consolidado por socio (3 filas).
- Orden: posición 15.
- Color de pestaña: `#2E75B6` (azul).
- Visible, no protegida.

## BLOQUE A — Saldos por cuenta (cols A–P, 320 fórmulas)

Columnas (encabezados fila 2): `Codigo`, `Nombre_Cuenta`, `Moneda`, `Clase`, `Permite_Revaloriz`, `Debe_Total_Original`, `Haber_Total_Original`, `Saldo_Original`, `Debe_Total_USD`, `Haber_Total_USD`, `Saldo_USD_Historico`, `CPP`, `Tasa_Vigente_Hoy`, `Saldo_USD_Mercado`, `Ganancia_Latente`, `Alerta`.

Plantilla por columna (fila 3, se replica en filas 4-22):

| Col | Fórmula resumida |
|---|---|
| A-E | `INDEX(tb_cuentas[...], N)` posicional |
| F | `SUMIFS(tb_mayor[Debe_Original], ..., B3, ..., "Activo")` |
| G | Idem con Haber_Original |
| H | Saldo según clase: Activo/Gasto = D-H; Pasivo/Patrimonio/Ingreso = H-D |
| I | `SUMIFS(tb_mayor[Debe_USD], ...)` |
| J | Idem Haber_USD |
| K | **Saldo USD histórico** (tasas del momento del asiento) |
| L | CPP (costo promedio ponderado) = K/H |
| M | Tasa vigente hoy (`XLOOKUP` a `tb_tasas_vigentes`) |
| N | **Saldo USD a tasa actual** (revalorización teórica) |
| O | Ganancia/pérdida latente = N-K (si permite_revalorización) |
| P | Alerta: `"⚠ Revalorizar"` si >50 USD, `"Revisar"` si >10 |

**20 filas × 16 columnas = 320 fórmulas.**

### Observación crítica

Las columnas **A-E usan `INDEX` posicional** sobre `tb_cuentas[...]`. Vínculo frágil ante reordenamiento.

## BLOQUE B — Matriz CxC/CxP por entidad (cols R–V, 35 fórmulas)

| Col | Plantilla fila 3 |
|---|---|
| R | `="Cuentas Pendientes"` (literal fijo) |
| S | `=INDEX(tb_entidades[entidad],1)` posicional |
| T | `SUMIFS(tb_mayor[Debe_USD],...,"Cuentas Pendientes",...,S3,...)` - `SUMIFS(Haber_USD,...)` |
| U | `=IF(T3>0.01,"Me debe",IF(T3<-0.01,"Le debo","—"))` |
| V | `=IF(T3>0.01,"Activo (CxC)",IF(T3<-0.01,"Pasivo (CxP)","—"))` |

7 filas × 5 cols = 35 fórmulas.

## BLOQUE C — Consolidado por socio (cols Y–AD, 18 fórmulas)

Los 3 socios en **X3:X5** (Socio01, Socio02, Socio03) son valores estáticos.

| Col | Plantilla fila 3 (Socio01) | Qué calcula |
|---|---|---|
| Y | `SUMPRODUCT((tb_mayor[Cuenta]="Utilidad Distribuible")*(tb_mayor[Categoria]="Generación Utilidad")*(ISNUMBER(SEARCH(X3,tb_mayor[Socios_Participantes])))*tb_mayor[Haber_USD])` - mismo con "Gasto Distribuible" y Debe_USD | Utilidad/gasto común atribuible |
| Z | `SUMIFS(tb_mayor[Haber_USD],tb_mayor[Cuenta],"Cta. Corriente "&X3,tb_mayor[Categoria],"Pacto Utilidades",tb_mayor[Estado_Registro],"Activo")` | Pactos abonados al socio *(R4: concatenación dinámica)* |
| AA | Saldo total Utilidad Distribuible (global) | Igual para los 3 socios |
| AB | `SUMIFS(tb_mayor[Debe_USD],tb_mayor[Cuenta],"Cta. Corriente "&X3,tb_mayor[Categoria],"Retiro Socio",...)` | Retiros del socio *(R4: dinámico)* |
| AC | `=Z3-AB3` | Saldo neto Cta. Cte socio |
| AD | `SUMIFS(tb_mayor[Haber_USD],tb_mayor[Categoria],"Aporte Socio",tb_mayor[Entidad],X3,...)` | Aportes del socio |

## Validaciones de datos

Ninguna. La hoja es 100% cálculo derivado.

## Formato condicional (3 reglas)

| # | Rango | Condición | Fill |
|---|---|---|---|
| 1 | P3:P22 | Contains `'⚠'` | `#FFEB9C` amarillo |
| 2 | P3:P22 | Contains `'Revisar'` | `#FCE4D6` salmón |
| 3 | N3:N22 | LessThan `0` | (sin color definido) |

## Protección

Hoja **NO protegida**.

## Riesgos detectados

1. **Bloque A usa `INDEX` posicional** sobre `tb_cuentas`. Frágil ante reordenamiento.
2. **Bloque B usa `INDEX` posicional** sobre `tb_entidades`. Mismo riesgo.
3. ~~**Bloque C tenía nombres de cuenta hardcoded**~~ → **Corregido en R4** (ahora usa `"Cta. Corriente "&X#`).
4. **Filas fijas** (20/7/3) — no se expanden dinámicamente.
