# Hoja: CONFIG

> Catálogos maestros del sistema. Contiene 11 tablas estructuradas (`ListObject`) con toda la configuración de divisas, entidades, cuentas, categorías y segmentos.  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:AR200` (200 filas × 44 columnas).
- El contenido real vive en `A1:AR14` (tablas).
- La fila 200 contenía una celda de prueba (eliminada en R1).

## Estructura visual

- **Zonas:** 11 tablas estructuradas dispuestas horizontalmente (catálogos maestros), una columna vacía de separación entre cada una.
- Celdas combinadas: ninguna.
- Paneles congelados: fila 1 (`frozenRows=1`).
- Orden en el libro: posición 3.
- Color de pestaña: `#7030A0` (morado).
- Estado: Visible. No protegida.

## Tablas estructuradas (resumen)

### `tb_divisas` (A1:F6) — 5 divisas

Columnas: `divisa`, `es_base`, `tipo`, `decimales`, `activa`, `simbolo`.

| divisa | es_base | tipo | decimales | activa | simbolo |
|---|---|---|---|---|---|
| USD | SI | Fiat | 2 | SI | $ |
| USDT | NO | Cripto | 2 | SI | ₮ |
| Bs | NO | Fiat | 2 | SI | Bs |
| Oro | NO | Commodity | 2 | SI | gr |
| EUR | NO | Fiat | 2 | SI | € |

### `tb_tipo_divisa` (H1:H4)
Valores: `Fiat`, `Cripto`, `Commodity`.

### `tb_entidades` (J1:M7) — 6 entidades
| entidad | tipo_entidad | activa | notas |
|---|---|---|---|
| Socio01 | Socio | SI | Socio fundador |
| Socio02 | Socio | SI | |
| Socio03 | Socio | SI | |
| Tercero | Tercero | SI | Genérico para clientes/proveedores |
| Binance | Externo | SI | Exchange |
| BDV | Banco | SI | Banco de Venezuela |

### `tb_tipo_entidad` (O1:O6)
Valores: `Socio`, `Tercero`, `Externo`, `Interno`, `Banco`.

### `tb_cuentas` (Q1:X21) — 20 cuentas contables

Columnas: `codigo`, `nombre_cuenta`, `clase`, `naturaleza`, `tipo_operativo`, `moneda`, `permite_revalorizacion`, `activa`.

Ejemplos clave:

| codigo | nombre_cuenta | clase | moneda | permite_reval | activa |
|---|---|---|---|---|---|
| 1101 | Binance Socio03 | Activo | USDT | SI | SI |
| 1102 | Banco de Venezuela | Activo | Bs | SI | SI |
| 1104 | Billetera USD | Activo | USD | NO | SI |
| 1106 | Bolsillo Oro | Activo | Oro | SI | SI |
| 1302 | Cuentas Pendientes | Activo | USD | NO | SI |
| 2102 | Utilidad Distribuible | Pasivo | USD | NO | SI |
| 3100 | Capital / Aportes Socios | Patrimonio | USD | NO | SI |
| 3101 | Cta. Corriente Socio03 | Patrimonio | USD | NO | SI |
| 3102 | Cta. Corriente Socio01 | Patrimonio | USD | NO | SI |
| 3103 | Cta. Corriente Socio02 | Patrimonio | USD | NO | SI |
| 4100 | Utilidad en Operaciones | Ingreso | USD | NO | SI |
| 4200 | Ganancia por Revalorización | Ingreso | USD | NO | SI |
| 5100 | Costo de Ventas | Gasto | USD | NO | SI |
| 5200 | Gastos Operativos | Gasto | USD | NO | SI |
| 5300 | Gastos Personales | Gasto | USD | NO | SI |
| 5400 | Pérdida por Revalorización | Gasto | USD | NO | SI |

(Listado completo de las 20 cuentas en el libro real.)

### `tb_clase_cuenta` (Z1:Z6)
Valores: `Activo`, `Pasivo`, `Patrimonio`, `Ingreso`, `Gasto`.

