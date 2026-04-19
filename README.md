# Panel de pre-diseño — Sistema Contable Multidivisa

Herramienta visual para iterar ideas de cambio sobre el libro Excel `Sistema_Contable_Automatico.xlsm` antes de ejecutarlas en VBA.

## Qué contiene

- **`index.html`** — el panel completo con 3 vistas sincronizadas (Flujo de macros, Estructura del libro, Kanban de ideas)
- **`data.json`** — archivo con el estado actual de las tarjetas de pre-diseño
- **`README.md`** — este archivo

## Cómo usar

### Abrir el panel localmente

1. Descargá `index.html` a tu PC
2. Doble clic — se abre en el navegador
3. Las tarjetas que crees se guardan en `localStorage` (persisten entre sesiones del mismo navegador)

### Publicar como página web (opcional)

Si querés acceder desde cualquier dispositivo:

1. Repo → Settings → Pages
2. Source: `main` / root
3. Save
4. Esperá unos minutos, obtenés una URL tipo `https://mlandolfi90.github.io/Sistema-Contabel-EXcel/`

## Flujo de trabajo

```
1. Capturar ideas en "Idea / por pensar"
        ↓
2. Madurarlas → mover a "En diseño"
        ↓
3. Definirlas → mover a "Listo para implementar"
        ↓
4. Botón "Copiar prompt VBA" → copia texto al portapapeles
        ↓
5. Pegar en chat con Claude → genera el VBA
        ↓
6. Aplicar cambios al libro Excel
```

## Sincronización entre dispositivos

El panel guarda en `localStorage` del navegador, que es por-dispositivo. Para mover tus ideas entre dispositivos:

1. **Exportar JSON** en el dispositivo origen (descarga `data.json`)
2. Subirlo al repo reemplazando el existente
3. En el otro dispositivo → **Importar JSON** pegando el contenido de `data.json`

## Integración con Claude

Si tenés la integración de GitHub activa en claude.ai:

1. En el chat → botón **+** → **Agregar desde GitHub**
2. Seleccionás este repo → `data.json`
3. Claude lee las tarjetas directamente y puede generar VBA sin necesidad de copiar/pegar

## Nodos del catálogo

El panel tiene precargados los elementos reales del sistema contable:

- **12 macros** (GuardarLote, LimpiarRegistro, ActualizarTasaVigente, etc.)
- **6 hojas** (REGISTRO_RAPIDO, LIBRO_MAYOR, TASAS, AUDITOR_LOTES, REPORTE_BARRIDO, SALDOS_Y_ENTIDADES)
- **10 tablas estructuradas** (tb_mayor, tb_registro_rapido, tb_tasas_vigentes, etc.)
- **5 rangos con nombre** (IDs_Unicos, ListaCuentaActiva, etc.)
- **1 regla** (AlertaSpread)

## Arquitectura de referencia

Ver los `.md` del proyecto para la documentación completa del sistema (extraída por IA del libro Excel original).
