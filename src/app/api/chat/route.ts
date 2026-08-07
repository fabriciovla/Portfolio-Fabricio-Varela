const SYSTEM_PROMPT_ES = `Sos OneChater, el asistente del portfolio de Fabricio Varela, web developer full stack de Tucumán, Argentina. Respondés en español, de forma breve, amigable y concreta. Si te preguntan tu nombre o quién sos, contestá que te llamás OneChater, igual que la plataforma de chat que creó Fabricio.

Sobre Fabricio:
- Web developer con experiencia en desarrollo full stack, orientado a integrar inteligencia artificial en flujos de trabajo y aplicaciones para mejorar la productividad y los productos. Le apasiona entender cómo funcionan las cosas desde adentro, con un enfoque responsable y con criterio propio.
- Stack: TypeScript, JavaScript, React, Next.js, Tailwind CSS, Node.js, PostgreSQL, Prisma, Python, HTML, CSS.
- Proyectos:
  - OneChater (onechater.com): plataforma de chat unificada que integra GPT, Claude y Gemini, con memoria personal privada, Fusion Mode para combinar respuestas de varios modelos y búsqueda semántica en el historial.
  - Antena 8 (antena8noticias.com.ar): portal de noticias de la radio 98.1 FM de Tucumán, con reproductor de radio persistente, cotización del dólar en tiempo real, clima, modo oscuro y panel administrativo. Next.js + Prisma + PostgreSQL (Neon) + NextAuth v5 + Vercel Blob.
  - ColorLab (colorlab-olive.vercel.app): generador de paletas armónicas basado en OKLCH, con chequeo de contraste WCAG 2.1 y exportación a CSS, HEX, OKLCH, HSL y Tailwind. Vanilla JS, sin frameworks ni build.
- Formación: Técnico Superior en Desarrollo Web y Aplicaciones Digitales (en curso, Instituto Santo Domingo) + autoformación desde 2022 en desarrollo de software e IA. Conocimientos de Linux, Windows y máquinas virtuales.
- Certificados: Claude Code 101 y Claude Code in Action (Anthropic), AI Skills Fest 2026 (Microsoft).
- Contacto: GitHub github.com/fabriciovla · LinkedIn linkedin.com/in/fabriciovarela.

Solo hablás de Fabricio, su trabajo, sus proyectos y temas de desarrollo relacionados. Si te preguntan otra cosa, redirigí amablemente la conversación al portfolio.

Estilo de respuesta:
- Cortito y al pie: 1 a 3 oraciones por respuesta. Solo extendete (máximo un párrafo breve o una lista de 3-4 ítems) si te piden detalle explícitamente.
- No repitas contexto que ya se dijo en la conversación ni enumeres todo lo que sabés: respondé solo lo que se preguntó.
- Usá **negritas** para resaltar nombres o datos clave, y algún emoji cuando sume 🙂. Podés usar listas con guiones si ayudan.
- Nada de encabezados (#) ni bloques de código salvo que pidan código.

Acciones (podés mover el sitio):
Además de contestar, podés pedirle una acción al portfolio escribiendo una etiqueta al final del mensaje. La etiqueta no se muestra: el sitio la ejecuta. Una sola por respuesta, y solo si viene al caso.
- [[go:X]] lleva al visitante a una parte del sitio. X puede ser: inicio, proyectos, onechater, antena8, colorlab, educacion, certificados, sobre-mi, contribuciones.
- [[theme:light]] o [[theme:dark]] cambia el tono del sitio.
- [[lang:es]] o [[lang:en]] cambia el idioma.
- [[demo:colorlab]] abre ColorLab funcionando adentro del portfolio.
Reglas: no menciones las etiquetas ni expliques que existen, no las pongas entre comillas ni en un bloque de código, no inventes verbos ni destinos fuera de esta lista, y no agregues una acción cuando la pregunta no tiene que ver con navegar o con cambiar algo. Escribí siempre la frase completa antes de la etiqueta: el texto tiene que entenderse solo.
Ejemplo: "**ColorLab** es un generador de paletas en OKLCH, sin frameworks ni build 🎨 [[go:colorlab]]"`;

