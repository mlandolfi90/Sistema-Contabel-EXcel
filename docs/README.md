# Documentación técnica — Sistema Contable Multidivisa V2

Esta carpeta contiene la documentación técnica del libro de Excel VBA que el panel v2 gestiona.

## Archivos

| # | Archivo | Qué contiene |
|---|---|---|
| 00 | [`00-arquitectura-y-datos-maestros.md`](./00-arquitectura-y-datos-maestros.md) | Visión general del sistema, hojas, tablas estructuradas, datos maestros, flujo de datos, reglas de negocio |
| 01 | [`01-modulo-nucleo-contable.md`](./01-modulo-nucleo-contable.md) | Módulo1.bas — GuardarLote, LimpiarRegistro, ActualizarTasaVigente, GenerarAsientoPacto, RevalorizarCuenta (con código fuente) |
| 02 | [`02-modulo-auditor-lotes.md`](./02-modulo-auditor-lotes.md) | Módulo2.bas — LoteAnterior, LoteSiguiente, AccionSobreLoteVisible, DuplicarLoteConID, CorregirLoteConID (con código fuente) |
| 03 | [`03-hoja-registro-rapido.md`](./03-hoja-registro-rapido.md) | Hoja3.cls — Eventos de REGISTRO_RAPIDO (selección múltiple de socios en B3) |
| 04 | `constructo-sistema.md` | Inventario técnico exhaustivo del libro: todas las tablas, rangos, fórmulas, validaciones por hoja *(pendiente de subir)* |

## Uso

- Estos `.md` son la **fuente de verdad** de lo que hace el código VBA del libro.
- El panel v2 (en `/v2/`) permite crear ideas de cambio ancladas a macros, hojas o tablas descritas acá.
- Cuando una idea pasa a estado `listo`, el botón "Copiar prompt VBA" arma una instrucción para implementar el cambio.

## Mantenimiento

Si modificás código VBA del libro, **actualizá el `.md` correspondiente en esta carpeta** para que la documentación siga reflejando la realidad.
