# 05 — Actualizaciones post-documentación (2026-04-19)

Este documento fue generado antes de aplicar **5 rondas de correcciones** al libro. Los cambios abajo reflejan el estado ACTUAL del libro vs lo descrito originalmente en las otras docs de `docs/hojas/`.

## 5.1 Fórmulas eliminadas o convertidas a valores

| Referencia original | Estado actual | Ronda |
|---|---|---|
| `tb_tasas_vigentes[ultima_actualizacion]` (D3:D6) = `=TODAY()` | Valor estático 46130 (11/04/2026) | R5 |
| `TASAS!H7` (fecha faltante, valor 0) | Valor 46130 | R5 |
| `LIBRO_MAYOR!B7:B8` (fechas 0 en L003 anulado) | Valor 46130 | R5 |
| `CONFIG!B200` = `=2+3` | Celda vacía (test eliminado) | R1 |
| `PyL!B2` = `=DATE(YEAR(TODAY()),MONTH(TODAY()),1)` | Valor estático + DV Date | R4 |
| `PyL!B3` = `=TODAY()` | Valor estático + DV Date | R4 |
| `FLUJO_CAJA!B2/B3` | Valores estáticos + DV Date | R4 |
| `PyL_POR_SEGMENTO!B2/B3` | Valores estáticos + DV Date | R4 |
| `BALANCE!B2` = `=TODAY()` | Valor estático | R5 |

## 5.2 Fórmulas modificadas (funcionalidad)

| Celda | Cambio | Ronda |
|---|---|---|
| `!CACHE!!B4/B5` | `SUM` → `SUMIFS` filtrando `Estado_Registro=Activo` | R1 |
| `DASHBOARD!A26` | Apuntaba a `SALDOS!S9` (#¡REF!) → envuelto en `IFERROR` | R1 |
| `DASHBOARD!B26/C26/D26` | Envueltas en `IFERROR` | R1 |
| `DASHBOARD!A41` | Literal "Bolsillo Oro" → fórmula `IF` alineada con vecinas | R1 |
| `BALANCE!B6:B12` y `B15` | `XLOOKUP` a col N (mercado) → col K (histórico) | R2 |
| `BALANCE!A34/B34` (nuevos) | Fila informativa Ganancia Latente por Revalorización | R2 |
| `BALANCE!B35` | `=SUM(B29:B34)` → `=SUM(B29:B33)` (excluye ganancia latente) | R2 |
| `DASHBOARD!B4` | `SUMIFS` col N + CxC → `SUMIFS` col K + CxC (coherente con BALANCE) | R2 |
| `SALDOS_Y_ENTIDADES!Z3:Z5` y `AB3:AB5` | Nombre `"Cta. Corriente Socio01/Socio02/Socio03"` hardcoded → `"Cta. Corriente "&X#` | R4 |
| `REPORTE_BARRIDO!B22/B23/B24` | Socios hardcoded en `SEARCH` → referencia `A22/A23/A24` | R4 |
| `PyL_POR_SEGMENTO!A7:A26` | `INDEX(CONFIG_AUX!G2#)` (solo Ingreso) → `INDEX(CONFIG_AUX!I2#)` (Ingreso+Gasto) | R3 |

## 5.3 Elementos nuevos

| Ubicación | Contenido | Ronda |
|---|---|---|
| `CONFIG_AUX!I1` | Encabezado "Cuentas PyL" | R3 |
| `CONFIG_AUX!I2` | `=SORT(FILTER(tb_cuentas[nombre_cuenta],((tb_cuentas[clase]="Ingreso")+(tb_cuentas[clase]="Gasto"))*(tb_cuentas[activa]="SI"),""))` | R3 |
| `REPORTE_BARRIDO!B29:B31` | DV Decimal ≥ 0 | R5 |
| `PyL`/`FLUJO_CAJA`/`PyL_POR_SEGMENTO!B2:B3` | DV Date entre 2000-01-01 y TODAY() | R4 |
| `!CACHE!` | Protección de hoja activada | R5 |

## 5.4 Nuevas hojas de documentación

Se crearon 15 hojas `_DOC_NN_*` + `_DOC_PROGRESS` (control de avance). Estas son hojas de documentación, **no participan en el flujo de cálculo contable**.

## 5.5 Impacto en el conteo de named ranges

| Sección original | Valor original | Valor actual | Comentario |
|---|---|---|---|
| Named ranges visibles | 18 | 18 | Sin cambios |
| Named ranges ocultos | ~10 | 9 | Pequeña diferencia por baja de `_FilterDatabase` tras reescritura de CONFIG_AUX |

## 5.6 Verificación final (2026-04-19)

- CUADRE BALANCE: **0** (antes 26.83) ✓
- `!CACHE!` cuadre: **✓ OK** (antes descuadre -3.17) ✓
- DASHBOARD A26: **vacío** (antes #¡REF!) ✓
- `PyL_POR_SEGMENTO`: **incluye Ingresos + Gastos** ✓
- 15/15 hojas en estado "Completado" en `_DOC_PROGRESS` ✓
