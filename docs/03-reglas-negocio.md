# Reglas de Negocio — Sistema Contable Multidivisa V2

---

## 1. Guardar un lote

### Condiciones obligatorias (todas deben cumplirse)

1. `REGISTRO_RAPIDO!B6` debe contener la cadena `"Balanceado"` (la fórmula de B6 la calcula automáticamente).
2. Mínimo **2 líneas** con `Monto > 0`.
3. Cada línea con `Monto > 0` debe tener `Segmento` no vacío.
4. Máximo **20 líneas** por lote (tope duro).

### Alerta de spread

Para líneas en divisa ≠ USD:
```
spread = (tasa_lote - tasa_vigente) / tasa_vigente
```
Si `|spread| > 0.03` (3%), se muestra alerta y se ofrece actualizar la tasa vigente con la tasa del lote.

---

## 2. Convención Debe / Haber

| `Tipo_DH` | `Debe_Original` | `Haber_Original` |
|-----------|-----------------|------------------|
| `"D"` | `= Monto` | `= 0` |
| `"H"` | `= 0` | `= Monto` |

Las columnas `Debe_USD` y `Haber_USD` en `tb_mayor` son **fórmulas auto-heredadas** (no las escribe la macro).

---

## 3. Corrección de lotes

1. El lote original queda **Anulado**: se agrega `[ANULADO: motivo]` al campo `Descripcion` y se fija `Estado_Registro = "Anulado"`.
2. Las líneas del original se precargan en `REGISTRO_RAPIDO` para edición.
3. El usuario edita y guarda como lote nuevo — el historial del original permanece intacto.

---

## 4. Duplicación de lotes

- Carga las líneas del lote seleccionado en `REGISTRO_RAPIDO` con `Descripcion = "DUPLICADO de <ID>: …"`.
- El original **no se modifica**.
- útil para lotes recurrentes o de plantilla.

> Tanto Corrección como Duplicación abortan con mensaje si el lote supera las 20 líneas.

---

## 5. Pacto de utilidades

**Trigger:** botón en `REPORTE_BARRIDO` → macro `GenerarAsientoPacto`.

**Asiento generado:**
- Débito a `Utilidad Distribuible` por el total a distribuir.
- Crédito a `Cta. Corriente <Socio>` por la asignación individual de cada socio con asignación > 0.

**Fuente de datos:**

| Celda | Contenido |
|-------|-----------|
| `REPORTE_BARRIDO!B29` | Asignación Manuel |
| `REPORTE_BARRIDO!B30` | Asignación Andreina |
| `REPORTE_BARRIDO!B31` | Asignación Michelle |
| `REPORTE_BARRIDO!B33` | Total pendiente (suma de B29:B31, tolerancia 0.01) |

---

## 6. Revalorización de cuenta

**Trigger:** macro `RevalorizarCuenta` (con InputBox para nombre de cuenta).

| Situación | Débito | Crédito |
|-----------|--------|--------|
| Ganancia latente | Cuenta revaluada | `Ganancia por Revalorización` |
| Pérdida latente | `Pérdida por Revalorización` | Cuenta revaluada |

**Fuente:** `SALDOS_Y_ENTIDADES!O3:O22` (ganancia/pérdida latente USD por cuenta).

Si el valor absoluto es < 0.01 USD, la macro no genera asiento.

---

## 7. USD sin conversión

Las líneas en USD **no se registran** en `tb_tasas_historial`. La lógica de spread tampoco aplica.

---

## 8. Tope de 20 líneas por lote

Este tope es **regla de negocio**, no limitación técnica.
Cambiar el tope requiere sincronizar:
1. Capacidad física de `tb_registro_rapido` (número de `ListRows`).
2. Constante `MAX_LINEAS_LOTE` en `Módulo2`.
3. Revisar el balanceo visible en la hoja.

---

## 9. ID de lote

- Formato: `L001`, `L002`, … `L999`.
- Se calcula automáticamente en `REGISTRO_RAPIDO!B2` con fórmula que extrae el máximo ID existente en `tb_mayor` y suma 1.
- Fórmula: `~"L"&TEXT(IF(COUNTA(tb_mayor[ID_Lote])=0,1,MAX(IFERROR(VALUE(MID(tb_mayor[ID_Lote],2,10)),0))+1),"000")`
