Attribute VB_Name = "Módulo1"
Option Explicit

' ============================================================
' SISTEMA CONTABLE MULTIDIVISA V2 — MÓDULO PRINCIPAL
' Refactorizado con referencias por nombre de columna (ListColumns)
' Robusto a reordenamiento de columnas en tb_registro_rapido y tb_mayor
'
' Source of truth: este archivo. El .xlsm debe importar/sincronizar desde aquí.
' ============================================================

' ============================================================
' Helper: obtener índice de columna por nombre (lanza error claro si no existe)
' Visibilidad: Public para que Módulo2 pueda usarlo también.
' ============================================================
Public Function colIdx(tb As ListObject, nombreCol As String) As Long
    On Error Resume Next
    colIdx = tb.ListColumns(nombreCol).Index
    If Err.Number <> 0 Then
        Err.Clear
        MsgBox "La columna '" & nombreCol & "' no existe en la tabla '" & tb.Name & "'." & vbCrLf & _
               "Verifica que el libro no fue modificado manualmente.", vbCritical, "Columna no encontrada"
        End
    End If
    On Error GoTo 0
End Function


' ============================================================
' MACRO 1: GuardarLote
' Asociar a botón "💾 Guardar Lote" en REGISTRO_RAPIDO
' ============================================================
Sub GuardarLote()
    Dim wsReg As Worksheet, wsMayor As Worksheet, wsHist As Worksheet
    Dim tbReg As ListObject, tbMayor As ListObject, tbHist As ListObject
    Dim idLote As String, fecha As Date, socios As String
    Dim refChat As String, descrip As String, estado As String
    Dim i As Long, nLineas As Long
    Dim nuevaFila As ListRow

    Set wsReg = ThisWorkbook.Sheets("REGISTRO_RAPIDO")
    Set wsMayor = ThisWorkbook.Sheets("LIBRO_MAYOR")
    Set wsHist = ThisWorkbook.Sheets("TASAS")
    Set tbReg = wsReg.ListObjects("tb_registro_rapido")
    Set tbMayor = wsMayor.ListObjects("tb_mayor")
    Set tbHist = wsHist.ListObjects("tb_tasas_historial")

    ' Índices REGISTRO_RAPIDO por nombre
    Dim regCuenta As Long, regEntidad As Long, regCategoria As Long, regSegmento As Long
    Dim regTipoDH As Long, regMonto As Long, regMoneda As Long, regTasa As Long, regIDDeuda As Long
    regCuenta = colIdx(tbReg, "Cuenta")
    regEntidad = colIdx(tbReg, "Entidad")
    regCategoria = colIdx(tbReg, "Categoría")
    regSegmento = colIdx(tbReg, "Segmento")
    regTipoDH = colIdx(tbReg, "Tipo_DH")
    regMonto = colIdx(tbReg, "Monto")
    regMoneda = colIdx(tbReg, "Moneda")
    regTasa = colIdx(tbReg, "Tasa")
    regIDDeuda = colIdx(tbReg, "ID_Deuda")

    ' Índices LIBRO_MAYOR por nombre
    Dim mayIDLote As Long, mayFecha As Long, mayCuenta As Long, mayEntidad As Long
    Dim mayCategoria As Long, maySegmento As Long, mayMoneda As Long
    Dim mayDebeOrig As Long, mayHaberOrig As Long, mayTasa As Long
    Dim maySocios As Long, mayIDDeuda As Long, mayRefChat As Long, mayDescrip As Long, mayEstado As Long
    mayIDLote = colIdx(tbMayor, "ID_Lote")
    mayFecha = colIdx(tbMayor, "Fecha")
    mayCuenta = colIdx(tbMayor, "Cuenta")
    mayEntidad = colIdx(tbMayor, "Entidad")
    mayCategoria = colIdx(tbMayor, "Categoria")
    maySegmento = colIdx(tbMayor, "Segmento")
    mayMoneda = colIdx(tbMayor, "Moneda")
    mayDebeOrig = colIdx(tbMayor, "Debe_Original")
    mayHaberOrig = colIdx(tbMayor, "Haber_Original")
    mayTasa = colIdx(tbMayor, "Tasa")
    maySocios = colIdx(tbMayor, "Socios_Participantes")
    mayIDDeuda = colIdx(tbMayor, "ID_Deuda")
    mayRefChat = colIdx(tbMayor, "Ref_Chat")
    mayDescrip = colIdx(tbMayor, "Descripcion")
    mayEstado = colIdx(tbMayor, "Estado_Registro")

    fecha = wsReg.Range("B1").Value
    idLote = wsReg.Range("B2").Value
    socios = wsReg.Range("B3").Value
    refChat = wsReg.Range("B4").Value
    descrip = wsReg.Range("B5").Value
    estado = wsReg.Range("B6").Value

    If InStr(estado, "Balanceado") = 0 Then
        MsgBox "El lote no está balanceado." & vbCrLf & _
               "Estado actual: " & estado & vbCrLf & _
               "Corrige las líneas antes de guardar.", vbCritical, "Error al guardar"
        Exit Sub
    End If

    ' Validar: al menos 2 líneas con monto > 0 y Segmento no vacío
    nLineas = 0
    For i = 1 To tbReg.ListRows.Count
        If IsNumeric(tbReg.ListRows(i).Range.Cells(1, regMonto).Value) Then
            If tbReg.ListRows(i).Range.Cells(1, regMonto).Value > 0 Then
                nLineas = nLineas + 1
                If Trim(CStr(tbReg.ListRows(i).Range.Cells(1, regSegmento).Value)) = "" Then
                    MsgBox "Falta Segmento en la línea " & i & ".", vbCritical, "Segmento obligatorio"
                    Exit Sub
                End If
            End If
        End If
    Next i

    If nLineas < 2 Then
        MsgBox "Un lote debe tener al menos 2 líneas con monto > 0.", vbCritical, "Error"
        Exit Sub
    End If

    If MsgBox("¿Guardar lote " & idLote & " con " & nLineas & " líneas?", _
              vbQuestion + vbYesNo, "Confirmar guardado") = vbNo Then Exit Sub

    Application.ScreenUpdating = False

    Dim cuenta As String, entidad As String, categoria As String, segmento As String, tipoDH As String
    Dim monto As Double, moneda As String, tasa As Double, idDeuda As String
    Dim tasaVigente As Double, spread As Double
    Dim alertaSpread As Boolean: alertaSpread = False
    Dim divisaAlerta As String, tasaAlerta As Double, spreadAlerta As Double

    For i = 1 To tbReg.ListRows.Count
        With tbReg.ListRows(i).Range
            cuenta = .Cells(1, regCuenta).Value
            If cuenta <> "" And IsNumeric(.Cells(1, regMonto).Value) Then
                If .Cells(1, regMonto).Value > 0 Then
                    entidad = .Cells(1, regEntidad).Value
                    categoria = .Cells(1, regCategoria).Value
                    segmento = .Cells(1, regSegmento).Value
                    tipoDH = .Cells(1, regTipoDH).Value
                    monto = .Cells(1, regMonto).Value
                    moneda = .Cells(1, regMoneda).Value
                    tasa = .Cells(1, regTasa).Value
                    idDeuda = .Cells(1, regIDDeuda).Value

                    Set nuevaFila = tbMayor.ListRows.Add
                    With nuevaFila.Range
                        .Cells(1, mayIDLote).Value = idLote
                        .Cells(1, mayFecha).Value = fecha
                        .Cells(1, mayCuenta).Value = cuenta
                        ' Codigo_Cuenta y Clase son fórmulas auto-heredadas
                        .Cells(1, mayEntidad).Value = entidad
                        .Cells(1, mayCategoria).Value = categoria
                        .Cells(1, maySegmento).Value = segmento
                        .Cells(1, mayMoneda).Value = moneda
                        If tipoDH = "D" Then
                            .Cells(1, mayDebeOrig).Value = monto
                            .Cells(1, mayHaberOrig).Value = 0
                        Else
                            .Cells(1, mayDebeOrig).Value = 0
                            .Cells(1, mayHaberOrig).Value = monto
                        End If
                        .Cells(1, mayTasa).Value = tasa
                        ' Debe_USD y Haber_USD son fórmulas auto-heredadas
                        .Cells(1, maySocios).Value = socios
                        .Cells(1, mayIDDeuda).Value = idDeuda
                        .Cells(1, mayRefChat).Value = refChat
                        .Cells(1, mayDescrip).Value = descrip
                        .Cells(1, mayEstado).Value = "Activo"
                    End With

                    ' Registrar historial tasas
                    If moneda <> "USD" Then
                        tasaVigente = Application.WorksheetFunction.IfError( _
                            Application.WorksheetFunction.XLookup(moneda, _
                                ThisWorkbook.Sheets("TASAS").Range("tb_tasas_vigentes[divisa]"), _
                                ThisWorkbook.Sheets("TASAS").Range("tb_tasas_vigentes[tasa_vs_USD]")), _
                            0)

                        If tasaVigente > 0 Then
                            spread = (tasa - tasaVigente) / tasaVigente
                            Dim histRow As ListRow
                            Set histRow = tbHist.ListRows.Add
                            With histRow.Range
                                .Cells(1, 1).Value = fecha
                                .Cells(1, 2).Value = idLote
                                .Cells(1, 3).Value = moneda
                                .Cells(1, 4).Value = tasa
                                .Cells(1, 5).Value = tasaVigente
                                .Cells(1, 6).Value = spread
                                .Cells(1, 7).Value = "transaccion"
                            End With
                            If Abs(spread) > 0.03 And Not alertaSpread Then
                                alertaSpread = True
                                divisaAlerta = moneda
                                tasaAlerta = tasa
                                spreadAlerta = spread
                            End If
                        End If
                    End If
                End If
            End If
        End With
    Next i

    If alertaSpread Then
        Dim resp As VbMsgBoxResult
        resp = MsgBox("La tasa para " & divisaAlerta & " (" & Format(tasaAlerta, "#,##0.0000") & _
                      ") difiere " & Format(spreadAlerta, "0.00%") & _
                      " de la vigente." & vbCrLf & vbCrLf & _
                      "¿Actualizar tasa vigente?", vbQuestion + vbYesNo, "Alerta de spread")
        If resp = vbYes Then
            Call ActualizarTasaVigenteDesde(divisaAlerta, tasaAlerta)
        End If
    End If

    Call LimpiarRegistro

    Application.ScreenUpdating = True
    MsgBox "Lote " & idLote & " guardado exitosamente (" & nLineas & " líneas).", vbInformation
