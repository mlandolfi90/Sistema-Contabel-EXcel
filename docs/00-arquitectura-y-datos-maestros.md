# Arquitectura y Datos Maestros — Sistema Contable Multidivisa V2 (Excel + VBA)

> Documento maestro de referencia para NotebookLM. Describe la arquitectura general del libro de Excel, las hojas que lo componen, las tablas estructuradas (`ListObjects`), los datos maestros y el flujo de información entre módulos.

---

## 1. Visión general del sistema

Se trata de un **sistema contable multidivisa** implementado sobre un único libro de Excel con macros VBA. Está diseñado para:

- Registrar **lotes de asientos contables** (cada lote con múltiples líneas Debe/Haber).
- Operar en **múltiples monedas** (USD como moneda base; USDT, Bs, Oro, EUR como divisas operativas) con conversión mediante **tasas vs USD** vigentes e historial.
- Mantener un **Libro Mayor** acumulativo con columnas originales y convertidas a USD.
- Gestionar **lotes activos / anulados** con trazabilidad completa (corrección y duplicación sin pérdida de historial).
- Generar **asientos automáticos**: pacto de utilidades entre socios, revalorización por tasa.
- Auditar lotes ya registrados mediante una hoja de navegación (anterior/siguiente, acción inteligente).

## 2. Socios del negocio

Los socios participantes identificados en el código son tres:

- **Socio01**
- **Socio02**
- **Socio03**

Cada uno tiene una **Cuenta Corriente** nominada (`Cta. Corriente Socio01`, `Cta. Corriente Socio02`, `Cta. Corriente Socio03`) usada como contrapartida de la cuenta `Utilidad Distribuible` en los asientos de pacto.

## 3. Hojas del libro

El libro contiene al menos las siguientes hojas (nombres tal como los invoca el código VBA, `ThisWorkbook.Sheets("…")`):

| Hoja | Rol | Tipo |
|---|---|---|
| `REGISTRO_RAPIDO` | Formulario de captura de lotes nuevos | Operativa / entrada |
| `LIBRO_MAYOR` | Libro mayor acumulativo de todos los asientos registrados | Operativa / almacenamiento principal |
| `TASAS` | Tasas vigentes vs USD + historial de tasas aplicadas | Datos maestros + histórico |
| `AUDITOR_LOTES` | Navegación y acción sobre lotes ya registrados | Operativa / auditoría |
| `REPORTE_BARRIDO` | Cálculo de reparto de utilidades entre socios | Reporte / generador |
| `SALDOS_Y_ENTIDADES` | Saldos por cuenta y ganancia/pérdida latente por revalorizar | Reporte |

En el proyecto VBA exportado aparecen además 17 hojas adicionales identificadas genéricamente como `Hoja16` … `Hoja32`. Sus módulos de código están vacíos (solo contienen el encabezado de clase VBA), por lo que su contenido funcional vive exclusivamente en el libro de Excel (celdas, tablas, fórmulas), no en VBA.

## 4. Tablas estructuradas (ListObjects)

El sistema usa **tablas con nombre** de Excel (`ListObject`) para robustecer las referencias. El código está **refactorizado para usar nombres de columna** (no posiciones), mediante el helper `colIdx(tb, nombreColumna)`.

### 4.1 `tb_registro_rapido` — hoja `REGISTRO_RAPIDO`

Tabla de captura. Contiene las líneas del lote que se está preparando antes de guardar.

**Capacidad física**: 20 filas (tope duro por regla de negocio — ver §9.9). La tabla debe tener al menos 20 `ListRows` disponibles para que Corrección/Duplicación desde `AUDITOR_LOTES` puedan repoblar cualquier lote legítimo sin truncar.

**Columnas de entrada del usuario** (limpiadas por `LimpiarRegistro`):

- `Cuenta`
- `Entidad`
- `Categoría` (con tilde)
- `Segmento`
- `Tipo_DH` — valores `"D"` (Debe) o `"H"` (Haber)
- `Monto`
- `USD_Manual_Debe`
- `USD_Manual_Haber`
- `ID_Deuda`

**Columnas adicionales usadas en el flujo**: `Moneda`, `Tasa`.

**Cabecera del lote** (celdas fijas de la hoja, no de la tabla):

- `B1` → Fecha del lote
- `B2` → ID_Lote
- `B3` → Socios participantes — **celda especial con UX de multi-selección tipo toggle** implementada en el código de hoja (`Hoja3.cls`, handlers `Worksheet_Change` y `Worksheet_SelectionChange`). Cada clic en el dropdown agrega el socio si no estaba o lo quita si ya estaba, construyendo una lista separada por `", "`. El `Comment` oculto de la celda se usa como memoria del valor anterior.
- `B4` → Ref_Chat
- `B5` → Descripción
- `B6` → Estado del lote (debe contener la cadena `"Balanceado"` para poder guardar; también `"Vacío"` cuando no hay lote en curso)

