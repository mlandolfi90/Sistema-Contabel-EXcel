# Implementación desde Cero — Sistema Contable Multidivisa V2

> Orden exacto para construir el libro `Sistema_Contable_Automatico.xlsm` desde un libro en blanco.

---

## Requisitos previos

- Excel para Windows (365 o 2021+), con macros habilitadas.
- Marcar *"Confiar en acceso al modelo de objetos de VBA"* solo si se usa `ExportarTodoVBA_Completo`.
- Archivos `.bas` y `.cls` de la carpeta [`vba/`](vba/).

---

## Fase 1 — Crear el libro y habilitar VBA

1. Nuevo libro → guardar como **`.xlsm`** (libro habilitado para macros).
2. Renombrar la primera hoja a `CONFIG`.
3. En el editor VBA (`Alt+F11`) verificar que el proyecto VBA es accesible.

---

## Fase 2 — Crear hojas (en orden)

Crear las hojas con exactamente estos nombres (sin espacios extra):

| # | Nombre | Pestaña color sugerido |
|---|--------|-----------------------|
| 1 | `CONFIG` | Morado `#7030A0` |
| 2 | `CONFIG_AUX` | Morado claro |
| 3 | `TASAS` | Azul `#5B9BD5` |
| 4 | `REGISTRO_RAPIDO` | Ámbar `#FFC000` |
| 5 | `LIBRO_MAYOR` | Azul oscuro `#1F4E78` |
| 6 | `AUDITOR_LOTES` | Rojo/naranja |
| 7 | `SALDOS_Y_ENTIDADES` | Verde |
| 8 | `REPORTE_BARRIDO` | Verde claro |
| 9 | `BALANCE` | Azul medio |
| 10 | `DASHBOARD` | Gris/negro |
| 11 | `FLUJO_CAJA` | Verde |
| 12 | `PyL_POR_SEGMENTO` | Verde `#70AD47` |

> El **CodeName** de la hoja `REGISTRO_RAPIDO` debe ser `Hoja3` para que `Hoja3.cls` funcione. Verificar en el panel de propiedades del editor VBA y cambiar si difiere.

---

## Fase 3 — Tablas en `CONFIG`

Crear las siguientes tablas estructuradas (Insertar → Tabla) con sus nombres exactos:

| Tabla | Columnas mínimas |
|-------|------------------|
| `tb_divisas` | `divisa`, `es_base`, `tipo`, `decimales`, `activa`, `simbolo` |
| `tb_tipo_divisa` | `tipo_divisa` |
| `tb_entidades` | `entidad`, `tipo_entidad`, `activa`, `notas` |
| `tb_cuentas` | `nombre_cuenta`, `codigo_cuenta`, `clase`, `activa` |
| `tb_categorias` | `categoria`, `activa` |
| `tb_segmentos` | `segmento`, `activo` |

Poblar con los datos maestros según [`01-datos-maestros.md`](01-datos-maestros.md) y los archivos de hoja en [`hojas/`](hojas/).

---

## Fase 4 — Tablas en `TASAS`

Crear:
- `tb_tasas_vigentes` (A1:F6) con las 5 divisas (USD, USDT, Bs, Oro, EUR).
- `tb_tasas_historial` (H1:N14) con 7 columnas.

Agregar validaciones de datos:
- `tb_tasas_vigentes[operacion]` → lista: `Base,Multiplicar,Dividir`
- `tb_tasas_vigentes[fuente_ultima]` → lista: `manual,api,sistema`
- `tb_tasas_historial[tipo_origen]` → lista: `transaccion,actualizacion_manual`

---

## Fase 5 — `CONFIG_AUX` y named ranges

1. Crear las fórmulas de derrame en `CONFIG_AUX`:
   - `ListaCuentaActiva`: `=SORT(FILTER(tb_cuentas[nombre_cuenta],tb_cuentas[activa]="SI",""))`
   - `ListaEntidadActiva`: similar sobre `tb_entidades`
   - `ListaCategoriaActiva`: similar sobre `tb_categorias`
   - `ListaSegmentoActiva`: similar sobre `tb_segmentos`
   - `ListaSocios`: `=FILTER(tb_entidades[entidad],tb_entidades[tipo_entidad]="Socio")`
   - `ListaCuentasPyL` (col I): `=SORT(FILTER(tb_cuentas[nombre_cuenta],((tb_cuentas[clase]="Ingreso")+(tb_cuentas[clase]="Gasto"))*(tb_cuentas[activa]="SI"),""))`

