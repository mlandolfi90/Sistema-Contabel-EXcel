# Código VBA — source of truth

Esta carpeta contiene los módulos VBA del sistema **exportados desde el `.xlsm`** y versionados aparte del binario.

## ¿Por qué?

Antes el código VBA vivía embebido en bloques markdown dentro de los `docs/*.md`. Cualquier cambio de una línea VBA producía un diff que tocaba el `.md` completo, dificultando revisión y `git blame`. Al separar:

- Los diffs de Git muestran solo las líneas VBA que cambiaron.
- `git blame` funciona a nivel de línea VBA real.
- Los `.md` quedan como documentación pura (qué hace, por qué, cómo se conecta).
- El issue tracker puede referenciar `docs/vba/Modulo2.bas#L100` directamente.

## Contenido

| Archivo | Tipo VBA | CodeName | Hoja visible | Rol | Estado |
|---|---|---|---|---|---|
| `Modulo1.bas` | Módulo estándar (`Type=1`) | Módulo1 | — | 🟢 Runtime (núcleo) | ✅ Extraído |
| `Modulo2.bas` | Módulo estándar (`Type=1`) | Módulo2 | — | 🟢 Runtime (auditor) | ✅ Extraído (fix #11) |
| `Modulo3.bas` | Módulo estándar (`Type=1`) | Módulo3 | — | ⚪ Auxiliar de desarrollo | ⏳ Pendiente — [issue #18](https://github.com/mlandolfi90/Sistema-Contabel-EXcel/issues/18) |
| `Hoja3.cls` | Código de hoja (`Type=100`) | Hoja3 | REGISTRO_RAPIDO | 🟢 Runtime (UX socios) | ✅ Extraído |

### ℹ️ Nota sobre `Modulo3.bas`

`Modulo3` contiene la macro auxiliar `ExportarTodoVBA_Completo`, una utilidad de desarrollo que exporta todos los componentes VBA del proyecto a una carpeta plana. **No es parte del runtime del sistema contable**: ningún flujo operativo (captura, guardado, auditoría, pacto, revalorización) lo invoca. El libro funciona normalmente aunque `Modulo3` no exista. Su extracción es higiene del repo, no requisito funcional.

## Workflow de sincronización con el `.xlsm`

### Cuando edites en VBE (Alt+F11)

1. En VBE, click derecho sobre el módulo → **Exportar archivo…**
2. Sobrescribe el `.bas`/`.cls` correspondiente en `docs/vba/`.
3. `git diff` te muestra exactamente qué líneas cambiaron.
4. Commit + push.

### Cuando edites el `.bas` aquí (recomendado para fixes con seguimiento de issue)

1. Edita `docs/vba/Modulo2.bas` (o el que corresponda) con tu editor habitual.
2. Commit + push (referencia el issue: `fix(#11): …`).
3. En VBE, click derecho sobre el módulo viejo → **Quitar Módulo2…** (sin exportar).
4. Click derecho sobre el proyecto → **Importar archivo…** → selecciona el `.bas` actualizado.
5. Guarda el `.xlsm`.

### Caso especial: `Hoja3.cls`

El código de hoja está atado al **CodeName** `Hoja3`. Al importar el `.cls`, VBE lo asocia automáticamente a la hoja existente con ese CodeName (no crea una hoja nueva). Antes de importar:

1. En VBE, abrir el módulo `Hoja3` existente → seleccionar todo → borrar.
2. Copiar el contenido de `docs/vba/Hoja3.cls` (sin los 6 primeros renglones `VERSION 1.0 CLASS` hasta `Option Explicit` inclusive, que VBE ya tiene implícitos al ser clase de hoja).
3. Pegar en el módulo `Hoja3` vacío.

Alternativa más limpia: usar la opción `Importar archivo` solo si antes eliminas manualmente el módulo `Hoja3` del explorador (no recomendado; las clases de hoja se recrean con mal CodeName).

## Reglas

- **Encoding**: UTF-8 sin BOM. VBE acepta UTF-8 al importar.
- **Atributo `VB_Name`** debe coincidir con el nombre del módulo en el proyecto (`Módulo1`, `Módulo2`, `Hoja3` con tilde donde aplica).
- **Constantes públicas** documentadas en este README cuando afecten reglas de negocio.

## Constantes públicas relevantes

| Constante | Módulo | Valor | Regla de negocio |
|---|---|---|---|
| `MAX_LINEAS_LOTE` | `Modulo2.bas` | `20` | Tope duro de líneas por lote. Sincronizar con capacidad física de `tb_registro_rapido` si se cambia. Ver [issue #11](https://github.com/mlandolfi90/Sistema-Contabel-EXcel/issues/11). |

## Funciones públicas compartidas

| Función | Definida en | Usada por |
|---|---|---|
| `colIdx(tb, nombreCol)` | `Modulo1.bas` | `Modulo1.bas`, `Modulo2.bas` |
| `LimpiarRegistro` | `Modulo1.bas` | `Modulo2.bas` |

## Trazabilidad de cambios

- `Modulo2.bas` — refactor + fix [issue #11](https://github.com/mlandolfi90/Sistema-Contabel-EXcel/issues/11): tope duro de 20 líneas, helper `ContarFilasLote` extraído de duplicación entre macros.
- `Modulo1.bas`, `Hoja3.cls` — extracción inicial sin cambios funcionales (source of truth movido de `.md` a `.bas`/`.cls`).
- `Modulo3.bas` — módulo **auxiliar de desarrollo** (no runtime). Pendiente de extracción por higiene del repo, sin impacto funcional (ver [issue #18](https://github.com/mlandolfi90/Sistema-Contabel-EXcel/issues/18)).
