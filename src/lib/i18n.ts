"use client";

import { createContext, useContext } from "react";

export type Lang = "es" | "en";

// Todo el texto visible del sitio vive acá. La copia en español es la
// fuente de verdad: `en` se tipa contra ella, así que si se agrega una
// clave y falta su traducción, TypeScript lo marca.
const es = {
  nav: {
    inicio: "Inicio",
    sobre: "Sobre Mí",
    contacto: "Contacto",
    asistente: "Asistente",
  },
  hero: {
    role: "Web Developer, Full Stack",
    intro:
      "Me interesa entender como funcionan las cosas por dentro. Con criterio propio, y usando IA como copiloto para la productividad, construyo lo que se me cruce por la cabeza.",
    resume: "Currículum",
    // botón animado de la fila de enlaces: lleva la cámara adentro de la
    // pelota del logo del dock
    animation: "Animación",
    animationBack: "Tocá o Esc para volver",
  },
  sections: {
    proyectos: "Proyectos",
    educacion: "Educación",
    certificados: "Certificados",
    sobreMi: "Sobre Mí",
    contribuciones: "Contribuciones",
  },
  project: {
    featured: "Más popular",
    site: "Sitio web",
    repo: "Repositorio",
    details: "Ver más detalles",
    backend: "Backend",
    logoAlt: (title: string) => `Logo de ${title}`,
    // demo embebida: solo la tienen los proyectos que se dejan meter en un
    // iframe (ver el campo `demo` en page.tsx)
    demo: "Probar acá",
    demoClose: "Cerrar la demo",
    demoHint: "Es el proyecto de verdad, corriendo acá adentro.",
    demoFrame: (title: string) => `Demo de ${title}`,
  },
  projects: {
    onechater: {
      description:
        "Plataforma de chat unificada que integra GPT, Claude y Gemini con memoria personal privada, Fusion Mode para combinar respuestas de varios modelos y busqueda semantica en el historial.",
      backend:
        "Conexion de los asistentes: orquesta en simultaneo las APIs de OpenAI, Anthropic y Google, sincroniza el contexto entre modelos para el Fusion Mode y guarda la memoria personal cifrada por usuario.",
    },
    antena8: {
      description:
        "Portal de noticias de Antena 8 (98.1 FM, Tucuman) con cobertura de politica, economia, deportes y cultura. Incluye reproductor de radio persistente, cotizacion del dolar en tiempo real, clima, modo oscuro y panel administrativo con editor rich-text.",
      backend:
        "API routes de Next.js con Prisma sobre PostgreSQL (Neon serverless), autenticacion con NextAuth v5 por credenciales y JWT, y Vercel Blob para el almacenamiento de imagenes.",
    },
    colorlab: {
      description:
        "Generador de paletas de colores armonicas basado en el espacio de color OKLCH, con 6 tipos de armonia, chequeo de contraste WCAG 2.1 y exportacion a CSS variables, HEX, OKLCH, HSL y Tailwind CSS. Sin frameworks ni build, motor OKLCH propio.",
      backend:
        "Sin backend: todo el motor de color OKLCH corre client-side en JavaScript vanilla, sin dependencias ni build, servido como sitio estatico.",
    },
  },
  education: [
    {
      id: "santo-domingo",
      period: "Actual",
      institution: "Instituto Santo Domingo",
      // etiqueta corta para el rail de scroll
      short: "Instituto Santo Domingo",
      program: "Técnico/a Superior en Desarrollo Web y Aplicaciones Digitales",
      bullets: [
        "Título oficial de validez nacional.",
        "Incluye la certificacion intermedia de Desarrollador de Sitios Web (no oficial).",
        "Plan de estudios aprobado por el Expte. N° 0111-065420/2022, con respaldo institucional y reconocimiento academico.",
      ],
    },
    {
      id: "autoformacion",
      period: "2022 - presente",
      institution:
        "Autoformación en Desarrollo de Software, Programación e Inteligencia Artificial",
      short: "Autoformación",
      program: "En Internet",
      bullets: [
        "Especializacion autodidacta en tecnologias web, programacion de software e integracion de modelos de inteligencia artificial.",
        "Conocimientos en administracion de sistemas Linux y Windows, y manejo de maquinas virtuales.",
        "Desarrollo de herramientas de codigo abierto y aplicaciones web.",
      ],
    },
  ],
  certifications: {
    "claude-code-101": {
      description:
        "Certificado de finalizacion del curso introductorio de Anthropic sobre Claude Code. Cubre el flujo de trabajo agentic, comandos basicos y buenas practicas para programar con Claude Code.",
      tags: ["Claude Code", "Agentic Coding", "CLI", "Anthropic"],
    },
    "claude-code-in-action": {
      description:
        "Certificado de finalizacion del curso practico de Anthropic sobre Claude Code. Aplica Claude Code en proyectos reales: refactors, debugging y automatizacion de tareas de desarrollo.",
      tags: ["Claude Code", "Automatizacion", "Debugging", "Anthropic"],
    },
    "ai-skills-fest-2026": {
      description:
        "Los participantes demuestran conocimientos fundamentales y aplicados de IA, incluyendo como usar herramientas de IA para mejorar la productividad, crear contenido y resolver problemas del mundo real. Identifican casos de uso practicos, aplican la IA de forma responsable y siguen desarrollando habilidades a traves de rutas de aprendizaje guiadas.",
      tags: ["IA", "Productividad", "IA Responsable", "Aprendizaje Guiado"],
    },
  },
  cert: { view: "Ver credencial ↗" },
  contributions: {
    total: (n: number) => `${n} en el último año`,
    day: (count: number, date: string) => `${count} contribuciones el ${date}`,
    profile: "Ver perfil en GitHub ↗",
  },
  months: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ],
  about: {
    intro:
      "Soy web developer con experiencia en desarrollo full stack y una fuerte orientación hacia la integración de inteligencia artificial en flujos de trabajo y aplicaciones, para mejorar la productividad y los productos. Me apasiona entender cómo funcionan las cosas desde adentro, aplicando un enfoque responsable y con criterio propio en cada proyecto que emprendo.",
    highlights: [
      {
        id: "trabajo",
        title: "Como trabajo",
        text: "Uso la IA como copiloto, no como reemplazo: entiendo lo que construyo de adentro hacia afuera antes de confiar en el resultado.",
      },
      {
        id: "intereses",
        title: "Lo que me interesa",
        text: "Desarrollo full stack, sistemas de IA aplicados a productos reales, y entender como funcionan las herramientas que uso todos los dias.",
      },
      {
        id: "formacion",
        title: "Formacion",
        text: "Técnico/a Superior en Desarrollo Web y Aplicaciones Digitales (en curso) en Instituto Santo Domingo, mas aprendizaje autodidacta en Linux, Windows y maquinas virtuales.",
      },
    ],
    // los nombres se cruzan contra techIcons en page.tsx; el que no tiene
    // icono se muestra igual, solo con su nombre
    tools: {
      title: "Con qué trabajo",
      items: [
        "Arch Linux",
        "VS Code",
        "Git",
        "GitHub",
        "TypeScript",
        "Next.js",
        "Tailwind CSS",
        "PostgreSQL",
        "Prisma",
        "Vercel",
        "Claude Code",
      ],
      note: "Todo sobre Linux, y la IA metida en el editor y en la terminal, no en una pestaña aparte.",
    },
    offline: {
      title: "Fuera del código",
      text: "Soy de Tucumán. Aprendí a programar por mi cuenta desde 2022, rompiendo cosas en máquinas virtuales hasta entender por qué se rompían, y sigue siendo la forma en la que aprendo cualquier cosa nueva.",
    },
  },
  assistant: {
    heading: "Asistente",
    close: "Cerrar asistente",
    thinking: "El asistente está pensando",
    greeting: "¡Hola! ¿Qué tal?",
    subtitle: "Preguntame lo que quieras sobre Fabricio.",
    suggestions: [
      "¿Quién es Fabricio?",
      "¿Cuáles son sus proyectos?",
      "¿Qué stack usa?",
      "Contame sobre sus estudios",
      "¿Cómo lo contacto?",
    ],
    placeholder: "Escribí tu pregunta...",
    send: "Enviar",
    saturated: "Las IAs están saturadas…",
    saturatedHint: "probá de nuevo en un rato 😴",
    resting: "El asistente está descansando 😴",
    limit: "Llegaste al límite de preguntas por hoy 🙂",
    oops: "Uy, me distraje un segundo 😅. Probá de nuevo en un ratito.",
    // modo reclutador: se pega una búsqueda laboral y el asistente contesta
    // qué encaja y qué no, en vez de charlar
    match: {
      chip: "Pegá una búsqueda laboral",
      placeholder: "Pegá acá la descripción del puesto…",
      hint: "Te digo qué encaja con lo que hizo Fabricio y qué no.",
      exit: "Volver al chat normal",
    },
    // botones que el asistente puede colgar de una respuesta para llevar al
    // visitante a la parte del sitio de la que está hablando
    action: {
      go: (label: string) => `Llevame a ${label}`,
      demo: (label: string) => `Probar ${label} acá`,
    },
  },
  notice: {
    before: "El asistente está hecho con ",
    after: ", mi chat multimodelo.",
    close: "Cerrar aviso",
  },
  toggle: {
    toLight: "Cambiar a tono claro",
    toDark: "Cambiar a tono oscuro",
    // el botón muestra el idioma al que se cambia
    lang: "Cambiar a inglés",
    langCode: "EN",
  },
  scrollspy: { goTo: (label: string) => `Ir a ${label}` },
  contact: {
    lede: "¿Tenés una búsqueda abierta, un proyecto o una idea a medio armar? Escribime por donde te quede más cómodo.",
    location: "Tucumán, Argentina · trabajo remoto",
    channels: {
      github: "Todo lo que construí, con su historial de commits.",
      linkedin:
        "El lugar para hablar de trabajo. Es por donde más rápido contesto.",
    },
    assistant: {
      title: "¿Preguntas rápidas?",
      text: "El asistente del sitio sabe de mí, de mis proyectos y de mi stack. Si querés chequear algo antes de escribirme, preguntale a él.",
      cta: "Abrir el asistente",
    },
  },
};