2. Definir named ranges apuntando a las celdas de inicio de cada derrame (`Gestor de nombres`).

---

## Fase 6 — `REGISTRO_RAPIDO`

1. Crear cabecera: celdas A1:B7 con las etiquetas y fórmulas documentadas en [`hojas/REGISTRO_RAPIDO.md`](hojas/REGISTRO_RAPIDO.md).
2. Crear tabla `tb_registro_rapido` en filas 10–20 con 13 columnas.
3. Configurar dropdowns de validación en columnas `Cuenta`, `Entidad`, `Categoría`, `Segmento`, `Tipo_DH` usando los named ranges de `CONFIG_AUX`.
4. Agregar fórmulas en columnas `Moneda`, `Tasa`, `Debe_USD`, `Haber_USD`.
5. Aplicar formato condicional a `B6` y `B7`.
6. Congelar filas 1:10.

---

## Fase 7 — `LIBRO_MAYOR`

1. Crear tabla `tb_mayor` con las 19 columnas documentadas en [`hojas/LIBRO_MAYOR.md`](hojas/LIBRO_MAYOR.md).
2. Ingresar fórmulas en columnas `Codigo_Cuenta`, `Clase`, `Debe_USD`, `Haber_USD` (auto-heredadas por la tabla).
3. Congelar fila 1.

---

## Fase 8 — `AUDITOR_LOTES`

1. Crear panel según [`hojas/AUDITOR_LOTES.md`](hojas/AUDITOR_LOTES.md).
2. Crear fórmula de IDs únicos en columna auxiliar `AZ` (derrame descendente).
3. Definir named range `IDs_Unicos` apuntando al derrame.
4. Agregar botones de forma y asignar macros: `LoteAnterior`, `LoteSiguiente`, `AccionSobreLoteVisible`.
5. Aplicar formato condicional a `B11`, `I27`, `A34`.

---

## Fase 9 — Importar código VBA

En el editor VBA (`Alt+F11`):

1. Importar `vba/Modulo1.bas` (Módulo1 — Núcleo contable).
2. Importar `vba/Modulo2.bas` (Módulo2 — Auditor de lotes).
3. Importar `vba/Modulo3.bas` (Módulo3 — Exportador, opcional).
4. Importar `vba/Hoja3.cls` como código de la hoja `REGISTRO_RAPIDO` (CodeName `Hoja3`).
   > Alternativa: copiar el contenido del `.cls` directamente en el módulo de la hoja desde el editor.

---

## Fase 10 — Botones en hojas

| Hoja | Forma | Macro asignada |
|------|-------|----------------|
| `REGISTRO_RAPIDO` | `💾 Guardar Lote` | `GuardarLote` |
| `REGISTRO_RAPIDO` | `🗑 Limpiar` | `LimpiarRegistro` |
| `TASAS` | `Actualizar Tasa` | `ActualizarTasaVigente` |
| `REPORTE_BARRIDO` | `Generar Asiento Pacto` | `GenerarAsientoPacto` |
| `AUDITOR_LOTES` | `◄ Anterior` | `LoteAnterior` |
| `AUDITOR_LOTES` | `Siguiente ►` | `LoteSiguiente` |
| `AUDITOR_LOTES` | `Corregir / Duplicar` | `AccionSobreLoteVisible` |

---

## Fase 11 — Reportes

Crear hojas `BALANCE`, `DASHBOARD`, `FLUJO_CAJA`, `PyL_POR_SEGMENTO`, `SALDOS_Y_ENTIDADES`, `REPORTE_BARRIDO` según documentación en [`hojas/`](hojas/). Estas hojas son solo fórmulas que consumen `tb_mayor` y los catálogos de `CONFIG`.

---

## Verificación final

- [ ] `REGISTRO_RAPIDO!B6` muestra `✓ Balanceado` al ingresar un asiento cuadrado.
- [ ] `GuardarLote` graba en `tb_mayor` y limpia el formulario.
- [ ] `AUDITOR_LOTES` navega entre lotes y muestra datos correctos.
- [ ] `GenerarAsientoPacto` prellena el asiento en `REGISTRO_RAPIDO`.
- [ ] Spread > 3% genera alerta al guardar.
- [ ] `BALANCE` cuadra (diferencia = 0).
