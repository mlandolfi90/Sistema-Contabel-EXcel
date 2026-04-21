# Biblia Técnica — Convenciones y Limitaciones del Entorno

> Documento vivo de reglas técnicas, limitaciones del entorno y convenciones obligatorias para evitar errores repetidos en futuras implementaciones.
>
> **Toda regla aquí debe citarse en los prompts/Issues que la toquen.**

---

## 1. Excel LTSC 2021 — Limitaciones de Validación de Datos

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

Excel LTSC 2021 evalúa el campo Origen de validación en un contexto "legacy" que no soporta spill ranges directamente. El nombre definido con `#` actúa como puente, devolviendo el rango expandido.

### Referencia en el repo

- Todas las listas dinámicas del sistema deben vivir en `CONFIG_AUX`.
- Ver: `docs/hojas/config-aux.md`.
- Nombres ya usados: `ListaCuentaActiva`, `ListaEntidadActiva`, `ListaCategoriaActiva`, `ListaSegmentoActiva`, `ListaSocios`, `ListaTipoDH`.

---

## 2. Convenciones del Plan de Cuentas por Código

| Rango | Clase | Uso |
|-------|-------|-----|
| 1100-1200 | Activo | Billeteras, dinero a la mano y cuentas virtuales/temporales |
| 1300+ | Activo | Cuentas operativas (CxC/CxP, etc.) |
| 2000+ | Pasivo | Obligaciones |
| 3000+ | Patrimonio | Capital y cuentas corrientes de socios |
| 4000+ | Ingreso | Ingresos puros |
| 5000+ | Gasto | Gastos puros |
| 6000+ | Resultado | Cuentas mixtas (naturaleza Mixta) — G/P unificadas |

---

## 3. Clase de Cuenta `Resultado` (pendiente de implementación)

- Naturaleza: **Mixta**
- Uso: cuentas que acumulan tanto ganancias (Haber) como pérdidas (Debe) en una sola cuenta, siguiendo la regla **"G - P x suma"**.
- Reemplaza el patrón de cuentas separadas (ej: `4200 Ganancia` + `5400 Pérdida` → `6100 Ganancia-Pérdida x Revalorización`).
- **Pérdidas por ajustes de valoración (revalorización, diferencias de cambio) NO son Gastos** — deben ir en clase `Resultado`, no `Gasto`.

---

## 4. Estructura de Balance USD vs Moneda Nativa

- El sistema balancea los lotes **en USD** (vía columnas `Debe_USD` / `Haber_USD`).
- Las cuentas operan en su **moneda nativa**.
- Un saldo ≠ 0 en moneda nativa de una cuenta es **válido y esperado** — representa la posición real en esa moneda.
- La ganancia/pérdida latente por diferencial de tasas se refleja automáticamente en cuentas con `permite_revalorizacion = SÍ` (ver `SALDOS_Y_ENTIDADES` columna O).

---

## 5. Conversión a USD a Demanda

- La conversión a USD **NO se almacena precalculada** — se calcula on-demand vía fórmulas (`XLOOKUP` a `tb_tasas_vigentes`) en las columnas `Debe_USD` / `Haber_USD`.
- La tasa pactada del lote queda registrada en `tb_tasas_historial` para trazabilidad y cálculo de spread.
- Permite `USD_Manual_Debe/Haber` para sobrescribir la tasa cuando la operación lo requiera (ej: fijar "tasa de salida" en una operación de cambio).

---

## 6. Cuentas Temporales (Virtuales)

- Son cuentas **virtuales** (no representan dinero físico).
- Acumulan **diferencial de tasas** entre entrada y salida como **ganancia/pérdida latente**.
- `permite_revalorizacion = SÍ` (obligatorio — es su función).
- Por defecto son **globales por moneda** (no por entidad). Se permite una Temporal por Entidad si el Operador lo decide — no es regla ni restricción.

---

## 7. Entidad `Operador` — Metadato sin Asiento

- Toda operación debe registrar un Operador en cabecera del lote.
- El Operador **NO genera asiento contable** — es solo metadato de trazabilidad.
- Vive en `tb_entidades` con `tipo_entidad = "Operador"`.

---

## 8. Inmutabilidad de Tipo de Entidad

- Una entidad **no puede cambiar de `tipo_entidad`** una vez registrada — para preservar integridad histórica de asientos.
- Si se requiere cambio de rol, se crea una nueva entidad.

---

## 9. Reglas de Guardado de Lote (recordatorio del sistema actual)

- `B6` debe contener `"Balanceado"`.
- Mínimo 2 líneas con `Monto > 0`.
- Toda línea con `Monto > 0` requiere `Segmento`.
- Máximo 20 líneas por lote (tope duro — regla de negocio).
- Spread > 3% entre tasa pactada y tasa vigente dispara alerta.

---

## 10. Flexibilidad de División de Lotes

- Una operación puede registrarse en **1 lote** (si ocurre simultáneamente) o en **múltiples lotes** (si los pasos ocurren en momentos distintos).
- Cada lote balancea en USD de forma independiente.
- La trazabilidad entre lotes relacionados se mantiene vía `Ref_Chat` o `ID_Deuda`.

---

## 11. Layout de Celdas — Prohibido Combinar o Agrandar

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

- Las celdas combinadas **rompen fórmulas** con referencias estructuradas y rangos.
- Impiden `SORT`, `FILTER`, y autofiltros nativos de Excel.
- Dificultan el mantenimiento, especialmente cuando se insertan/eliminan filas.
- Incompatibles con tablas estructuradas (`ListObject`).
- Rompen navegación por teclado y selección de rangos.

### Alcance

Aplica a **todas las hojas del libro**: reportes, dashboards, configuraciones, hojas de captura y cualquier presentación visual.

---

## Cómo contribuir a este documento

Cuando durante una implementación se detecte:
- Una limitación del entorno (Excel, VBA, LTSC).
- Una convención que deba aplicarse transversalmente.
- Un patrón que, de no seguirse, cause errores repetidos.

→ Agregar sección numerada aquí + mencionar en los prompts/Issues afectados con enlace a esta biblia.

---

*Última actualización: 2026-04-21*