const en: typeof es = {
  nav: {
    inicio: "Home",
    sobre: "About",
    contacto: "Contact",
    asistente: "Assistant",
  },
  hero: {
    role: "Web Developer, Full Stack",
    intro:
      "I like understanding how things work under the hood. With my own judgment, and using AI as a copilot for productivity, I build whatever crosses my mind.",
    resume: "Resume",
    animation: "Animation",
    animationBack: "Tap or press Esc to go back",
  },
  sections: {
    proyectos: "Projects",
    educacion: "Education",
    certificados: "Certificates",
    sobreMi: "About Me",
    contribuciones: "Contributions",
  },
  project: {
    featured: "Most popular",
    site: "Website",
    repo: "Repository",
    details: "More details",
    backend: "Backend",
    logoAlt: (title: string) => `${title} logo`,
    demo: "Try it here",
    demoClose: "Close the demo",
    demoHint: "It's the real project, running right here.",
    demoFrame: (title: string) => `${title} demo`,
  },
  projects: {
    onechater: {
      description:
        "Unified chat platform that brings GPT, Claude and Gemini together with private personal memory, Fusion Mode to combine answers from several models, and semantic search across the history.",
      backend:
        "Assistant wiring: orchestrates the OpenAI, Anthropic and Google APIs in parallel, syncs context between models for Fusion Mode, and stores personal memory encrypted per user.",
    },
    antena8: {
      description:
        "News portal for Antena 8 (98.1 FM, Tucumán) covering politics, economy, sports and culture. Includes a persistent radio player, live dollar exchange rate, weather, dark mode and an admin panel with a rich-text editor.",
      backend:
        "Next.js API routes with Prisma over PostgreSQL (Neon serverless), NextAuth v5 authentication with credentials and JWT, and Vercel Blob for image storage.",
    },
    colorlab: {
      description:
        "Harmonic color palette generator built on the OKLCH color space, with 6 harmony types, WCAG 2.1 contrast checking and export to CSS variables, HEX, OKLCH, HSL and Tailwind CSS. No frameworks, no build step, custom OKLCH engine.",
      backend:
        "No backend: the whole OKLCH color engine runs client-side in vanilla JavaScript, with no dependencies or build step, served as a static site.",
    },
  },
  education: [
    {
      id: "santo-domingo",
      period: "Current",
      institution: "Instituto Santo Domingo",
      short: "Instituto Santo Domingo",
      program: "Higher Technical Degree in Web and Digital App Development",
      bullets: [
        "Official degree, valid nationwide.",
        "Includes the intermediate Website Developer certification (unofficial).",
        "Curriculum approved under file No. 0111-065420/2022, with institutional backing and academic recognition.",
      ],
    },
    {
      id: "autoformacion",
      period: "2022 - present",
      institution:
        "Self-taught in Software Development, Programming and Artificial Intelligence",
      short: "Self-taught",
      program: "Online",
      bullets: [
        "Self-taught specialization in web technologies, software programming and integration of artificial intelligence models.",
        "Knowledge of Linux and Windows system administration, and virtual machine management.",
        "Development of open source tools and web applications.",
      ],
    },
  ],
  certifications: {
    "claude-code-101": {
      description:
        "Certificate of completion for Anthropic's introductory course on Claude Code. Covers the agentic workflow, core commands and best practices for coding with Claude Code.",
      tags: ["Claude Code", "Agentic Coding", "CLI", "Anthropic"],
    },
    "claude-code-in-action": {
      description:
        "Certificate of completion for Anthropic's hands-on course on Claude Code. Applies Claude Code to real projects: refactors, debugging and automation of development tasks.",
      tags: ["Claude Code", "Automation", "Debugging", "Anthropic"],
    },
    "ai-skills-fest-2026": {
      description:
        "Participants demonstrate foundational and applied AI knowledge, including how to use AI tools to boost productivity, create content and solve real-world problems. They identify practical use cases, apply AI responsibly and keep building skills through guided learning paths.",
      tags: ["AI", "Productivity", "Responsible AI", "Guided Learning"],
    },
  },
  cert: { view: "View credential ↗" },
  contributions: {
    total: (n: number) => `${n} in the last year`,
    day: (count: number, date: string) => `${count} contributions on ${date}`,
    profile: "View GitHub profile ↗",
  },
  months: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  about: {
    intro:
      "I'm a web developer with full stack experience and a strong focus on bringing artificial intelligence into workflows and applications, to improve both productivity and the products themselves. I'm passionate about understanding how things work from the inside, with a responsible approach and my own judgment on every project I take on.",
    highlights: [
      {
        id: "trabajo",
        title: "How I work",
        text: "I use AI as a copilot, not as a replacement: I understand what I build from the inside out before trusting the result.",
      },
      {
        id: "intereses",
        title: "What interests me",
        text: "Full stack development, AI systems applied to real products, and understanding how the tools I use every day actually work.",
      },
      {
        id: "formacion",
        title: "Education",
        text: "Higher Technical Degree in Web and Digital App Development (in progress) at Instituto Santo Domingo, plus self-taught learning in Linux, Windows and virtual machines.",
      },
    ],
    tools: {
      title: "What I work with",
      items: [
        "Arch Linux",
        "VS Code",
        "Git",
        "GitHub",
        "TypeScript",
        "Next.js",
        "Tailwind CSS",
        "PostgreSQL",
        "Prisma",
        "Vercel",
        "Claude Code",
      ],
      note: "All of it on Linux, with AI built into the editor and the terminal instead of living in a separate tab.",
    },
    offline: {
      title: "Away from the code",
      text: "I'm from Tucumán, Argentina. I taught myself to program from 2022 on, breaking things inside virtual machines until I understood why they broke, and that's still how I learn anything new.",
    },
  },
  assistant: {
    heading: "Assistant",
    close: "Close assistant",
    thinking: "The assistant is thinking",
    greeting: "Hey! How's it going?",
    subtitle: "Ask me anything about Fabricio.",
    suggestions: [
      "Who is Fabricio?",
      "What projects has he built?",
      "What stack does he use?",
      "Tell me about his studies",
      "How can I contact him?",
    ],
    placeholder: "Type your question...",
    send: "Send",
    saturated: "The AIs are overloaded…",
    saturatedHint: "try again in a while 😴",
    resting: "The assistant is taking a break 😴",
    limit: "You reached today's question limit 🙂",
    oops: "Oops, I got distracted for a second 😅. Try again in a bit.",
    match: {
      chip: "Paste a job posting",
      placeholder: "Paste the job description here…",
      hint: "I'll tell you what matches Fabricio's work and what doesn't.",
      exit: "Back to normal chat",
    },
    action: {
      go: (label: string) => `Take me to ${label}`,
      demo: (label: string) => `Try ${label} here`,
    },
  },
  notice: {
    before: "The assistant is built with ",
    after: ", my multi-model chat.",
    close: "Close notice",
  },
  toggle: {
    toLight: "Switch to light tone",
    toDark: "Switch to dark tone",
    lang: "Cambiar a español",
    langCode: "ES",
  },
  scrollspy: { goTo: (label: string) => `Go to ${label}` },
  contact: {
    lede: "Got an open role, a project, or an idea that's still half-formed? Write to me wherever suits you best.",
    location: "Tucumán, Argentina · working remotely",
    channels: {
      github: "Everything I've built, with its commit history.",
      linkedin: "The place to talk about work. It's where I reply fastest.",
    },
    assistant: {
      title: "Quick questions?",
      text: "The site's assistant knows about me, my projects and my stack. If you want to check something before writing, ask it.",
      cta: "Open the assistant",
    },
  },
};

export const copy = { es, en } as const;
export type Copy = typeof es;

export const LangContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Copy;
}>({ lang: "es", setLang: () => {}, t: es });

export const useLang = () => useContext(LangContext);
