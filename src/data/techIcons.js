import {
  siAnthropic,
  siArchlinux,
  siCss,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siTailwindcss,
  siTypescript,
  siVercel,
} from 'simple-icons'

// nombre que se ve en el chip -> icono (path SVG de simple-icons) y color.
// "currentColor" es para las marcas de logo negro: siguen el color del texto
// del chip, y así no desaparecen si el fondo cambia de tono
export const techIcons = {
  TypeScript: { icon: siTypescript, color: '#3178c6' },
  HTML: { icon: siHtml5, color: '#e34f26' },
  CSS: { icon: siCss, color: '#663399' },
  JavaScript: { icon: siJavascript, color: '#f7df1e' },
  PLpgSQL: { icon: siPostgresql, color: '#4169e1' },
  Python: { icon: siPython, color: '#3776ab' },
  'Node.js': { icon: siNodedotjs, color: '#5fa04e' },
  PostgreSQL: { icon: siPostgresql, color: '#4169e1' },
  'Next.js': { icon: siNextdotjs, color: 'currentColor' },
  'Tailwind CSS': { icon: siTailwindcss, color: '#06b6d4' },
  Prisma: { icon: siPrisma, color: '#c7d2de' },
  React: { icon: siReact, color: '#61dafb' },
  'Arch Linux': { icon: siArchlinux, color: '#1793d1' },
  Git: { icon: siGit, color: '#f05032' },
  GitHub: { icon: siGithub, color: 'currentColor' },
  Vercel: { icon: siVercel, color: 'currentColor' },
  'Claude Code': { icon: siAnthropic, color: '#d97757' },
  Anthropic: { icon: siAnthropic, color: 'currentColor' },
}
