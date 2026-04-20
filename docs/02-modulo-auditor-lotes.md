# Módulo2 — Auditor de Lotes (Navegación, Corrección y Duplicación)

> Módulo estándar VBA. Contiene la lógica de la hoja `AUDITOR_LOTES`: navegar cronológicamente entre lotes ya guardados, y corregir o duplicar lotes con trazabilidad completa.

## Resumen de macros expuestas

| Macro | Tipo | Propósito |
|---|---|---|
| `LoteAnterior` | `Sub` pública | Botón "◀ Anterior" en `AUDITOR_LOTES`. Mueve `B4` al lote cronológicamente más antiguo que el visible (avanza en el array `IDs_Unicos` que está ordenado descendente). |
| `LoteSiguiente` | `Sub` pública | Botón "▶ Siguiente". Mueve `B4` al lote más reciente respecto al actual. |
| `AccionSobreLoteVisible` | `Sub` pública | Botón inteligente. Si el lote visible tiene `Estado = "Activo"` llama a `CorregirLoteConID`; si es `"Anulado"` llama a `DuplicarLoteConID`. |
| `DuplicarLoteConID(idLoteOriginal)` | `Sub` pública (callable) | Copia todas las líneas del lote original a `REGISTRO_RAPIDO` para editar y guardar como lote nuevo. **No modifica el original**. |
| `CorregirLoteConID(idLoteCorregir)` | `Sub` pública (callable) | Anula las filas del lote original en `tb_mayor` (marca `Estado_Registro = "Anulado"` y añade `" [ANULADO: <motivo>]"` a `Descripcion`) y precarga un nuevo lote editable. Pide un motivo obligatorio por `InputBox`. |
| `CopiarLineaMayorARegistro(tbMayor, filaMayor, tbReg, filaReg)` | `Private Sub` | Helper — copia una fila de `tb_mayor` a `tb_registro_rapido` convirtiendo `Debe_Original/Haber_Original` de vuelta a `Tipo_DH` + `Monto`. |

## Tablas y hojas que toca

- Lee navegación: `AUDITOR_LOTES!B4` (ID seleccionado), `B11` (estado), rango con nombre `IDs_Unicos`, columna auxiliar `AZ` (lista ordenada desc).
- Lee / anula en: `LIBRO_MAYOR` → `tb_mayor` (usa `ID_Lote`, `Socios_Participantes`, `Ref_Chat`, `Descripcion`, `Estado_Registro`, `Cuenta`, `Entidad`, `Categoria`, `Segmento`, `Debe_Original`, `Haber_Original`).
- Escribe en: `REGISTRO_RAPIDO` → `tb_registro_rapido` (cabecera `B1` Fecha, `B3` Socios, `B4` Ref_Chat, `B5` Descripción) y líneas vía `CopiarLineaMayorARegistro`.

## Reglas operativas

1. **Corrección** = anulación + nuevo lote. El asiento original nunca se borra; su `Descripcion` recibe el sufijo `" [ANULADO: <motivo>]"` y su `Estado_Registro` pasa a `"Anulado"`. La nueva descripción prellenada es `"CORRIGE <ID>: <motivo> | <descripcion_original>"`.
2. **Duplicación** = clonación pura. Antes de copiar se eliminan sufijos `" [ANULADO: …]"` de la descripción. La nueva descripción queda como `"DUPLICADO de <ID>: <descripcion_original_limpia>"`.
3. Ambas operaciones exigen que `REGISTRO_RAPIDO!B6 = "Vacío"`; si no, piden confirmación y llaman `LimpiarRegistro` antes de continuar.
4. El **array `IDs_Unicos` está ordenado descendente** (más reciente primero), por eso `LoteAnterior` suma 1 a la posición y `LoteSiguiente` resta 1.
5. Límite técnico: el array local `filasLote` se dimensiona a 100 filas. **Un lote con más de 100 líneas se truncaría** en corrección/duplicación.

## Código fuente

El código fuente completo del Módulo2 está versionado en el proyecto de Excel. Para consultarlo en el entorno VBA:

1. Abrir `Sistema_Contable_Automatico.xlsm`.
2. `Alt+F11` para abrir el editor VBA.
3. Navegar a `Modules → Módulo2`.

Alternativamente, ejecutar la macro `ExportarTodoVBA_Completo` (Módulo3) que vuelca todos los componentes VBA a una carpeta `VBA_Export` al lado del libro.

> **Nota:** Esta sección de documentación describe la interfaz y contrato del módulo. El código fuente completo VBA fue omitido acá para mantener el archivo legible.

## Puntos clave del diseño

- **Navegación en array descendente**: `IDs_Unicos` está ordenado del más reciente al más antiguo. Por eso `LoteAnterior` (cronológicamente anterior = más antiguo) avanza hacia adelante en el array, y `LoteSiguiente` retrocede.
- **Celdas auxiliares `AZ`**: la columna `AZ` de `AUDITOR_LOTES` contiene la misma lista que `IDs_Unicos` pero expandida; el código lee `AZ(nuevaPos + 1)` (offset +1 por el header).
- **Corrección con trazabilidad**: el asiento original se anula (no se borra). La `Descripcion` conserva el texto original y solo se le añade el sufijo `[ANULADO: motivo]`. Esto permite reconstruir la historia completa.
- **Duplicación limpia**: si el lote a duplicar ya estaba anulado, el código limpia el sufijo `[ANULADO: ...]` antes de copiar la descripción al nuevo lote. El original queda intacto.
- **Conversión Debe/Haber → Tipo_DH**: al copiar del mayor al registro, se determina `Tipo_DH = "D"` si `Debe_Original > 0`, sino `"H"`, y el `Monto` se toma del campo correspondiente.
- **Activación visual**: tras precargar el lote en `REGISTRO_RAPIDO`, la macro selecciona la primera celda editable (fila 11, columna Monto) para que el usuario vea dónde ajustar.

## Interacción con otros módulos

- Llama a `Módulo1.LimpiarRegistro` antes de precargar lotes.
- Depende de `Módulo1.colIdx` (helper de índice de columna por nombre).
- Indirectamente, el usuario finaliza el flujo llamando `Módulo1.GuardarLote` sobre el lote precargado.

## Riesgos conocidos

1. **Límite de 100 líneas por lote** en `filasLote(1 To 100)`. Si algún lote tiene más (caso extremadamente raro), las líneas extras se pierden silenciosamente.
2. **Sin `Undo` para `CorregirLoteConID`**: una vez anulado el lote original, no hay forma de revertir la anulación automáticamente (habría que editar a mano `Estado_Registro` y `Descripcion` en `tb_mayor`).
3. **Validación de estado hardcoded**: solo reconoce `"Activo"` y `"Anulado"`. Cualquier otro valor de `Estado_Registro` cortaría el flujo con un `MsgBox` sin acción.
