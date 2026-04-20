# Reglas generales del Sistema Contabel

Este documento recoge las reglas transversales del sistema que aplican
independientemente de la hoja, macro o tabla afectada. Son decisiones
de diseño que condicionan cómo se construyen y mantienen los
componentes del libro Excel (`Sistema-Contabel.xlsm`).

Las reglas se recuerdan y documentan a medida que se identifican.
Este archivo es el detalle vinculado al [Issue #15](https://github.com/mlandolfi90/Sistema-Contabel-EXcel/issues/15).

---

## Índice de reglas activas

| # | Regla | Ámbito |
|---|---|---|
| 1 | [Fórmulas referencian nombres, no celdas](#regla-1--fórmulas-referencian-nombres-no-celdas) | Todas las hojas con fórmulas |

---

## Regla 1 — Fórmulas referencian nombres, no celdas

### Enunciado

Toda fórmula debe apoyarse en **rangos con nombre** o **referencias
estructuradas de tabla**. No se permiten referencias directas a
coordenadas de celda ni a rangos coordenados.

### Ejemplos

**Correcto:**
```
=SUMIFS(tb_mayor[monto], tb_mayor[cuenta], "CxC_Socio01")
=BUSCARV(idCuenta, tb_cuentas, 3, FALSO)
=SUMA(ListaCuentaActiva)
```

**Incorrecto:**
```
=SUMIFS(LIBRO_MAYOR!F:F, LIBRO_MAYOR!C:C, "CxC_Socio01")
=BUSCARV(A2, CONFIG!B2:D100, 3, FALSO)
=SUMA(B2:B50)
```

### Justificación

- **Resistencia a cambios estructurales.** Al insertar o eliminar filas,
  cambiar el orden de columnas, o reorganizar hojas, las fórmulas con
  nombres siguen funcionando. Las referencias coordenadas se rompen.
- **Legibilidad.** `tb_mayor[monto]` comunica el propósito de la fórmula;
  `LIBRO_MAYOR!F:F` requiere abrir la hoja y contar columnas.
- **Mantenibilidad.** Cambiar el rango de un nombre es un único punto
  de edición. Cambiar un rango coordenado requiere revisar todas las
  fórmulas que lo usan.
- **Consistencia con VBA.** Las macros ya usan `colIdx`, nombres de
  tabla y rangos con nombre. La regla alinea hojas y código bajo el
  mismo estándar.

### Alcance

Aplica a **toda fórmula nueva o editada** en cualquier hoja del libro:
`BALANCE`, `PyL`, `DASHBOARD`, `LIBRO_MAYOR`, `CONFIG_AUX`,
`SALDOS_Y_ENTIDADES`, `FLUJO_CAJA`, `REPORTE_BARRIDO`, `PyL_POR_SEGMENTO`,
entre otras.

### Excepciones permitidas

- Rangos temporales dentro de celdas auxiliares de cálculo local
  (ej: una fila de trabajo en `CONFIG_AUX` que explicitamente está
  contenida y documentada).
- Fórmulas dentro de validaciones de datos que Excel exige como
  coordenadas absolutas por limitación propia.

En ambos casos, la excepción debe comentarse en la celda adyacente o
en el encabezado de la sección.

### Cómo auditar cumplimiento

1. Abrir **Administrador de nombres** (`Ctrl+F3`) y verificar que los
   nombres relevantes estén definidos.
2. En cada hoja crítica, usar **Fórmulas → Mostrar fórmulas** (`Ctrl+´`)
   y revisar visualmente que no aparezcan coordenadas absolutas.
3. Para búsquedas masivas: **Inicio → Buscar y seleccionar → Fórmulas**,
   filtrar por patrón `!A` o `!B` (referencias externas).

---

## Notas de mantenimiento de este documento

- Cada regla nueva se agrega como sección con el mismo formato:
  Enunciado → Ejemplos → Justificación → Alcance → Excepciones → Auditoría.
- El índice de arriba se actualiza al agregar o retirar reglas.
- Las reglas retiradas no se borran: se mueven a una sección
  "Reglas históricas" con la razón del retiro.
