# Datos Maestros — Tablas Estructuradas y Rangos

> Referencia completa de tablas (`ListObject`), columnas y rangos con nombre del sistema.

---

## 1. `tb_registro_rapido` — hoja `REGISTRO_RAPIDO`

Tabla de captura (máx. 20 filas físicas).

| Columna | Tipo | Notas |
|---------|------|-------|
| `Cuenta` | Entrada | Dropdown desde `ListaCuentaActiva` |
| `Entidad` | Entrada | Dropdown desde `ListaEntidadActiva` |
| `Categoría` | Entrada | Dropdown desde `ListaCategoriaActiva` (con tilde) |
| `Segmento` | Entrada | Dropdown desde `ListaSegmentoActiva` |
| `Tipo_DH` | Entrada | `"D"` o `"H"` |
| `Monto` | Entrada | Numérico |
| `Moneda` | Fórmula | XLOOKUP a `tb_tasas_vigentes` |
| `Tasa` | Fórmula | XLOOKUP a `tb_tasas_vigentes` |
| `USD_Manual_Debe` | Entrada | Override manual; si ≠0 tiene precedencia |
| `USD_Manual_Haber` | Entrada | Override manual; si ≠0 tiene precedencia |
| `Debe_USD` | Fórmula | Calcula automáticamente |
| `Haber_USD` | Fórmula | Calcula automáticamente |
| `ID_Deuda` | Entrada | Opcional; vincula línea a una deuda |

**Cabecera del lote (celdas fuera de la tabla):**

| Celda | Contenido |
|-------|-----------|
| `B1` | Fecha del lote |
| `B2` | ID_Lote (fórmula automática) |
| `B3` | Socios participantes (UX toggle multi-selección) |
| `B4` | Ref_Chat |
| `B5` | Descripción |
| `B6` | Estado: `Vacío` / `✓ Balanceado` / `✗ Descuadre: X USD` |
| `B7` | Diferencia numérica (Debe_USD − Haber_USD) |

---

## 2. `tb_mayor` — hoja `LIBRO_MAYOR`

Libro mayor acumulativo. Cada fila = una línea contable.

| Columna | Escrita por | Notas |
|---------|-------------|-------|
| `ID_Lote` | Macro | Formato `L001` |
| `Fecha` | Macro | |
| `Cuenta` | Macro | |
| `Codigo_Cuenta` | Fórmula | XLOOKUP a `CONFIG` |
| `Clase` | Fórmula | XLOOKUP a `CONFIG` |
| `Entidad` | Macro | |
| `Categoria` | Macro | Sin tilde (a diferencia de `tb_registro_rapido`) |
| `Segmento` | Macro | |
| `Moneda` | Macro | |
| `Debe_Original` | Macro | |
| `Haber_Original` | Macro | |
| `Tasa` | Macro | |
| `Debe_USD` | Fórmula | Auto-heredada |
| `Haber_USD` | Fórmula | Auto-heredada |
| `Socios_Participantes` | Macro | |
| `ID_Deuda` | Macro | |
| `Ref_Chat` | Macro | |
| `Descripcion` | Macro | Puede incluir `[ANULADO: motivo]` |
| `Estado_Registro` | Macro | `"Activo"` o `"Anulado"` |

---

## 3. `tb_tasas_vigentes` — hoja `TASAS`

| Columna | Notas |
|---------|-------|
| `divisa` | `USD`, `USDT`, `Bs`, `Oro`, `EUR` |
| `tasa_vs_USD` | Numérico; USD = 1 |
| `operacion` | `Base` / `Multiplicar` / `Dividir` |
| `ultima_actualizacion` | Timestamp al actualizar |
| `actualizada_por` | `Environ("USERNAME")` de Windows |
| `fuente_ultima` | `manual` / `api` / `sistema` |

> **Nota:** `ultima_actualizacion` usaba `TODAY()` en versiones anteriores (incorrecto). Debe ser un valor estático que se sobreescribe al actualizar la tasa.

---

## 4. `tb_tasas_historial` — hoja `TASAS`

Bitácora de tasas aplicadas por lote o actualización manual.

| # | Columna | Notas |
|---|---------|-------|
| 1 | `Fecha` | |
| 2 | `ID_Lote` | Vacío si es `actualizacion_manual` |
| 3 | `Divisa` | |
| 4 | `Tasa_Aplicada` | |
| 5 | `Tasa_Vigente` | |
| 6 | `Spread` | `(tasa − vigente) / vigente` |
| 7 | `Tipo` | `transaccion` / `actualizacion_manual` |

---

## 5. Tablas en hoja `CONFIG` (11 tablas)

| Tabla | Columnas clave | Propósito |
|-------|---------------|----------|
| `tb_divisas` | `divisa`, `es_base`, `tipo`, `activa` | Catálogo de divisas |
| `tb_tipo_divisa` | `tipo_divisa` | Lista: Fiat, Cripto, Commodity |
| `tb_entidades` | `entidad`, `tipo_entidad`, `activa` | Catálogo de entidades/socios |
| `tb_cuentas` | `nombre_cuenta`, `codigo`, `clase`, `activa` | Plan de cuentas |
| `tb_categorias` | `categoria`, `activa` | Catálogo de categorías |
| `tb_segmentos` | `segmento`, `activo` | Catálogo de segmentos |

---

## 6. Rangos con nombre relevantes

| Rango | Hoja | Contenido |
|-------|------|-----------|
| `IDs_Unicos` | `AUDITOR_LOTES` | Lista ordenada desc. de IDs de lote únicos |
| `ListaCuentaActiva` | `CONFIG_AUX` | Derrame de cuentas activas (FILTER) |
| `ListaEntidadActiva` | `CONFIG_AUX` | Derrame de entidades activas |
| `ListaCategoriaActiva` | `CONFIG_AUX` | Derrame de categorías activas |
| `ListaSegmentoActiva` | `CONFIG_AUX` | Derrame de segmentos activos |
| `ListaSocios` | `CONFIG_AUX` | Socios activos |
| `ListaTipoDH` | (separado) | `D`, `H` |

> Las listas de `CONFIG_AUX` se generan con `FILTER` + `SORT` sobre las tablas de `CONFIG`. Son el origen de todos los dropdowns del sistema.
