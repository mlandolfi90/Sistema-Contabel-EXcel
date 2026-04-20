# Código VBA — source of truth

Esta carpeta contiene los módulos VBA del sistema **exportados desde el `.xlsm`** y versionados aparte del binario.

## ¿Por qué?

Antes el código VBA vivía embebido en bloques markdown dentro de `docs/02-modulo-auditor-lotes.md` y similares. Eso significaba que cualquier cambio de una sola línea VBA producía un diff que tocaba el `.md` completo, dificultando la revisión y el rastreo de cambios. Al separar el código:

- Los diffs de Git muestran solo las líneas VBA que cambiaron.
- `git blame` funciona a nivel de línea de código VBA real.
- Los `.md` quedan como documentación pura (qué hace, por qué, cómo se conecta).
- El issue tracker puede referenciar `docs/vba/Modulo2.bas#L100` directamente.

## Contenido

| Archivo | Tipo VBA | CodeName | Hoja visible |
|---|---|---|---|
| `Modulo2.bas` | Módulo estándar (`Type=1`) | Módulo2 | — |
| _(pendiente)_ `Modulo1.bas` | Módulo estándar | Módulo1 | — |
| _(pendiente)_ `Modulo3.bas` | Módulo estándar | Módulo3 | — |
| _(pendiente)_ `Hoja3.cls` | Código de hoja (`Type=100`) | Hoja3 | REGISTRO_RAPIDO |

## Workflow de sincronización con el `.xlsm`

### Cuando edites en VBE (Alt+F11)

1. En VBE, click derecho sobre el módulo → **Exportar archivo…**
2. Sobrescribe el `.bas`/`.cls` correspondiente en `docs/vba/`.
3. `git diff` te muestra exactamente qué líneas cambiaron.
4. Commit + push.

### Cuando edites el `.bas` aquí (recomendado para fixes con seguimiento de issue)

1. Edita `docs/vba/Modulo2.bas` con tu editor habitual.
2. Commit + push (referencia el issue: `fix(#11): …`).
3. En VBE, click derecho sobre el módulo viejo → **Quitar Módulo2** (sin exportar).
4. Click derecho sobre el proyecto → **Importar archivo…** → selecciona el `.bas` actualizado.
5. Guarda el `.xlsm`.

## Reglas

- **Encoding**: UTF-8 sin BOM. VBE acepta UTF-8 al importar.
- **Atributo `VB_Name`** debe coincidir con el nombre del módulo en el proyecto (`Módulo2` con tilde).
- **Constantes públicas** documentadas en este README cuando afecten reglas de negocio (ej. `MAX_LINEAS_LOTE` en `Modulo2.bas`).

## Trazabilidad de cambios actuales

- `Modulo2.bas` incluye el fix del [issue #11](https://github.com/mlandolfi90/sistema-contabel-excel/issues/11): tope duro de 20 líneas por lote, validación previa con aborto ruidoso, helper `ContarFilasLote` extraído de las dos macros que duplicaban la lógica.
