# Módulo2 — Auditor de Lotes (Navegación, Corrección y Duplicación)

> Módulo estándar VBA. Contiene la lógica de la hoja `AUDITOR_LOTES`: navegar cronológicamente entre lotes ya guardados, y corregir o duplicar lotes con trazabilidad completa.

## Resumen de macros expuestas

| Macro | Tipo | Propósito |
|---|---|---|
| `LoteAnterior` | `Sub` pública | Botón "◀ Anterior" en `AUDITOR_LOTES`. |
| `LoteSiguiente` | `Sub` pública | Botón "▶ Siguiente". |
| `AccionSobreLoteVisible` | `Sub` pública | Botón inteligente. Si Activo → `CorregirLoteConID`; si Anulado → `DuplicarLoteConID`. |
| `DuplicarLoteConID(id)` | `Sub` pública | Copia líneas a `REGISTRO_RAPIDO` para editar y guardar como lote nuevo. No modifica el original. |
| `CorregirLoteConID(id)` | `Sub` pública | Anula filas del lote original y precarga un nuevo lote editable. Pide motivo obligatorio. |
| `CopiarLineaMayorARegistro(...)` | `Private Sub` | Helper — copia fila de `tb_mayor` a `tb_registro_rapido`. |

## Tablas y hojas que toca

- Lee navegación: `AUDITOR_LOTES!B4` (ID), `B11` (estado), rango `IDs_Unicos`, columna auxiliar `AZ`.
- Lee/anula en: `LIBRO_MAYOR` → `tb_mayor`.
- Escribe en: `REGISTRO_RAPIDO` → `tb_registro_rapido`.

## Reglas operativas

1. **Corrección** = anulación + nuevo lote. Sufijo `" [ANULADO: <motivo>]"` a `Descripcion`, `Estado_Registro = "Anulado"`. Nueva descripción: `"CORRIGE <ID>: <motivo> | <descripcion_original>"`.
2. **Duplicación** = clonación pura. Limpia sufijos `[ANULADO: …]`. Nueva descripción: `"DUPLICADO de <ID>: <desc>"`.
3. Ambas exigen `REGISTRO_RAPIDO!B6 = "Vacío"`.
4. `IDs_Unicos` ordenado descendente (más reciente primero).
5. **Tope duro de 20 líneas por lote** (regla de negocio). El array local `filasLote(1 To 20)` coincide con la capacidad física de `tb_registro_rapido`. Si un lote en `tb_mayor` supera 20 líneas, la macro **aborta con `MsgBox` ruidoso** en lugar de truncar silenciosamente.

## Código fuente

El código fuente completo del Módulo2 está en el proyecto de Excel (Alt+F11 → Módulo2).

## Puntos clave del diseño

- **Navegación en array descendente**: `LoteAnterior` avanza en el array; `LoteSiguiente` retrocede.
- **Corrección con trazabilidad**: el asiento original se anula (no se borra).
- **Duplicación limpia**: si el lote a duplicar ya estaba anulado, el código limpia el sufijo `[ANULADO: ...]`.
- **Validación previa antes de procesar**: el conteo de filas del lote se hace en una primera pasada; si excede el tope se aborta antes de tocar nada (Corrección no anula nada si no puede completar el nuevo lote).

## Interacción con otros módulos

- Llama a `Módulo1.LimpiarRegistro`.
- Depende de `Módulo1.colIdx`.

## Riesgos conocidos

1. **Tope de 20 líneas por lote**: decisión de negocio, no limitación técnica. Si en el futuro se requieren lotes mayores, hay que (a) expandir `tb_registro_rapido` en `REGISTRO_RAPIDO`, (b) subir la constante `MAX_LINEAS_LOTE` en Módulo2, y (c) revisar que el balanceo del lote siga cabiendo en el formulario.
2. **Sin `Undo` para `CorregirLoteConID`**: una vez anulado el lote original no hay reversión automática; el usuario debe duplicar el anulado para recuperar.
3. **Solo reconoce `"Activo"` y `"Anulado"`** como estados válidos; cualquier otro valor en `B11` muestra error genérico.