End Sub


' ============================================================
' Utilidad: Limpiar REGISTRO_RAPIDO (solo columnas de entrada del usuario)
' ============================================================
Sub LimpiarRegistro()
    Dim wsReg As Worksheet, tb As ListObject
    Set wsReg = ThisWorkbook.Sheets("REGISTRO_RAPIDO")
    Set tb = wsReg.ListObjects("tb_registro_rapido")

    wsReg.Range("B3").ClearContents
    wsReg.Range("B4").ClearContents
    wsReg.Range("B5").ClearContents

    ' Lista de columnas de entrada (no fórmulas calculadas)
    Dim columnasInput(0 To 8) As String
    columnasInput(0) = "Cuenta"
    columnasInput(1) = "Entidad"
    columnasInput(2) = "Categoría"
    columnasInput(3) = "Segmento"
    columnasInput(4) = "Tipo_DH"
    columnasInput(5) = "Monto"
    columnasInput(6) = "USD_Manual_Debe"
    columnasInput(7) = "USD_Manual_Haber"
    columnasInput(8) = "ID_Deuda"

    Dim i As Long, j As Long, idxCol As Long
    For i = tb.ListRows.Count To 1 Step -1
        For j = 0 To 8
            idxCol = colIdx(tb, columnasInput(j))
            tb.ListRows(i).Range.Cells(1, idxCol).ClearContents
        Next j
    Next i
