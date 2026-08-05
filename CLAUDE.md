@AGENTS.md

# Portfolio — Fabricio Varela

Portfolio de una sola página con dock animado, cambio de tono e idioma en vivo, y un asistente de chat (OneChater) servido por LLMs gratuitos. Next.js 16 (App Router) + React 19 + Tailwind 4 + framer-motion 12.

## Respuestas: siempre caveman

**Todas las respuestas de chat van en modo caveman** (skill `caveman`, nivel `full` por defecto). No hace falta que el usuario lo pida cada vez ni que se invoque `/caveman`: es el default de este repo.

- Sustancia técnica completa. Muere solo el relleno: artículos, "básicamente/realmente", cortesías, hedging, narración de tool calls.
- **Idioma del usuario intacto.** Si escribe en español, se responde en español comprimido — caveman es el estilo, no el idioma.
- Código, comandos, nombres de API y errores: **byte por byte exactos**, nunca comprimidos.
- Nunca inventar abreviaturas (`cfg`, `impl`, `fn`): el tokenizer las parte igual, cero ahorro y se lee peor.
- **Se sale de caveman** para avisos de seguridad, confirmaciones de acciones irreversibles y cuando comprimir vuelva ambiguo el orden de pasos. Se vuelve al terminar esa parte.
- **Nada persistido fuera del chat va en caveman**: código, comentarios, mensajes de commit, docs, este archivo y texto de PR/issue se escriben en prosa normal.
- Apagar: "modo normal" o `/caveman off`. Niveles: `/caveman lite|full|ultra`.

Skills instaladas en `~/.claude/skills/` (no en el repo): `caveman`, `caveman-commit`, `caveman-review`, `caveman-compress`, `caveman-help`, `cavecrew`.

## Cierre de un pedido: corto

Al terminar una tarea no se explica todo lo que se hizo. Va solo lo más importante y se corta ahí.

- Nada de recapitular archivo por archivo, ni repetir la explicación del problema que el usuario ya conoce, ni justificar cada decisión: el porqué de cada cosa vive en los comentarios del código, no en el chat.
- El formato normal es dos o tres líneas: qué quedó andando y, si hay algo que el usuario tiene que saber o decidir, eso. Si no hay nada de eso, una línea alcanza.
- Se puede alargar solo si: algo quedó sin hacer o roto, hace falta una decisión del usuario, o el cambio tiene un efecto que no se ve desde donde miró el pedido. En esos casos va únicamente esa parte.
- El resultado de los checks (build, `tsc`, lint) se menciona en pocas palabras, sin volcar la salida si pasó.
- Si el usuario quiere el detalle, lo pide.

## Correr el proyecto

```bash
npm run dev     # next dev -> http://localhost:3000
npm run build
npm run lint    # eslint (usa eslint.config.mjs)
npx tsc --noEmit
```

Antes de levantar un dev server, fijarse si ya hay uno: `next dev` avisa `You can access the existing server at http://localhost:3000` en vez de arrancar otro. El lock vive en `.next/dev/lock`.

Ojo: existe una carpeta vieja del proyecto en `/home/fabricio/portfolio`. **El repo bueno es `/run/media/fabricio/0EF2E599F2E584F5/portfolio`**; si algo se ve raro, confirmar desde qué carpeta se levantó el server.

`eslint` tira ~28 errores preexistentes en `page.tsx` (casi todos `react-hooks/set-state-in-effect`). No son regresiones: al tocar el archivo, comparar contra esa línea de base en vez de apuntar a cero.

## Estructura

| Archivo | Qué hay |
|---|---|
| `src/app/page.tsx` | **Todo el sitio (~3000 líneas)**: dock, secciones, asistente, animaciones. Un solo componente `Home` con tabs, no rutas. |
| `src/app/layout.tsx` | Fuentes, metadata y el script inline anti-flash de tono/idioma. |
| `src/app/globals.css` | Variables de tema, `.dock-glass`, y la view transition del cambio de tono. |
| `src/app/api/chat/route.ts` | Endpoint del asistente: cadena de proveedores, rate limit, streaming SSE. |
| `src/lib/i18n.ts` | Toda la copia visible, es/en. |
| `src/lib/utils.ts` | `cn()` — clsx + tailwind-merge. |
| `src/components/ui/siri-wave.tsx` | Onda del asistente. |