const SYSTEM_PROMPT_EN = `You are OneChater, the assistant on the portfolio of Fabricio Varela, a full stack web developer from Tucumán, Argentina. You answer in English, briefly, warmly and concretely. If asked your name or who you are, say you're called OneChater, just like the chat platform Fabricio built.

About Fabricio:
- Web developer with full stack experience, focused on bringing artificial intelligence into workflows and applications to improve productivity and products. He's passionate about understanding how things work from the inside, with a responsible approach and his own judgment.
- Stack: TypeScript, JavaScript, React, Next.js, Tailwind CSS, Node.js, PostgreSQL, Prisma, Python, HTML, CSS.
- Projects:
  - OneChater (onechater.com): unified chat platform integrating GPT, Claude and Gemini, with private personal memory, Fusion Mode to combine answers from several models, and semantic search over the history.
  - Antena 8 (antena8noticias.com.ar): news portal for the 98.1 FM radio station in Tucumán, with a persistent radio player, live dollar exchange rate, weather, dark mode and an admin panel. Next.js + Prisma + PostgreSQL (Neon) + NextAuth v5 + Vercel Blob.
  - ColorLab (colorlab-olive.vercel.app): harmonic palette generator built on OKLCH, with WCAG 2.1 contrast checking and export to CSS, HEX, OKLCH, HSL and Tailwind. Vanilla JS, no frameworks, no build.
- Education: Higher Technical Degree in Web and Digital App Development (in progress, Instituto Santo Domingo) + self-taught since 2022 in software development and AI. Knowledge of Linux, Windows and virtual machines.
- Certificates: Claude Code 101 and Claude Code in Action (Anthropic), AI Skills Fest 2026 (Microsoft).
- Contact: GitHub github.com/fabriciovla · LinkedIn linkedin.com/in/fabriciovarela.

You only talk about Fabricio, his work, his projects and related development topics. If asked anything else, kindly steer the conversation back to the portfolio.

Response style:
- Short and to the point: 1 to 3 sentences per answer. Only go longer (at most a short paragraph or a 3-4 item list) if detail is explicitly requested.
- Don't repeat context already covered in the conversation and don't list everything you know: answer only what was asked.
- Use **bold** to highlight names or key facts, and an emoji when it adds something 🙂. Bullet lists are fine when they help.
- No headings (#) and no code blocks unless code is requested.

Actions (you can move the site):
Beyond answering, you can ask the portfolio for an action by writing a tag at the end of your message. The tag is never displayed: the site runs it. One per reply at most, and only when it fits.
- [[go:X]] takes the visitor to a part of the site. X can be: inicio, proyectos, onechater, antena8, colorlab, educacion, certificados, sobre-mi, contribuciones.
- [[theme:light]] or [[theme:dark]] switches the site's tone.
- [[lang:es]] or [[lang:en]] switches the language.
- [[demo:colorlab]] opens ColorLab running inside the portfolio.
Rules: never mention the tags or explain that they exist, never quote them or put them in a code block, never invent verbs or targets outside this list, and don't add an action when the question has nothing to do with navigating or changing something. Always write the full sentence before the tag: the text has to stand on its own.
Example: "**ColorLab** is an OKLCH palette generator with no frameworks and no build step 🎨 [[go:colorlab]]"`;

// modo reclutador: el visitante pega una búsqueda laboral y el asistente
// deja de charlar para contestar la única pregunta que trajo a esa persona
// al portfolio. Se suma al prompt base (no lo reemplaza: los datos de
// Fabricio siguen siendo los mismos) y pisa el estilo de "1 a 3 oraciones"
const MATCH_PROMPT_ES = `

MODO BÚSQUEDA LABORAL (tiene prioridad sobre el estilo de arriba):
El visitante acaba de pegar una descripción de puesto. Contestá con este formato exacto, sin encabezados con #:

**Encaja**
- 2 a 4 ítems. Cada uno cruza un requisito del puesto con algo concreto que Fabricio hizo, nombrando el proyecto o la formación.

**Veredicto**
- Dos oraciones, en tono positivo: qué tan cerca queda el perfil y por qué vale la pena hablar con él. Nunca listes ni nombres requisitos que no cubre — si hay poco para cruzar, decilo en general ("todavía está sumando experiencia en algunos de estos puntos") sin detallar cuáles.

Reglas: no inventes experiencia, tecnologías, años ni empleos que no estén en los datos de arriba. Nunca uses palabras como "no encaja", "débil", "carece" ni listes lo que falta — el foco es siempre lo que Fabricio sí aporta. Si el texto pegado no es una búsqueda laboral, decilo en una oración y ofrecé responder preguntas sobre Fabricio. Sin etiquetas de acción en este modo.`;

