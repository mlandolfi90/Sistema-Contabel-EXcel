# Hoja: CONFIG

> Catálogos maestros del sistema. Contiene 11 tablas estructuradas (`ListObject`) con toda la configuración de divisas, entidades, cuentas, categorías y segmentos.  
> Generado: 2026-04-19

## Dimensiones

- UsedRange: `A1:AR200` (200 filas × 44 columnas).
- El contenido real vive en `A1:AR14` (tablas).
- La fila 200 contenía una celda de prueba (eliminada en R1).

## Estructura visual

- **Zonas:** 11 tablas estructuradas dispuestas horizontalmente.
- Paneles congelados: fila 1.
- Orden: posición 3.
- Color de pestaña: `#7030A0` (morado).
- Visible, no protegida.

## Tablas estructuradas (resumen)

### `tb_divisas` (A1:F6) — 5 divisas

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

### `tb_clase_cuenta` (Z1:Z6)
Valores: `Activo`, `Pasivo`, `Patrimonio`, `Ingreso`, `Gasto`.

### `tb_naturaleza` (AB1:AB4)
Valores: `Deudora`, `Acreedora`, `Mixta`.

### `tb_tipo_operativo` (AD1:AD5)
Valores: `Físico`, `Electrónico`, `Virtual`, `Patrimonial`.

### `tb_categorias` (AF1:AI14) — 13 categorías

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
Valores: `Operativa`, `Ganancia`, `Gasto`, `Distribución`, `Socio`, `Movimiento`, `Ajuste`, `Personal`.

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

186 celdas con validación, agrupadas en **14 reglas únicas** (listas en la versión original del archivo).

## Protección

Hoja **NO protegida**.
