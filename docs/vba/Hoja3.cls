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

' ============================================================
' HOJA3 — Código de evento de REGISTRO_RAPIDO
' CodeName interno "Hoja3" = hoja visible "REGISTRO_RAPIDO".
' Implementa la UX de multi-selección tipo toggle sobre B3 (Socios).
'
' Source of truth: este archivo. Importarlo en el .xlsm reemplaza el código
' de la clase de hoja; NO crea una hoja nueva (VBE respeta el CodeName).
' ============================================================

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
