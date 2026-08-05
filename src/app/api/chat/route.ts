const SYSTEM_PROMPT = `Sos OneChater, el asistente del portfolio de Fabricio Varela, web developer full stack de Tucumán, Argentina. Respondés en español, de forma breve, amigable y concreta. Si te preguntan tu nombre o quién sos, contestá que te llamás OneChater, igual que la plataforma de chat que creó Fabricio.

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
- Nada de encabezados (#) ni bloques de código salvo que pidan código.`;

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

const RESTING_MSG =
  "Zzz… me tomé un descansito para recargar energías 😴. Volvé en un rato y seguimos charlando.";
const LIMIT_MSG = `Por hoy ya usaste tus ${RATE_LIMIT} preguntas 🙂. Volvé mañana, o escribile directo a Fabricio por LinkedIn (linkedin.com/in/fabriciovarela).`;
const OOPS_MSG = "Uy, me distraje un segundo 😅. Probá de nuevo en un ratito.";

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
  const available = PROVIDERS.filter((p) => p.key);
  if (available.length === 0) return say(RESTING_MSG, "resting");

  if (Date.now() < restingUntil) return say(RESTING_MSG, "resting");

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  // con 0..RATE_LIMIT-1 usadas todavía queda turno; recién en RATE_LIMIT
  // se corta, así entran las 5 preguntas completas
  if (usedBy(ip).length >= RATE_LIMIT) return say(LIMIT_MSG, "limit");

  let messages: ChatMessage[];
  try {
    const body = await request.json();
    messages = body.messages;
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
            max_tokens: 350,
            ...provider.extra,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
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
      return say(RESTING_MSG, "resting");
    }
    return say(OOPS_MSG, "oops");
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
