Attribute VB_Name = "Módulo2"

' ============================================================
' MÓDULO2 — AUDITOR DE LOTES
' Navegación cronológica + Corrección + Duplicación de lotes ya guardados.
' Source of truth: este archivo. El .xlsm debe importar/sincronizar desde aquí.
'
' Dependencias externas:
'   - Módulo1.colIdx(tb, nombreColumna)
'   - Módulo1.LimpiarRegistro
'
' Hojas/tablas que toca:
'   - AUDITOR_LOTES (B4 ID, B11 estado, IDs_Unicos, AZ aux)
'   - LIBRO_MAYOR / tb_mayor   (lectura + anulación)
'   - REGISTRO_RAPIDO / tb_registro_rapido (escritura)
' ============================================================

Option Explicit

' Tope duro de líneas por lote (regla de negocio, ver docs/00 §9.9 y issue #11)
' Si se sube este valor, sincronizar también: capacidad física de tb_registro_rapido.
Public Const MAX_LINEAS_LOTE As Long = 20


' --- Botón ◀ Anterior (cronológicamente = más antiguo = siguiente en array SORT desc)
Sub LoteAnterior()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("AUDITOR_LOTES")
    Dim pos As Variant
    pos = Application.Match(ws.Range("B4").Value, ws.Range("IDs_Unicos"), 0)
    If IsError(pos) Then
        ws.Range("B4").Value = ws.Range("AZ2").Value
    Else
        Dim nuevaPos As Long
        nuevaPos = CLng(pos) + 1
        If nuevaPos > Application.WorksheetFunction.CountA(ws.Range("IDs_Unicos")) Then
            MsgBox "Ya estás en el lote más antiguo.", vbInformation
            Exit Sub
        End If
        ws.Range("B4").Value = ws.Range("AZ" & (nuevaPos + 1)).Value
    End If
End Sub


' --- Botón ▶ Siguiente (cronológicamente = más reciente = anterior en array SORT desc)
Sub LoteSiguiente()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("AUDITOR_LOTES")
    Dim pos As Variant
    pos = Application.Match(ws.Range("B4").Value, ws.Range("IDs_Unicos"), 0)
    If IsError(pos) Then
        ws.Range("B4").Value = ws.Range("AZ2").Value
    Else
        Dim nuevaPos As Long
        nuevaPos = CLng(pos) - 1
        If nuevaPos < 1 Then
            MsgBox "Ya estás en el lote más reciente.", vbInformation
            Exit Sub
        End If
        ws.Range("B4").Value = ws.Range("AZ" & (nuevaPos + 1)).Value
    End If
End Sub


' --- Botón inteligente: Corrige si Activo, Duplica si Anulado
Sub AccionSobreLoteVisible()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("AUDITOR_LOTES")
    Dim idLote As String, estado As String
    idLote = ws.Range("B4").Value
    estado = ws.Range("B11").Value

    If idLote = "" Then
        MsgBox "No hay lote seleccionado.", vbExclamation
        Exit Sub
    End If

    If estado = "Anulado" Then
        Call DuplicarLoteConID(idLote)
    ElseIf estado = "Activo" Then
        Call CorregirLoteConID(idLote)
    Else
        MsgBox "Estado del lote desconocido: " & estado, vbCritical
    End If
End Sub


' ============================================================
' Helper: contar e indexar las filas de tb_mayor que pertenecen a un lote.
' Devuelve el array filasLote dimensionado al tamaño exacto.
' Si el conteo supera MAX_LINEAS_LOTE devuelve -1 en filasEncontradas
' (señal de aborto para el caller).
' ============================================================
Private Function ContarFilasLote(tbMayor As ListObject, mIDLote As Long, _
                                  idLote As String, _
                                  ByRef filasLote() As Long, _
                                  ByRef filasEncontradas As Long) As Boolean
    Dim i As Long, k As Long

    ' Primera pasada: contar
    filasEncontradas = 0
    For i = 1 To tbMayor.ListRows.Count
        If tbMayor.ListRows(i).Range.Cells(1, mIDLote).Value = idLote Then
            filasEncontradas = filasEncontradas + 1
        End If
    Next i

    If filasEncontradas = 0 Then
        ContarFilasLote = False
        Exit Function
    End If

    If filasEncontradas > MAX_LINEAS_LOTE Then
        MsgBox "El lote " & idLote & " tiene " & filasEncontradas & _
               " líneas, supera el tope de " & MAX_LINEAS_LOTE & " por lote." & vbCrLf & _
               "Operación abortada. Revisa si el lote original es legítimo o si " & _
               "hubo una migración masiva mal formada.", vbCritical, "Tope excedido"
        filasEncontradas = -1
        ContarFilasLote = False
        Exit Function
    End If

    ' Segunda pasada: indexar con tamaño exacto
    ReDim filasLote(1 To filasEncontradas)
    k = 0
    For i = 1 To tbMayor.ListRows.Count
        If tbMayor.ListRows(i).Range.Cells(1, mIDLote).Value = idLote Then
            k = k + 1
            filasLote(k) = i
        End If
    Next i

    ContarFilasLote = True