End Sub


' ============================================================
' Utilidad: actualizar tasa vigente (parametrizado)
' ============================================================
Sub ActualizarTasaVigenteDesde(divisa As String, nuevaTasa As Double)
    Dim ws As Worksheet, tb As ListObject, i As Long
    Set ws = ThisWorkbook.Sheets("TASAS")
    Set tb = ws.ListObjects("tb_tasas_vigentes")

    ' Índices por nombre
    Dim colDivisa As Long, colTasa As Long, colFecha As Long, colUser As Long, colFuente As Long
    colDivisa = colIdx(tb, "divisa")
    colTasa = colIdx(tb, "tasa_vs_USD")
    colFecha = colIdx(tb, "ultima_actualizacion")
    colUser = colIdx(tb, "actualizada_por")
    colFuente = colIdx(tb, "fuente_ultima")

    For i = 1 To tb.ListRows.Count
        If tb.ListRows(i).Range.Cells(1, colDivisa).Value = divisa Then
            tb.ListRows(i).Range.Cells(1, colTasa).Value = nuevaTasa
            tb.ListRows(i).Range.Cells(1, colFecha).Value = Now
            tb.ListRows(i).Range.Cells(1, colUser).Value = Environ("USERNAME")
            tb.ListRows(i).Range.Cells(1, colFuente).Value = "manual"

            Dim tbHist As ListObject, histRow As ListRow
            Set tbHist = ws.ListObjects("tb_tasas_historial")
            Set histRow = tbHist.ListRows.Add
            With histRow.Range
                .Cells(1, 1).Value = Now
                .Cells(1, 2).Value = ""
                .Cells(1, 3).Value = divisa
                .Cells(1, 4).Value = nuevaTasa
                .Cells(1, 5).Value = nuevaTasa
                .Cells(1, 6).Value = 0
                .Cells(1, 7).Value = "actualizacion_manual"
            End With
            Exit For
        End If
    Next i
