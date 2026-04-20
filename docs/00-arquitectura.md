# Arquitectura — Sistema Contable Multidivisa V2 (Excel + VBA)

> Visión general del libro, hojas, flujo de datos y componentes VBA.

---

## 1. Visión general

Sistema contable implementado en un único libro Excel con macros VBA. Funciones principales:

- Registrar **lotes de asientos** (múltiples líneas Debe/Haber, máx. 20 por lote).
- Operar en **múltiples monedas** (USD base; USDT, Bs, Oro, EUR operativas).
- Mantener **Libro Mayor** acumulativo con columnas originales y convertidas a USD.
- Gestionar **lotes activos/anulados** con trazabilidad completa.
- Generar **asientos automáticos**: pacto de utilidades y revalorización por tasa.
- **Auditar lotes** con navegación anterior/siguiente y acción inteligente.

---

## 2. Socios del negocio

| Socio | Cuenta Corriente |
|-------|------------------|
| Manuel | `Cta. Corriente Manuel` |
| Andreina | `Cta. Corriente Andreina` |
| Michelle | `Cta. Corriente Michelle` |

---

## 3. Hojas del libro

| Hoja | Rol | Tipo |
|------|-----|------|
| `REGISTRO_RAPIDO` | Formulario de captura de lotes nuevos | Entrada |
| `LIBRO_MAYOR` | Libro mayor acumulativo | Almacenamiento principal |
| `TASAS` | Tasas vigentes + historial | Datos maestros |
| `AUDITOR_LOTES` | Navegación y acción sobre lotes | Auditoría |
| `REPORTE_BARRIDO` | Cálculo de reparto de utilidades | Reporte / generador |
| `SALDOS_Y_ENTIDADES` | Saldos + ganancia/pérdida latente | Reporte |
| `CONFIG` | Catálogos maestros (11 tablas) | Datos maestros |
| `CONFIG_AUX` | Listas derivadas para dropdowns | Aux. de fórmulas |
| `BALANCE` | Balance general | Reporte |
| `DASHBOARD` | Panel de indicadores | Reporte |
| `PyL_POR_SEGMENTO` | Estado de resultados por segmento | Reporte |
| `FLUJO_CAJA` | Flujo de caja | Reporte |

> Existen además `Hoja16`…`Hoja32` sin código VBA; su contenido es exclusivamente celdas/fórmulas.

---

## 4. Flujo de datos principal

```
Usuario captura líneas
        │
        ▼
REGISTRO_RAPIDO  ─►  validación (balance + ≥2 líneas + Segmento)
(tb_registro_rapido)       │
                           ▼
                 GuardarLote() copia línea a línea
                           │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     LIBRO_MAYOR    TASAS.historial   Alerta spread
     (tb_mayor)    (tb_tasas_hist.)  (si >3%)
                           │
                           ▼
                 ¿actualizar tasa vigente?
                           │
                           ▼
               tb_tasas_vigentes
```

---

## 5. Componentes VBA

### Runtime (requeridos)

| Archivo | Módulo | Macros principales |
|---------|--------|-------------------|
| [`vba/Modulo1.bas`](vba/Modulo1.bas) | Núcleo contable | `GuardarLote`, `LimpiarRegistro`, `ActualizarTasaVigente`, `GenerarAsientoPacto`, `RevalorizarCuenta` |
| [`vba/Modulo2.bas`](vba/Modulo2.bas) | Auditor de lotes | `LoteAnterior`, `LoteSiguiente`, `AccionSobreLoteVisible`, `CorregirLoteConID`, `DuplicarLoteConID` |
| [`vba/Hoja3.cls`](vba/Hoja3.cls) | Código de hoja | `Worksheet_Change`, `Worksheet_SelectionChange` (UX multi-selección de socios en B3) |

### Auxiliar de desarrollo (no runtime)

| Archivo | Módulo | Función |
|---------|--------|---------|
| [`vba/Modulo3.bas`](vba/Modulo3.bas) | Exportador VBA | `ExportarTodoVBA_Completo` — exporta `.bas`/`.cls` a carpeta local. No afecta el sistema si se elimina. |

---

## 6. Celdas fijas por hoja

### `REGISTRO_RAPIDO`
`B1` Fecha · `B2` ID_Lote · `B3` Socios · `B4` Ref_Chat · `B5` Descripción · `B6` Estado

### `AUDITOR_LOTES`
`B4` ID_Lote seleccionado · `B11` Estado del lote (`Activo`/`Anulado`) · rango `IDs_Unicos` + col. aux. `AZ`

### `REPORTE_BARRIDO`
`B29` Asignación Manuel · `B30` Andreina · `B31` Michelle · `B33` Monto pendiente pactar

### `SALDOS_Y_ENTIDADES`
`B3:B22` nombres de cuenta · `O3:O22` ganancia/pérdida latente USD

---

## 7. Divisas soportadas

| Divisa | Tipo | Operación vs USD |
|--------|------|------------------|
| USD | Fiat | Base (sin conversión) |
| USDT | Cripto | Multiplicar |
| Bs | Fiat | Dividir |
| Oro | Commodity | Multiplicar |
| EUR | Fiat | Multiplicar |

---

## 8. Dependencias técnicas

- Excel para Windows (escritorio) + VBA habilitado
- Funciones: `XLOOKUP`, `FILTER`, `SORT`, `IFERROR`
- Excel 365 o Excel 2021+
- Marcar *"Confiar en acceso al modelo de objetos de VBA"* para `ExportarTodoVBA_Completo`

---

## 9. Glosario rápido

| Término | Definición |
|---------|------------|
| **Lote** | Conjunto balanceado de líneas bajo un mismo `ID_Lote` (máx. 20 líneas) |
| **Spread** | Desviación % entre tasa del asiento y tasa vigente |
| **Revalorización** | Asiento que refleja ganancia/pérdida latente por variación de tasa |
| **Pacto** | Asiento de distribución de utilidades entre socios |
| **Anulado** | `Estado_Registro = "Anulado"` — permanece en el mayor para trazabilidad |
