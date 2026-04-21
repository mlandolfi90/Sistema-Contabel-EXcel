# Biblia Teórica — Sistema Contable

> Reglas **conceptuales** del sistema contable. Independientes de la plataforma (Excel, VBA) — aplicarían en cualquier reimplementación.
>
> Para reglas **técnicas** del entorno (Excel LTSC, VBA, celdas, validación de datos), ver [`biblia-tecnica.md`](biblia-tecnica.md).

---

## 1. Plan de Cuentas por Rango de Código

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

## 2. Clase de Cuenta `Resultado`

- **Naturaleza:** Mixta.
- **Uso:** cuentas que acumulan tanto ganancias (Haber) como pérdidas (Debe) en una sola cuenta, siguiendo la regla **"G − P x suma"**.
- **Reemplaza** el patrón de cuentas separadas (ej: `4200 Ganancia por Revalorización` + `5400 Pérdida por Revalorización` → `6100 Ganancia-Pérdida x Revalorización`).
- **Pérdidas por ajustes de valoración** (revalorización, diferencias de cambio, ajustes de mercado) **NO son Gastos** — deben ir en clase `Resultado`, no `Gasto`.
- La clase `Gasto` queda reservada para **consumo real de recursos**.

---

## 3. Balance USD vs Moneda Nativa

- Los lotes balancean **en USD**.
- Las cuentas operan en su **moneda nativa**.
- Un saldo ≠ 0 en moneda nativa es **válido y esperado** — representa la posición real en esa moneda (billetera viva).
- El diferencial respecto al valor USD histórico se materializa como **ganancia/pérdida latente** vía `permite_revalorizacion = SÍ`.

---

## 4. Conversión a USD a Demanda

- La conversión a USD **NO se almacena precalculada** — se calcula on-demand vía fórmulas de referencia a tasas vigentes.
- La tasa pactada del lote queda registrada en el historial de tasas para trazabilidad y cálculo de spread.
- Admite override manual por línea (`USD_Manual_Debe/Haber`) para fijar la tasa cuando la operación lo requiera (ej: "tasa de salida" en operación de cambio).

---

## 5. Cuentas Temporales (Virtuales)

- Son cuentas **virtuales** — no representan dinero físico.
- Acumulan **diferencial de tasas** entre entrada y salida como **ganancia/pérdida latente**.
- `permite_revalorizacion = SÍ` (obligatorio — es su función).
- Por defecto son **globales por moneda** (ej: `Bs Electrónico Temporal`, `USDT Temporal`), no por entidad.
- Se permite crear una Temporal por Entidad si el Operador lo decide (no es regla ni restricción).

---

## 6. Entidad `Operador` — Metadato sin Asiento

- Toda operación debe registrar un Operador en cabecera del lote.
- El Operador **NO genera asiento contable** — es solo metadato de trazabilidad.
- Vive en `tb_entidades` con `tipo_entidad = "Operador"`.

---

## 7. Tipos de Entidad Permitidos

Catálogo cerrado:

- `Operador` — ejecuta operaciones, sin participación contable.
- `Tercero` — contraparte en transacciones (comprador P2P, vendedor tercero, etc.).
- `Socio` — aporta capital y participa en utilidad.
- `Banco`, `Externo`, `Interno` — tipos existentes complementarios.

---

## 8. Inmutabilidad de Tipo de Entidad

- Una entidad **no puede cambiar de `tipo_entidad`** una vez registrada, para preservar integridad histórica de asientos.
- Si se requiere cambio de rol, se crea una nueva entidad.

---

## 9. Flexibilidad de División de Lotes

- Una operación puede registrarse en **1 lote** (si ocurre simultáneamente) o **múltiples lotes** (si los pasos ocurren en momentos distintos).
- Cada lote balancea de forma independiente.
- La trazabilidad entre lotes relacionados se mantiene vía `Ref_Chat` o `ID_Deuda`.

---

## 10. Utilidad: Latente → Generada → Pactada

**Tres estados del ciclo de utilidad:**

| Estado | Dónde vive | Cómo se materializa |
|--------|-----------|---------------------|
| **Latente** | En cuentas con `permite_revalorizacion = SÍ` | Automática por diferencial de tasas |
| **Generada** | En `Utilidad Distribuible` con categoría `Generación Utilidad` | Macro `RevalorizarCuenta` (manual) |
| **Pactada** | En `Cta. Corriente <Socio>` con categoría `Pacto Utilidades` | Macro `GenerarAsientoPacto` (manual) |