### 4.2 `tb_mayor` — hoja `LIBRO_MAYOR`

Libro mayor acumulativo. Cada fila = una línea contable registrada.

**Columnas**:

- `ID_Lote`
- `Fecha`
- `Cuenta`
- `Codigo_Cuenta` — fórmula auto-heredada (no se escribe por macro)
- `Clase` — fórmula auto-heredada
- `Entidad`
- `Categoria` (sin tilde, a diferencia de `tb_registro_rapido`)
- `Segmento`
- `Moneda`
- `Debe_Original`
- `Haber_Original`
- `Tasa`
- `Debe_USD` — fórmula auto-heredada
- `Haber_USD` — fórmula auto-heredada
- `Socios_Participantes`
- `ID_Deuda`
- `Ref_Chat`
- `Descripcion`
- `Estado_Registro` — valores `"Activo"` o `"Anulado"`

**Convención Debe/Haber**: si `Tipo_DH = "D"` entonces `Debe_Original = Monto` y `Haber_Original = 0`; si `"H"`, al revés.

### 4.3 `tb_tasas_vigentes` — hoja `TASAS`

Datos maestros de tasas de cambio actuales.

**Columnas**:

- `divisa` — divisas conocidas: `USDT`, `Bs`, `Oro`, `EUR` (USD es la base y no requiere fila)
- `tasa_vs_USD`
- `ultima_actualizacion` — timestamp (`Now`)
- `actualizada_por` — se rellena con `Environ("USERNAME")` de Windows
- `fuente_ultima` — valores observados: `"manual"`

### 4.4 `tb_tasas_historial` — hoja `TASAS`

Bitácora de tasas aplicadas en cada registro o actualización.

**Columnas (por posición; en el código se referencian por índice 1..7)**:

1. Fecha
2. ID_Lote (vacío si es actualización manual)
3. Divisa
4. Tasa aplicada
5. Tasa vigente en ese momento
6. Spread = `(tasa - tasaVigente) / tasaVigente`
7. Tipo — `"transaccion"` o `"actualizacion_manual"`

**Regla de alerta**: si `|spread| > 3%` (0.03) en una transacción, se ofrece al usuario actualizar la tasa vigente con la tasa del lote.

## 5. Rangos con nombre relevantes

- `IDs_Unicos` — rango en la hoja `AUDITOR_LOTES` con la lista ordenada (descendente) de IDs de lote únicos.
- `AZ2`, `AZ3`, … — celdas auxiliares en `AUDITOR_LOTES` donde se expande la lista ordenada de IDs (el lote más reciente está en `AZ2`).

## 6. Celdas fijas por hoja

### `REGISTRO_RAPIDO`

- `B1` Fecha · `B2` ID_Lote · `B3` Socios · `B4` Ref_Chat · `B5` Descripción · `B6` Estado

### `AUDITOR_LOTES`

- `B4` ID_Lote seleccionado (navegable)
- `B11` Estado del lote visible (`"Activo"` / `"Anulado"`)
- Rango `IDs_Unicos` y columna auxiliar `AZ`

### `REPORTE_BARRIDO`

- `B29` Asignación a Socio01
- `B30` Asignación a Socio02
- `B31` Asignación a Socio03
- `B33` Monto pendiente de pactar (debe igualar la suma de las tres asignaciones, tolerancia 0.01)

### `SALDOS_Y_ENTIDADES`

- Rango `B3:B22` — nombres de cuenta
- Rango `O3:O22` — ganancia/pérdida latente en USD por cuenta (entrada para revalorización)

## 7. Flujo de datos principal

```
   Usuario captura líneas
          │
          ▼
  REGISTRO_RAPIDO  ──►  validación (balance + ≥2 líneas + Segmento)
  (tb_registro_rapido)         │
                               ▼
                     GuardarLote() copia línea a línea
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
       LIBRO_MAYOR        TASAS.historial     Alerta spread
       (tb_mayor)         (tb_tasas_historial)  (si >3%)
                               │
                               ▼
                     ¿actualizar tasa vigente?
                               │
                               ▼
                   tb_tasas_vigentes
```

## 8. Macros públicas (botones esperados)

Las macros públicas (a conectar con botones de hoja) son:

- **`GuardarLote`** — botón "💾 Guardar Lote" en `REGISTRO_RAPIDO`.
- **`LimpiarRegistro`** — reinicia el formulario de captura.
- **`ActualizarTasaVigente`** — diálogo interactivo para cambiar tasa de una divisa.
- **`GenerarAsientoPacto`** — botón en `REPORTE_BARRIDO`; prellena en `REGISTRO_RAPIDO` el asiento de distribución de utilidades entre los socios.
- **`RevalorizarCuenta`** — diálogo que prellena un asiento de revalorización tomando la ganancia/pérdida latente desde `SALDOS_Y_ENTIDADES`.
- **`LoteAnterior` / `LoteSiguiente`** — navegación cronológica en `AUDITOR_LOTES`.
- **`AccionSobreLoteVisible`** — botón inteligente: si el lote está Activo lanza `CorregirLoteConID`; si está Anulado lanza `DuplicarLoteConID`.
- **`ExportarTodoVBA`** — utilidad que exporta todos los componentes VBA del proyecto a una carpeta `VBA_Export` junto al libro.

