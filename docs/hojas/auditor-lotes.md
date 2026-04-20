# Hoja: AUDITOR_LOTES

> Panel de auditoría interactivo para inspeccionar lotes individuales del LIBRO_MAYOR. Navegación anterior/siguiente + acción inteligente (corregir/duplicar).  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:AZ35` (35 filas × 52 columnas).
- Solo las columnas A–I (y AZ como helper) tienen contenido real.

## Estructura visual

- **Fila 1-2:** título + instrucciones.
- **Filas 4-11:** ficha del lote seleccionado (ID, posición, fecha, ref. chat, socios, descripción, estado).
- **Fila 13:** etiqueta `LÍNEAS DEL LOTE`.
- **Fila 14:** encabezados de líneas (Cuenta, Entidad, Categoría, Moneda, Debe_Orig, Haber_Orig, Tasa, Debe_USD, Haber_USD).
- **Filas 15-24:** área para derrame de líneas (se derraman desde A15).
- **Filas 25-27:** totales USD (Debe, Haber, Diferencia) con indicador cuadre/descuadre.
- **Filas 29-31:** sección `NAVEGACIÓN` con texto instructivo.
- **Filas 33-35:** sección `ACCIÓN INTELIGENTE` con mensaje dinámico según estado.
- **Columna AZ:** helper con lista de IDs únicos (derrame desde AZ2).
- Orden: posición 9.
- Color de pestaña: `#FFC000` (ámbar).
- Visible, no protegida.

## Celdas estáticas clave

| Celda | Valor |
|---|---|
| A1 | AUDITOR DE LOTES |
| A2 | Usa ◀ Anterior y Siguiente ▶ para navegar entre lotes. Cuando encuentres el incorrecto, pulsa 🔧 Corregir Este Lote. |
| A4 | ID Lote: |
| B4 | (input de usuario — ID del lote visible) |
| A5 | Posición: |
| A7 | Fecha: |
| A8 | Ref. Chat: |
| A9 | Socios: |
| A10 | Descripción: |
| A11 | Estado: |
| A13 | LÍNEAS DEL LOTE |
| A14-I14 | Cuenta · Entidad · Categoría · Moneda · Debe_Orig · Haber_Orig · Tasa · Debe_USD · Haber_USD |
| A25 | TOTALES USD: |
| G25/G26/G27 | Debe: / Haber: / Diferencia: |
| A29 | NAVEGACIÓN |
| A33 | ACCIÓN INTELIGENTE |
| AZ1 | IDs únicos helper |

## Fórmulas (14 en total)

| # | Celda | Fórmula | Qué calcula |
|---|---|---|---|
| 1 | AZ2 | `=SORT(UNIQUE(FILTER(tb_mayor[ID_Lote],tb_mayor[ID_Lote]<>"")),1,-1)` | Lista única de IDs, ordenada descendente. Derrama hacia abajo. |
| 2 | B5 | `=IFERROR(MATCH(B4,IDs_Unicos,0)&" de "&COUNTA(IDs_Unicos),"No existe")` | Posición del lote actual sobre total |
| 3 | B7 | `=IFERROR(INDEX(tb_mayor[Fecha],MATCH(B4,tb_mayor[ID_Lote],0)),"")` | Fecha del primer registro del lote |
| 4 | B8 | `=IFERROR(INDEX(tb_mayor[Ref_Chat],MATCH(B4,tb_mayor[ID_Lote],0)),"")` | Ref_Chat |
| 5 | B9 | `=IFERROR(INDEX(tb_mayor[Socios_Participantes],MATCH(B4,tb_mayor[ID_Lote],0)),"")` | Socios_Participantes |
| 6 | B10 | `=IFERROR(INDEX(tb_mayor[Descripcion],MATCH(B4,tb_mayor[ID_Lote],0)),"")` | Descripción |
| 7 | B11 | `=IFERROR(INDEX(tb_mayor[Estado_Registro],MATCH(B4,tb_mayor[ID_Lote],0)),"")` | Estado_Registro (Activo/Anulado) |
| 8 | A15 | `=IFERROR(FILTER(CHOOSE({1,2,3,4,5,6,7,8,9},tb_mayor[Cuenta],tb_mayor[Entidad],tb_mayor[Categoria],tb_mayor[Moneda],tb_mayor[Debe_Original],tb_mayor[Haber_Original],tb_mayor[Tasa],tb_mayor[Debe_USD],tb_mayor[Haber_USD]),tb_mayor[ID_Lote]=B4),"")` | Derrame 2D de las 9 columnas filtradas por ID de lote |
| 9 | H25 | `=IFERROR(SUMIFS(tb_mayor[Debe_USD],tb_mayor[ID_Lote],B4),0)` | Suma Debe_USD del lote |
| 10 | H26 | `=IFERROR(SUMIFS(tb_mayor[Haber_USD],tb_mayor[ID_Lote],B4),0)` | Suma Haber_USD del lote |
| 11 | H27 | `=H25-H26` | Diferencia |
| 12 | I27 | `=IF(ABS(H27)<0.01,"✓ Cuadra","⚠ Descuadre "&TEXT(ABS(H27),"#.##0,00"))` | Indicador de cuadre (tolerancia 0.01 USD) |
| 13 | A34 | `=IF(B11="Activo","🔧 Pulsa el botón para CORREGIR este lote...",IF(B11="Anulado","📋 Pulsa el botón para DUPLICAR este lote...","— Selecciona un lote válido —"))` | Mensaje dinámico según estado |
| 14 | A35 | `="Estado actual: "&B11` | Etiqueta de estado |

## Validaciones de datos

Ninguna. B4 es texto libre (el usuario escribe el ID o usa las macros de navegación).

## Formato condicional (6 reglas)

| # | Rango | Condición | Fill | Font |
|---|---|---|---|---|
| 1 | B11 | EqualTo `"Anulado"` | `#FFC7CE` rojo claro | `#9C0006` rojo oscuro |
| 2 | B11 | EqualTo `"Activo"` | `#C6EFCE` verde claro | `#006100` verde oscuro |
| 3 | I27 | Contains `'Cuadra'` | `#C6EFCE` | `#006100` |
| 4 | I27 | Contains `'Descuadre'` | `#FFC7CE` | `#9C0006` |
| 5 | A34 | Contains `'CORREGIR'` | `#FFF2CC` amarillo | — |
| 6 | A34 | Contains `'DUPLICAR'` | `#E2EFDA` verde pálido | — |

## Protección

Hoja **NO protegida**.

## Relación con VBA

Esta hoja es el panel de control de `Módulo2.bas`:

- `Módulo2.LoteAnterior` / `LoteSiguiente` leen `B4` y la reescriben con el ID vecino en `AZ`.
- `Módulo2.AccionSobreLoteVisible` lee `B11` y despacha a `CorregirLoteConID` (si Activo) o `DuplicarLoteConID` (si Anulado).
- Ver [`../02-modulo-auditor-lotes.md`](../02-modulo-auditor-lotes.md) para el contrato completo.
