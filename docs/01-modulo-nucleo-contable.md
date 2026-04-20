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
| `colIdx(tb, nombreCol)` | `Private Function` | Helper — devuelve el índice de una columna de un `ListObject` por su nombre. |
| `EscribirLinea(...)` | `Private Sub` | Helper — escribe una línea pre-rellenada en `tb_registro_rapido`. |

## Tablas y hojas que toca

- Lee / limpia: `REGISTRO_RAPIDO` → `tb_registro_rapido`.
- Escribe: `LIBRO_MAYOR` → `tb_mayor`.
- Escribe: `TASAS` → `tb_tasas_vigentes` y `tb_tasas_historial`.
- Lee: `SALDOS_Y_ENTIDADES!B3:B22` (cuentas) y `O3:O22` (ganancia latente USD); `REPORTE_BARRIDO!B29:B31, B33`.

## Reglas de validación en `GuardarLote`

1. El estado en `REGISTRO_RAPIDO!B6` debe contener `"Balanceado"`.
2. Debe haber **al menos 2 líneas** con `Monto > 0`.
3. Cada línea con `Monto > 0` debe tener `Segmento` no vacío.
4. Para líneas en divisa ≠ USD se calcula `spread`. Si `|spread| > 0.03` se alerta al usuario.

## Código fuente

El código fuente completo del Módulo1 está versionado en el proyecto de Excel. Para consultarlo:

1. Abrir `Sistema_Contable_Automatico.xlsm`.
2. `Alt+F11` para abrir el editor VBA.
3. Navegar a `Modules → Módulo1`.

## Puntos clave del diseño

- **Refactorizado por nombre de columna**: usa `colIdx(tb, "NombreColumna")` en vez de índices numéricos.
- **Pacto de utilidades**: orden de créditos hardcodeado: Socio03 → Socio01 → Socio02 (solo los que tienen asignación > 0).
- **Revalorización**: lee ganancia/pérdida desde `SALDOS_Y_ENTIDADES!O3:O22` con `XLOOKUP` sobre `B3:B22`.

## Interacción con otros módulos

- `Módulo2` (Auditor) llama a `LimpiarRegistro` antes de precargar lotes.
- `Hoja3` alimenta el valor de `B3` (socios) que `GuardarLote` copia a `tb_mayor.Socios_Participantes`.
