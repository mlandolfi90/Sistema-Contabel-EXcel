# Hoja: DASHBOARD

> Panel ejecutivo consolidado: KPIs, saldos por divisa, CxC/CxP por entidad, estado de socios, alertas de revalorización.  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:F55` (55 filas × 6 columnas).
- **166 fórmulas** distribuidas en 6 secciones.

## Estructura visual

- **A1** título.
- **Fila 3** subtítulo `KPIs AL DÍA DE HOY`; filas 4-8: 5 KPIs.
- **Fila 10** subtítulo `SALDOS POR DIVISA`; fila 11 encabezados; filas 12-16 por divisa (USD, USDT, Bs, Oro, EUR).
- **Fila 18** subtítulo `CUENTAS PENDIENTES POR ENTIDAD`; fila 19 encabezados; filas 20-26 por entidad.
- **Fila 28** subtítulo `ESTADO DE SOCIOS`; fila 29 encabezados; filas 30-32 por socio.
- **Fila 34** subtítulo `ALERTAS DE REVALORIZACIÓN`; fila 35 encabezados; filas 36-55 espejo de SALDOS (solo las que tienen alerta).
- Paneles congelados: filas 1-2.
- Orden: posición 23.
- Color de pestaña: `#C00000` (rojo oscuro).
- Visible, no protegida.

## Fórmulas (166 en total)

### Sección 1 — KPIs (B4:B8, 5 fórmulas)

| Celda | Fórmula | Qué calcula |
|---|---|---|
| B4 | *(R2)* `=SUMIFS(SALDOS_Y_ENTIDADES!K3:K22,SALDOS_Y_ENTIDADES!D3:D22,"Activo")+SUMIF(SALDOS_Y_ENTIDADES!T3:T9,">0",SALDOS_Y_ENTIDADES!T3:T9)` | Total Activos USD (col K + CxC positivas) |
| B5 | `=SUMIFS(SALDOS_Y_ENTIDADES!K3:K22,SALDOS_Y_ENTIDADES!D3:D22,"Pasivo")+ABS(SUMIF(SALDOS_Y_ENTIDADES!T3:T9,"<0",SALDOS_Y_ENTIDADES!T3:T9))` | Total Pasivos USD |
| B6 | `=B4-B5` | Patrimonio = Activos - Pasivos |
| B7 | `=IFERROR(XLOOKUP("Utilidad Distribuible",SALDOS_Y_ENTIDADES!B3:B22,SALDOS_Y_ENTIDADES!K3:K22),0)` | Saldo Utilidad Distribuible |
| B8 | `=PyL!B17` | Resultado del mes (link a PyL) |

**R2:** `B4` originalmente usaba col N (mercado); cambió a col K (histórico) para ser coherente con BALANCE.

### Sección 2 — Saldos por divisa (B12:D16, 15 fórmulas)

Plantilla fila 12 (USD), se repite para USDT/Bs/Oro/EUR:

| Col | Fórmula | Qué calcula |
|---|---|---|
| B | `=SUMIFS(SALDOS_Y_ENTIDADES!H3:H22,SALDOS_Y_ENTIDADES!C3:C22,"USD",SALDOS_Y_ENTIDADES!D3:D22,"Activo")` | Saldo original (moneda nativa) |
| C | `=SUMIFS(SALDOS_Y_ENTIDADES!N3:N22,SALDOS_Y_ENTIDADES!C3:C22,"USD",SALDOS_Y_ENTIDADES!D3:D22,"Activo")` | Saldo USD mercado |
| D | `=IF($B$4=0,0,C12/$B$4)` | % del total activos |

### Sección 3 — CxC/CxP por entidad (A20:D26, 28 fórmulas)

Espejo directo de `SALDOS_Y_ENTIDADES` bloque B:

| Col | Plantilla fila 20 |
|---|---|
| A | `=SALDOS_Y_ENTIDADES!S3` |
| B | `=SALDOS_Y_ENTIDADES!T3` |
| C | `=SALDOS_Y_ENTIDADES!V3` |
| D | `=SALDOS_Y_ENTIDADES!U3` |

**R1:** `A26` apuntaba a `SALDOS_Y_ENTIDADES!S9` (vacío) → devolvía `#¡REF!`. Ahora envuelto en `IFERROR` (vacío si no hay dato). Mismo fix en B26/C26/D26.

### Sección 4 — Estado de socios (A30:F32, 18 fórmulas)

Espejo directo de `SALDOS_Y_ENTIDADES` bloque C para Socio01 (fila 30), Socio02 (31), Socio03 (32). Columnas A-F.

### Sección 5 — Alertas de revalorización (A36:E55, 100 fórmulas)

Plantilla fila 36:

| Col | Fórmula |
|---|---|
| A | `=IF(SALDOS_Y_ENTIDADES!P3="","",SALDOS_Y_ENTIDADES!B3)` |
| B | `=IF(SALDOS_Y_ENTIDADES!P3="","",SALDOS_Y_ENTIDADES!K3)` |
| C | `=IF(SALDOS_Y_ENTIDADES!P3="","",SALDOS_Y_ENTIDADES!N3)` |
| D | `=IF(SALDOS_Y_ENTIDADES!P3="","",SALDOS_Y_ENTIDADES!O3)` |
| E | `=SALDOS_Y_ENTIDADES!P3` |

Se replica en 36-55 (20 filas × 5 cols = 100 fórmulas) apuntando a `SALDOS_Y_ENTIDADES` filas 3-22.

**R1:** `A41` era literal `"Bolsillo Oro"` (residuo) → ahora es fórmula alineada con las vecinas.

## Validaciones de datos

Ninguna.

## Formato condicional

Pendiente verificar (la hoja tiene indicadores visuales no escaneados en esta pasada).

## Protección

Hoja **NO protegida**.

## Riesgos detectados

1. ~~**A26 = #¡REF!**~~ → **Corregido en R1** con `IFERROR`.
2. ~~**A41 = 'Bolsillo Oro' literal**~~ → **Corregido en R1** (ahora fórmula).
3. ~~**KPI B4 mezclaba col N con col K**~~ → **Corregido en R2** (ahora ambos desde col K, coherente con BALANCE).
4. **Sección 5 reserva 20 filas fijas** para alertas. Desperdicio si hay pocas.
5. **Pendiente CF** (no escaneado).
