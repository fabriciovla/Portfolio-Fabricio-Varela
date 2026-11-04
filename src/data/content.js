// Todo el texto y los datos visibles del sitio viven acá, no dentro de los
// componentes. Así un componente solo sabe "cómo se ve" y acá está "qué dice":
// para cambiar un texto o sumar un proyecto no hace falta tocar HTML.

export const hero = {
  name: 'Fabricio Varela',
  role: 'Web Developer, Full Stack',
  intro:
    'Me interesa entender como funcionan las cosas por dentro. Con criterio propio, y usando IA como copiloto para la productividad, construyo lo que se me cruce por la cabeza.',
  links: [
    { label: 'GitHub', href: 'https://github.com/fabriciovla' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/fabriciovarela' },
    { label: 'Currículum', href: '#' },
  ],
}

export const header = {
  brand: 'FV',
  brandLabel: 'Fabricio Varela, inicio',
  links: [
    { label: 'GitHub', href: 'https://github.com/fabriciovla' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/fabriciovarela' },
  ],
  contact: 'Contáctame',
  email: 'fabriciovarelagm@gmail.com',
}

// textos de la tarjeta de proyectos y de su vista abierta. Cada app
// reutiliza el sitio/repo de `projects` (más abajo) y suma una descripción corta
export const showcase = {
  title: 'Mis proyectos',
  open: 'Abrir proyectos',
  close: 'Cerrar',
  openApp: 'Abrir app',
  moreInfo: 'Más información',
  apps: [
    {
      id: 'beauty-apps',
      label: 'beauty apps',
      name: 'Beauty Apps',
      description:
        'Ecosistema de utilidades nativas para Windows creadas con foco en diseño, fluidez y simplicidad, donde conviven Beauty Shell y Beauty Screenshot.',
    },
    {
      id: 'beauty-shell',
      label: 'beauty shell',
      name: 'Beauty Shell',
      description:
        'Una terminal clara, rápida y lista para acompañar todo lo que hacés. La terminal más bonita para Windows.',
    },
    {
      id: 'beauty-screenshot',
      label: 'beauty screenshot',
      name: 'Beauty Screenshot',
      description:
        'Capturas de pantalla simples y lindas. La captura queda copiada o guardada, y descansa un momento en la esquina como en Mac.',
    },
    {
      id: 'onechater',
      label: 'onechater',
      name: 'OneChater',
      description: 'Un chat unificado con GPT, Claude y Gemini, con memoria personal privada.',
    },
    {
      id: 'conext',
      label: 'conext',
      name: 'Conext',
      description:
        'Agentes de IA que responden precios, stock y envíos con los datos de tu negocio. Si el cliente cambia de canal, la conversación sigue.',
    },
  ],
}

export const aboutShowcase = {
  title: 'Sobre mí',
  open: 'Abrir sobre mí',
  close: 'Cerrar',
  intro:
    'Soy web developer con experiencia en desarrollo full stack y una fuerte orientación hacia la integración de inteligencia artificial en flujos de trabajo y aplicaciones, para mejorar la productividad y los productos. Me apasiona entender cómo funcionan las cosas desde adentro, aplicando un enfoque responsable y con criterio propio en cada proyecto que emprendo.',
  items: [
    {
      id: 'como-trabajo',
      title: 'Como trabajo',
      description:
        'Uso la IA como copiloto, no como reemplazo: entiendo lo que construyo de adentro hacia afuera antes de confiar en el resultado.',
    },
    {
      id: 'intereses',
      title: 'Lo que me interesa',
      description:
        'Desarrollo full stack, sistemas de IA aplicados a productos reales, y entender como funcionan las herramientas que uso todos los dias.',
    },
    {
      id: 'formacion',
      title: 'Formacion',
      description:
        'Técnico/a Superior en Desarrollo Web y Aplicaciones Digitales (en curso) en Instituto Santo Domingo, mas aprendizaje autodidacta en Linux, Windows y maquinas virtuales.',
    },
    {
      id: 'herramientas',
      title: 'Con qué trabajo',
      tags: [
        'Arch Linux',
        'VS Code',
        'Git',
        'GitHub',
        'TypeScript',
        'Vue',
        'PostgreSQL',
        'Prisma',
        'Vercel',
        'Claude Code',
      ],
      description:
        'Todo sobre Linux, y la IA metida en el editor y en la terminal, no en una pestaña aparte.',
    },
  ],
}

export const sections = {
  proyectos: 'Proyectos',
  educacion: 'Educación',
  certificados: 'Certificados',
  sobreMi: 'Sobre Mí',
  contribuciones: 'Contribuciones',
  contacto: 'Contacto',
}

export const projectLabels = {
  featured: 'Más popular',
  site: 'Sitio web',
  repo: 'Repositorio',
  details: 'Ver más detalles',
  backend: 'Backend',
  logoAlt: (title) => `Logo de ${title}`,
}

export const projects = [
  {
    id: 'beauty-apps',
    title: 'Beauty Apps',
    stack: ['TypeScript', 'HTML', 'CSS'],
    site: 'https://beauty-shell.vercel.app/',
    repo: '#',
    details: '#',
    featured: false,
    logo: '/logos/beauty-apps.png',
    description:
      'Ecosistema de utilidades nativas para Windows creadas con foco en diseño, fluidez y simplicidad, donde conviven Beauty Shell y Beauty Screenshot.',
    backend:
      'Plataforma central de presentación y distribución de las herramientas de escritorio de la suite Beauty Apps.',
  },
  {
    id: 'beauty-shell',
    title: 'Beauty Shell',
    stack: ['TypeScript', 'HTML', 'CSS'],
    site: 'https://beauty-shell.vercel.app/shell/',
    repo: '#',
    details: '#',
    featured: false,
    logo: '/logos/beauty-shell.png',
    description:
      'Una terminal clara, rápida y lista para acompañar todo lo que hacés. La terminal más bonita para Windows.',
    backend:
      'Aplicación de escritorio para Windows optimizada para arranque instantáneo y bajo consumo de recursos.',
  },
  {
    id: 'beauty-screenshot',
    title: 'Beauty Screenshot',
    stack: ['TypeScript', 'HTML', 'CSS'],
    site: 'https://beauty-shell.vercel.app/screenshot/',
    repo: '#',
    details: '#',
    featured: false,
    logo: '/logos/beauty-screenshot.png',
    description:
      'Capturas de pantalla simples y lindas. La captura queda copiada o guardada, y descansa un momento en la esquina como en Mac.',
    backend:
      'Utilidad nativa para Windows con captura rápida al portapapeles o disco y miniatura flotante temporal.',
  },
  {
    id: 'onechater',
    title: 'OneChater',
    stack: ['TypeScript', 'HTML', 'CSS', 'JavaScript', 'PLpgSQL', 'Python'],
    site: 'https://onechater.com',
    repo: '#',
    details: '#',
    featured: true,
    logo: '/logos/onechater.svg',
    description:
      'Plataforma de chat unificada que integra GPT, Claude y Gemini con memoria personal privada, Fusion Mode para combinar respuestas de varios modelos y busqueda semantica en el historial.',
    backend:
      'Conexion de los asistentes: orquesta en simultaneo las APIs de OpenAI, Anthropic y Google, sincroniza el contexto entre modelos para el Fusion Mode y guarda la memoria personal cifrada por usuario.',
  },
  {
    id: 'conext',
    title: 'Conext',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    site: 'https://www.conext.lat/',
    repo: '#',
    details: '#',
    featured: false,
    logo: '/logos/conext.png',
    description:
      'Agentes de IA que responden precios, stock y envíos con los datos de tu negocio. Si el cliente cambia de canal, la conversación sigue.',
    backend:
      'Orquestación omnicanal de agentes de IA conectados al catálogo, inventario y logística del negocio con memoria continua entre canales.',
  },
]

export const education = [
  {
    id: 'santo-domingo',
    period: 'Actual',
    institution: 'Instituto Santo Domingo',
    program: 'Técnico/a Superior en Desarrollo Web y Aplicaciones Digitales',
    bullets: [
      'Título oficial de validez nacional.',
      'Incluye la certificacion intermedia de Desarrollador de Sitios Web (no oficial).',
      'Plan de estudios aprobado por el Expte. N° 0111-065420/2022, con respaldo institucional y reconocimiento academico.',
    ],
  },
  {
    id: 'autoformacion',
    period: '2022 - presente',
    institution:
      'Autoformación en Desarrollo de Software, Programación e Inteligencia Artificial',
    program: 'En Internet',
    bullets: [
      'Especializacion autodidacta en tecnologias web, programacion de software e integracion de modelos de inteligencia artificial.',
      'Conocimientos en administracion de sistemas Linux y Windows, y manejo de maquinas virtuales.',
      'Desarrollo de herramientas de codigo abierto y aplicaciones web.',
    ],
  },
]

export const certifications = [
  {
    id: 'claude-code-101',
    title: 'Claude Code 101',
    issuer: 'Anthropic',
    icon: 'Anthropic',
    code: 'CLAUDE-CODE-101',
    link: '/certificates/claude-code-101.pdf',
    description:
      'Certificado de finalizacion del curso introductorio de Anthropic sobre Claude Code. Cubre el flujo de trabajo agentic, comandos basicos y buenas practicas para programar con Claude Code.',
    tags: ['Claude Code', 'Agentic Coding', 'CLI', 'Anthropic'],
  },
  {
    id: 'claude-code-in-action',
    title: 'Claude Code in Action',
    issuer: 'Anthropic',
    icon: 'Anthropic',
    code: 'CLAUDE-CODE-ACTION',
    link: '/certificates/claude-code-in-action.pdf',
    description:
      'Certificado de finalizacion del curso practico de Anthropic sobre Claude Code. Aplica Claude Code en proyectos reales: refactors, debugging y automatizacion de tareas de desarrollo.',
    tags: ['Claude Code', 'Automatizacion', 'Debugging', 'Anthropic'],
  },
  {
    id: 'ai-skills-fest-2026',
    title: 'AI Skills Fest 2026',
    issuer: 'Microsoft',
    icon: 'Microsoft',
    code: 'AI-SKILLS-FEST-2026',
    link: 'https://www.credly.com/badges/269375e9-525b-47d0-8f69-f0e2d66ff87a/linked_in_profile',
    description:
      'Los participantes demuestran conocimientos fundamentales y aplicados de IA, incluyendo como usar herramientas de IA para mejorar la productividad, crear contenido y resolver problemas del mundo real. Identifican casos de uso practicos, aplican la IA de forma responsable y siguen desarrollando habilidades a traves de rutas de aprendizaje guiadas.',
    tags: ['IA', 'Productividad', 'IA Responsable', 'Aprendizaje Guiado'],
  },
]

export const certLabels = { view: 'Ver credencial ↗' }

export const about = {
  introLead:
    'Soy web developer con experiencia en desarrollo full stack y una fuerte orientación hacia la integración de inteligencia artificial en flujos de trabajo y aplicaciones, para mejorar la productividad y los productos.',
  introRest:
    'Me apasiona entender cómo funcionan las cosas desde adentro, aplicando un enfoque responsable y con criterio propio en cada proyecto que emprendo.',
  highlights: [
    {
      id: 'trabajo',
      title: 'Como trabajo',
      text: 'Uso la IA como copiloto, no como reemplazo: entiendo lo que construyo de adentro hacia afuera antes de confiar en el resultado.',
    },
    {
      id: 'intereses',
      title: 'Lo que me interesa',
      text: 'Desarrollo full stack, sistemas de IA aplicados a productos reales, y entender como funcionan las herramientas que uso todos los dias.',
    },
    {
      id: 'formacion',
      title: 'Formacion',
      text: 'Técnico/a Superior en Desarrollo Web y Aplicaciones Digitales (en curso) en Instituto Santo Domingo, mas aprendizaje autodidacta en Linux, Windows y maquinas virtuales.',
    },
  ],
  // los nombres se cruzan contra data/techIcons.js; el que no tiene icono
  // ("VS Code") se muestra igual, solo con su nombre
  tools: {
    title: 'Con qué trabajo',
    items: [
      'Arch Linux',
      'VS Code',
      'Git',
      'GitHub',
      'TypeScript',
      'Vue',
      'PostgreSQL',
      'Prisma',
      'Vercel',
      'Claude Code',
    ],
    note: 'Todo sobre Linux, y la IA metida en el editor y en la terminal, no en una pestaña aparte.',
  },
  offline: {
    title: 'Fuera del código',
    text: 'Soy de Tucumán. Aprendí a programar por mi cuenta desde 2022, rompiendo cosas en máquinas virtuales hasta entender por qué se rompían, y sigue siendo la forma en la que aprendo cualquier cosa nueva.',
  },
}

export const contributions = {
  user: 'fabriciovla',
  total: (n) => `${n} en el último año`,
  day: (count, date) => `${count} contribuciones el ${date}`,
  profile: 'Ver perfil en GitHub ↗',
  months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
}

export const contact = {
  lede: '¿Tenés una búsqueda abierta, un proyecto o una idea a medio armar? Escribime por donde te quede más cómodo.',
  location: 'Tucumán, Argentina · trabajo remoto',
  channels: [
    {
      id: 'github',
      label: 'GitHub',
      handle: 'github.com/fabriciovla',
      href: 'https://github.com/fabriciovla',
      description: 'Todo lo que construí, con su historial de commits.',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      handle: 'in/fabriciovarela',
      href: 'https://www.linkedin.com/in/fabriciovarela',
      description: 'El lugar para hablar de trabajo. Es por donde más rápido contesto.',
    },
  ],
}
