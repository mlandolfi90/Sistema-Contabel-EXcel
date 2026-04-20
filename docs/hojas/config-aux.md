# Hoja: CONFIG_AUX

> Hoja auxiliar con listas activas derramadas (dynamic arrays). Alimenta los dropdowns que necesitan filtrar por `activa=SI`.  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:H21` (21 filas × 8 columnas).
- 8 fórmulas derramadas en fila 2 alimentan dropdowns filtrados en todo el libro.

## Estructura visual

- Fila 1: encabezados (nombres lógicos de listas).
- Fila 2: fórmulas derramadas (**dynamic arrays**).
- Filas 3-21: derrame de resultados (solo visibles, no contienen fórmulas).
- Orden: posición 5.
- Color de pestaña: ninguno.
- Visible, no protegida.

## Propósito

Las fórmulas `FILTER` no pueden usarse directamente dentro de Validación de Datos en Excel. Por eso se derraman acá, y los named ranges apuntan al rango derramado con la notación `#` (ej: `=CONFIG_AUX!$A$2#`).

## Celdas estáticas (solo encabezados)

| Celda | Valor |
|---|---|
| A1 | Cuentas_Activas |
| B1 | Entidades_Activas |
| C1 | Categorias_Activas |
| D1 | Socios_Activos |
| E1 | Divisas_Activas |
| F1 | Segmentos Activos |
| G1 | Cuentas Ingreso |
| H1 | Cuentas Gasto |

## Fórmulas (las 8 dinámicas)

| Celda | Fórmula | Qué calcula |
|---|---|---|
| A2 | `=FILTER(tb_cuentas[nombre_cuenta],tb_cuentas[activa]="SI")` | Cuentas activas |
| B2 | `=FILTER(tb_entidades[entidad],tb_entidades[activa]="SI")` | Entidades activas |
| C2 | `=tb_categorias[categoria]` | Categorías (sin filtrar) |
| D2 | `=FILTER(tb_entidades[entidad],tb_entidades[tipo_entidad]="Socio")` | Solo socios |
| E2 | `=FILTER(tb_divisas[divisa],tb_divisas[activa]="SI")` | Divisas activas |
| F2 | `=FILTER(tb_segmentos[segmento],tb_segmentos[activo]="SI","")` | Segmentos activos |
| G2 | `=SORT(FILTER(tb_cuentas[nombre_cuenta],(tb_cuentas[clase]="Ingreso")*(tb_cuentas[activa]="SI"),""))` | Cuentas de ingreso (A→Z) |
| H2 | `=SORT(FILTER(tb_cuentas[nombre_cuenta],(tb_cuentas[clase]="Gasto")*(tb_cuentas[activa]="SI"),""))` | Cuentas de gasto (A→Z) |

## Valores derramados actuales

- **A2# Cuentas_Activas** (20 elementos): Binance Socio03, Banco de Venezuela, Billetera Bs Personal, Billetera USD, Zelle, Bolsillo Oro, Oficina Bs Efectivo, Cuenta Corriente Negocio, Cuentas Pendientes, Utilidad Distribuible, Capital / Aportes Socios, Cta. Corriente Socio03, Cta. Corriente Socio01, Cta. Corriente Socio02, Utilidad en Operaciones, Ganancia por Revalorización, Costo de Ventas, Gastos Operativos, Gastos Personales, Pérdida por Revalorización.
- **B2# Entidades_Activas** (6): Socio01, Socio02, Socio03, Tercero, Binance, BDV.
- **C2# Categorias_Activas** (13): Venta/Cambio, Compra, Cobro de Tercero, Pago a Tercero, Generación Utilidad, Gasto Distribuible, Pacto Utilidades, Aporte Socio, Retiro Socio, Transferencia Interna, Revalorización, Gasto Operativo, Gasto Personal.
- **D2# Socios_Activos** (3): Socio01, Socio02, Socio03.
- **E2# Divisas_Activas** (5): USD, USDT, Bs, Oro, EUR.
- **F2# Segmentos Activos** (6): Oficina, Cambios, Oro, Personal, Compartido, General.
- **G2# Cuentas Ingreso** (2): Ganancia por Revalorización, Utilidad en Operaciones.
- **H2# Cuentas Gasto** (4): Costo de Ventas, Gastos Operativos, Gastos Personales, Pérdida por Revalorización.

## Named ranges que dependen de esta hoja

| Named range | Apunta a | Usado por |
|---|---|---|
| `ListaCuentaActiva` | `=CONFIG_AUX!$A$2#` | DV de cuenta en `tb_registro_rapido` |
| `ListaEntidadActiva` | `=CONFIG_AUX!$B$2#` | DV de entidad |
| `ListaCategoriaActiva` | `=CONFIG_AUX!$C$2#` | DV de categoría |
| `ListaSocios` | `=CONFIG_AUX!$D$2#` | Dropdown de socio destinatario |
| `ListaDivisaActiva` | `=CONFIG_AUX!$E$2#` | DV de moneda operativa |
| `ListaSegmentoActiva` | `=CONFIG_AUX!$F$2#` | DV de segmento |

Las columnas G/H (Cuentas Ingreso/Gasto) derraman pero actualmente no hay named range público que las referencie; podrían usarse en reportes PyL.

## Validaciones de datos

Ninguna. CONFIG_AUX es **origen** de validaciones, no consumidor.

## Formato condicional

Ninguno.

## Dropdowns

Ninguno (la hoja alimenta dropdowns en otras hojas via named ranges).

## Protección

Hoja **NO protegida**.