### `tb_naturaleza` (AB1:AB4)
Valores: `Deudora`, `Acreedora`, `Mixta`.

### `tb_tipo_operativo` (AD1:AD5)
Valores: `Físico`, `Electrónico`, `Virtual`, `Patrimonial`.

### `tb_categorias` (AF1:AI14) — 13 categorías

Columnas: `categoria`, `grupo`, `afecta_utilidad_distribuible`, `genera_reporte_barrido`.

| categoria | grupo | afecta_UD | genera_RB |
|---|---|---|---|
| Venta/Cambio | Operativa | NO | SI |
| Compra | Operativa | NO | NO |
| Cobro de Tercero | Operativa | NO | NO |
| Pago a Tercero | Operativa | NO | NO |
| Generación Utilidad | Ganancia | SI | SI |
| Gasto Distribuible | Gasto | SI | SI |
| Pacto Utilidades | Distribución | SI | NO |
| Aporte Socio | Socio | NO | NO |
| Retiro Socio | Socio | NO | NO |
| Transferencia Interna | Movimiento | NO | NO |
| Revalorización | Ajuste | NO | NO |
| Gasto Operativo | Gasto | NO | NO |
| Gasto Personal | Personal | NO | NO |

### `tb_grupo_categoria` (AK1:AN10)
Valores en columna A: `Operativa`, `Ganancia`, `Gasto`, `Distribución`, `Socio`, `Movimiento`, `Ajuste`, `Personal`. Las columnas B-D (`Columna1-3`) están vacías.

### `tb_segmentos` (AP1:AR7) — 6 segmentos

| segmento | descripcion | activo |
|---|---|---|
| Oficina | Negocios Hechos de OroKalipso | SI |
| Cambios | Operaciones en criptomonedas (USDT, trading) | SI |
| Oro | Inversión y operaciones con oro físico | SI |
| Personal | Gastos y movimientos personales de socios | SI |
| Compartido | Gastos que se prorratean mensualmente | SI |
| General | Default para ajustes contables y transversales | SI |

## Fórmulas

Solo 1 fórmula original (`B200 = =2+3`, celda de prueba eliminada en R1).

## Validaciones de datos

186 celdas con validación, agrupadas en **14 reglas únicas**:

| # | Rango | Tipo | Fuente |
|---|---|---|---|
| 1 | B2:B6 (`tb_divisas[es_base]`) | List | `SI,NO` literal |
| 2 | C2:C6 (`tb_divisas[tipo]`) | List | `=ListaTipoDivisa` |
| 3 | E2:E6 (`tb_divisas[activa]`) | List | `SI,NO` literal |
| 4 | K2:K7 (`tb_entidades[tipo_entidad]`) | List | `=ListaTipoEntidad` |
| 5 | L2:L7 (`tb_entidades[activa]`) | List | `SI,NO` literal |
| 6 | S2:S21 (`tb_cuentas[clase]`) | List | `=ListaClase` |
| 7 | T2:T21 (`tb_cuentas[naturaleza]`) | List | `=ListaNaturaleza` |
| 8 | U2:U21 (`tb_cuentas[tipo_operativo]`) | List | `=ListaTipoOperativo` |
| 9 | V2:V21 (`tb_cuentas[moneda]`) | List | `=ListaDivisa` |
| 10 | W2:W21 (`tb_cuentas[permite_revalorizacion]`) | List | `SI,NO` literal |
| 11 | X2:X21 (`tb_cuentas[activa]`) | List | `SI,NO` literal |
| 12 | AG2:AG14 (`tb_categorias[grupo]`) | List | `=$AK$2:$AK$10` (ref directa) |
| 13 | AH2:AH14 (`tb_categorias[afecta_utilidad_distribuible]`) | List | `SI,NO` literal |
| 14 | AI2:AI14 (`tb_categorias[genera_reporte_barrido]`) | List | `SI,NO` literal |

Todas con `inCellDropDown=true`, sin mensaje de entrada ni alerta de error.

## Formato condicional

Ninguno.

## Protección

Hoja **NO protegida**.