`page.tsx` es grande a propósito: casi todo son animaciones acopladas al dock (`layoutId="dock"` compartido entre navbar, aviso y dock del asistente). Partirlo rompe los morphs. Antes de mover un componente afuera, verificar que no participe de ese layoutId.

## Convenciones

**Comentarios en español, explicando el porqué.** Todo el código está comentado así: minúscula, tono llano, y siempre el motivo o el intento fallido detrás de la decisión, nunca lo que el código ya dice. Ejemplo real:

```ts
// sin will-change: el dock está escalado 1.16 y, si se promueve a capa,
// el navegador rasteriza el texto a 1x y después lo agranda -> borroso
```

Al tocar este código, mantener esa densidad y ese idioma. Es la memoria de por qué las cosas están como están.

**Nada de texto hardcodeado en la UI.** Todo pasa por `src/lib/i18n.ts`. El objeto `es` es la fuente de verdad y `en` se tipa contra él: si falta una traducción, TypeScript lo marca. Se consume con `useLang()` → `{ lang, setLang, t }`.

**Tema por inversión de dos variables.** `--ink` (lo que era negro) y `--paper` (lo que era blanco) se dan vuelta en `:root[data-theme="light"]`, y Tailwind mapea `--color-black`/`--color-white` a ellas en `@theme inline`. Por eso cientos de `text-black/60` y `border-black/10` funcionan en los dos tonos **sin una sola clase `dark:`**. No agregar variantes `dark:`: romperían el modelo.

**El vidrio del dock va por clase, no por `style`.** Usar `DOCK_GLASS` (`.dock-glass` en `globals.css`). Con un `layoutId`, framer reescribe frame a frame las props de `style` que sabe corregir por escala — `box-shadow` entre ellas — y contra un `var(--…)` escribe `var(--glass-shadow)NaN`, que es inválido: la sombra desaparece en cada morph.

## Mecánicas delicadas

**Anti-flash de tono/idioma.** El script inline de `layout.tsx` corre durante el parseo y deja `data-theme` / `lang` en el `<html>` antes del primer pintado. React los lee de ahí al montar, nunca de `localStorage` en render. Esto produce un warning de hydration mismatch en dev sobre `data-theme` — es esperado, no un bug a arreglar.

**Cambio de tono.** El tono nuevo se destapa por una máscara circular que nace en el tamaño y la posición exactos de la pelota del dock, viaja al centro y se abre a `200vmax`. El recorrido está en `@keyframes theme-reveal`; el JS solo pone `--ball-x/y/d`. Durante la captura, `[data-morphing]` apaga **todas** las transiciones: si alguna corre, la foto congela colores a mitad de camino.

**Botones de tono e idioma.** Cuelgan de los bordes reales del dock (`dockLeft`/`dockRight`, medidos cada frame en `Home`), no de la mitad del ancho. Motivo: al arrastrar la burbuja más allá de un extremo, el dock se estira anclado a **un solo lado** (`transformOrigin: 0%/100%` + `navShift`); repartir el crecimiento 50/50 metía el borde estirado debajo de un botón y le abría un hueco al otro. La medición pasa de px de pantalla al espacio local dividiendo por la escala del contenedor, que durante la entrada vale 1.16.

**Burbuja del dock.** El gesto usa un proxy invisible con `x` crudo; la burbuja visible se dibuja aparte con `left`/`width` animados. Compartir canal mataba la animación, porque medir `dragConstraints` en cada re-render la corta a la mitad. `warpCenter` hace el imán a cada ítem y la banda elástica en los extremos.

**Asistente.** `/api/chat` encadena Groq → OpenRouter, y dentro de cada uno recorre varios modelos: 12s de timeout por modelo, 25s para toda la cadena. Un 429 pone al asistente a "descansar" (cooldown hasta 6h). Rate limit de **5 preguntas por IP por día**, contado solo en el servidor y solo cuando la respuesta salió de verdad — cuando el front también contaba, se adelantaba y bloqueaba una pregunta de más. Los avisos ("descansando", "límite", "me distraje") salen como **texto plano con status 200**, para que la UI los muestre como una burbuja normal y nunca como error.

Env vars en `.env.local` (no versionado): `GROQ_API_KEY`, `OPENROUTER_API_KEY`, y opcionales `GROQ_MODEL` / `OPENROUTER_MODEL`. Sin ninguna key, el asistente responde el mensaje de "descansando" en vez de romper.

El system prompt (bio, proyectos, contacto) vive duplicado es/en en `route.ts`. Si cambian los datos de Fabricio, hay que tocar **los dos**.
