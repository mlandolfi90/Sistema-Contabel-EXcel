# Hoja3 — Código de evento de `REGISTRO_RAPIDO` (Selección múltiple de socios)

> Código de hoja (clase VBA tipo 100) asociado al `CodeName` **`Hoja3`**, que corresponde a la hoja visible **`REGISTRO_RAPIDO`**. Implementa una UX de "multi-selección tipo toggle" sobre la celda `B3` (Socios participantes) usando la combinación dropdown + manejadores de eventos + `Comment` como memoria del valor previo.

## Resumen de handlers

| Handler | Tipo | Propósito |
|---|---|---|
| `Worksheet_Change(Target)` | `Private Sub` | Se dispara cuando cambia cualquier celda. Si el cambio es en `$B$3`, implementa el toggle: agrega el socio si no estaba, lo quita si ya estaba. |
| `Worksheet_SelectionChange(Target)` | `Private Sub` | Se dispara al seleccionar una celda. Si es `$B$3`, sincroniza el `Comment` oculto con el valor actual de la celda (memoria para la próxima edición). |

## Problema que resuelve

Excel no ofrece listas desplegables (Data Validation) con selección múltiple de forma nativa. El patrón clásico es: el usuario abre el dropdown, elige un socio, y ese valor **sobrescribe** lo que hubiera. Aquí en cambio se quiere acumular socios (`Socio01, Socio02` o `Socio01, Socio02, Socio03`) mediante clics sucesivos en el mismo dropdown.

## Mecánica del toggle en `B3`

1. La hoja tiene en `B3` una validación de datos con la lista de socios individuales (`Socio01`, `Socio02`, `Socio03`).
2. Al elegir uno del dropdown, el valor llega "pelado" a la celda (un solo nombre) y dispara `Worksheet_Change`.
3. El handler compara ese nombre con el **valor anterior guardado en el `Comment` oculto** de la misma celda.
4. Si el socio ya está en la lista → lo **quita** (toggle off). Si no está → lo **agrega al final** separado por `", "`.
5. Vuelve a escribir la lista completa en la celda y actualiza el `Comment` oculto para la siguiente edición.
6. `Worksheet_SelectionChange` mantiene el `Comment` sincronizado cada vez que el usuario entra en `B3` (por si el valor fue modificado por otra macro o por el usuario pegando una lista).

## Dependencias y supuestos

- La celda objetivo es siempre `$B$3`. Hardcodeada.
- `Application.EnableEvents = False` se usa para evitar recursión infinita cuando el handler reescribe el valor de la propia celda.
- El `Comment` de la celda se usa como "shadow storage" del valor anterior. **No debe usarse `B3.Comment` para otros fines** o se rompe la lógica.
- Si el usuario pega una cadena con comas (`"Socio01, Socio02"`), el handler lo respeta y no toca nada (detecta que ya es una lista completa).
- El separador usado es literalmente `", "` (coma + espacio). La comparación entre nombres es case-insensitive (`LCase`).
- Uso de `On Error` para degradar con elegancia si la celda no tiene `Comment` todavía (primera edición).

## Interacción con el resto del sistema

- Alimenta el valor que `Módulo1.GuardarLote` lee de `wsReg.Range("B3").Value` y copia a `tb_mayor.Socios_Participantes`.
- Indirectamente, los valores aquí construidos son los que luego se usan en `Módulo2.DuplicarLoteConID` y `Módulo2.CorregirLoteConID` al repoblar `REGISTRO_RAPIDO!B3` desde un lote existente.

## Relación `CodeName` ↔ hoja visible

Este archivo **confirma** que el `CodeName` interno `Hoja3` corresponde a la hoja visible `REGISTRO_RAPIDO`. Las demás hojas del libro (`Hoja1, Hoja2, Hoja4, …, Hoja32`) **no tienen código de evento**; toda su lógica vive en las celdas (fórmulas, tablas, validaciones, rangos con nombre).

## Código fuente

```vb
VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Hoja3"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Option Explicit

Private Sub Worksheet_Change(ByVal Target As Range)
    ' Toggle multi-selección de socios en B3
    If Target.Address = "$B$3" Then
        Application.EnableEvents = False
        On Error GoTo Cleanup
        
        Dim nuevoSocio As String
        nuevoSocio = Trim(Target.Value)
        
        ' Si el valor es vacío, no hacer nada
        If nuevoSocio = "" Then GoTo Cleanup
        
        ' Recuperar el valor anterior (lo guardamos antes de que cambiara)
        Dim valorAnterior As String
        valorAnterior = CStr(Target.Comment.Text)
        
        ' Si el nuevo valor YA es la cadena completa acumulada, no hacer nada
        ' Esto pasa cuando el usuario pega o escribe la lista completa directamente
        If InStr(valorAnterior, ",") > 0 And nuevoSocio = valorAnterior Then GoTo Cleanup
        
        ' Validar que nuevoSocio es un solo socio (una sola selección del dropdown)
        If InStr(nuevoSocio, ",") > 0 Then GoTo Cleanup  ' el usuario pegó múltiples, respetar
        
        Dim socios() As String
        Dim yaExiste As Boolean: yaExiste = False
        Dim i As Long
        Dim resultado As String: resultado = ""
        
        If valorAnterior = "" Then
            ' Era vacío, solo poner el nuevo
            resultado = nuevoSocio
        Else
            ' Parsear lista anterior
            socios = Split(valorAnterior, ",")
            For i = LBound(socios) To UBound(socios)
                Dim s As String: s = Trim(socios(i))
                If s <> "" Then
                    If LCase(s) = LCase(nuevoSocio) Then
                        yaExiste = True
                        ' no lo agregamos (toggle off: lo quitamos)
                    Else
                        If resultado = "" Then
                            resultado = s
                        Else
                            resultado = resultado & ", " & s
                        End If
                    End If
                End If
            Next i
            
            If Not yaExiste Then
                ' Agregarlo al final
                If resultado = "" Then
                    resultado = nuevoSocio
                Else
                    resultado = resultado & ", " & nuevoSocio
                End If
            End If
        End If
        
        Target.Value = resultado
        ' Actualizar comment shadow para próxima vez
        On Error Resume Next
        Target.Comment.Delete
        On Error GoTo Cleanup
        Target.AddComment resultado
        Target.Comment.Visible = False
        
Cleanup:
        Application.EnableEvents = True
    End If
End Sub

Private Sub Worksheet_SelectionChange(ByVal Target As Range)
    ' Cuando entras a B3, sincronizar el comment shadow con el valor actual
    If Target.Address = "$B$3" Then
        Application.EnableEvents = False
        On Error Resume Next
        Target.Comment.Delete
        If Trim(Target.Value) <> "" Then
            Target.AddComment CStr(Target.Value)
            Target.Comment.Visible = False
        End If
        Application.EnableEvents = True
    End If
End Sub
```
