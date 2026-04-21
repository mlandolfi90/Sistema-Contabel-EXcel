# Módulo1 — Núcleo Contable (Guardar Lote, Tasas, Pacto, Revalorización)

> Módulo estándar VBA. Contiene las macros principales de captura de asientos, gestión de tasas, generación automática de asientos de pacto de utilidades y revalorización.
>
> **Source of truth del código**: [`docs/vba/Modulo1.bas`](vba/Modulo1.bas). Este `.md` documenta diseño e intención; el `.bas` es el código real importado en el `.xlsm`.

## Resumen de macros expuestas

| Macro | Tipo | Propósito |
|---|---|---|
| `GuardarLote` | `Sub` pública | Valida el formulario `REGISTRO_RAPIDO`, graba las líneas en `tb_mayor`, registra historial de tasas, y alerta si el spread supera 3%. |
| `LimpiarRegistro` | `Sub` pública | Limpia cabecera y líneas de entrada en `REGISTRO_RAPIDO` (no toca fórmulas). |
| `ActualizarTasaVigente` | `Sub` pública | Diálogo interactivo para cambiar la tasa vigente de una divisa. |
| `ActualizarTasaVigenteDesde(divisa, nuevaTasa)` | `Sub` pública (callable) | Implementación parametrizada; actualiza `tb_tasas_vigentes` y anota en `tb_tasas_historial` con tipo `actualizacion_manual`. |
| `GenerarAsientoPacto` | `Sub` pública | Prellena en `REGISTRO_RAPIDO` el asiento de distribución de utilidades entre socios (Manuel / Andreina / Michelle) a partir de `REPORTE_BARRIDO!B29:B31`. |
| `RevalorizarCuenta` | `Sub` pública | Prellena en `REGISTRO_RAPIDO` un asiento de revalorización usando la ganancia/pérdida latente leída de `SALDOS_Y_ENTIDADES`. |
| `colIdx(tb, nombreCol)` | `Public Function` | Helper — devuelve el índice de una columna de un `ListObject` por su nombre. Usado también por `Modulo2.bas`. |
| `EscribirLinea(...)` | `Private Sub` | Helper — escribe una línea pre-rellenada en `tb_registro_rapido` referenciando columnas por nombre. |

## Tablas y hojas que toca

- Lee / limpia: `REGISTRO_RAPIDO` → `tb_registro_rapido` (con columnas `Cuenta`, `Entidad`, `Categoría`, `Segmento`, `Tipo_DH`, `Monto`, `Moneda`, `Tasa`, `ID_Deuda`, `USD_Manual_Debe`, `USD_Manual_Haber`).
- Escribe: `LIBRO_MAYOR` → `tb_mayor` (columnas `ID_Lote`, `Fecha`, `Cuenta`, `Entidad`, `Categoria`, `Segmento`, `Moneda`, `Debe_Original`, `Haber_Original`, `Tasa`, `Socios_Participantes`, `ID_Deuda`, `Ref_Chat`, `Descripcion`, `Estado_Registro`). Las columnas `Codigo_Cuenta`, `Clase`, `Debe_USD`, `Haber_USD` son fórmulas auto-heredadas.
- Escribe: `TASAS` → `tb_tasas_vigentes` y `tb_tasas_historial`.
- Lee: `SALDOS_Y_ENTIDADES!B3:B22` (cuentas) y `O3:O22` (ganancia latente USD); `REPORTE_BARRIDO!B29:B31, B33`.

## Reglas de validación en `GuardarLote`

1. El estado en `REGISTRO_RAPIDO!B6` debe contener `"Balanceado"`.
2. Debe haber **al menos 2 líneas** con `Monto > 0`.
3. Cada línea con `Monto > 0` debe tener `Segmento` no vacío.
4. Para líneas en divisa ≠ USD se calcula `spread = (tasa - tasaVigente)/tasaVigente`. Si `|spread| > 0.03` se alerta al usuario y se ofrece actualizar la tasa vigente.

## Interacción con otros módulos

- Exporta `colIdx` como `Public Function` — `Modulo2.bas` lo consume.
- Exporta `LimpiarRegistro` — `Modulo2.bas` lo invoca antes de Duplicar/Corregir.

## Constantes / atributos relevantes

No define constantes públicas propias. El tope de 20 líneas por lote (ver [issue #11](https://github.com/mlandolfi90/sistema-contabel-excel/issues/11)) es regla de negocio del sistema, pero `GuardarLote` no la aplica explícitamente: se respeta porque la tabla `tb_registro_rapido` solo tiene 20 filas físicas. Si en el futuro quisiéramos validar el tope también en `GuardarLote` (defensa en profundidad), habría que importar `MAX_LINEAS_LOTE` desde `Modulo2.bas`.
