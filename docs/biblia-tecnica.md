# Biblia Técnica — Entorno Excel y VBA

> Reglas **técnicas** propias del entorno Excel LTSC 2021 + VBA.
> Limitaciones de la plataforma, patrones obligatorios de implementación, layout de celdas.
>
> Para reglas **conceptuales** del sistema contable (plan de cuentas, clases, flujos, etc.), ver [`biblia-teorica.md`](biblia-teorica.md).

---

## 1. Validación de Datos con Funciones de Array Dinámico

### ❌ NO permitido

`FILTER`, `SORT`, `UNIQUE` y otras funciones de **array dinámico** **NO pueden usarse directamente** dentro del campo "Origen" de la Validación de Datos en Excel LTSC 2021.

**Ejemplo incorrecto (falla silenciosamente):**
```
Origen:  =FILTER(tb_entidades[entidad], tb_entidades[tipo_entidad]="Operador")
```

### ✅ Patrón correcto (obligatorio)

1. **Crear la lista derramada** en la hoja `CONFIG_AUX` usando `FILTER` / `SORT`.
2. **Asignar un nombre definido** a esa celda derramada usando el operador `#` (spill range).
3. **Apuntar la Validación de Datos al nombre definido.**

**Ejemplo correcto:**

**Paso 1** — en `CONFIG_AUX!X2`:
```excel
=SORT(FILTER(tb_entidades[entidad], tb_entidades[tipo_entidad]="Operador"))
```

**Paso 2** — Crear nombre en `Administrador de Nombres`:
| Nombre | Se refiere a |
|--------|--------------|
| `ListaOperadoresActivos` | `=CONFIG_AUX!$X$2#` |

**Paso 3** — en la validación de datos de la celda destino:
```
Origen:  =ListaOperadoresActivos
```

### Por qué

Excel LTSC 2021 evalúa el campo Origen de validación en un contexto "legacy" que no soporta spill ranges directamente. El nombre definido con `#` actúa como puente.

### Referencia en el repo

- Todas las listas dinámicas del sistema deben vivir en `CONFIG_AUX`.
- Ver: `docs/hojas/config-aux.md`.
- Nombres ya usados: `ListaCuentaActiva`, `ListaEntidadActiva`, `ListaCategoriaActiva`, `ListaSegmentoActiva`, `ListaSocios`, `ListaTipoDH`.

---

## 2. Layout de Celdas — Prohibido Combinar o Agrandar

### ❌ NO permitido

- **No combinar celdas** (`Merge Cells`) en ninguna hoja del libro.
- **No agrandar celdas** para simular KPIs, títulos destacados o agrupaciones visuales.

### ✅ Patrón correcto (obligatorio)

Para lograr efectos visuales de énfasis (KPIs, títulos, tarjetas destacadas):

- **Tamaño de fuente grande** en la propia celda (ej: 24-36 pt).
- **Formato de celda** (bordes, color de fondo, color de fuente, negrita).
- **Formato condicional** para cambiar colores según valor.
- **Alto/ancho de fila/columna** ajustado manualmente si es necesario, **pero sin combinar**.
- **Iconos emoji** o símbolos unicode como marcadores visuales dentro de la celda.

### Por qué

- Las celdas combinadas rompen fórmulas con referencias estructuradas y rangos.
- Impiden `SORT`, `FILTER`, y autofiltros nativos.
- Dificultan mantenimiento al insertar/eliminar filas.
- Incompatibles con tablas estructuradas (`ListObject`).
- Rompen navegación por teclado y selección de rangos.

### Alcance

Aplica a **todas las hojas del libro**: reportes, dashboards, configuraciones, hojas de captura y cualquier presentación visual.

---

## 3. Referencias: Nombres en vez de Coordenadas

Toda fórmula debe apoyarse en **rangos con nombre** o **referencias estructuradas de tabla**. Prohibidas las referencias directas a coordenadas de celda.

**Correcto:**
```
=SUMIFS(tb_mayor[Debe_USD], tb_mayor[Cuenta], "Cta. Corriente Manuel")
=XLOOKUP(idCuenta, tb_cuentas[codigo], tb_cuentas[nombre_cuenta])
=SUMA(ListaCuentaActiva)
```

**Incorrecto:**
```
=SUMIFS(LIBRO_MAYOR!N:N, LIBRO_MAYOR!C:C, "...")
=XLOOKUP(A2, CONFIG!Q2:Q21, CONFIG!R2:R21)
=SUMA(A2:A50)
```