## 9. Reglas de negocio clave

1. **Un lote no se guarda si no está balanceado** (la celda `B6` de `REGISTRO_RAPIDO` debe contener la palabra `"Balanceado"`; esa celda se alimenta de fórmulas de la hoja).
2. **Mínimo 2 líneas con `Monto > 0`** y **`Segmento` obligatorio** en cada línea con monto.
3. **Corrección de lotes** = anular el original (añade `[ANULADO: motivo]` a `Descripcion` y fija `Estado_Registro = "Anulado"`) y precargar un nuevo lote editable en `REGISTRO_RAPIDO`.
4. **Duplicación de lotes** = cargar las líneas en `REGISTRO_RAPIDO` con descripción `"DUPLICADO de <ID>: …"` sin tocar el original.
5. **Pacto de utilidades**: débito único a `Utilidad Distribuible` y créditos a las `Cta. Corriente <Socio>` que tengan asignación > 0. Socios incluidos en el pacto: Socio01, Socio02, Socio03.
6. **Revalorización**: ganancia latente → débito a la cuenta revaluada y crédito a `Ganancia por Revalorización`; pérdida → débito a `Pérdida por Revalorización` y crédito a la cuenta.
7. **Alerta de spread**: si al registrar una línea en divisa no-USD la tasa ingresada difiere de la vigente en más del 3%, el sistema ofrece actualizar la tasa vigente.
8. **USD no tiene conversión**: las líneas en USD no se registran en `tb_tasas_historial`.
9. **Tope de 20 líneas por lote**: un asiento contable no puede superar 20 líneas. Este tope es **regla de negocio**, no limitación técnica, y debe respetarse tanto en captura (`tb_registro_rapido` tiene 20 filas físicas) como en operaciones derivadas (Corrección/Duplicación desde `AUDITOR_LOTES` abortan con mensaje si el lote original excede el tope). Cambiar el tope requiere sincronizar: capacidad física de la tabla, constante `MAX_LINEAS_LOTE` en Módulo2, y revisión del balanceo visible en la hoja.

## 10. Componentes VBA del proyecto

El proyecto VBA, inventariado por `ExportarTodoVBA_Completo` (Módulo3), tiene **35 componentes totales**, de los cuales **solo 4 contienen código**:

### 10.1 Componentes con código (4)

- **`Módulo1.bas`** (módulo estándar, `Type = 1`) — núcleo contable: `GuardarLote`, `LimpiarRegistro`, `ActualizarTasaVigente`, `GenerarAsientoPacto`, `RevalorizarCuenta`.
- **`Módulo2.bas`** (módulo estándar, `Type = 1`) — auditor de lotes: `LoteAnterior`, `LoteSiguiente`, `AccionSobreLoteVisible`, `DuplicarLoteConID`, `CorregirLoteConID`.
- **`Módulo3.bas`** (módulo estándar, `Type = 1`) — utilidad de exportación: `ExportarTodoVBA_Completo`.
- **`Hoja3.cls`** (código de hoja, `Type = 100`) — **CodeName `Hoja3` = hoja visible `REGISTRO_RAPIDO`**. Contiene `Worksheet_Change` y `Worksheet_SelectionChange` que implementan la selección múltiple tipo toggle sobre la celda `B3` (Socios participantes) usando el `Comment` oculto de la celda como memoria del valor previo.

### 10.2 Componentes vacíos (31)

`ThisWorkbook` y las demás hojas (`Hoja1`, `Hoja2`, `Hoja4`, …, `Hoja32`) no tienen código.

## 11. Divisas soportadas

- `USD` (base, sin conversión)
- `USDT`
- `Bs` (bolívares)
- `Oro`
- `EUR`

## 12. Dependencias técnicas

- Excel de escritorio (Windows) con **VBA habilitado**.
- Funciones: `XLookup`, `IfError`, `SORT`, tablas `ListObject`.

## 13. Glosario rápido

- **Lote**: conjunto balanceado de líneas contables guardado bajo un mismo `ID_Lote` (máximo 20 líneas).
- **Spread**: desviación porcentual entre la tasa usada en un asiento y la tasa vigente.
- **Revalorización**: asiento que refleja ganancia/pérdida latente por variación de tasa.
- **Pacto**: asiento de distribución de utilidades entre los socios.
- **Anulado**: fila del mayor marcada como `Estado_Registro = "Anulado"`.
