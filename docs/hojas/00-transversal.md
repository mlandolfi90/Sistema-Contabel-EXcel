# 00 — Estructuras transversales del libro

> Archivo: `Sistema_Contable_Automatico.xlsm`  
> Generado: 2026-04-19

## 1. Rangos con nombre (Named Ranges)

| Nombre | Referencia exacta | Ámbito | Comentario |
|---|---|---|---|
| IDs_Unicos | `AUDITOR_LOTES!$AZ$2#` | Libro | Rango derramado con IDs únicos de lotes (spill) |
| ListaCategoria | `tb_categorias[categoria]` | Libro | Catálogo completo de categorías |
| ListaCategoriaActiva | `CONFIG_AUX!$C$2#` | Libro | Categorías activas filtradas (spill) |
| ListaClase | `tb_clase_cuenta[clase]` | Libro | Catálogo de clases contables |
| ListaCuenta | `tb_cuentas[nombre_cuenta]` | Libro | Catálogo completo de cuentas |
| ListaCuentaActiva | `CONFIG_AUX!$A$2#` | Libro | Cuentas activas filtradas (spill) |
| ListaDivisa | `tb_divisas[divisa]` | Libro | Catálogo completo de divisas |
| ListaDivisaActiva | `CONFIG_AUX!$E$2#` | Libro | Divisas activas filtradas (spill) |
| ListaEntidad | `tb_entidades[entidad]` | Libro | Catálogo completo de entidades |
| ListaEntidadActiva | `CONFIG_AUX!$B$2#` | Libro | Entidades activas filtradas (spill) |
| ListaNaturaleza | `tb_naturaleza[naturaleza]` | Libro | Catálogo de naturaleza contable |
| ListaSegmento | `tb_segmentos[segmento]` | Libro | Catálogo completo de segmentos |
| ListaSegmentoActiva | `CONFIG_AUX!$F$2#` | Libro | Segmentos activos filtrados (spill) |
| ListaSocios | `CONFIG_AUX!$D$2#` | Libro | Lista de socios (spill) |
| ListaTipoDH | constante `{"D";"H"}` | Libro | Constante tipo Debe/Haber |
| ListaTipoDivisa | `tb_tipo_divisa[tipo_divisa]` | Libro | Catálogo tipos de divisa |
| ListaTipoEntidad | `tb_tipo_entidad[tipo_entidad]` | Libro | Catálogo tipos de entidad |
| ListaTipoOperativo | `tb_tipo_operativo[tipo_operativo]` | Libro | Catálogo tipos operativos |
| _FilterDatabase | `CONFIG_AUX!$F$2:$F$7` | CONFIG_AUX | Auto-filtro interno de Excel |

### Nombres internos de compatibilidad (ocultos)
Stubs `_xlfn.*` / `_xlpm.*` para funciones dinámicas (FILTER, SORT, UNIQUE, XLOOKUP, LET, SUMIFS, IFERROR, ANCHORARRAY, _xlpm.op). Son marcadores de compatibilidad con versiones anteriores, no datos del usuario.

## 2. Tablas estructuradas (ListObject)

| Tabla | Hoja | Rango | Filas | Propósito |
|---|---|---|---|---|
| `tb_divisas` | CONFIG | A1:F6 | 5 | Catálogo de divisas |
| `tb_tipo_divisa` | CONFIG | H1:H4 | 3 | Tipos de divisa (Fiat/Cripto/Commodity) |
| `tb_entidades` | CONFIG | J1:M7 | 6 | Entidades (socios, terceros, bancos) |
| `tb_tipo_entidad` | CONFIG | O1:O6 | 5 | Tipos de entidad |
| `tb_cuentas` | CONFIG | Q1:X21 | 20 | Catálogo de cuentas contables |
| `tb_clase_cuenta` | CONFIG | Z1:Z6 | 5 | Clases contables (Activo/Pasivo…) |
| `tb_naturaleza` | CONFIG | AB1:AB4 | 3 | Naturalezas (Deudora/Acreedora/Mixta) |
| `tb_tipo_operativo` | CONFIG | AD1:AD5 | 4 | Tipos operativos (Físico/Electrónico/…) |
| `tb_categorias` | CONFIG | AF1:AI14 | 13 | Categorías de movimiento |
| `tb_grupo_categoria` | CONFIG | AK1:AN10 | 9 | Grupos de categoría |
| `tb_segmentos` | CONFIG | AP1:AR7 | 6 | Segmentos de negocio |
| `tb_tasas_vigentes` | TASAS | A1:F6 | 5 | Tasas de cambio actuales |
| `tb_tasas_historial` | TASAS | H1:N14 | 13 | Historial de tasas pactadas |
| `tb_registro_rapido` | REGISTRO_RAPIDO | A10:M20 | 10 | Captura de lote en curso |
| `tb_mayor` | LIBRO_MAYOR | A1:S16 | 15 | Libro mayor acumulativo |

### Fórmulas clave en tablas estructuradas

- `tb_tasas_vigentes[ultima_actualizacion]`: `=TODAY()`

