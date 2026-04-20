# Módulo2 — Auditor de Lotes (Navegación, Corrección y Duplicación)

> Módulo estándar VBA. Contiene la lógica de la hoja `AUDITOR_LOTES`: navegar cronológicamente entre lotes ya guardados, y corregir o duplicar lotes con trazabilidad completa.
>
> **Source of truth del código**: [`docs/vba/Modulo2.bas`](vba/Modulo2.bas). Este `.md` documenta diseño e intención; el `.bas` es el código real importado en el `.xlsm`.

## Resumen de macros expuestas

| Macro | Tipo | Propósito |
|---|---|---|
| `LoteAnterior` | `Sub` pública | Botón "◀ Anterior" en `AUDITOR_LOTES`. |
| `LoteSiguiente` | `Sub` pública | Botón "▶ Siguiente". |
| `AccionSobreLoteVisible` | `Sub` pública | Botón inteligente. Si Activo → `CorregirLoteConID`; si Anulado → `DuplicarLoteConID`. |
| `DuplicarLoteConID(id)` | `Sub` pública | Copia líneas a `REGISTRO_RAPIDO` para editar y guardar como lote nuevo. No modifica el original. |
| `CorregirLoteConID(id)` | `Sub` pública | Anula filas del lote original y precarga un nuevo lote editable. Pide motivo obligatorio. |
| `ContarFilasLote(...)` | `Private Function` | Helper — cuenta e indexa filas de `tb_mayor` para un lote dado. Aborta con `MsgBox` si supera `MAX_LINEAS_LOTE`. |
| `CopiarLineaMayorARegistro(...)` | `Private Sub` | Helper — copia fila de `tb_mayor` a `tb_registro_rapido`. |

## Constantes públicas

| Constante | Valor | Significado |
|---|---|---|
| `MAX_LINEAS_LOTE` | `20` | Tope duro de líneas por lote (regla de negocio). Sincronizar con capacidad física de `tb_registro_rapido` si se cambia. |

## Tablas y hojas que toca

- Lee navegación: `AUDITOR_LOTES!B4` (ID), `B11` (estado), rango `IDs_Unicos`, columna auxiliar `AZ`.
- Lee/anula en: `LIBRO_MAYOR` → `tb_mayor`.
- Escribe en: `REGISTRO_RAPIDO` → `tb_registro_rapido`.

## Reglas operativas

1. **Corrección** = anulación + nuevo lote. Sufijo `" [ANULADO: <motivo>]"` a `Descripcion`, `Estado_Registro = "Anulado"`. Nueva descripción: `"CORRIGE <ID>: <motivo> | <descripcion_original>"`.
2. **Duplicación** = clonación pura. Limpia sufijos `[ANULADO: …]`. Nueva descripción: `"DUPLICADO de <ID>: <desc>"`.
3. Ambas exigen `REGISTRO_RAPIDO!B6 = "Vacío"`.
4. `IDs_Unicos` ordenado descendente (más reciente primero).
5. **Tope duro de 20 líneas por lote** (`MAX_LINEAS_LOTE`). El array local `filasLote` se dimensiona al tamaño exacto. Si un lote en `tb_mayor` supera 20 líneas, la macro **aborta con `MsgBox` ruidoso** en lugar de truncar silenciosamente.
6. **Validación antes de mutar**: `CorregirLoteConID` valida el tope **antes** de anular cualquier fila. Si abortara después, el lote original quedaría anulado sin reemplazo.

## Puntos clave del diseño

- **Navegación en array descendente**: `LoteAnterior` avanza en el array; `LoteSiguiente` retrocede.
- **Corrección con trazabilidad**: el asiento original se anula (no se borra).
- **Duplicación limpia**: si el lote a duplicar ya estaba anulado, el código limpia el sufijo `[ANULADO: ...]`.
- **Helper `ContarFilasLote` compartido**: extraído del código duplicado que vivía en ambas macros. Encapsula conteo + validación + indexado en una sola función.

## Interacción con otros módulos

- Llama a `Módulo1.LimpiarRegistro`.
- Depende de `Módulo1.colIdx`.

## Riesgos conocidos

1. **Tope de 20 líneas por lote**: decisión de negocio, no limitación técnica. Si se requieren lotes mayores, sincronizar (a) capacidad física de `tb_registro_rapido`, (b) constante `MAX_LINEAS_LOTE`, (c) revisión del balanceo visible en la hoja.
2. **Sin `Undo` para `CorregirLoteConID`**: una vez anulado el lote original no hay reversión automática; el usuario debe duplicar el anulado para recuperar.
3. **Solo reconoce `"Activo"` y `"Anulado"`** como estados válidos; cualquier otro valor en `B11` muestra error genérico.
