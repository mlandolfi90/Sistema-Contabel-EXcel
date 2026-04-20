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

Plantilla fila 3 (se replica en filas 4-22):

| Col | Fórmula | Qué calcula |
|---|---|---|
| A | `=INDEX(tb_cuentas[codigo],1)` | Código posicional (fila 4 → INDEX(...,2), etc.) |
| B | `=INDEX(tb_cuentas[nombre_cuenta],1)` | Nombre cuenta |
| C | `=INDEX(tb_cuentas[moneda],1)` | Moneda |
| D | `=INDEX(tb_cuentas[clase],1)` | Clase contable |
| E | `=INDEX(tb_cuentas[permite_revalorizacion],1)` | Flag revalorización |
| F | `=SUMIFS(tb_mayor[Debe_Original],tb_mayor[Cuenta],B3,tb_mayor[Estado_Registro],"Activo")` | Suma Debe original |
| G | `=SUMIFS(tb_mayor[Haber_Original],tb_mayor[Cuenta],B3,tb_mayor[Estado_Registro],"Activo")` | Suma Haber original |
| H | `=IF(D3="Activo",F3-G3,IF(OR(D3="Pasivo",D3="Patrimonio",D3="Ingreso"),G3-F3,F3-G3))` | Saldo original según clase |
| I | `=SUMIFS(tb_mayor[Debe_USD],tb_mayor[Cuenta],B3,tb_mayor[Estado_Registro],"Activo")` | Suma Debe USD |
| J | `=SUMIFS(tb_mayor[Haber_USD],tb_mayor[Cuenta],B3,tb_mayor[Estado_Registro],"Activo")` | Suma Haber USD |
| K | `=IF(D3="Activo",I3-J3,IF(OR(D3="Pasivo",D3="Patrimonio",D3="Ingreso"),J3-I3,I3-J3))` | **Saldo USD histórico** (tasas del momento del asiento) |
| L | `=IF(OR(H3=0,C3="USD"),0,K3/H3)` | CPP (costo promedio ponderado) |
| M | `=IFERROR(XLOOKUP(C3,tb_tasas_vigentes[divisa],tb_tasas_vigentes[tasa_vs_USD]),1)` | Tasa vigente hoy |
| N | `=IF(H3=0,0,LET(op,IFERROR(XLOOKUP(C3,tb_tasas_vigentes[divisa],tb_tasas_vigentes[operacion]),"Error"),IF(op="Base",H3,IF(op="Multiplicar",H3*M3,IF(op="Dividir",H3/M3,0)))))` | **Saldo USD a tasa actual** (revalorización teórica) |
| O | `=IF(E3="NO",0,N3-K3)` | Ganancia/pérdida latente |
| P | `=IF(ABS(O3)>50,"⚠ Revalorizar",IF(ABS(O3)>10,"Revisar",""))` | Alerta textual |

**20 filas × 16 columnas = 320 fórmulas.**

### Observación crítica

Las columnas **A-E usan `INDEX` posicional** sobre `tb_cuentas[...]`. Vínculo frágil: si se reordena, inserta o borra una cuenta en `tb_cuentas`, cambia el contenido de esta hoja. Sería más robusto derramar con `=tb_cuentas[codigo]`.

## BLOQUE B — Matriz CxC/CxP por entidad (cols R–V, 35 fórmulas)

| Col | Plantilla fila 3 | Qué calcula |
|---|---|---|
| R | `="Cuentas Pendientes"` | Literal fijo |
| S | `=INDEX(tb_entidades[entidad],1)` | Entidad posicional |
| T | `=SUMIFS(tb_mayor[Debe_USD],tb_mayor[Cuenta],"Cuentas Pendientes",tb_mayor[Entidad],S3,tb_mayor[Estado_Registro],"Activo")-SUMIFS(tb_mayor[Haber_USD],...)` | Saldo USD Debe - Haber |
| U | `=IF(T3>0.01,"Me debe",IF(T3<-0.01,"Le debo","—"))` | Interpretación |
| V | `=IF(T3>0.01,"Activo (CxC)",IF(T3<-0.01,"Pasivo (CxP)","—"))` | Clasificación balance |

7 filas × 5 cols = 35 fórmulas.

## BLOQUE C — Consolidado por socio (cols Y–AD, 18 fórmulas)

Los 3 socios en **X3:X5** (Socio01, Socio02, Socio03) son valores estáticos.

| Col | Plantilla fila 3 (Socio01) | Qué calcula |
|---|---|---|
| Y | `=SUMPRODUCT((tb_mayor[Cuenta]="Utilidad Distribuible")*(tb_mayor[Categoria]="Generación Utilidad")*(ISNUMBER(SEARCH(X3,tb_mayor[Socios_Participantes])))*tb_mayor[Haber_USD])-SUMPRODUCT(..."Gasto Distribuible"...)` | Utilidad/gasto común atribuible al socio (busca su nombre con SEARCH) |
| Z | `=SUMIFS(tb_mayor[Haber_USD],tb_mayor[Cuenta],"Cta. Corriente "&X3,tb_mayor[Categoria],"Pacto Utilidades",tb_mayor[Estado_Registro],"Activo")` | Suma pactos abonados al socio *(R4: reemplazado el hardcode por concatenación dinámica)* |
| AA | `=SUMIFS(tb_mayor[Haber_USD],tb_mayor[Cuenta],"Utilidad Distribuible",tb_mayor[Estado_Registro],"Activo")-SUMIFS(tb_mayor[Debe_USD],...)` | Saldo total Utilidad Distribuible (global, igual para los 3 socios) |
| AB | `=SUMIFS(tb_mayor[Debe_USD],tb_mayor[Cuenta],"Cta. Corriente "&X3,tb_mayor[Categoria],"Retiro Socio",tb_mayor[Estado_Registro],"Activo")` | Retiros del socio *(R4: dinámico)* |
| AC | `=Z3-AB3` | Saldo neto Cta. Cte socio = pactos - retiros |
| AD | `=SUMIFS(tb_mayor[Haber_USD],tb_mayor[Categoria],"Aporte Socio",tb_mayor[Entidad],X3,tb_mayor[Estado_Registro],"Activo")` | Aportes del socio |

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

1. **Bloque A usa `INDEX` posicional** sobre `tb_cuentas` (A-E). Frágil ante reordenamiento.
2. **Bloque B usa `INDEX` posicional** sobre `tb_entidades` (S). Mismo riesgo.
3. ~~**Bloque C tenía nombres de cuenta hardcoded**~~ → **Corregido en R4** (ahora usa `"Cta. Corriente "&X#`).
4. **Filas fijas** (20 en A, 7 en B, 3 en C) — no se expanden dinámicamente si crecen las tablas fuente.
