# Documentación — Sistema Contable Multidivisa V2

Índice de navegación. Leer en este orden para implementar desde cero.

## Orden de lectura recomendado

| # | Archivo | Contenido |
|---|---------|----------|
| 0 | [00-arquitectura.md](00-arquitectura.md) | Visión general, hojas, flujo de datos, componentes VBA |
| 1 | [01-datos-maestros.md](01-datos-maestros.md) | Tablas estructuradas, divisas, cuentas, entidades, named ranges |
| 2 | [02-implementacion.md](02-implementacion.md) | Construcción desde cero — orden exacto de pasos |
| 3 | [03-reglas-negocio.md](03-reglas-negocio.md) | Reglas de validación, spread, pacto, revalorización, anulación |

## Documentación por hoja

Carpeta [`hojas/`](hojas/) — una hoja = un archivo.

## Código VBA

Carpeta [`vba/`](vba/) — archivos `.bas` / `.cls` listos para importar en el editor VBA.

## Convenciones

- Las fórmulas se escriben con `~` inicial para evitar ejecución en el visor (en Excel usan `=`).
- `tb_*` = tabla estructurada (`ListObject`).
- Las columnas se referencian **por nombre**, nunca por posición.