Consulta completa: [`docs/reglas-generales.md` — Regla 1](reglas-generales.md).

---

## 4. Lectura de Valores Configurables desde VBA

Cuando un parámetro deba ser configurable por el usuario final sin tocar código, debe implementarse como **celda + named range**, no como constante hardcoded.

**❌ NO hacer:**
```vb
Const UMBRAL_SPREAD As Double = 0.03
```

**✅ Correcto:**
```vb
Dim umbralSpread As Double
On Error Resume Next
umbralSpread = ThisWorkbook.Names("UmbralAlertaSpread").RefersToRange.Value
If Err.Number <> 0 Or umbralSpread <= 0 Or umbralSpread > 1 Then
    umbralSpread = 0.03    ' fallback
End If
On Error GoTo 0
```

**Beneficios:**
- El valor queda visible y auditable en la hoja, no oculto en código.
- Cambio de política operativa no requiere tocar VBA.
- Alineado con la regla 3 de este documento y con `docs/reglas-generales.md` (Regla 1).

Casos concretos: `UmbralAlertaSpread` (Issue #4), `Cuenta_Utilidad_Default` (pendiente).

---

## 5. Columnas por Nombre en ListObjects (colIdx)

Todas las macros que lean o escriban tablas estructuradas deben usar el helper `colIdx(tb, "NombreColumna")` en vez de índices numéricos.

**❌ NO hacer:**
```vb
tbMayor.ListRows(i).Range.Cells(1, 3).Value = cuenta  ' asume col 3
```

**✅ Correcto:**
```vb
Dim colCuenta As Long
colCuenta = colIdx(tbMayor, "Cuenta")
tbMayor.ListRows(i).Range.Cells(1, colCuenta).Value = cuenta
```

**Beneficios:**
- Resistente al reordenamiento de columnas.
- Mensajes de error claros si una columna se elimina o renombra.
- Ya implementado en `Modulo1.bas` y `Modulo2.bas`.

---

## 6. Escritura Atómica en Tablas Derivadas

Cuando una macro escribe en **múltiples tablas relacionadas** (ej: `tb_mayor` + `tb_tasas_historial`), las escrituras **deben ser atómicas**: o todas tienen éxito, o ninguna se ejecuta.

### ❌ Patrón incorrecto (problema actual)

En `GuardarLote`, las entradas de `tb_tasas_historial` se escriben **dentro del loop de líneas**, antes de confirmar que todas las líneas del lote se guardaron. Si el proceso falla a mitad, quedan huérfanos en el historial.

### ✅ Patrón correcto

1. Acumular las entradas en un buffer (array, `Collection`, `Scripting.Dictionary`) durante el loop.
2. Escribir en la tabla derivada **solo después** de que el commit principal (lote completo en `tb_mayor`) fue exitoso.

Pendiente en Issue (ver Caso 1 — Issue E por crear).

---

## 7. Paneles Congelados y Cabeceras

- Hojas con cabeceras fijas (`REGISTRO_RAPIDO`, `AUDITOR_LOTES`): las filas de cabecera deben caber dentro del panel congelado.
- Al agregar nuevos campos en cabecera, verificar que el panel sigue cubriendo **todas** las filas hasta el inicio de la tabla operativa.
- `REGISTRO_RAPIDO`: panel congelado a fila 10. Disponible para nuevos campos: filas 1-9.

---

## 8. `ultima_actualizacion` — Timestamp Estático, No `=TODAY()`

- La columna `ultima_actualizacion` de `tb_tasas_vigentes` debe ser **valor estático** (escrito por VBA con `Now` al actualizar).
- **NO** usar `=TODAY()` como fórmula — siempre mostraría la fecha actual, no la real de actualización.
- Ver Issue #8, corregido en R5 del historial del proyecto.

---

## Cómo contribuir a este documento

Cuando durante una implementación se detecte:
- Una limitación del entorno (Excel, VBA, LTSC).
- Un patrón obligatorio de implementación.
- Una convención que, de no seguirse, cause errores repetidos a nivel técnico.

→ Agregar sección numerada aquí.
→ Para reglas **conceptuales** del sistema contable, agregar en [`biblia-teorica.md`](biblia-teorica.md).
→ Mencionar la regla en los prompts/Issues afectados con enlace a esta biblia.

---

*Última actualización: 2026-04-21*