End Function


' ============================================================
' Helper: copiar una línea del LIBRO_MAYOR a REGISTRO_RAPIDO (por nombre de columna)
' ============================================================
Private Sub CopiarLineaMayorARegistro(tbMayor As ListObject, filaMayor As Long, _
                                       tbReg As ListObject, filaReg As Long)
    ' Índices mayor
    Dim mCuenta As Long, mEntidad As Long, mCategoria As Long, mSegmento As Long
    Dim mDebeOrig As Long, mHaberOrig As Long
    mCuenta = colIdx(tbMayor, "Cuenta")
    mEntidad = colIdx(tbMayor, "Entidad")
    mCategoria = colIdx(tbMayor, "Categoria")
    mSegmento = colIdx(tbMayor, "Segmento")
    mDebeOrig = colIdx(tbMayor, "Debe_Original")
    mHaberOrig = colIdx(tbMayor, "Haber_Original")

    ' Índices registro
    Dim rCuenta As Long, rEntidad As Long, rCategoria As Long, rSegmento As Long
    Dim rTipoDH As Long, rMonto As Long
    rCuenta = colIdx(tbReg, "Cuenta")
    rEntidad = colIdx(tbReg, "Entidad")
    rCategoria = colIdx(tbReg, "Categoría")
    rSegmento = colIdx(tbReg, "Segmento")
    rTipoDH = colIdx(tbReg, "Tipo_DH")
    rMonto = colIdx(tbReg, "Monto")

    Dim cuenta As String, entidad As String, categoria As String, segmento As String
    Dim debeOrig As Double, haberOrig As Double

    With tbMayor.ListRows(filaMayor).Range
        cuenta = .Cells(1, mCuenta).Value
        entidad = .Cells(1, mEntidad).Value
        categoria = .Cells(1, mCategoria).Value
        segmento = .Cells(1, mSegmento).Value
        debeOrig = .Cells(1, mDebeOrig).Value
        haberOrig = .Cells(1, mHaberOrig).Value
    End With

    With tbReg.ListRows(filaReg).Range
        .Cells(1, rCuenta).Value = cuenta
        .Cells(1, rEntidad).Value = entidad
        .Cells(1, rCategoria).Value = categoria
        .Cells(1, rSegmento).Value = segmento
        If debeOrig > 0 Then
            .Cells(1, rTipoDH).Value = "D"
            .Cells(1, rMonto).Value = debeOrig
        Else
            .Cells(1, rTipoDH).Value = "H"
            .Cells(1, rMonto).Value = haberOrig
        End If
    End With
End Sub


' ============================================================
' Duplicar un lote sin modificar el original
' ============================================================
Sub DuplicarLoteConID(idLoteOriginal As String)
    Dim wsReg As Worksheet, wsMayor As Worksheet
    Dim tbReg As ListObject, tbMayor As ListObject
    Dim i As Long, filasEncontradas As Long

    Set wsReg = ThisWorkbook.Sheets("REGISTRO_RAPIDO")
    Set wsMayor = ThisWorkbook.Sheets("LIBRO_MAYOR")
    Set tbReg = wsReg.ListObjects("tb_registro_rapido")
    Set tbMayor = wsMayor.ListObjects("tb_mayor")

    If wsReg.Range("B6").Value <> "Vacío" And wsReg.Range("B6").Value <> "" Then
        If MsgBox("REGISTRO_RAPIDO no está vacío. ¿Descartar lo actual y duplicar?", _
                  vbQuestion + vbYesNo, "Confirmar") = vbNo Then Exit Sub
        Call LimpiarRegistro
    End If

    If MsgBox("¿Duplicar el lote " & idLoteOriginal & " en REGISTRO_RAPIDO?" & vbCrLf & _
              "(El lote original NO se modifica)", _
              vbQuestion + vbYesNo, "Duplicar lote") = vbNo Then Exit Sub

    ' Índices para buscar
    Dim mIDLote As Long, mSocios As Long, mRefChat As Long, mDescrip As Long
    mIDLote = colIdx(tbMayor, "ID_Lote")
    mSocios = colIdx(tbMayor, "Socios_Participantes")
    mRefChat = colIdx(tbMayor, "Ref_Chat")
    mDescrip = colIdx(tbMayor, "Descripcion")

    ' Validar tope ANTES de tocar nada (issue #11)
    Dim filasLote() As Long
    If Not ContarFilasLote(tbMayor, mIDLote, idLoteOriginal, filasLote, filasEncontradas) Then
        If filasEncontradas = 0 Then
            MsgBox "No se encontró el lote " & idLoteOriginal, vbCritical
        End If
        Exit Sub
    End If

    Application.ScreenUpdating = False

    Dim socios As String, refChat As String, descrip As String
    socios = tbMayor.ListRows(filasLote(1)).Range.Cells(1, mSocios).Value
    refChat = tbMayor.ListRows(filasLote(1)).Range.Cells(1, mRefChat).Value
    descrip = tbMayor.ListRows(filasLote(1)).Range.Cells(1, mDescrip).Value

    Dim posAnul As Long
    posAnul = InStr(descrip, " [ANULADO:")
    If posAnul > 0 Then descrip = Left(descrip, posAnul - 1)

    Call LimpiarRegistro
    wsReg.Range("B1").Value = Date
    wsReg.Range("B3").Value = socios
    wsReg.Range("B4").Value = refChat
    wsReg.Range("B5").Value = "DUPLICADO de " & idLoteOriginal & ": " & descrip

    Dim linea As Long: linea = 0
    For i = 1 To filasEncontradas
        linea = linea + 1
        Call CopiarLineaMayorARegistro(tbMayor, filasLote(i), tbReg, linea)
    Next i

    Application.ScreenUpdating = True
    wsReg.Activate
    wsReg.Range(wsReg.Cells(11, colIdx(tbReg, "Monto")), wsReg.Cells(11, colIdx(tbReg, "Monto"))).Select
    MsgBox "Lote " & idLoteOriginal & " duplicado en REGISTRO_RAPIDO." & vbCrLf & _
           "El original no se modificó." & vbCrLf & vbCrLf & _
           "Edita lo que necesites y pulsa 'Guardar Lote'.", vbInformation