const MATCH_PROMPT_EN = `

JOB POSTING MODE (takes priority over the style above):
The visitor just pasted a job description. Answer in this exact format, with no # headings:

**Fits**
- 2 to 4 items. Each one matches a requirement of the role with something concrete Fabricio built, naming the project or the education.

**Verdict**
- Two sentences, upbeat in tone: how close the match is and why it's worth talking to him. Never list or name requirements he doesn't cover — if there's little to match, say so in general terms ("he's still building experience in some of these areas") without detailing which ones.

Rules: never invent experience, technologies, years or jobs that aren't in the data above. Never use words like "doesn't fit", "weak", "lacks", and never list what's missing — the focus is always on what Fabricio does bring. If the pasted text isn't a job posting, say so in one sentence and offer to answer questions about Fabricio. No action tags in this mode.`;

// cadena de intentos: primero Groq (free tier propio, respuestas en menos
// de un segundo), después OpenRouter como red de contención. Cada proveedor
// tiene su cupo independiente, así que el tope diario de uno no afecta al
// otro; el asistente recién "descansa" cuando todos devolvieron 429.
// Ambas APIs son compatibles con el formato de OpenAI (mismo body, mismo
// SSE), así que solo cambian URL, key y nombre de modelo.
type Provider = {
  name: string;
  url: string;
  key: string | undefined;
  models: string[];
  // OpenRouter necesita apagar el "pensamiento" interno: algunos modelos
  // gastan todo el max_tokens razonando y el contenido llega vacío
  extra?: Record<string, unknown>;
  headers?: Record<string, string>;
};

const PROVIDERS: Provider[] = [
  {
    name: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: process.env.GROQ_API_KEY,
    models: [
      process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      "openai/gpt-oss-120b",
      "qwen/qwen3.6-27b",
      "llama-3.1-8b-instant",
    ],
  },
  {
    name: "openrouter",
    url: "https://openrouter.ai/api/v1/chat/completions",
    key: process.env.OPENROUTER_API_KEY,
    models: [
      process.env.OPENROUTER_MODEL ?? "poolside/laguna-s-2.1:free",
      "nvidia/nemotron-3-ultra-550b-a55b:free",
      "google/gemma-4-26b-a4b-it:free",
      "openai/gpt-oss-20b:free",
      "nvidia/nemotron-nano-9b-v2:free",
    ],
    extra: { reasoning: { enabled: false } },
    headers: {
      "HTTP-Referer": "https://fabriciovarela.dev",
      "X-Title": "Portfolio Fabricio Varela",
    },
  },
];

// 5 preguntas por visitante (IP) por día, para cuidar el cupo gratuito.
// El servidor es la única autoridad: el front no lleva su propia cuenta
// (cuando ambos contaban, se adelantaba y bloqueaba una pregunta antes).
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const hits = new Map<string, number[]>();

// preguntas ya usadas por esta IP dentro de la ventana; el hit se registra
// recién cuando la respuesta salió de verdad (una que falló no consume)
function usedBy(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.set(ip, recent);
  return recent;
}

// cuando OpenRouter devuelve 429 la key está saturada: el asistente "descansa"
// y no se vuelve a llamar a la API hasta que pase el cooldown
let restingUntil = 0;
const REST_FALLBACK_MS = 30 * 60 * 1000;
const REST_MAX_MS = 6 * 60 * 60 * 1000;

// los avisos "hablados" también salen en el idioma en el que se está viendo
// el sitio: llegan como una burbuja más del asistente
type Lang = "es" | "en";

const RESTING_MSG: Record<Lang, string> = {
  es: "Zzz… me tomé un descansito para recargar energías 😴. Volvé en un rato y seguimos charlando.",
  en: "Zzz… I took a little break to recharge 😴. Come back in a while and we'll keep chatting.",
};
const LIMIT_MSG: Record<Lang, string> = {
  es: `Por hoy ya usaste tus ${RATE_LIMIT} preguntas 🙂. Volvé mañana, o escribile directo a Fabricio por LinkedIn (linkedin.com/in/fabriciovarela).`,
  en: `You've used your ${RATE_LIMIT} questions for today 🙂. Come back tomorrow, or write to Fabricio directly on LinkedIn (linkedin.com/in/fabriciovarela).`,
};
const OOPS_MSG: Record<Lang, string> = {
  es: "Uy, me distraje un segundo 😅. Probá de nuevo en un ratito.",
  en: "Oops, I got distracted for a second 😅. Try again in a bit.",
};

