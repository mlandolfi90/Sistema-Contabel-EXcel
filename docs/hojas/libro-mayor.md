# Hoja: LIBRO_MAYOR

> Libro mayor acumulativo de todos los asientos contables. Fuente maestra del sistema.  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:S16` (16 filas × 19 columnas).
- Contiene `tb_mayor` con **14 registros reales** (filas 3-16) + fila 2 vacía (artifact del ListObject).

## Estructura visual

- Fila 1: encabezados.
- Fila 2: reservada (vacía).
- Filas 3-16: datos (14 asientos agrupados en 7 lotes L001-L007).
- Paneles congelados: fila 1.
- Orden: posición 13.
- Color de pestaña: `#1F4E78` (azul oscuro).
- Visible, no protegida.

## Encabezados (fila 1)

`ID_Lote` · `Fecha` · `Cuenta` · `Codigo_Cuenta` · `Clase` · `Entidad` · `Categoria` · `Segmento` · `Moneda` · `Debe_Original` · `Haber_Original` · `Tasa` · `Debe_USD` · `Haber_USD` · `Socios_Participantes` · `ID_Deuda` · `Ref_Chat` · `Descripcion` · `Estado_Registro`.

## Lotes registrados al momento de la documentación

7 lotes con 2 líneas cada uno (Debe/Haber):

| Lote | Fecha | Descripción | Estado |
|---|---|---|---|
| L001 | 46130 | Compra 10gr oro con 1400 USDT | Activo |
| L002 | 46130 | Venta 3gr oro por 450 USDT (ganancia 30 USD) | Activo |
| L003 | **0** | Gasto comida — pagado en Bs | **Anulado** |
| L004 | 46130 | TEST REFACTOR del L003 corregido | Activo |
| L005 | 46130 | Compra 5gr oro con 700 USDT | Activo |
| L006 | 46130 | Venta 500 USDT por 315.000 Bs | Activo |
| L007 | 46130 | Pago alquiler oficina 126.000 Bs | Activo |

**Anomalía detectada (corregida en R5):** L003 tenía `Fecha=0` (faltante) con estado `Anulado` y nota `[ANULADO: descuadre $3.17]`. L004 es el registro correctivo del mismo gasto.

## Fórmulas (60 en total)

**4 plantillas únicas × 15 filas** (2-16) en columnas D, E, M, N:

| Col | Plantilla | Qué calcula |
|---|---|---|
| D (Codigo_Cuenta) | `=IF([@Cuenta]="","",IFERROR(XLOOKUP([@Cuenta],tb_cuentas[nombre_cuenta],tb_cuentas[codigo]),"N/A"))` | Código de la cuenta |
| E (Clase) | `=IF([@Cuenta]="","",IFERROR(XLOOKUP([@Cuenta],tb_cuentas[nombre_cuenta],tb_cuentas[clase]),"N/A"))` | Clase contable |
| M (Debe_USD) | `=IF([@[Debe_Original]]=0,0,LET(op,IFERROR(XLOOKUP([@Moneda],tb_tasas_vigentes[divisa],tb_tasas_vigentes[operacion]),"Error"),IF(op="Base",[@[Debe_Original]],IF(op="Multiplicar",[@[Debe_Original]]*[@Tasa],IF(op="Dividir",[@[Debe_Original]]/[@Tasa],0)))))` | Conversión a USD |
| N (Haber_USD) | Simétrica a M para `Haber_Original` | Conversión a USD |

Distribución: 15 fórmulas por columna × 4 columnas = 60 fórmulas.

## Validaciones de datos

Ninguna. Los registros se insertan via macro desde `REGISTRO_RAPIDO` (que sí tiene validaciones).

## Formato condicional

Ninguno.

## Dropdowns

Ninguno.

## Protección

Hoja **NO protegida**.

## Notas

- `Debe_USD` y `Haber_USD` son fórmulas auto-heredadas (no se escriben por macro).
- `Codigo_Cuenta` y `Clase` son fórmulas auto-heredadas.
- El resto de columnas (ID_Lote, Fecha, Cuenta, Entidad, etc.) se escriben directamente por `Módulo1.GuardarLote`.
