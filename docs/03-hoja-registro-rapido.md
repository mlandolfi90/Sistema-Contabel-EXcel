# Hoja3 — Código de evento de `REGISTRO_RAPIDO` (Selección múltiple de socios)

> Código de hoja (clase VBA `Type=100`) asociado al **CodeName `Hoja3`**, que corresponde a la hoja visible **`REGISTRO_RAPIDO`**. Implementa una UX de "multi-selección tipo toggle" sobre la celda `B3` (Socios participantes) usando dropdown + handlers de eventos + `Comment` como memoria del valor previo.
>
> **Source of truth del código**: [`docs/vba/Hoja3.cls`](vba/Hoja3.cls).

## Resumen de handlers

| Handler | Tipo | Propósito |
|---|---|---|
| `Worksheet_Change(Target)` | `Private Sub` | Se dispara cuando cambia cualquier celda. Si el cambio es en `$B$3`, implementa el toggle: agrega el socio si no estaba, lo quita si ya estaba. |
| `Worksheet_SelectionChange(Target)` | `Private Sub` | Se dispara al seleccionar una celda. Si es `$B$3`, sincroniza el `Comment` oculto con el valor actual de la celda (memoria para la próxima edición). |

## Problema que resuelve

Excel no ofrece listas desplegables (Data Validation) con selección múltiple de forma nativa. El patrón clásico es: el usuario abre el dropdown, elige un socio, y ese valor **sobrescribe** lo que hubiera. Aquí en cambio se quiere acumular socios (`Manuel, Andreina` o `Manuel, Andreina, Michelle`) mediante clics sucesivos en el mismo dropdown.

## Mecánica del toggle en `B3`

1. La hoja tiene en `B3` una validación de datos con la lista de socios individuales (`Manuel`, `Andreina`, `Michelle`).
2. Al elegir uno del dropdown, el valor llega "pelado" a la celda (un solo nombre) y dispara `Worksheet_Change`.
3. El handler compara ese nombre con el **valor anterior guardado en el `Comment` oculto** de la misma celda.
4. Si el socio ya está en la lista → lo **quita** (toggle off). Si no está → lo **agrega al final** separado por `", "`.
5. Vuelve a escribir la lista completa en la celda y actualiza el `Comment` oculto para la siguiente edición.
6. `Worksheet_SelectionChange` mantiene el `Comment` sincronizado cada vez que el usuario entra en `B3`.

## Dependencias y supuestos

- La celda objetivo es siempre `$B$3`. Hardcodeada.
- `Application.EnableEvents = False` se usa para evitar recursión infinita cuando el handler reescribe el valor de la propia celda.
- El `Comment` de la celda se usa como "shadow storage" del valor anterior. **No debe usarse `B3.Comment` para otros fines** o se rompe la lógica.
- Si el usuario pega una cadena con comas (`"Manuel, Andreina"`), el handler lo respeta y no toca nada (detecta que ya es una lista completa).
- El separador usado es literalmente `", "` (coma + espacio). La comparación entre nombres es case-insensitive (`LCase`).
- Uso de `On Error` para degradar con elegancia si la celda no tiene `Comment` todavía (primera edición).

## Interacción con el resto del sistema

- Alimenta el valor que `Modulo1.GuardarLote` lee de `wsReg.Range("B3").Value` y copia a `tb_mayor.Socios_Participantes`.
- Indirectamente, los valores aquí construidos son los que luego se usan en `Modulo2.DuplicarLoteConID` y `Modulo2.CorregirLoteConID` al repoblar `REGISTRO_RAPIDO!B3` desde un lote existente.

## Relación `CodeName` ↔ hoja visible

Este archivo **confirma** que el `CodeName` interno `Hoja3` corresponde a la hoja visible `REGISTRO_RAPIDO`. Las demás hojas del libro (`Hoja1, Hoja2, Hoja4, …, Hoja32`) **no tienen código de evento**; toda su lógica vive en las celdas (fórmulas, tablas, validaciones, rangos con nombre).
