# Documentación técnica de hojas del libro Excel

Esta carpeta tiene **un archivo por cada hoja** del libro `Sistema_Contable_Automatico.xlsm`. Cada archivo documenta: celdas estáticas, fórmulas, validaciones, formato condicional, dropdowns, protección y riesgos detectados.

## Índice de hojas

### Hojas de configuración (fuentes de datos maestros)
| # | Hoja | Rol |
|---|---|---|
| 1 | [`config.md`](./config.md) | Catálogos maestros (divisas, entidades, cuentas, categorías, segmentos…) |
| 2 | [`config-aux.md`](./config-aux.md) | Listas derivadas filtradas (las que alimentan los dropdowns) |
| 3 | [`tasas.md`](./tasas.md) | Tasas vigentes + historial de tasas pactadas |

### Hojas operativas
| # | Hoja | Rol |
|---|---|---|
| 4 | [`registro-rapido.md`](./registro-rapido.md) | Formulario de captura de lotes nuevos |
| 5 | [`libro-mayor.md`](./libro-mayor.md) | Libro mayor acumulativo |
| 6 | [`auditor-lotes.md`](./auditor-lotes.md) | Panel de navegación y auditoría de lotes |

### Hojas de cálculo (consolidados y reportes)
| # | Hoja | Rol |
|---|---|---|
| 7 | [`saldos-y-entidades.md`](./saldos-y-entidades.md) | Motor de saldos (bloque puente entre mayor y reportes) |
| 8 | [`balance.md`](./balance.md) | Balance General (Estado de Situación Financiera) |
| 9 | [`pyl.md`](./pyl.md) | Estado de Resultados (P&L) |
| 10 | [`pyl-por-segmento.md`](./pyl-por-segmento.md) | P&L desglosado por segmento de negocio |
| 11 | [`flujo-caja.md`](./flujo-caja.md) | Flujo de caja por período |
| 12 | [`dashboard.md`](./dashboard.md) | Panel ejecutivo consolidado |
| 13 | [`reporte-barrido.md`](./reporte-barrido.md) | Distribución de utilidad entre socios (asistente de pacto) |
| 14 | [`cache.md`](./cache.md) | Hoja interna con métricas globales del mayor |

### Transversal
| # | Archivo | Rol |
|---|---|---|
| 0 | [`00-transversal.md`](./00-transversal.md) | Named ranges, tablas estructuradas y mapa de dependencias entre hojas |
| — | [`05-actualizaciones.md`](./05-actualizaciones.md) | Histórico de cambios post-documentación (5 rondas de correcciones 2026-04-19) |

## Criterio

- **1 hoja = 1 archivo** para navegar rápido.
- Cada archivo mantiene el mismo formato: Dimensiones → Estructura visual → Celdas estáticas → Fórmulas → Validaciones → FC → Dropdowns → Protección → Riesgos detectados.
- Origen: inventario exhaustivo generado por IA el 2026-04-19.

## Notación

- Las fórmulas se muestran con `~` inicial para evitar que Markdown o sandboxes las interpreten. **En el libro real empiezan con `=`**.
- `46130` es el número serie de fecha de `11/04/2026`.
- `tb_*` son tablas estructuradas de Excel (`ListObject`).