End Sub


' ============================================================
' MACRO 2: ActualizarTasaVigente (interactivo)
' ============================================================
Sub ActualizarTasaVigente()
    Dim divisa As String, tasaStr As String, tasa As Double
    divisa = InputBox("Divisa a actualizar (USDT, Bs, Oro, EUR):", "Actualizar tasa vigente")
    If divisa = "" Then Exit Sub
    tasaStr = InputBox("Nueva tasa vs USD para " & divisa & ":", "Actualizar tasa")
    If tasaStr = "" Then Exit Sub
    If Not IsNumeric(tasaStr) Then
        MsgBox "Tasa inválida", vbCritical: Exit Sub
    End If
    tasa = CDbl(tasaStr)
    Call ActualizarTasaVigenteDesde(divisa, tasa)
    MsgBox "Tasa de " & divisa & " actualizada a " & Format(tasa, "#,##0.0000"), vbInformation
End Sub


' ============================================================
' Helper: escribir línea pre-rellenada en REGISTRO_RAPIDO por nombre de columna
' ============================================================
Private Sub EscribirLinea(tb As ListObject, fila As Long, _
                          cuenta As String, entidad As String, categoria As String, _
                          segmento As String, tipoDH As String, monto As Double)
    With tb.ListRows(fila).Range
        .Cells(1, colIdx(tb, "Cuenta")).Value = cuenta
        .Cells(1, colIdx(tb, "Entidad")).Value = entidad
        .Cells(1, colIdx(tb, "Categoría")).Value = categoria
        .Cells(1, colIdx(tb, "Segmento")).Value = segmento
        .Cells(1, colIdx(tb, "Tipo_DH")).Value = tipoDH
        .Cells(1, colIdx(tb, "Monto")).Value = monto
    End With
End Sub


