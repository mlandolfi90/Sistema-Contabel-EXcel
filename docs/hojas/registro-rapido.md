# Hoja: REGISTRO_RAPIDO

> Formulario rápido para capturar un lote completo de asientos contables. Se confirma con macro `GuardarLote` que copia a `tb_mayor`.  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:M20` (20 filas × 13 columnas).

## Estructura visual

- **Filas 1-7:** cabecera del lote (Fecha, ID_Lote, Socios_Participantes, Ref_Chat, Descripción, Estado, Diferencia).
- **Fila 8:** título del sistema.
- **Fila 10:** encabezados de tabla `tb_registro_rapido`.
- **Filas 11-20:** cuerpo de tabla `tb_registro_rapido` (10 filas para asientos).
- Paneles congelados: **10 filas** (para mantener cabecera + encabezado de tabla visibles).
- Orden: posición 11.
- Color de pestaña: `#FFC000` (ámbar).
- Visible, no protegida.

## Celdas estáticas (cabecera)

| Celda | Valor |
|---|---|
| A1 | Fecha: |
| B1 | Input usuario (fecha del lote) — formato `dd/mm/yyyy` |
| A2 | ID_Lote: |
| B2 | Fórmula automática (genera siguiente consecutivo) |
| A3 | Socios_Participantes: |
| B3 | Input usuario (multi-selección toggle, manejado por `Hoja3.cls`) |
| C3 | (separar con comas: Socio01, Socio02, Socio03) |
| A4 | Ref_Chat: |
| A5 | Descripción: |
| A6 | Estado: (fila calculada con fórmula) |
| A7 | Diferencia: |
| A8 | SISTEMA CONTABLE MULTIDIVISA V2 — REGISTRO RÁPIDO |

Encabezados de tabla (fila 10): Cuenta · Entidad · Categoría · Segmento · Tipo_DH · Monto · Moneda · Tasa · USD_Manual_Debe · USD_Manual_Haber · Debe_USD · Haber_USD · ID_Deuda.

## Fórmulas (43 en total)

### Cabecera / balance (3)

| Celda | Fórmula | Qué calcula |
|---|---|---|
| B2 | `="L"&TEXT(IF(COUNTA(tb_mayor[ID_Lote])=0,1,MAX(IFERROR(VALUE(MID(tb_mayor[ID_Lote],2,10)),0))+1),"000")` | Próximo ID_Lote formato `L###` — extrae el número de cada ID en `tb_mayor` y suma 1 al máximo |
| B6 | `=IF(COUNTA(tb_registro_rapido[Cuenta])=0,"Vacío",IF(ABS(B7)<0.01,"✓ Balanceado","✗ Descuadre: "&TEXT(B7,"#,##0.00")&" USD"))` | Estado del formulario: `Vacío` si no hay líneas; `✓ Balanceado` si \|B7\|<0.01; `✗ Descuadre: X USD` en otro caso |
| B7 | `=SUM(tb_registro_rapido[Debe_USD])-SUM(tb_registro_rapido[Haber_USD])` | Diferencia Debe - Haber |

### Tabla `tb_registro_rapido` (columnas G, H, K, L en filas 11-20 — 40 fórmulas)

| Col | Plantilla (fila 11) |
|---|---|
| G (Moneda) | `=IF([@Cuenta]="","",IFERROR(XLOOKUP([@Cuenta],tb_cuentas[nombre_cuenta],tb_cuentas[moneda]),""))` |
| H (Tasa) | `=IF(OR([@Moneda]="",[@Moneda]="USD"),1,IF(AND([@[Tipo_DH]]="D",[@[USD_Manual_Debe]]<>"",[@[USD_Manual_Debe]]>0),[@Monto]/[@[USD_Manual_Debe]],IF(AND([@[Tipo_DH]]="H",[@[USD_Manual_Haber]]<>"",[@[USD_Manual_Haber]]>0),[@Monto]/[@[USD_Manual_Haber]],IFERROR(XLOOKUP([@Moneda],tb_tasas_vigentes[divisa],tb_tasas_vigentes[tasa_vs_USD]),1))))` |
| K (Debe_USD) | `=IF([@[USD_Manual_Debe]]<>"",[@[USD_Manual_Debe]],IF(OR([@[Tipo_DH]]<>"D",[@Monto]="",[@Monto]=0),0,LET(op,IFERROR(XLOOKUP([@Moneda],tb_tasas_vigentes[divisa],tb_tasas_vigentes[operacion]),"Error"),IF(op="Base",[@Monto],IF(op="Multiplicar",[@Monto]*[@Tasa],IF(op="Dividir",[@Monto]/[@Tasa],0))))))` |
| L (Haber_USD) | Simétrica a K pero para `Tipo_DH="H"` |

Las fórmulas se repiten idénticamente en filas 12-20 (solo cambia la fila de `[@]` por la sintaxis estructurada).

## Validaciones de datos

62 celdas con validación, **8 reglas únicas**:

| Rango | Tipo | Criterio / Origen |
|---|---|---|
| B1 | Date | `<= =TODAY()` |
| B3 | List | `=ListaSocios` |
| A11:A20 | List | `=ListaCuentaActiva` |
| B11:B20 | List | `=ListaEntidadActiva` |
| C11:C20 | List | `=ListaCategoriaActiva` |
| D11:D20 | List | `=ListaSegmentoActiva` |
| E11:E20 | List | `=ListaTipoDH` |
| F11:F20 | Decimal | `> 0` |

## Formato condicional (4 reglas)

| Rango | Condición | Fill |
|---|---|---|
| B7 | NotEqualTo `0` | `#FFC7CE` (rojo) |
| B6 | Contains `'Balanceado'` | `#C6EFCE` (verde) |
| B6 | Contains `'Descuadre'` | `#FFC7CE` (rojo) |
| B6 | Contains `'Vacío'` | `#E7E6E6` (gris) |

## Protección

Hoja **NO protegida**.

## Relación con VBA

- Esta hoja tiene `CodeName = Hoja3` con handlers `Worksheet_Change` / `Worksheet_SelectionChange` (ver [`../03-hoja-registro-rapido.md`](../03-hoja-registro-rapido.md)).
- `Módulo1.GuardarLote` lee esta hoja y copia filas a `tb_mayor`.
- `Módulo1.LimpiarRegistro` vacía las columnas de entrada.
- `Módulo2.DuplicarLoteConID` / `CorregirLoteConID` repueblan esta hoja desde `tb_mayor`.