**Reparto entre socios:**
- Siempre **explícito y manual** por el Operador vía `REPORTE_BARRIDO`.
- **No hay prorrateo automático** — aunque participen N socios en un lote, el sistema no divide la utilidad automáticamente.
- La columna `Socios_Participantes` del lote es **indicador de corresponsabilidad** (participación), no base de cálculo de utilidad atribuible.

**Indicador derivado:**
- **Utilidad Pendiente de Pactar** = Utilidad Generada − Utilidad Pactada (por socio).
- Debe visualizarse en `SALDOS_Y_ENTIDADES` (por socio) y `DASHBOARD` (consolidado).

---

## 11. Ciclo de Cierre — Triggers y Visibilidad

### Triggers

| Proceso | Trigger | Frecuencia |
|---------|---------|------------|
| Revalorización | **Manual puro** (Operador ejecuta `RevalorizarCuenta`) | Discreción del Operador |
| Alcance por revalorización | **Flexible** — una cuenta, varias, o todas | Decisión del Operador |
| Pacto de Utilidades | **Manual** (`GenerarAsientoPacto`) | Acumulativo: se difiere hasta cierre |
| Asignación en `REPORTE_BARRIDO` | **Libre** — sin validación automática del criterio | Discreción del Operador |

### Indicadores visuales obligatorios

**Revalorizaciones Pendientes** — visible en 3 lugares:
1. `SALDOS_Y_ENTIDADES` — por cuenta (alerta por columna).
2. `TASAS` — panel consolidado por divisa con impacto en USD al cambiar tasa.
3. `DASHBOARD` — KPI destacado con total pendiente.

**Utilidad Pendiente de Pactar** — visible en 2 lugares:
1. `SALDOS_Y_ENTIDADES` — por socio (columna calculada).
2. `DASHBOARD` — KPI destacado con total.

---

## 12. Umbral de Spread — Valor Configurable

- El umbral que dispara la **alerta de spread** entre tasa pactada y tasa vigente es **configurable por el Operador**.
- Valor por defecto: **3%**.
- Rango recomendado: entre **1% y 20%**.
- El umbral vive como parámetro del sistema, editable sin tocar código.

> El **cómo técnico** (named range `UmbralAlertaSpread`, lectura desde VBA) está documentado en [`biblia-tecnica.md` sección 4](biblia-tecnica.md#4-lectura-de-valores-configurables-desde-vba) y el Issue #4.

---

## 13. Spread — Metadato, No Asiento Contable

- El spread se **registra en historial de tasas** como metadato por cada línea en moneda ≠ USD.
- Si `|spread| > UmbralAlertaSpread` → **alerta al Operador** con opción de actualizar la tasa vigente.
- **No genera asiento contra ninguna cuenta de G/P.**
- La ganancia/pérdida por diferencial de tasas **solo se materializa contablemente** al ejecutar `RevalorizarCuenta` sobre una cuenta con `permite_revalorizacion = SÍ`.

---

## 14. Mecanismos para Balancear Lotes con Diferencial de Tasas

**Regla general:** un lote no se guarda si no está balanceado en USD.

Cuando el descuadre proviene de diferencial de tasas legítimo, el Operador tiene **dos caminos**:

| Ruta | Mecanismo | Efecto sobre la utilidad |
|------|-----------|--------------------------|
| **A — USD_Manual** | Override `USD_Manual_Debe/Haber` en la línea con diferencial | Ganancia queda **latente** en la cuenta temporal |
| **B — Cuadrar con Utilidad** (por implementar) | Línea automática contra `Cuenta_Utilidad_Default` (configurable) | Ganancia queda **realizada** inmediatamente |

La elección depende de la preferencia contable del Operador en ese momento.

---

## 15. Reglas de Guardado de Lote (resumen operativo)

- `B6` debe contener `"Balanceado"`.
- Mínimo 2 líneas con `Monto > 0`.
- Toda línea con `Monto > 0` requiere `Segmento`.
- Máximo **20 líneas por lote** (tope duro — regla de negocio).
- Alerta de spread según umbral configurable (ver secciones 12 y 13).

---

## Cómo contribuir a este documento

Cuando durante el diseño o implementación se detecte:
- Una regla **conceptual** del sistema contable que aplique transversalmente.
- Un patrón de diseño independiente de la plataforma (Excel).

→ Agregar sección numerada aquí.
→ Para reglas **técnicas del entorno**, agregar en [`biblia-tecnica.md`](biblia-tecnica.md).
→ Mencionar la regla en los prompts/Issues afectados con enlace a esta biblia.

---

*Última actualización: 2026-04-21*