End Sub


' ============================================================
' Corregir un lote: anula el original y pre-carga un nuevo lote editable
' ============================================================
Sub CorregirLoteConID(idLoteCorregir As String)
    Dim wsReg As Worksheet, wsMayor As Worksheet
    Dim tbReg As ListObject, tbMayor As ListObject
    Dim motivo As String, i As Long, filasEncontradas As Long

    Set wsReg = ThisWorkbook.Sheets("REGISTRO_RAPIDO")
    Set wsMayor = ThisWorkbook.Sheets("LIBRO_MAYOR")
    Set tbReg = wsReg.ListObjects("tb_registro_rapido")
    Set tbMayor = wsMayor.ListObjects("tb_mayor")

    If wsReg.Range("B6").Value <> "Vacío" And wsReg.Range("B6").Value <> "" Then
        If MsgBox("REGISTRO_RAPIDO no está vacío. ¿Descartar y continuar?", _
                  vbQuestion + vbYesNo) = vbNo Then Exit Sub
        Call LimpiarRegistro
    End If

    ' Índices
    Dim mIDLote As Long, mSocios As Long, mRefChat As Long, mDescrip As Long, mEstado As Long
    mIDLote = colIdx(tbMayor, "ID_Lote")
    mSocios = colIdx(tbMayor, "Socios_Participantes")
    mRefChat = colIdx(tbMayor, "Ref_Chat")
    mDescrip = colIdx(tbMayor, "Descripcion")
    mEstado = colIdx(tbMayor, "Estado_Registro")

    ' Validar tope ANTES de anular nada (issue #11 — crítico:
    ' si abortáramos después de anular, el lote original quedaría anulado sin reemplazo)
    Dim filasLote() As Long
    If Not ContarFilasLote(tbMayor, mIDLote, idLoteCorregir, filasLote, filasEncontradas) Then
        If filasEncontradas = 0 Then
            MsgBox "No se encontró el lote " & idLoteCorregir, vbCritical
        End If
        Exit Sub
    End If

    motivo = InputBox("Motivo de la corrección de " & idLoteCorregir & ":", "Motivo")
    If motivo = "" Then Exit Sub

    Application.ScreenUpdating = False

    Dim socios As String, refChat As String, descrip As String
    socios = tbMayor.ListRows(filasLote(1)).Range.Cells(1, mSocios).Value
    refChat = tbMayor.ListRows(filasLote(1)).Range.Cells(1, mRefChat).Value
    descrip = tbMayor.ListRows(filasLote(1)).Range.Cells(1, mDescrip).Value

    ' Anular filas del lote original
    For i = 1 To filasEncontradas
        With tbMayor.ListRows(filasLote(i)).Range
            .Cells(1, mDescrip).Value = .Cells(1, mDescrip).Value & " [ANULADO: " & motivo & "]"
            .Cells(1, mEstado).Value = "Anulado"
        End With
    Next i

    Call LimpiarRegistro
    wsReg.Range("B1").Value = Date
    wsReg.Range("B3").Value = socios
    wsReg.Range("B4").Value = refChat
    wsReg.Range("B5").Value = "CORRIGE " & idLoteCorregir & ": " & motivo & " | " & descrip

    Dim linea As Long: linea = 0
    For i = 1 To filasEncontradas
        linea = linea + 1
        Call CopiarLineaMayorARegistro(tbMayor, filasLote(i), tbReg, linea)
    Next i

    Application.ScreenUpdating = True
    wsReg.Activate
    wsReg.Range(wsReg.Cells(11, colIdx(tbReg, "Monto")), wsReg.Cells(11, colIdx(tbReg, "Monto"))).Select
    MsgBox idLoteCorregir & " anulado. Edita y guarda el nuevo lote.", vbInformation
End Sub