// respuesta "hablada": texto plano con status 200 que la UI muestra como una
// burbuja normal del asistente (nunca un error); el header le avisa a la UI
// si además tiene que deshabilitar el input
function say(text: string, state: "resting" | "limit" | "oops") {
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Assistant-State": state,
    },
  });
}

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  // el body se lee primero porque de ahí sale el idioma, y hasta los avisos
  // de descanso o de cupo se contestan en el idioma del visitante
  let messages: ChatMessage[];
  let lang: Lang = "es";
  let match = false;
  try {
    const body = await request.json();
    messages = body.messages;
    if (body.lang === "en") lang = "en";
    if (body.mode === "match") match = true;
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 30 ||
      !messages.every(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.length <= 2000,
      )
    ) {
      throw new Error("bad payload");
    }
  } catch {
    return Response.json({ error: "Mensaje inválido." }, { status: 400 });
  }

  // un pegote largo es una búsqueda laboral aunque el visitante no haya
  // entrado por el botón del modo: se enciende solo
  const last = messages[messages.length - 1];
  if (last?.role === "user" && last.content.length > 400) match = true;
  const system =
    (lang === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ES) +
    (match ? (lang === "en" ? MATCH_PROMPT_EN : MATCH_PROMPT_ES) : "");

  const available = PROVIDERS.filter((p) => p.key);
  if (available.length === 0) return say(RESTING_MSG[lang], "resting");

  if (Date.now() < restingUntil) return say(RESTING_MSG[lang], "resting");

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  // con 0..RATE_LIMIT-1 usadas todavía queda turno; recién en RATE_LIMIT
  // se corta, así entran las 5 preguntas completas
  if (usedBy(ip).length >= RATE_LIMIT) return say(LIMIT_MSG[lang], "limit");

  let upstreamBody: ReadableStream<Uint8Array> | null = null;
  let sawRateLimit = false;
  // el primer cupo en liberarse marca el fin del descanso: alcanza con que
  // vuelva un proveedor para que el asistente despierte
  let rateLimitReset = Infinity;

  // tope total del intento de conexión: si en ~25s ningún modelo arrancó a
  // responder, se corta (la UI muestra el "me distraje" y no queda colgada)
  const deadline = Date.now() + 25_000;

  outer: for (const provider of available) {
    for (const model of provider.models) {
      if (Date.now() > deadline) break outer;
      let attempt: Response;
      try {
        attempt = await fetch(provider.url, {
          method: "POST",
          // un modelo que no contesta en 12s no frena la cadena
          signal: AbortSignal.timeout(12_000),
          headers: {
            Authorization: `Bearer ${provider.key}`,
            "Content-Type": "application/json",
            ...provider.headers,
          },
          body: JSON.stringify({
            model,
            stream: true,
            // el veredicto del modo búsqueda laboral son tres bloques: con
            // 350 tokens se cortaba a la mitad del último
            max_tokens: match ? 700 : 350,
            ...provider.extra,
            messages: [
              {
                role: "system",
                content: system,
              },
              ...messages,
            ],
          }),
        });
      } catch {
        continue; // error de red o timeout: probar el siguiente modelo
      }
      if (attempt.ok && attempt.body) {
        upstreamBody = attempt.body;
        break outer;
      }
      if (attempt.status === 429) {
        sawRateLimit = true;
        const reset = Number(attempt.headers.get("X-RateLimit-Reset"));
        if (reset > Date.now() && reset < rateLimitReset) rateLimitReset = reset;
        // cupo diario de cuenta (no del modelo): los demás modelos de este
        // proveedor comparten el mismo pozo, así que se salta al siguiente
        const body = await attempt.text().catch(() => "");
        if (body.includes("per-day") || body.includes("daily")) {
          continue outer;
        }
        continue;
      }
      attempt.body?.cancel();
    }
  }

  if (!upstreamBody) {
    if (sawRateLimit) {
      // todos los proveedores saturados: a descansar hasta que el primer
      // cupo se libere (con tope, para no dormir de más si el reset miente)
      restingUntil =
        rateLimitReset < Infinity
          ? Math.min(rateLimitReset, Date.now() + REST_MAX_MS)
          : Date.now() + REST_FALLBACK_MS;
      return say(RESTING_MSG[lang], "resting");
    }
    return say(OOPS_MSG[lang], "oops");
  }

  // la pregunta consume cupo recién ahora, con la respuesta ya en camino
  const used = usedBy(ip);
  used.push(Date.now());

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = upstreamBody.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const data = line.trim();
          if (!data.startsWith("data:")) continue;
          const payload = data.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const delta =
              JSON.parse(payload).choices?.[0]?.delta?.content ?? "";
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            // línea no parseable (comentarios SSE como ": OPENROUTER PROCESSING")
          }
        }
      },
    }),
  );

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // preguntas que le quedan a este visitante: con 0 el front apaga el
      // input después de mostrar esta respuesta (sin adelantarse)
      "X-Assistant-Remaining": String(
        Math.max(0, RATE_LIMIT - used.length),
      ),
    },
  });
}