' ============================================================
' MACRO 3: GenerarAsientoPacto
' Asociar a botón en REPORTE_BARRIDO
' ============================================================
Sub GenerarAsientoPacto()
    Dim wsRB As Worksheet, wsReg As Worksheet, tb As ListObject
    Set wsRB = ThisWorkbook.Sheets("REPORTE_BARRIDO")
    Set wsReg = ThisWorkbook.Sheets("REGISTRO_RAPIDO")
    Set tb = wsReg.ListObjects("tb_registro_rapido")

    Dim asigManuel As Double, asigAndreina As Double, asigMichelle As Double
    asigManuel = wsRB.Range("B29").Value
    asigAndreina = wsRB.Range("B30").Value
    asigMichelle = wsRB.Range("B31").Value

    Dim total As Double: total = asigManuel + asigAndreina + asigMichelle
    Dim pendiente As Double: pendiente = wsRB.Range("B33").Value

    If Abs(total - pendiente) > 0.01 Then
        MsgBox "El total asignado (" & Format(total, "#,##0.00") & _
               ") no coincide con el pendiente (" & Format(pendiente, "#,##0.00") & ").", _
               vbCritical, "Descuadre"
        Exit Sub
    End If

    If total <= 0 Then
        MsgBox "No hay nada para pactar.", vbExclamation
        Exit Sub
    End If

    If wsReg.Range("B6").Value <> "Vacío" Then
        If MsgBox("REGISTRO_RAPIDO no está vacío. ¿Limpiar y generar asiento de pacto?", _
                  vbQuestion + vbYesNo, "Confirmar") = vbNo Then Exit Sub
        Call LimpiarRegistro
    End If

    Dim socios As String: socios = ""
    If asigManuel > 0 Then socios = socios & "Manuel, "
    If asigAndreina > 0 Then socios = socios & "Andreina, "
    If asigMichelle > 0 Then socios = socios & "Michelle, "
    If Right(socios, 2) = ", " Then socios = Left(socios, Len(socios) - 2)

    wsReg.Range("B3").Value = socios
    wsReg.Range("B5").Value = "Pacto de utilidades " & Format(Date, "dd/mm/yyyy")

    Dim linea As Long: linea = 1
    Call EscribirLinea(tb, linea, "Utilidad Distribuible", "", "Pacto Utilidades", "General", "D", total)
    linea = linea + 1

    If asigMichelle > 0 Then
        Call EscribirLinea(tb, linea, "Cta. Corriente Michelle", "Michelle", "Pacto Utilidades", "General", "H", asigMichelle)
        linea = linea + 1
    End If
    If asigManuel > 0 Then
        Call EscribirLinea(tb, linea, "Cta. Corriente Manuel", "Manuel", "Pacto Utilidades", "General", "H", asigManuel)
        linea = linea + 1
    End If
    If asigAndreina > 0 Then
        Call EscribirLinea(tb, linea, "Cta. Corriente Andreina", "Andreina", "Pacto Utilidades", "General", "H", asigAndreina)
    End If

    wsReg.Activate
    MsgBox "Asiento de pacto pre-llenado en REGISTRO_RAPIDO." & vbCrLf & _
           "Verifica y pulsa 'Guardar Lote'.", vbInformation
End Sub


' ============================================================
' MACRO 4: RevalorizarCuenta
' ============================================================
Sub RevalorizarCuenta()
    Dim cuenta As String
    cuenta = InputBox("Cuenta a revalorizar (nombre exacto):", "Revalorizar")
    If cuenta = "" Then Exit Sub

    Dim wsSaldos As Worksheet, wsReg As Worksheet
    Set wsSaldos = ThisWorkbook.Sheets("SALDOS_Y_ENTIDADES")
    Set wsReg = ThisWorkbook.Sheets("REGISTRO_RAPIDO")

    Dim ganancia As Double
    ganancia = Application.WorksheetFunction.IfError( _
        Application.WorksheetFunction.XLookup(cuenta, _
            wsSaldos.Range("B3:B22"), wsSaldos.Range("O3:O22")), 0)

    If Abs(ganancia) < 0.01 Then
        MsgBox "No hay ganancia/pérdida latente para " & cuenta, vbInformation
        Exit Sub
    End If

    Call LimpiarRegistro
    wsReg.Range("B5").Value = "Revalorización " & cuenta

    Dim tb As ListObject
    Set tb = wsReg.ListObjects("tb_registro_rapido")

    If ganancia > 0 Then
        Call EscribirLinea(tb, 1, cuenta, "", "Revalorización", "General", "D", 0)
        Call EscribirLinea(tb, 2, "Ganancia por Revalorización", "", "Revalorización", "General", "H", ganancia)
    Else
        Call EscribirLinea(tb, 1, "Pérdida por Revalorización", "", "Revalorización", "General", "D", Abs(ganancia))
        Call EscribirLinea(tb, 2, cuenta, "", "Revalorización", "General", "H", 0)
    End If

    wsReg.Activate
    MsgBox "Asiento de revalorización pre-llenado." & vbCrLf & _
           "Ganancia/Pérdida latente: " & Format(ganancia, "#,##0.00") & " USD", vbInformation
End Sub
