# Módulo1 — Núcleo Contable (Guardar Lote, Tasas, Pacto, Revalorización)

> Módulo estándar VBA. Contiene las macros principales de captura de asientos, gestión de tasas, generación automática de asientos de pacto de utilidades y revalorización.

## Resumen de macros expuestas

| Macro | Tipo | Propósito |
|---|---|---|
| `GuardarLote` | `Sub` pública | Valida el formulario `REGISTRO_RAPIDO`, graba las líneas en `tb_mayor`, registra historial de tasas, y alerta si el spread supera 3%. |
| `LimpiarRegistro` | `Sub` pública | Limpia cabecera y líneas de entrada en `REGISTRO_RAPIDO` (no toca fórmulas). |
| `ActualizarTasaVigente` | `Sub` pública | Diálogo interactivo para cambiar la tasa vigente de una divisa. |
| `ActualizarTasaVigenteDesde(divisa, nuevaTasa)` | `Sub` pública (callable) | Implementación parametrizada; actualiza `tb_tasas_vigentes` y anota en `tb_tasas_historial` con tipo `actualizacion_manual`. |
| `GenerarAsientoPacto` | `Sub` pública | Prellena en `REGISTRO_RAPIDO` el asiento de distribución de utilidades entre socios (Socio01 / Socio02 / Socio03) a partir de `REPORTE_BARRIDO!B29:B31`. |
| `RevalorizarCuenta` | `Sub` pública | Prellena en `REGISTRO_RAPIDO` un asiento de revalorización usando la ganancia/pérdida latente leída de `SALDOS_Y_ENTIDADES`. |
| `colIdx(tb, nombreCol)` | `Private Function` | Helper — devuelve el índice de una columna de un `ListObject` por su nombre, con error claro si no existe. |
| `EscribirLinea(tb, fila, cuenta, entidad, categoria, segmento, tipoDH, monto)` | `Private Sub` | Helper — escribe una línea pre-rellenada en `tb_registro_rapido` referenciando columnas por nombre. |

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

## Código fuente

El código fuente completo del Módulo1 está versionado en el proyecto de Excel. Para consultarlo en el entorno VBA:

1. Abrir `Sistema_Contable_Automatico.xlsm`.
2. `Alt+F11` para abrir el editor VBA.
3. Navegar a `Modules → Módulo1`.

Alternativamente, ejecutar la macro `ExportarTodoVBA_Completo` (Módulo3) que vuelca todos los componentes VBA a una carpeta `VBA_Export` al lado del libro.

> **Nota:** Esta sección de documentación describe la interfaz y contrato del módulo. El código fuente completo VBA fue omitido acá para mantener el archivo legible. El código vive en el `.xlsm` y se exporta con la macro `ExportarTodoVBA_Completo`.

## Puntos clave del diseño

- **Refactorizado por nombre de columna**: el código usa `colIdx(tb, "NombreColumna")` en vez de índices numéricos. Esto hace al sistema robusto si reordenás columnas en `tb_registro_rapido` o `tb_mayor`.
- **Fecha de lote**: viene de `REGISTRO_RAPIDO!B1`, no se calcula.
- **ID_Lote**: viene de `REGISTRO_RAPIDO!B2`, alimentado por fórmula en la hoja (generador de consecutivos).
- **Validación de balance**: se delega a la fórmula de `B6`. El macro solo verifica que contenga la cadena `"Balanceado"`.
- **Historial de tasas**: se escribe *una fila por línea no-USD*, dentro del loop de líneas. Tipo `transaccion`.
- **Alerta de spread**: se acumula la primera alerta del lote (`alertaSpread` booleano) y se muestra al final; si el usuario confirma, se llama `ActualizarTasaVigenteDesde` con la tasa del primer lote que disparó la alerta.
- **Pacto de utilidades**: orden de créditos hardcodeado: Socio03 → Socio01 → Socio02 (solo los que tienen asignación > 0).
- **Revalorización**: lee ganancia/pérdida desde `SALDOS_Y_ENTIDADES!O3:O22` con `XLOOKUP` sobre `B3:B22`; si `|ganancia| < 0.01` avisa que no hay que revalorizar.

## Interacción con otros módulos

- `Módulo2` (Auditor) llama a `LimpiarRegistro` antes de precargar lotes para duplicar/corregir.
- `Módulo2` depende de que `REGISTRO_RAPIDO!B6` pase de `"Vacío"` a `"Balanceado"` antes de poder usar `GuardarLote` nuevamente.
- `Hoja3` (código de hoja de `REGISTRO_RAPIDO`) alimenta el valor de `B3` (socios) que `GuardarLote` luego copia a `tb_mayor.Socios_Participantes`.
