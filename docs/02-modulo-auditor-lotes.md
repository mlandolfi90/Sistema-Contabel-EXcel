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
5. Límite: array `filasLote(1 To 100)`. Un lote con más de 100 líneas se truncaría.

## Código fuente

El código fuente completo del Módulo2 está en el proyecto de Excel (Alt+F11 → Módulo2).

## Puntos clave del diseño

- **Navegación en array descendente**: `LoteAnterior` avanza en el array; `LoteSiguiente` retrocede.
- **Corrección con trazabilidad**: el asiento original se anula (no se borra).
- **Duplicación limpia**: si el lote a duplicar ya estaba anulado, el código limpia el sufijo `[ANULADO: ...]`.

## Interacción con otros módulos

- Llama a `Módulo1.LimpiarRegistro`.
- Depende de `Módulo1.colIdx`.

## Riesgos conocidos

1. **Límite de 100 líneas por lote**.
2. **Sin `Undo` para `CorregirLoteConID`**.
3. **Solo reconoce `"Activo"` y `"Anulado"`**.
