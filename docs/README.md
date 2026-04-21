# Documentación — Sistema Contable Multidivisa V2

Índice de navegación. Leer en este orden para implementar desde cero.

## Orden de lectura recomendado

| # | Archivo | Contenido |
|---|---------|----------|
| 0 | [00-arquitectura.md](00-arquitectura.md) | Visión general, hojas, flujo de datos, componentes VBA |
| 1 | [01-datos-maestros.md](01-datos-maestros.md) | Tablas estructuradas, divisas, cuentas, entidades, named ranges |
| 2 | [02-implementacion.md](02-implementacion.md) | Construcción desde cero — orden exacto de pasos |
| 3 | [03-reglas-negocio.md](03-reglas-negocio.md) | Reglas de validación, spread, pacto, revalorización, anulación |

## Biblias de diseño

| Archivo | Contenido |
|---------|----------|
| [biblia-tecnica.md](biblia-tecnica.md) | Reglas técnicas del entorno Excel LTSC 2021 + VBA |
| [biblia-teorica.md](biblia-teorica.md) | Reglas conceptuales del sistema contable (independientes de plataforma) |
| [reglas-generales.md](reglas-generales.md) | Reglas transversales de diseño (nombres vs coordenadas, etc.) |

## Documentación VBA

Un `.md` por componente de código. Cada uno referencia su `.bas`/`.cls` como source of truth.

| Archivo | Componente |
|---------|-----------|
| [vba-modulo1-nucleo.md](vba-modulo1-nucleo.md) | `Modulo1.bas` — núcleo contable (GuardarLote, tasas, pacto, revalorización) |
| [vba-modulo2-auditor.md](vba-modulo2-auditor.md) | `Modulo2.bas` — auditor de lotes (navegación, corrección, duplicación) |
| [vba-hoja3-registro.md](vba-hoja3-registro.md) | `Hoja3.cls` — código de evento de `REGISTRO_RAPIDO` (toggle de socios) |

## Documentación por hoja

Carpeta [`hojas/`](hojas/) — una hoja = un archivo.

## Código VBA

Carpeta [`vba/`](vba/) — archivos `.bas` / `.cls` listos para importar en el editor VBA.

## Convenciones

- Las fórmulas se escriben con `~` inicial para evitar ejecución en el visor (en Excel usan `=`).
- `tb_*` = tabla estructurada (`ListObject`).
- Las columnas se referencian **por nombre**, nunca por posición.
