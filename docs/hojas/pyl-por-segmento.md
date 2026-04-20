# Hoja: PyL_POR_SEGMENTO

> Estado de Resultados desglosado por segmento de negocio. **Hoja más pesada del libro** con 274 fórmulas y muchos SUMIFS.  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:L32` (32 filas × 12 columnas).
- **274 fórmulas** distribuidas en matriz cuenta × segmento.

## Estructura visual

- Fila 1: título.
- Fila 2: Fecha_Inicio; fila 3: Fecha_Fin.
- **Fila 5:** derrame de segmentos activos en C5 (`TRANSPOSE(ListaSegmentoActiva)`).
- **Col A filas 7-26:** lista de cuentas (`INDEX` a derrames de CONFIG_AUX).
- **Col B filas 7-26:** subtotal por cuenta = `SUM(C:L)`.
- **Cols C:L filas 7-26:** matriz cuenta × segmento.
- **Filas 27-32:** totales finales.
- Orden: posición 29.
- Color de pestaña: `#70AD47` (verde claro).
- Visible, no protegida.

## Celdas estáticas

| Celda | Valor |
|---|---|
| A1 | ESTADO DE RESULTADOS POR SEGMENTO |
| A2 | Fecha_Inicio: |
| A3 | Fecha_Fin: |

## Fórmulas (274 total)

### Período (2)

| Celda | Fórmula original | Estado |
|---|---|---|
| B2 | `=DATE(YEAR(TODAY()),MONTH(TODAY()),1)` | **R4:** estático + DV Date |
| B3 | `=TODAY()` | **R4:** estático + DV Date |

### Header de segmentos (fila 5)

| Celda | Fórmula |
|---|---|
| C5 | `=TRANSPOSE(ListaSegmentoActiva)` (derrame horizontal C5:L5) |

### Columna A (filas 7-26) — 20 fórmulas

Plantilla: `=IFERROR(INDEX(CONFIG_AUX!$I$2#,N),"")` donde `N=1..20`.

**R3:** originalmente apuntaba a `CONFIG_AUX!G2#` (solo Ingresos). Ahora apunta a `CONFIG_AUX!I2#` (Ingreso + Gasto) — por eso R3 agregó también la fórmula `I2` en CONFIG_AUX que hace `SORT(FILTER(... clase=Ingreso OR clase=Gasto, activa=SI))`.

### Columna B (filas 7-26) — 23 fórmulas

Plantilla fila 7: `=IF($A7="",0,SUM(C7:L7))`. Subtotal por cuenta.

Filas 27-29 tienen fórmulas adicionales de totales generales.

### Cols C:L (filas 7-26) — matriz cuenta × segmento, **230 fórmulas** (10 cols × 23 filas)

Plantilla fila 7, col C (se replica cambiando referencia de columna):

```
=IF(OR($A7="",C$5=""),0,
  IFERROR(
    IF(XLOOKUP($A7,tb_cuentas[nombre_cuenta],tb_cuentas[clase])="Ingreso",
      SUMIFS(tb_mayor[Haber_USD],tb_mayor[Cuenta],$A7,tb_mayor[Segmento],C$5,tb_mayor[Fecha],">="&$B$2,tb_mayor[Fecha],"<="&$B$3,tb_mayor[Estado_Registro],"Activo")
     -SUMIFS(tb_mayor[Debe_USD],tb_mayor[Cuenta],$A7,tb_mayor[Segmento],C$5,tb_mayor[Fecha],">="&$B$2,tb_mayor[Fecha],"<="&$B$3,tb_mayor[Estado_Registro],"Activo"),
      SUMIFS(tb_mayor[Debe_USD],...)-SUMIFS(tb_mayor[Haber_USD],...))
  ,0))
```

Qué calcula por celda (cuenta, segmento):
- Si la cuenta es **Ingreso** → suma `Haber-Debe`.
- Si es **Gasto** → suma `Debe-Haber`.
- Filtra por segmento, período y `Estado=Activo`.
- Si cuenta o segmento vacío → 0.

La plantilla se replica idéntica en `C7:L26` (230 fórmulas), cambiando solo `$A{fila}` y `{col}$5`.

### Totales (filas 27-32)

18 fórmulas adicionales de totales por columna y grandes totales (no listadas celda por celda).

## Validaciones de datos

- **R4 (nuevas):** `B2:B3` con DV Date.

## Formato condicional

No escaneado.

## Protección

Hoja **NO protegida**.

## Riesgos detectados

1. ~~**Col A solo traía Cuentas de Ingreso**~~ → **Corregido en R3** (ahora Ingreso + Gasto).
2. **20 filas fijas** reservadas para cuentas. Rígido si crece el catálogo.
3. **Período rígido** — mismo issue que PyL (resuelto parcialmente en R4).
4. **Fórmula por celda muy repetitiva** (10 segmentos × 20 cuentas × 2 SUMIFS dobles = 40 SUMIFS por fila). **Puede ser lento en libros grandes** — candidato a reemplazo con PIVOT o Power Query.
5. **Revisión CF pendiente.**