- `tb_registro_rapido[Moneda]`:  
  `=IF([@Cuenta]="","",IFERROR(XLOOKUP([@Cuenta],tb_cuentas[nombre_cuenta],tb_cuentas[moneda]),""))`

- `tb_registro_rapido[Tasa]`:  
  `=IF(OR([@Moneda]="",[@Moneda]="USD"),1,IF(AND([@[Tipo_DH]]="D",[@[USD_Manual_Debe]]<>"",[@[USD_Manual_Debe]]>0),[@Monto]/[@[USD_Manual_Debe]],IF(AND([@[Tipo_DH]]="H",[@[USD_Manual_Haber]]<>"",[@[USD_Manual_Haber]]>0),[@Monto]/[@[USD_Manual_Haber]],IFERROR(XLOOKUP([@Moneda],tb_tasas_vigentes[divisa],tb_tasas_vigentes[tasa_vs_USD]),1))))`

- `tb_registro_rapido[Debe_USD]`:  
  `=IF([@[USD_Manual_Debe]]<>"",[@[USD_Manual_Debe]],IF(OR([@[Tipo_DH]]<>"D",[@Monto]="",[@Monto]=0),0,LET(op,IFERROR(XLOOKUP([@Moneda],tb_tasas_vigentes[divisa],tb_tasas_vigentes[operacion]),"Error"),IF(op="Base",[@Monto],IF(op="Multiplicar",[@Monto]*[@Tasa],IF(op="Dividir",[@Monto]/[@Tasa],0))))))`

- `tb_registro_rapido[Haber_USD]`: simétrica a `Debe_USD` pero para `Tipo_DH="H"`.

- `tb_mayor[Codigo_Cuenta]`:  
  `=IF([@Cuenta]="","",IFERROR(XLOOKUP([@Cuenta],tb_cuentas[nombre_cuenta],tb_cuentas[codigo]),"N/A"))`

- `tb_mayor[Clase]`:  
  `=IF([@Cuenta]="","",IFERROR(XLOOKUP([@Cuenta],tb_cuentas[nombre_cuenta],tb_cuentas[clase]),"N/A"))`

- `tb_mayor[Debe_USD]` / `tb_mayor[Haber_USD]`: misma lógica LET con `operacion` de `tb_tasas_vigentes`.

## 3. Mapa de dependencias entre hojas

| Hoja origen | Lee datos de | Refs |
|---|---|---|
| Claude Log | (ninguna) | 0 |
| CONFIG | (ninguna) | 0 |
| CONFIG_AUX | CONFIG | 17 |
| TASAS | (ninguna) | 0 |
| AUDITOR_LOTES | LIBRO_MAYOR | 26 |
| REGISTRO_RAPIDO | CONFIG (20), TASAS (60), LIBRO_MAYOR (2) | 82 |
| LIBRO_MAYOR | CONFIG (60), TASAS (60) | 120 |
| SALDOS_Y_ENTIDADES | LIBRO_MAYOR (374), CONFIG (107), TASAS (80) | 561 |
| BALANCE | SALDOS_Y_ENTIDADES | 34 |
| PyL | LIBRO_MAYOR | 60 |
| FLUJO_CAJA | LIBRO_MAYOR (194), CONFIG (44) | 238 |
| DASHBOARD | SALDOS_Y_ENTIDADES (266), PyL (1) | 267 |
| REPORTE_BARRIDO | SALDOS_Y_ENTIDADES (5), LIBRO_MAYOR (16) | 21 |
| !CACHE! | LIBRO_MAYOR | 3 |
| PyL_POR_SEGMENTO | LIBRO_MAYOR (4800), CONFIG (400), CONFIG_AUX (21) | 5221 |

### Niveles de dependencia (de base a consumidor)

- **Nivel 0** (fuentes puras): `CONFIG`, `TASAS`, `Claude Log`
- **Nivel 1** (listas derivadas): `CONFIG_AUX` ← `CONFIG`
- **Nivel 2** (captura): `REGISTRO_RAPIDO` ← `CONFIG`, `TASAS`, `LIBRO_MAYOR` (para consecutivos)
- **Nivel 3** (mayor contable): `LIBRO_MAYOR` ← `CONFIG`, `TASAS`
- **Nivel 4** (motor de saldos): `SALDOS_Y_ENTIDADES` ← `LIBRO_MAYOR`, `CONFIG`, `TASAS`
- **Nivel 5** (reportes): `BALANCE`, `PyL`, `FLUJO_CAJA`, `PyL_POR_SEGMENTO`, `REPORTE_BARRIDO`, `AUDITOR_LOTES`
- **Nivel 6** (presentación): `DASHBOARD` ← `SALDOS_Y_ENTIDADES`, `PyL`

Hoja sin entrada desde ninguna otra hoja: `!CACHE!` (solo consume `LIBRO_MAYOR`; no es leída por nadie en fórmulas).

## 4. Diccionario de campos (columnas por tabla)

Ver detalle completo en cada archivo de hoja (`docs/hojas/*.md`). Para una vista sintética del dominio contable (qué significa cada columna), ver [`../00-arquitectura-y-datos-maestros.md`](../00-arquitectura-y-datos-maestros.md).
