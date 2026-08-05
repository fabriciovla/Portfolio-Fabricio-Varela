"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  Reorder,
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import {
  HiOutlineAcademicCap,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineCodeBracket,
  HiOutlineEnvelope,
  HiOutlineFolder,
  HiOutlineHome,
  HiOutlinePaperAirplane,
  HiOutlineUser,
  HiOutlineXMark,
} from "react-icons/hi2";
import {
  SiAnthropic,
  SiCss,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import type { IconType } from "react-icons";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// indicador de "pensando": tres pelotitas rebotando, a juego con el logo
function ThinkingDots() {
  return (
    <div
      className="flex items-center gap-1.5 py-2"
      aria-label="El asistente está pensando"
    >
      {[0, 1, 2].map((d) => (
        <motion.span
          key={d}
          className="h-2 w-2 rounded-full bg-black/40"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.85,
            repeat: Infinity,
            delay: d * 0.14,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// estilos de markdown para las respuestas del asistente
const markdownComponents: Components = {
  p: (props) => <p className="my-1.5 first:mt-0 last:mb-0" {...props} />,
  strong: (props) => <strong className="font-semibold" {...props} />,
  ul: (props) => (
    <ul className="my-1.5 list-disc pl-5 first:mt-0 last:mb-0" {...props} />
  ),
  ol: (props) => (
    <ol className="my-1.5 list-decimal pl-5 first:mt-0 last:mb-0" {...props} />
  ),
  li: (props) => <li className="my-0.5" {...props} />,
  a: (props) => (
    <a
      className="font-medium underline underline-offset-2"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.85em]"
      {...props}
    />
  ),
};

function OneChaterLogo({
  className,
  hideBottom = false,
}: {
  className?: string;
  // sin la pelota inferior: se usa mientras esa pelota está "de viaje"
  // volviendo desde el chat hacia el icono de la navbar
  hideBottom?: boolean;
}) {
  return (
    <svg viewBox="14 18 74 72" className={className} aria-hidden="true">
      <path
        d="M 32 22 Q 18 26 18 40 Q 20 54 34 54 Q 48 52 46 38 Q 44 24 32 22 Z"
        fill="currentColor"
      />
      <path
        d="M 68 26 Q 56 28 54 40 Q 56 54 70 54 Q 84 52 82 38 Q 80 26 68 26 Z"
        fill="currentColor"
      />
      {!hideBottom && (
        <path
          d="M 50 56 Q 36 58 36 72 Q 38 86 52 84 Q 66 82 64 68 Q 62 56 50 56 Z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

// pelota que viaja del chat cerrado a la navbar: arranca donde estaba el
// globo de saturación, espera a que la navbar termine de aparecer, y vuela
// achicándose hasta el hueco de la pelota inferior del icono de Asistente
function FlyingBall({
  from,
  onDone,
}: {
  from: { x: number; y: number; d: number };
  onDone: () => void;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const icon = document.querySelector<HTMLElement>("[data-assistant-icon]");
    if (!icon) {
      done.current();
      return;
    }
    // destino por offsets de layout: la navbar recién montada todavía está
    // haciendo su morph (transforms), pero el layout final ya existe y los
    // offsets no se ven afectados por transforms
    let left = 0;
    let top = 0;
    for (
      let node: Element | null = icon;
      node instanceof HTMLElement;
      node = node.offsetParent
    ) {
      left += node.offsetLeft;
      top += node.offsetTop;
    }
    const w = icon.offsetWidth;
    const h = icon.offsetHeight;
    // mismo mapeo del viewBox "14 18 74 72": pelota inferior en (50, 70)
    const s = Math.min(w / 74, h / 72);
    const dx = left + w / 2 + (50 - 51) * s - from.x;
    const dy = top + h / 2 + (70 - 54) * s - from.y;
    const ts = (34 * s) / from.d;
    // vuelo con "física": acelera, se pasa apenas del destino y aterriza
    // con un rebote de squash antes de asentarse
    const anim = el.animate(
      [
        {
          transform: "translate(0px, 0px) scale(1)",
          easing: "cubic-bezier(0.55, 0, 0.6, 0.5)",
        },
        {
          transform: `translate(${dx * 1.03}px, ${dy * 1.03}px) scale(${ts})`,
          offset: 0.7,
          easing: "ease-out",
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${ts * 1.35})`,
          offset: 0.87,
          easing: "ease-in-out",
        },
        { transform: `translate(${dx}px, ${dy}px) scale(${ts})` },
      ],
      { duration: 450, fill: "forwards" },
    );
    anim.onfinish = () => {
      done.current();
      // giro de recuperación: con las tres pelotas de vuelta juntas, el
      // icono entero da una vuelta y se asienta
      icon.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
        {
          duration: 650,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          composite: "add",
        },
      );
    };
    // impacto del aterrizaje (~87% del vuelo): la navbar acusa el golpe y
    // las dos pelotas que quedaron en el icono pegan un saltito; composite
    // "add" suma estos transforms a los del morph/drag sin pisarlos
    const impact = setTimeout(() => {
      document.querySelector<HTMLElement>("[data-dock-nav]")?.animate(
        [
          { transform: "translateY(0) scale(1, 1)" },
          { transform: "translateY(2px) scale(1.012, 0.97)", offset: 0.35 },
          { transform: "translateY(-1px) scale(0.997, 1.012)", offset: 0.7 },
          { transform: "translateY(0) scale(1, 1)" },
        ],
        { duration: 450, easing: "ease-out", composite: "add" },
      );
      icon.animate(
        [
          { transform: "translateY(0) scale(1)" },
          { transform: "translateY(-2px) scale(1.08)", offset: 0.4 },
          { transform: "translateY(0) scale(1)" },
        ],
        { duration: 360, easing: "ease-out", composite: "add" },
      );
    }, 370);
    return () => {
      clearTimeout(impact);
      anim.cancel();
    };
  }, [from]);

  return createPortal(
    <svg
      ref={ref}
      viewBox="34 54 34 34"
      className="pointer-events-none fixed z-[70] text-black"
      style={{
        left: from.x - from.d / 2,
        top: from.y - from.d / 2,
        width: from.d,
        height: from.d,
      }}
      aria-hidden="true"
    >
      <path
        d="M 50 56 Q 36 58 36 72 Q 38 86 52 84 Q 66 82 64 68 Q 62 56 50 56 Z"
        fill="currentColor"
      />
    </svg>,
    document.body,
  );
}

function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 21" className={className} aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

const HOLO_SPECTRUM =
  "#ff3d81, #ff8a3d, #ffe83d, #4dff7a, #3de0ff, #6a3dff, #ff3dd6, #ff3d81";

const PARTICLE_COLORS = [
  "rgba(0,0,0,0.9)",
  "rgba(0,0,0,0.7)",
  "rgba(0,0,0,0.5)",
];

function makeParticles() {
  return Array.from({ length: 90 }).map(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 240;
    const kind =
      Math.random() < 0.12
        ? "star"
        : Math.random() < 0.35
          ? "glow"
          : "dot";
    return {
      kind,
      left: Math.random() * 100,
      top: Math.random() * 100,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 50,
      size:
        kind === "star"
          ? 8 + Math.random() * 8
          : kind === "glow"
            ? 4 + Math.random() * 5
            : 2 + Math.random() * 3,
      color:
        PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      rotate: (Math.random() - 0.5) * 360,
      delay: Math.random() * 0.22,
      duration: 0.6 + Math.random() * 0.5,
    };
  });
}

function ParticleBurst() {
  // generar recién en el cliente: valores aleatorios en el primer render
  // rompen la hidratación (el HTML del servidor nunca coincide)
  const [particles, setParticles] = useState<
    ReturnType<typeof makeParticles>
  >([]);
  useEffect(() => {
    setParticles(makeParticles());
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
      {particles.map((p, i) =>
        p.kind === "star" ? (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute will-change-transform"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              fill: p.color,
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: p.dx,
              y: p.dy,
              scale: [0, 1.1, 0.9, 0],
              rotate: p.rotate,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <path d="M12 0c1.2 6.8 4 9.6 12 12-8 2.4-10.8 5.2-12 12-1.2-6.8-4-9.6-12-12 8-2.4 10.8-5.2 12-12z" />
          </motion.svg>
        ) : (
          <motion.span
            key={i}
            className="absolute rounded-full will-change-transform"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background:
                p.kind === "glow"
                  ? `radial-gradient(circle, ${p.color} 30%, transparent 70%)`
                  : "rgba(0,0,0,0.6)",
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: p.dx,
              y: p.dy,
              scale: [0, 1, 0.8, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ),
      )}
    </div>
  );
}

function HoloCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  return (
    <div
      ref={ref}
      onMouseMove={(event) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty(
          "--px",
          `${((event.clientX - rect.left) / rect.width) * 100}`,
        );
        el.style.setProperty(
          "--py",
          `${((event.clientY - rect.top) / rect.height) * 100}`,
        );
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        const el = ref.current;
        if (el) {
          el.style.setProperty("--px", "50");
          el.style.setProperty("--py", "50");
        }
      }}
      style={
        {
          "--px": "50",
          "--py": "50",
          transform: hover
            ? "perspective(800px) rotateX(calc((50 - var(--py)) * 0.1deg)) rotateY(calc((var(--px) - 50) * 0.1deg)) scale(1.015)"
            : "perspective(800px) scale(1)",
          // seguir al mouse con un pelín de suavizado: sin esto el tilt
          // engancha de golpe al entrar y tiembla con cada pixel
          transition: hover ? "transform 0.12s ease-out" : "transform 0.5s ease",
          willChange: "transform",
        } as React.CSSProperties
      }
      className="relative isolate flex flex-col gap-4 overflow-hidden rounded-3xl border border-black/10 bg-[var(--background)] p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hover ? 0.06 : 0.02,
          // giro suave del espectro (~1/3 de vuelta al cruzar la tarjeta);
          // a 3.6deg el arcoíris daba una vuelta entera y estroboscopeaba
          background: `conic-gradient(from calc(var(--px) * 1.2deg) at calc(var(--px) * 1%) calc(var(--py) * 1%), ${HOLO_SPECTRUM})`,
          mixBlendMode: "multiply",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hover ? 0.05 : 0.02,
          background: `repeating-linear-gradient(115deg, rgba(255,255,255,0.9) 0%, transparent 4%, transparent 8%)`,
          backgroundPosition: `calc(var(--px) * 1%) calc(var(--py) * 1%)`,
          mixBlendMode: "soft-light",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hover ? 0.12 : 0,
          background: `radial-gradient(circle at calc(var(--px) * 1%) calc(var(--py) * 1%), rgba(255,255,255,0.95), transparent 45%)`,
          mixBlendMode: "soft-light",
        }}
      />
      <div className="relative flex flex-col gap-4">{children}</div>
    </div>
  );
}

// id estable a partir de un título, para anclar cada sub-punto del scroll
const slug = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// depth 0 = sección; depth 1 = sub-punto (cada proyecto, cada certificado…)
type Section = { id: string; label: string; depth: number };

function ScrollSpy({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const railRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ballY = useMotionValue(0);
  const smoothY = useSpring(ballY, { stiffness: 500, damping: 40 });
  const ballOffset = useTransform(smoothY, (v) => v - 4);

  useEffect(() => {
    let frame = 0;
    let first = true;
    // pega la pelota a los enteros (los puntos) y acelera el salto entre ellos
    const magnet = (f: number) => {
      const s = 8;
      return 0.5 + Math.tanh((f - 0.5) * s) / (2 * Math.tanh(0.5 * s));
    };
    const update = () => {
      frame = 0;
      const rail = railRef.current;
      if (!rail || sections.length === 0) return;
      const threshold = window.innerHeight * 0.4;
      const tops = sections.map((section) => {
        const el = document.getElementById(section.id);
        return el ? el.getBoundingClientRect().top : Infinity;
      });

      let t = 0;
      for (let i = 0; i < tops.length - 1; i++) {
        if (tops[i] <= threshold && Number.isFinite(tops[i])) {
          const span = tops[i + 1] - tops[i];
          const f = Number.isFinite(span) && span > 0
            ? (threshold - tops[i]) / span
            : 0;
          t = i + Math.min(1, Math.max(0, f));
        }
      }

      // en los extremos el umbral no representa lo que se ve:
      // arriba de todo manda la primera sección, abajo de todo la última
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY <= 2) t = 0;
      else if (maxScroll > 0 && window.scrollY >= maxScroll - 2)
        t = sections.length - 1;

      const i = Math.max(0, Math.min(Math.floor(t), sections.length - 2));
      const f = magnet(Math.min(1, Math.max(0, t - i)));

      const railTop = rail.getBoundingClientRect().top;
      const centerOf = (index: number) => {
        const el = dotRefs.current[index];
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        return rect.top - railTop + rect.height / 2;
      };
      const y =
        sections.length > 1
          ? centerOf(i) + (centerOf(i + 1) - centerOf(i)) * f
          : centerOf(0);
      if (first) {
        first = false;
        ballY.jump(y);
      } else {
        ballY.set(y);
      }
      setActive(sections[Math.round(i + f)]?.id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // el contenido cambia de altura después de montar (tabs animados,
    // contribuciones que cargan async): recalcular cuando pase
    const observer = new ResizeObserver(onScroll);
    observer.observe(document.body);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
    };
  }, [sections, ballY]);

  return (
    <div
      ref={railRef}
      className="fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex"
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 -right-[1px] h-2 w-2 rounded-full bg-black"
        style={{ y: ballOffset }}
      />
      {sections.map((section, index) => {
        const isActive = active === section.id;
        const isSub = section.depth > 0;
        return (
          <button
            key={section.id}
            onClick={() =>
              document
                .getElementById(section.id)
                ?.scrollIntoView({ behavior: "smooth" })
            }
            // los sub-puntos van más juntos entre sí: se leen como un
            // grupo colgando de la sección que los contiene
            className={`group flex flex-row-reverse items-center gap-2.5 ${
              isSub ? "-mt-2" : ""
            }`}
            aria-label={`Ir a ${section.label}`}
          >
            <span
              ref={(el) => {
                dotRefs.current[index] = el;
              }}
              className={`rounded-full ${
                isSub ? "h-1 w-1 bg-black/15" : "h-1.5 w-1.5 bg-black/20"
              }`}
            />
            <span
              className={`font-mono tracking-widest uppercase transition-all duration-300 ${
                isSub ? "text-[9px]" : "text-[10px]"
              } ${
                isActive
                  ? `translate-x-0 opacity-100 ${
                      isSub ? "text-black/50" : "text-black/70"
                    }`
                  : "translate-x-1 text-black/40 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
              }`}
            >
              {section.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const dockGlassStyle = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))",
  backdropFilter: "blur(24px) saturate(180%) brightness(1.05)",
  WebkitBackdropFilter: "blur(24px) saturate(180%) brightness(1.05)",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow:
    "0 24px 60px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.1), inset 0 1.5px 1.5px rgba(255,255,255,1), inset 0 -2px 3px rgba(0,0,0,0.06)",
} as const;

// curva imán: se pega a los extremos (0 y 1) y acelera el salto en el medio
const magnetCurve = (t: number, s = 5) =>
  0.5 + Math.tanh((t - 0.5) * s) / (2 * Math.tanh(0.5 * s));

// deforma la posición del centro de la burbuja: dentro del dock cada ítem
// atrae como un imán; más allá de los extremos, banda elástica cuyo tope
// (asíntota del tanh) es el borde interno del dock — la burbuja nunca sale
function warpCenter(
  c: number,
  centers: number[],
  minCap: number,
  maxCap: number,
) {
  const min = centers[0];
  const max = centers[centers.length - 1];
  if (c < min) {
    const stretch = Math.max(1, min - minCap);
    return min - stretch * Math.tanh((min - c) / stretch);
  }
  if (c > max) {
    const stretch = Math.max(1, maxCap - max);
    return max + stretch * Math.tanh((c - max) / stretch);
  }
  let i = 0;
  while (i < centers.length - 2 && c > centers[i + 1]) i++;
  const span = centers[i + 1] - centers[i];
  const t = span > 0 ? (c - centers[i]) / span : 0;
  return centers[i] + span * magnetCurve(t);
}

function Navbar({
  active,
  onChange,
  assistantBallAway = false,
  revealed = true,
}: {
  active: string;
  onChange: (label: string) => void;
  // la pelota inferior del icono de Asistente está volando de vuelta desde
  // el chat: mostrar solo dos hasta que aterrice
  assistantBallAway?: boolean;
  // fade de entrada: va acá y no en el contenedor porque un ancestro con
  // opacity < 1 convierte al dock en backdrop root y le apaga el blur del
  // vidrio; al recuperarlo de golpe el color aparecía de un saque
  revealed?: boolean;
}) {
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // posición por `left` y ancho animados; `x` queda reservado para el gesto
  // de drag — si comparten canal, la medición de dragConstraints en cada
  // re-render mata la animación a mitad de camino
  const bubbleLeft = useMotionValue(0);
  const bubbleW = useMotionValue(0);
  const dragX = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  // estado capturado al iniciar el arrastre; el puntero escribe dragX crudo
  // y renderX lo pasa por el campo de imanes/banda elástica
  const dragBase = useRef({
    left: 0,
    w: 0,
    centers: [] as number[],
    minCap: 0,
    maxCap: 0,
  });
  // framer dispara onTap incluso al terminar un drag: anotar cuándo terminó
  // el último arrastre para no reenviar ese "clic" fantasma
  const lastDragEnd = useRef(0);
  const renderX = useTransform(dragX, (dx) => {
    const { left, w, centers, minCap, maxCap } = dragBase.current;
    if (centers.length < 2) return dx;
    const base = left + w / 2;
    return (
      warpCenter(base + dx, centers, minCap, maxCap) -
      warpCenter(base, centers, minCap, maxCap)
    );
  });
  // cuánto se pasó la burbuja de los extremos del dock (sin amortiguar)
  const navOvershoot = useTransform(dragX, (dx) => {
    const { left, w, centers } = dragBase.current;
    if (centers.length < 2) return 0;
    const c = left + w / 2 + dx;
    const min = centers[0];
    const max = centers[centers.length - 1];
    return c < min ? c - min : c > max ? c - max : 0;
  });
  // el dock entero se estira hacia la burbuja cuando tira del borde:
  // escala anclada en el lado opuesto + leve corrimiento y achatamiento
  const overshootRatio = (o: number) => Math.min(Math.abs(o), 260) / 260;
  const navSpring = { stiffness: 350, damping: 26 } as const;
  const navStretch = useSpring(
    useTransform(navOvershoot, (o) => 1 + overshootRatio(o) * 0.09),
    navSpring,
  );
  const navSquish = useSpring(
    useTransform(navOvershoot, (o) => 1 - overshootRatio(o) * 0.05),
    navSpring,
  );
  const navShift = useSpring(
    useTransform(navOvershoot, (o) => Math.sign(o) * overshootRatio(o) * 12),
    navSpring,
  );
  const navOrigin = useTransform(navOvershoot, (o) =>
    o >= 0 ? "0% 50%" : "100% 50%",
  );
  // deformación líquida: estirar según la velocidad visual del arrastre
  const dragVelocity = useVelocity(renderX);
  const stretchX = useSpring(
    useTransform(
      dragVelocity,
      (v) => 1 + (Math.min(Math.abs(v), 1600) / 1600) * 0.22,
    ),
    { stiffness: 400, damping: 25 },
  );
  const squishY = useSpring(
    useTransform(
      dragVelocity,
      (v) => 1 - (Math.min(Math.abs(v), 1600) / 1600) * 0.14,
    ),
    { stiffness: 400, damping: 25 },
  );
  const first = useRef(true);
  const activeIndex = Math.max(
    0,
    navItems.findIndex((item) => item.label === active),
  );

  const boundsOf = (index: number) => {
    const el = itemRefs.current[index];
    return el ? { x: el.offsetLeft, w: el.offsetWidth } : { x: 0, w: 0 };
  };

  const snapTo = (index: number) => {
    const { x, w } = boundsOf(index);
    const spring = { type: "spring", stiffness: 500, damping: 35 } as const;
    return [animate(bubbleLeft, x, spring), animate(bubbleW, w, spring)];
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      const { x, w } = boundsOf(activeIndex);
      bubbleLeft.jump(x);
      bubbleW.jump(w);
      return;
    }
    const controls = snapTo(activeIndex);
    return () => controls.forEach((control) => control.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // durante la entrada el dock se achica desde su estado "grande y separado":
  // los items se mueven, así que la burbuja se re-mide cada frame para no
  // quedar clavada donde estaban al principio. Se corta sola al terminar, o
  // antes si el usuario ya eligió otra sección (ahí manda snapTo)
  useEffect(() => {
    if (!revealed) return;
    const startIndex = activeIndex;
    const until = performance.now() + 2600;
    let raf = requestAnimationFrame(function sync() {
      const { x, w } = boundsOf(startIndex);
      bubbleLeft.jump(x);
      bubbleW.jump(w);
      if (performance.now() < until) raf = requestAnimationFrame(sync);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, activeIndex]);

  return (
    <motion.nav
      ref={navRef}
      layoutId="dock"
      data-dock-nav
      className="pointer-events-auto relative flex items-center overflow-hidden rounded-full p-1.5 will-change-transform"
      style={{
        ...dockGlassStyle,
        scaleX: navStretch,
        scaleY: navSquish,
        x: navShift,
        transformOrigin: navOrigin,
        opacity: revealed ? 1 : 0,
        // entra con las secciones separadas y recién después del hold se
        // compacta al gap de siempre (0.25rem = gap-1)
        gap: revealed ? "0.25rem" : "1.25rem",
        transition: [
          // el fade arranca junto con la subida del dock (delay 0.35s)
          "opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.4s",
          "gap 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.5s",
        ].join(", "),
      }}
    >
      <motion.div
        style={{
          left: bubbleLeft,
          x: renderX,
          width: bubbleW,
          scaleX: stretchX,
          scaleY: squishY,
          background: dragging
            ? "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.12))"
            : "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))",
          backdropFilter: dragging
            ? "blur(8px) saturate(180%) brightness(1.12)"
            : "none",
          WebkitBackdropFilter: dragging
            ? "blur(8px) saturate(180%) brightness(1.12)"
            : "none",
          border: dragging
            ? "1px solid rgba(255,255,255,0.9)"
            : "1px solid rgba(255,255,255,0)",
          boxShadow: dragging
            ? "0 10px 28px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1), inset 0 1.5px 1.5px rgba(255,255,255,1), inset 0 -3px 8px rgba(0,0,0,0.08), inset 3px 0 8px rgba(255,255,255,0.4), inset -3px 0 8px rgba(255,255,255,0.4)"
            : "0 4px 12px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(0,0,0,0.04)",
        }}
        className="pointer-events-none absolute inset-y-1.5 overflow-hidden rounded-full transition-[background,box-shadow,border,backdrop-filter] duration-300"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: dragging ? 1 : 0,
            background:
              "radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,0.9), transparent 55%)",
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: dragging ? 0.3 : 0,
            background: `linear-gradient(100deg, ${HOLO_SPECTRUM})`,
            filter: "blur(10px)",
            mixBlendMode: "soft-light",
          }}
        />
      </motion.div>
      {navItems.map((item, index) => {
        const isActive = active === item.label;
        return (
          <a
            key={item.label}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            href={item.href}
            onClick={() => onChange(item.label)}
            className={`relative flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-xs transition-all ${
              isActive ? "pointer-events-none" : ""
            }`}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "rgba(255,255,255,0.35)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "";
            }}
          >
            {item.label === "Asistente" ? (
              // mismo layoutId que el aviso: este icono es el que viaja
              <motion.span
                layoutId="onechater-mark"
                data-assistant-icon
                className="block h-5 w-5"
              >
                <OneChaterLogo
                  className="h-5 w-5"
                  hideBottom={assistantBallAway}
                />
              </motion.span>
            ) : (
              <item.icon className="h-5 w-5" />
            )}
            <span
              className={isActive ? "font-medium text-black" : "text-black/60"}
            >
              {item.label}
            </span>
          </a>
        );
      })}
      {/* proxy invisible: captura el drag con `x` crudo; la burbuja visible
          renderiza la versión deformada (imanes + banda elástica) */}
      <motion.div
        drag="x"
        dragMomentum={false}
        onDragStart={() => {
          setDragging(true);
          bubbleLeft.stop();
          bubbleW.stop();
          const w = bubbleW.get();
          const pad = 6; // p-1.5 del nav
          dragBase.current = {
            left: bubbleLeft.get(),
            w,
            centers: navItems.map((_, i) => {
              const bounds = boundsOf(i);
              return bounds.x + bounds.w / 2;
            }),
            minCap: pad + w / 2,
            maxCap: (navRef.current?.clientWidth ?? 0) - pad - w / 2,
          };
        }}
        onDragEnd={() => {
          lastDragEnd.current = Date.now();
          setDragging(false);
          // consolidar la posición visual (ya deformada) en `left` y liberar `x`
          const position = bubbleLeft.get() + renderX.get();
          bubbleLeft.jump(position);
          dragX.jump(0);
          const center = position + bubbleW.get() / 2;
          let nearest = 0;
          let best = Infinity;
          navItems.forEach((_, i) => {
            const bounds = boundsOf(i);
            const d = Math.abs(bounds.x + bounds.w / 2 - center);
            if (d < best) {
              best = d;
              nearest = i;
            }
          });
          if (navItems[nearest].label !== active)
            onChange(navItems[nearest].label);
          else snapTo(nearest);
        }}
        onTap={() => {
          if (Date.now() - lastDragEnd.current < 250) return;
          itemRefs.current[activeIndex]?.click();
        }}
        style={{ left: bubbleLeft, x: dragX, width: bubbleW }}
        className="absolute inset-y-1.5 z-10 cursor-grab touch-none rounded-full active:cursor-grabbing"
      />
    </motion.nav>
  );
}

const techIcons: Record<string, { icon: IconType; color: string }> = {
  TypeScript: { icon: SiTypescript, color: "#3178c6" },
  HTML: { icon: SiHtml5, color: "#e34f26" },
  CSS: { icon: SiCss, color: "#663399" },
  JavaScript: { icon: SiJavascript, color: "#f7df1e" },
  PLpgSQL: { icon: SiPostgresql, color: "#4169e1" },
  Python: { icon: SiPython, color: "#3776ab" },
  "Node.js": { icon: SiNodedotjs, color: "#5fa04e" },
  PostgreSQL: { icon: SiPostgresql, color: "#4169e1" },
  "Next.js": { icon: SiNextdotjs, color: "#000000" },
  "Tailwind CSS": { icon: SiTailwindcss, color: "#06b6d4" },
  Prisma: { icon: SiPrisma, color: "#2d3748" },
  React: { icon: SiReact, color: "#61dafb" },
};

const links = [
  { label: "GitHub", href: "https://github.com/fabriciovla" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/fabriciovarela" },
  { label: "Resume", href: "#" },
];

const navItems: {
  label: string;
  href: string;
  icon: IconType | typeof OneChaterLogo;
}[] = [
  { label: "Inicio", href: "#top", icon: HiOutlineHome },
  { label: "Sobre Mí", href: "#top", icon: HiOutlineUser },
  { label: "Contacto", href: "#", icon: HiOutlineEnvelope },
  { label: "Asistente", href: "#", icon: OneChaterLogo },
];

const initialProjects = [
  {
    title: "OneChater",
    description:
      "Plataforma de chat unificada que integra GPT, Claude y Gemini con memoria personal privada, Fusion Mode para combinar respuestas de varios modelos y busqueda semantica en el historial.",
    stack: ["TypeScript", "HTML", "CSS", "JavaScript", "PLpgSQL", "Python"],
    backend:
      "Conexion de los asistentes: orquesta en simultaneo las APIs de OpenAI, Anthropic y Google, sincroniza el contexto entre modelos para el Fusion Mode y guarda la memoria personal cifrada por usuario.",
    site: "https://onechater.com",
    repo: "#",
    details: "#",
    featured: true,
    logo: "/logos/onechater.svg",
  },
  {
    title: "Antena 8",
    description:
      "Portal de noticias de Antena 8 (98.1 FM, Tucuman) con cobertura de politica, economia, deportes y cultura. Incluye reproductor de radio persistente, cotizacion del dolar en tiempo real, clima, modo oscuro y panel administrativo con editor rich-text.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma"],
    backend:
      "API routes de Next.js con Prisma sobre PostgreSQL (Neon serverless), autenticacion con NextAuth v5 por credenciales y JWT, y Vercel Blob para el almacenamiento de imagenes.",
    site: "https://www.antena8noticias.com.ar/",
    repo: "https://github.com/fabriciovla/Antena-8-",
    details: "#",
    featured: false,
    logo: "/logos/antena8.png",
  },
  {
    title: "ColorLab",
    description:
      "Generador de paletas de colores armonicas basado en el espacio de color OKLCH, con 6 tipos de armonia, chequeo de contraste WCAG 2.1 y exportacion a CSS variables, HEX, OKLCH, HSL y Tailwind CSS. Sin frameworks ni build, motor OKLCH propio.",
    stack: ["HTML", "CSS", "JavaScript"],
    backend:
      "Sin backend: todo el motor de color OKLCH corre client-side en JavaScript vanilla, sin dependencias ni build, servido como sitio estatico.",
    site: "https://colorlab-olive.vercel.app/",
    repo: "https://github.com/fabriciovla/ColorLab",
    details: "#",
    featured: false,
    logo: "/logos/colorlab.svg",
  },
];

const education = [
  {
    period: "Actual",
    institution: "Instituto Santo Domingo",
    program: "Técnico/a Superior en Desarrollo Web y Aplicaciones Digitales",
    bullets: [
      "Título oficial de validez nacional.",
      "Incluye la certificacion intermedia de Desarrollador de Sitios Web (no oficial).",
      "Plan de estudios aprobado por el Expte. N° 0111-065420/2022, con respaldo institucional y reconocimiento academico.",
    ],
  },
  {
    period: "2022 - presente",
    institution:
      "Autoformación en Desarrollo de Software, Programación e Inteligencia Artificial",
    program: "En Internet",
    bullets: [
      "Especializacion autodidacta en tecnologias web, programacion de software e integracion de modelos de inteligencia artificial.",
      "Conocimientos en administracion de sistemas Linux y Windows, y manejo de maquinas virtuales.",
      "Desarrollo de herramientas de codigo abierto y aplicaciones web.",
    ],
  },
];

const certifications = [
  {
    title: "Claude Code 101",
    issuer: "Anthropic",
    icon: SiAnthropic,
    code: "CLAUDE-CODE-101",
    description:
      "Certificado de finalizacion del curso introductorio de Anthropic sobre Claude Code. Cubre el flujo de trabajo agentic, comandos basicos y buenas practicas para programar con Claude Code.",
    tags: ["Claude Code", "Agentic Coding", "CLI", "Anthropic"],
    link: "/certificates/claude-code-101.pdf",
  },
  {
    title: "Claude Code in Action",
    issuer: "Anthropic",
    icon: SiAnthropic,
    code: "CLAUDE-CODE-ACTION",
    description:
      "Certificado de finalizacion del curso practico de Anthropic sobre Claude Code. Aplica Claude Code en proyectos reales: refactors, debugging y automatizacion de tareas de desarrollo.",
    tags: ["Claude Code", "Automatizacion", "Debugging", "Anthropic"],
    link: "/certificates/claude-code-in-action.pdf",
  },
  {
    title: "AI Skills Fest 2026",
    issuer: "Microsoft",
    icon: MicrosoftLogo,
    code: "AI-SKILLS-FEST-2026",
    description:
      "Los participantes demuestran conocimientos fundamentales y aplicados de IA, incluyendo como usar herramientas de IA para mejorar la productividad, crear contenido y resolver problemas del mundo real. Identifican casos de uso practicos, aplican la IA de forma responsable y siguen desarrollando habilidades a traves de rutas de aprendizaje guiadas.",
    tags: ["IA", "Productividad", "IA Responsable", "Aprendizaje Guiado"],
    link: "https://www.credly.com/badges/269375e9-525b-47d0-8f69-f0e2d66ff87a/linked_in_profile",
  },
];

type ContributionDay = { date: string; count: number; level: number };

const CONTRIB_LEVELS = [
  "rgba(0,0,0,0.05)",
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39",
];

const MONTH_LABELS = [
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
];

function GithubContributions() {
  const [days, setDays] = useState<ContributionDay[] | null>(null);
  const [total, setTotal] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("https://github-contributions-api.jogruber.de/v4/fabriciovla?y=last")
      .then((res) => res.json())
      .then((data) => {
        setDays(data.contributions);
        setTotal(data.total.lastYear);
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  const weeks: (ContributionDay | null)[][] = [];
  if (days) {
    const padded: (ContributionDay | null)[] = [
      ...Array.from(
        { length: new Date(`${days[0].date}T00:00:00`).getDay() },
        () => null,
      ),
      ...days,
    ];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }
  }

  const monthLabels = weeks.map((week, i) => {
    const firstDay = week.find((day) => day !== null);
    if (!firstDay) return null;
    const month = new Date(`${firstDay.date}T00:00:00`).getMonth();
    if (i === 0) return null;
    const prevWeek = weeks[i - 1];
    const prevDay = prevWeek.find((day) => day !== null);
    if (!prevDay) return null;
    const prevMonth = new Date(`${prevDay.date}T00:00:00`).getMonth();
    return month !== prevMonth ? MONTH_LABELS[month] : null;
  });

  return (
    <div id="contribuciones" className="flex w-full scroll-mt-24 flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-mono text-sm tracking-widest text-black/50 uppercase">
          Contribuciones
        </h2>
        {days && (
          <span className="font-mono text-xs text-black/50">
            {total} en el último año
          </span>
        )}
      </div>
      <div className="rounded-3xl border border-black/10 p-6">
        {days ? (
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full gap-[2px]">
              {monthLabels.map((label, i) => (
                <span
                  key={i}
                  className="relative h-4 min-w-0 flex-1 font-mono text-[10px] text-black/40"
                >
                  {label && <span className="absolute left-0">{label}</span>}
                </span>
              ))}
            </div>
            <div className="flex w-full gap-[2px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  {Array.from({ length: 7 }).map((_, di) => {
                    const day = week[di];
                    return (
                      <span
                        key={di}
                        title={
                          day
                            ? `${day.count} contribuciones el ${day.date}`
                            : undefined
                        }
                        className="aspect-square w-full rounded-[2px]"
                        style={{
                          backgroundColor: day
                            ? CONTRIB_LEVELS[day.level]
                            : "transparent",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <a
              href="https://github.com/fabriciovla"
              className="mt-2 self-start text-sm text-black/60 hover:text-black"
            >
              Ver perfil en GitHub ↗
            </a>
          </div>
        ) : (
          <div className="h-24 w-full animate-pulse rounded-xl bg-black/5" />
        )}
      </div>
    </div>
  );
}

type ChatMessage = { role: "user" | "assistant"; content: string };

const chatSuggestions = [
  { icon: HiOutlineChatBubbleOvalLeft, text: "¿Quién es Fabricio?" },
  { icon: HiOutlineFolder, text: "¿Cuáles son sus proyectos?" },
  { icon: HiOutlineCodeBracket, text: "¿Qué stack usa?" },
  { icon: HiOutlineAcademicCap, text: "Contame sobre sus estudios" },
  { icon: HiOutlineEnvelope, text: "¿Cómo lo contacto?" },
];

function AssistantScreen({
  messages,
  busy,
  onSend,
  onClose,
  notice,
  flight,
  outcome,
}: {
  messages: ChatMessage[];
  busy: boolean;
  onSend: (text: string) => void;
  // si el globo de saturación está visible al cerrar, se pasa su posición
  // para que la pelota vuele de vuelta al icono de la navbar
  onClose: (ball?: { x: number; y: number; d: number }) => void;
  notice: string | null;
  // despegue pendiente: rect del dock desde donde vuela la burbuja del
  // mensaje recién enviado (índice = posición que va a ocupar en la lista)
  flight: { current: { index: number; rect: DOMRect } | null };
  // veredicto del server para el envío en curso: null mientras se espera
  outcome: "ok" | "blocked" | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // transición de escena: al primer mensaje, una burbuja del logo crece
  // hasta tapar la pantalla; bajo esa cobertura se cambia bienvenida -> chat
  const [scene, setScene] = useState<"welcome" | "chat">(
    messages.length === 0 ? "welcome" : "chat",
  );
  // fases del cover: al primer mensaje arranca la animación completa de una
  // ("cover": giro + la pelota se infla) y termina en "reveal" (fade sobre
  // el chat); si el server bloqueó (cupo/descanso), la pelota se congela a
  // medio inflar ("halt") mostrando adentro el aviso de saturación, y luego
  // se desvanece ("fadeout") de vuelta a la bienvenida
  const [phase, setPhase] = useState<
    "idle" | "cover" | "halt" | "fadeout" | "reveal"
  >("idle");
  // momento en que arrancó el cover: el freno por bloqueo espera a que la
  // pelota haya crecido lo suficiente como para verse
  const coverStart = useRef(0);
  // cierre unificado (X y Escape): si el globo de saturación está visible,
  // apaga el overlay y reporta su posición para el vuelo hacia la navbar
  const requestClose = useRef(() => {});
  requestClose.current = () => {
    const g = coverGeom.current;
    // con la animación de la pelota en pleno vuelo (todavía sin mensaje ni
    // chat), cerrar dejaría todo a medias: se ignora hasta que termine
    if (phase === "cover") return;
    if (phase === "halt" && g) {
      setPhase("idle");
      const size = 34 * Math.min(g.width / 74, g.height / 72);
      onClose({ x: g.ballX, y: g.ballY, d: g.halt * size });
    } else {
      onClose();
    }
  };
  const wasEmpty = useRef(messages.length === 0);
  // mensajes presentes al montar la pantalla: no re-animan su entrada
  const mountedCount = useRef(messages.length);
  const logoRef = useRef<HTMLDivElement>(null);
  // rect del logo en pantalla: la copia animada se dibuja exactamente encima,
  // y grow es la escala que necesita la pelota inferior para cubrir el viewport
  const coverGeom = useRef<{
    left: number;
    top: number;
    width: number;
    height: number;
    grow: number;
    // centro de la pelota inferior en pantalla y escala del "globo" quieto
    // donde se muestra el aviso de saturación
    ballX: number;
    ballY: number;
    halt: number;
  } | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      // el envío se revirtió (server bloqueado): todo vuelve al estado
      // inicial y un reintento dispara la animación de nuevo
      wasEmpty.current = true;
      setScene("welcome");
      return;
    }
    if (!wasEmpty.current) return;
    wasEmpty.current = false;
    const rect = logoRef.current?.getBoundingClientRect();
    if (rect) {
      // viewBox del logo: "14 18 74 72"; centro de la pelota inferior ≈ (50, 70)
      const s = Math.min(rect.width / 74, rect.height / 72);
      const x = rect.left + rect.width / 2 + (50 - (14 + 37)) * s;
      const y = rect.top + rect.height / 2 + (70 - (18 + 36)) * s;
      const size = 34 * s;
      const dist = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      coverGeom.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        grow: (dist * 2.8) / size,
        ballX: x,
        ballY: y,
        // globo de ~480px de diámetro: entra el aviso y no tapa el input
        halt: 480 / size,
      };
    } else {
      coverGeom.current = null;
    }
    // la animación completa corre sola con sus tiempos de siempre; si el
    // server bloquea, el rollback deja messages en 0 y este mismo efecto
    // limpia los timers pendientes (nunca llega a cambiar de escena)
    coverStart.current = performance.now();
    setPhase("cover");
    const swap = setTimeout(() => setScene("chat"), 1100);
    const reveal = setTimeout(() => setPhase("reveal"), 1300);
    const done = setTimeout(() => setPhase("idle"), 1900);
    return () => {
      clearTimeout(swap);
      clearTimeout(reveal);
      clearTimeout(done);
    };
  }, [messages.length]);

  // veredicto "blocked" (cupo agotado / descansando): la pelota se congela
  // a medio inflar — recién cuando creció lo suficiente — y muestra adentro
  // el aviso de saturación; el aviso se queda hasta que el usuario cierre
  // el chat (o reintente: ahí la animación arranca de nuevo)
  useEffect(() => {
    if (outcome !== "blocked") return;
    const elapsed = performance.now() - coverStart.current;
    const hold = Math.max(0, 750 - elapsed);
    const halt = setTimeout(
      () => setPhase((p) => (p === "idle" ? p : "halt")),
      hold,
    );
    return () => clearTimeout(halt);
  }, [outcome]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const scrollbar =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbar}px`;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col bg-[var(--background)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ y: "-150%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-150%", opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex w-full max-w-3xl items-center justify-between px-10 pt-10"
      >
        <h2 className="font-mono text-sm tracking-widest text-black/50 uppercase">
          Asistente
        </h2>
        <button
          onClick={() => requestClose.current()}
          aria-label="Cerrar asistente"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/60 transition-colors hover:bg-black/5 hover:text-black"
        >
          <HiOutlineXMark className="h-5 w-5" />
        </button>
      </motion.div>
      {scene === "welcome" ? (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-10 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center gap-3"
          >
            <div
              ref={logoRef}
              className="h-14 w-14"
              style={{ opacity: phase === "idle" ? 1 : 0 }}
            >
              <OneChaterLogo className="h-14 w-14 text-black" />
            </div>
            <h1 className="font-title text-3xl font-semibold">
              ¡Hola! ¿Qué tal?
            </h1>
            <p className="text-base text-black/50">
              Preguntame lo que quieras sobre Fabricio.
            </p>
          </motion.div>
          <div className="flex max-w-md flex-wrap justify-center gap-2">
            {chatSuggestions.map((suggestion, i) => (
              <motion.button
                key={suggestion.text}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.15 + i * 0.05,
                  ease: "easeOut",
                }}
                onClick={() => {
                  if (!busy && !notice) onSend(suggestion.text);
                }}
                className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 font-mono text-xs text-black/60 transition-colors hover:bg-black/5 hover:text-black"
              >
                <suggestion.icon className="h-4 w-4" />
                {suggestion.text}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
      <div className="relative mx-auto min-h-0 w-full max-w-3xl flex-1">
      <div
        ref={scrollRef}
        className="flex h-full flex-col gap-3 overflow-y-auto px-10 pt-6 pb-32"
      >
        {/* espaciador: ancla la conversación abajo, crece hacia arriba */}
        <div className="mt-auto" aria-hidden="true" />
        {messages.map((message, i) => {
          const isUser = message.role === "user";
          return (
            <motion.div
              key={i}
              layout="position"
              // vuelo del hijo desprendido: al montarse, la burbuja del
              // usuario mide la distancia hasta el dock y anima desde ahí
              // (FLIP con WAAPI: determinístico, anclado al borde derecho)
              ref={(el) => {
                if (!isUser || !el) return;
                const f = flight.current;
                if (!f || f.index !== i) return;
                flight.current = null;
                // primer mensaje: la cobertura de las pelotas tapa todo,
                // el vuelo no se vería
                if (phase !== "idle") return;
                const to = el.getBoundingClientRect();
                const dx = f.rect.right - 6 - to.right;
                const dy =
                  f.rect.top + f.rect.height / 2 - (to.top + to.height / 2);
                el.animate(
                  [
                    {
                      transform: `translate(${dx}px, ${dy}px) scale(0.95)`,
                      borderRadius: "24px",
                    },
                    {
                      transform: "translate(0, 0) scale(1)",
                      borderRadius: "16px",
                    },
                  ],
                  {
                    duration: 450,
                    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                  },
                );
              }}
              // al reabrir el chat, cada burbuja aparece con un pop suave
              // (fade + leve subida y escala) en orden escalonado; los
              // mensajes nuevos conservan su animación propia
              initial={
                i < mountedCount.current
                  ? { opacity: 0, y: 14, scale: 0.96 }
                  : isUser
                    ? false
                    : { opacity: 0, y: 16 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                delay: i < mountedCount.current ? 0.12 + i * 0.045 : 0,
                layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
              }}
              style={{ borderRadius: 16 }}
              className={`max-w-[85%] px-4 py-2.5 text-base leading-7 ${
                isUser
                  ? "self-end bg-black whitespace-pre-wrap text-white"
                  : "self-start border border-black/10 bg-black/[.02] text-black/80"
              }`}
            >
              {message.content ? (
                isUser ? (
                  message.content
                ) : (
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {message.content}
                  </Markdown>
                )
              ) : (
                <ThinkingDots />
              )}
            </motion.div>
          );
        })}
      </div>
      {/* fundido superior sutil: los mensajes se desvanecen contra el color
          de fondo al pasar bajo el header, sin blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--background), transparent)",
        }}
      />
      </div>
      )}
      {phase !== "idle" &&
        createPortal(
          // portal: AssistantScreen es un stacking context z-40, así que un
          // z-[70] interno nunca taparía el dock (z-[60]); desde body sí
          <motion.div
            className="pointer-events-none fixed inset-0 z-[70]"
            initial={{ opacity: 1 }}
            animate={{
              opacity: phase === "reveal" || phase === "fadeout" ? 0 : 1,
            }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <svg
              viewBox="14 18 74 72"
              className="absolute overflow-visible text-black"
              style={
                coverGeom.current
                  ? {
                      left: coverGeom.current.left,
                      top: coverGeom.current.top,
                      width: coverGeom.current.width,
                      height: coverGeom.current.height,
                    }
                  : {
                      left: "50%",
                      top: "50%",
                      width: 56,
                      height: 56,
                      marginLeft: -28,
                      marginTop: -28,
                    }
              }
            >
              <motion.g
                initial={{ rotate: 0 }}
                animate={{ rotate: 450 }}
                transition={{ duration: 1.2, ease: [0.5, 0, 0.3, 1] }}
              >
                <path
                  d="M 32 22 Q 18 26 18 40 Q 20 54 34 54 Q 48 52 46 38 Q 44 24 32 22 Z"
                  fill="currentColor"
                />
                <path
                  d="M 68 26 Q 56 28 54 40 Q 56 54 70 54 Q 84 52 82 38 Q 80 26 68 26 Z"
                  fill="currentColor"
                />
                <motion.path
                  d="M 50 56 Q 36 58 36 72 Q 38 86 52 84 Q 66 82 64 68 Q 62 56 50 56 Z"
                  fill="currentColor"
                  initial={{ scale: 1 }}
                  // con bloqueo la pelota no completa el inflado: se asienta
                  // como globo quieto donde vive el aviso de saturación
                  animate={{
                    scale:
                      phase === "halt" || phase === "fadeout"
                        ? (coverGeom.current?.halt ?? 18)
                        : (coverGeom.current?.grow ?? 200),
                  }}
                  transition={
                    phase === "halt" || phase === "fadeout"
                      ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                      : { duration: 0.75, delay: 0.4, ease: [0.85, 0, 0.15, 1] }
                  }
                />
              </motion.g>
            </svg>
            {(phase === "halt" || phase === "fadeout") && (
              <motion.div
                className="absolute w-60 text-center text-white"
                style={{
                  left: coverGeom.current?.ballX ?? "50%",
                  top: coverGeom.current?.ballY ?? "50%",
                  // tipografía propia del aviso, distinta a la de la página
                  fontFamily: 'Georgia, "Times New Roman", serif',
                }}
                initial={{ opacity: 0, scale: 0.92, x: "-50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
              >
                <p className="text-xl italic leading-7">
                  Las IAs están saturadas…
                </p>
                <p className="mt-2 text-sm italic opacity-70">
                  probá de nuevo en un rato 😴
                </p>
              </motion.div>
            )}
          </motion.div>,
          document.body,
        )}
    </motion.div>
  );
}

function AssistantDock({
  busy,
  onSend,
  notice,
}: {
  busy: boolean;
  onSend: (text: string, from?: DOMRect) => void;
  // texto amigable cuando el asistente no puede recibir más preguntas
  // (descansando o cupo agotado): reemplaza el placeholder y apaga el input
  notice: string | null;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.form
      layoutId="dock"
      onSubmit={(event) => {
        event.preventDefault();
        const text = input.trim();
        if (!text || busy || notice) return;
        setInput("");
        // el rect del dock es el punto de despegue del hijo: la burbuja
        // nueva nace en su borde derecho y vuela hasta su lugar en el chat
        onSend(text, event.currentTarget.getBoundingClientRect());
      }}
      // 43rem = ancho útil de la columna de mensajes (max-w-3xl menos px-10 por lado)
      className="pointer-events-auto flex w-full max-w-[43rem] items-center gap-2 rounded-full p-1.5 will-change-transform"
      style={dockGlassStyle}
    >
      <input
        ref={inputRef}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={notice ?? "Escribí tu pregunta..."}
        maxLength={2000}
        disabled={!!notice}
        className="min-w-0 flex-1 bg-transparent px-4 py-2 text-base outline-none placeholder:text-black/40 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={busy || !!notice || !input.trim()}
        aria-label="Enviar"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-opacity disabled:opacity-30"
      >
        <HiOutlinePaperAirplane className="h-4 w-4" />
      </button>
    </motion.form>
  );
}

// la navbar misma se convierte en este aviso: comparte layoutId "dock" (el
// vidrio se estira de una forma a la otra) y "onechater-mark" con el icono
// de Asistente, que viaja hasta acá girando sobre sí mismo
function DockNotice({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      layoutId="dock"
      style={dockGlassStyle}
      className="pointer-events-auto flex max-w-[min(92vw,31rem)] items-center gap-3 rounded-full py-3 pr-2 pl-4 will-change-transform"
      role="status"
    >
      {/* el layoutId va afuera y el giro adentro: framer no puede proyectar
          un layout y rotar el mismo nodo a la vez */}
      <motion.span layoutId="onechater-mark" className="block h-7 w-7 shrink-0">
        <motion.span
          className="block h-full w-full"
          initial={{ rotate: -270 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <OneChaterLogo className="h-full w-full text-black" />
        </motion.span>
      </motion.span>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="min-w-0 flex-1 text-sm leading-snug text-black/70"
      >
        El asistente de este sitio está hecho con{" "}
        <a
          href="https://onechater.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-black underline decoration-black/20 underline-offset-2 hover:decoration-black"
        >
          OneChater
        </a>
        , mi plataforma de chat unificada.
      </motion.p>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        onClick={onClose}
        aria-label="Cerrar aviso"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black"
      >
        <HiOutlineXMark className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}

// entrada de la página: el contenido sube en cascada, sin escalas ni rebotes
const enterStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const enterItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const aboutHighlights = [
  {
    title: "Como trabajo",
    text: "Uso la IA como copiloto, no como reemplazo: entiendo lo que construyo de adentro hacia afuera antes de confiar en el resultado.",
  },
  {
    title: "Lo que me interesa",
    text: "Desarrollo full stack, sistemas de IA aplicados a productos reales, y entender como funcionan las herramientas que uso todos los dias.",
  },
  {
    title: "Formacion",
    text: "Técnico/a Superior en Desarrollo Web y Aplicaciones Digitales (en curso) en Instituto Santo Domingo, mas aprendizaje autodidacta en Linux, Windows y maquinas virtuales.",
  },
];

export default function Home() {
  const [projects, setProjects] = useState(initialProjects);
  const [activeTab, setActiveTab] = useState("Inicio");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatBusy, setChatBusy] = useState(false);
  // "resting": las APIs gratuitas están saturadas; "limit": este visitante
  // agotó sus preguntas del día. El servidor es quien decide: el front no
  // lleva su propia cuenta (contar en los dos lados adelantaba el corte y
  // bloqueaba una pregunta antes de tiempo)
  const [assistantState, setAssistantState] = useState<
    "ok" | "resting" | "limit"
  >("ok");
  const prevTab = useRef("Inicio");
  const flightRef = useRef<{ index: number; rect: DOMRect } | null>(null);
  // la página termina de cargar (fuentes e imágenes incluidas) y recién ahí
  // sube la navbar desde abajo del viewport
  const [loaded, setLoaded] = useState(false);
  // el estallido de partículas queda solo para los cambios de pestaña:
  // en la carga inicial arranca la cascada, no un estallido
  const [tabSwitched, setTabSwitched] = useState(false);
  // aviso de OneChater: sale del dock a los 5s y se va solo; una vez cerrado
  // (o si ya entraron al asistente) no vuelve en toda la visita
  const [noticeSeen, setNoticeSeen] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  // pelota volviendo del chat cerrado al icono de la navbar; mientras
  // exista, el icono de Asistente muestra solo dos pelotas
  const [ballFlight, setBallFlight] = useState<{
    x: number;
    y: number;
    d: number;
  } | null>(null);
  // veredicto del envío en curso para la animación de las pelotas: "ok"
  // completa la expansión, "blocked" la aborta (las pelotas vuelven)
  const [sendOutcome, setSendOutcome] = useState<"ok" | "blocked" | null>(
    null,
  );

  // puntitos del scroll: cada sección con sus sub-puntos debajo. Los
  // proyectos se pueden reordenar arrastrando, así que la lista se arma
  // desde el estado para que el rail siga el orden que se ve en pantalla
  const scrollSections = useMemo<Section[] | null>(() => {
    if (activeTab === "Inicio") {
      return [
        { id: "top", label: "Inicio", depth: 0 },
        { id: "proyectos", label: "Proyectos", depth: 0 },
        ...projects.map((p) => ({
          id: `proyecto-${slug(p.title)}`,
          label: p.title,
          depth: 1,
        })),
        { id: "educacion", label: "Educación", depth: 0 },
        ...education.map((e) => ({
          id: `edu-${slug(e.institution)}`,
          label: e.institution.startsWith("Autoformación")
            ? "Autoformación"
            : e.institution,
          depth: 1,
        })),
        { id: "certificados", label: "Certificados", depth: 0 },
        ...certifications.map((c) => ({
          id: `cert-${slug(c.title)}`,
          label: c.title,
          depth: 1,
        })),
      ];
    }
    if (activeTab === "Sobre Mí") {
      return [
        { id: "top", label: "Inicio", depth: 0 },
        { id: "sobre-mi", label: "Sobre Mí", depth: 0 },
        ...aboutHighlights.map((h) => ({
          id: `sobre-${slug(h.title)}`,
          label: h.title,
          depth: 1,
        })),
        { id: "contribuciones", label: "Contribuciones", depth: 0 },
      ];
    }
    return null;
  }, [activeTab, projects]);

  const chatNotice =
    assistantState === "resting"
      ? "El asistente está descansando 😴"
      : assistantState === "limit"
        ? "Llegaste al límite de preguntas por hoy 🙂"
        : null;

  useEffect(() => {
    if (document.readyState === "complete") {
      setLoaded(true);
      return;
    }
    const onLoad = () => setLoaded(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // 5s desde que la página quedó lista; vuelve a ser navbar 6s después
  // (mientras dura el aviso no hay navegación, así que no se estira más)
  useEffect(() => {
    if (!loaded || noticeSeen) return;
    const show = setTimeout(() => setShowNotice(true), 5000);
    const hide = setTimeout(() => {
      setShowNotice(false);
      setNoticeSeen(true);
    }, 11000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [loaded, noticeSeen]);

  // al entrar al asistente el aviso pierde sentido: ya está adentro
  useEffect(() => {
    if (activeTab !== "Asistente") return;
    setShowNotice(false);
    setNoticeSeen(true);
  }, [activeTab]);

  async function sendChat(text: string, from?: DOMRect) {
    if (chatBusy || chatNotice) return;
    // registra el despegue: la burbuja del mensaje nuevo (índice = largo
    // actual) va a volar desde el rect del dock al montarse
    if (from) flightRef.current = { index: chatMessages.length, rect: from };
    const history: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: text },
    ];
    setChatMessages([...history, { role: "assistant", content: "" }]);
    setChatBusy(true);
    setSendOutcome(null);

    // revelado gradual: el stream llega de golpe y muy rápido; esto muestra
    // el texto a ritmo de tipeo (acelera un poco si se acumula mucho buffer)
    let target = "";
    let shown = 0;
    let streamDone = false;
    const timer = setInterval(() => {
      if (shown < target.length) {
        shown = Math.min(
          target.length,
          shown + 2 + Math.floor((target.length - shown) / 40),
        );
        setChatMessages([
          ...history,
          { role: "assistant", content: target.slice(0, shown) },
        ]);
      } else if (streamDone) {
        clearInterval(timer);
        setChatBusy(false);
      }
    }, 30);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-20) }),
      });
      if (!res.ok || !res.body) throw new Error("sin respuesta");
      // el server avisa si el asistente entró en descanso o se acabó el cupo:
      // el texto llega igual como burbuja, pero además se apaga el input
      const state = res.headers.get("x-assistant-state");
      if (state === "resting" || state === "limit") setAssistantState(state);
      // respuesta normal: si era la última pregunta del cupo, el input se
      // apaga recién después de mostrarla
      if (!state && res.headers.get("x-assistant-remaining") === "0") {
        setAssistantState("limit");
      }
      const blocked = state === "resting" || state === "limit";
      if (blocked && chatMessages.length === 0) {
        // primer mensaje rechazado (p. ej. recargó para esquivar el cupo):
        // se aborta la animación de las pelotas y se revierte el intento,
        // como si nada hubiera pasado
        clearInterval(timer);
        setSendOutcome("blocked");
        setChatMessages(chatMessages);
        setChatBusy(false);
        res.body.cancel();
        return;
      }
      setSendOutcome("ok");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        target += decoder.decode(value, { stream: true });
      }
      if (!target) throw new Error("sin respuesta");
      streamDone = true;
    } catch {
      // nunca mostrar el error real: el asistente solo "se distrae"
      // (la animación igual se completa para poder mostrar la burbuja)
      setSendOutcome("ok");
      clearInterval(timer);
      setChatMessages([
        ...history,
        {
          role: "assistant",
          content: "Uy, me distraje un segundo 😅. Probá de nuevo en un ratito.",
        },
      ]);
      setChatBusy(false);
    }
  }

  return (
    <>
      <div
        id="top"
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start gap-16 px-10 pt-16 pb-32 text-left"
      >
        <motion.div
          className="flex flex-col items-start gap-5"
          variants={enterStagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={enterItem} className="flex flex-col gap-2">
            <h1 className="font-title text-4xl font-semibold">
              Fabricio Varela
            </h1>
            <p className="text-xl text-black/60">Web Developer, Full Stack</p>
          </motion.div>
          <motion.p
            variants={enterItem}
            className="max-w-2xl text-lg leading-7 [word-spacing:0.3em]"
          >
            Me interesa entender como funcionan las cosas por dentro. Con
            criterio propio, y usando IA como copiloto para la productividad,
            construyo lo que se me cruce por la cabeza.
          </motion.p>
          <motion.div
            variants={enterItem}
            className="flex flex-wrap gap-2 font-mono text-sm"
          >
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-md border border-black/10 px-3 py-1.5 hover:bg-black/5"
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="relative w-full"
          variants={enterItem}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.24 }}
        >
          {tabSwitched && activeTab !== "Asistente" && (
            <ParticleBurst key={activeTab} />
          )}
          <AnimatePresence mode="wait">
            {activeTab === "Inicio" ? (
              <motion.div
                key="proyectos"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="flex w-full flex-col gap-6"
              >
                <h2
                  id="proyectos"
                  className="scroll-mt-24 font-mono text-sm tracking-widest text-black/50 uppercase"
                >
                  Proyectos
                </h2>
                <Reorder.Group
                  axis="y"
                  values={projects}
                  onReorder={setProjects}
                  className="flex flex-col gap-4"
                >
                  {projects.map((project) => (
                    <Reorder.Item
                      key={project.title}
                      id={`proyecto-${slug(project.title)}`}
                      value={project}
                      whileDrag={{
                        scale: 1.02,
                        boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
                      }}
                      className={`group relative flex scroll-mt-24 cursor-grab flex-col gap-4 rounded-3xl border bg-[var(--background)] p-6 active:cursor-grabbing ${
                        project.featured
                          ? "border-black/80 shadow-lg"
                          : "border-black/10"
                      }`}
                    >
                      {project.featured && (
                        <span className="absolute -top-3 right-6 rounded-full bg-black px-3 py-1 font-mono text-xs tracking-wide text-white uppercase">
                          Más popular
                        </span>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-title text-lg font-semibold">
                          {project.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-black/60">
                          <a href={project.site} className="hover:text-black">
                            Sitio web
                          </a>
                          <a href={project.repo} className="hover:text-black">
                            Repositorio
                          </a>
                          <a
                            href={project.details}
                            className="hover:text-black"
                          >
                            Ver más detalles
                          </a>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-black/[.02] p-4">
                        <p className="text-base leading-7 text-black/70">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h4 className="font-mono text-xs tracking-widest text-black/50 uppercase">
                          Backend
                        </h4>
                        <p className="text-base leading-7 text-black/70">
                          {project.backend}
                        </p>
                      </div>
                      <div className="flex items-end justify-between gap-5 border-t border-black/[.07] pt-4">
                        <div className="flex flex-wrap gap-2 font-mono text-xs text-black/60">
                          {project.stack.map((tech) => {
                            const Icon = techIcons[tech]?.icon;
                            const color = techIcons[tech]?.color;
                            return (
                              <span
                                key={tech}
                                className="flex items-center gap-1.5 rounded-md border border-black/10 px-2 py-1"
                              >
                                {Icon && <Icon size={14} color={color} />}
                                {tech}
                              </span>
                            );
                          })}
                        </div>
                        {/* la marca del sitio firma la card desde abajo; medida
                            por alto para que convivan el wordmark ancho de
                            Antena 8 y los iconos cuadrados de los otros dos.
                            <img> y no next/image: dos son SVG y optimizarlos
                            exige habilitar dangerouslyAllowSVG */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.logo}
                          alt={`Logo de ${project.title}`}
                          className="hidden h-8 w-auto max-w-[120px] shrink-0 self-center object-contain opacity-60 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0 sm:block"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                <div
                  id="educacion"
                  className="flex w-full scroll-mt-24 flex-col gap-6"
                >
                  <h2 className="font-mono text-sm tracking-widest text-black/50 uppercase">
                    Educación
                  </h2>
                  <div className="relative flex flex-col gap-10 pl-8">
                    <div className="absolute top-1.5 bottom-1.5 left-0 w-px bg-black/15" />
                    {education.map((item) => (
                      <div
                        key={item.institution}
                        id={`edu-${slug(item.institution)}`}
                        className="relative flex scroll-mt-24 flex-col gap-3"
                      >
                        <span className="absolute top-1.5 -left-8 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-black" />
                        <span className="font-mono text-sm text-black/50">
                          {item.period}
                        </span>
                        <h3 className="font-title text-lg font-semibold">
                          {item.institution}{" "}
                          <span className="font-sans text-base font-normal text-black/50">
                            · {item.program}
                          </span>
                        </h3>
                        <ul className="flex flex-col gap-2 pl-5">
                          {item.bullets.map((bullet) => (
                            <li
                              key={bullet}
                              className="list-disc text-base leading-7 text-black/70"
                            >
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  id="certificados"
                  className="flex w-full scroll-mt-24 flex-col gap-6"
                >
                  <h2 className="font-mono text-sm tracking-widest text-black/50 uppercase">
                    Certificados
                  </h2>
                  <div className="flex flex-col gap-4">
                    {certifications.map((cert) => (
                      <div
                        key={cert.title}
                        id={`cert-${slug(cert.title)}`}
                        className="scroll-mt-24"
                      >
                      <HoloCard>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <cert.icon className="h-5 w-5 text-black" />
                            <h3 className="font-title text-lg font-semibold">
                              {cert.title}
                            </h3>
                            <span className="text-black/40">·</span>
                            <span className="text-base text-black/60">
                              {cert.issuer}
                            </span>
                          </div>
                          <span className="font-mono text-sm text-black/40">
                            {cert.code}
                          </span>
                        </div>
                        <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-black/[.02] p-4">
                          <p className="text-base leading-7 text-black/70">
                            {cert.description}
                          </p>
                          <div className="flex flex-wrap gap-2 font-mono text-xs text-black/60">
                            {cert.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md border border-black/10 px-2 py-1"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <a
                            href={cert.link}
                            className="text-sm text-black/60 hover:text-black"
                          >
                            Ver credencial ↗
                          </a>
                        </div>
                      </HoloCard>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="sobre-mi"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="flex w-full flex-col gap-6"
              >
                <h2
                  id="sobre-mi"
                  className="scroll-mt-24 font-mono text-sm tracking-widest text-black/50 uppercase"
                >
                  Sobre Mí
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-black/70">
                  Soy web developer con experiencia en desarrollo full stack
                  y una fuerte orientación hacia la integración de
                  inteligencia artificial en flujos de trabajo y aplicaciones,
                  para mejorar la productividad y los productos. Me apasiona
                  entender cómo funcionan las cosas desde adentro, aplicando
                  un enfoque responsable y con criterio propio en cada
                  proyecto que emprendo.
                </p>
                <div className="flex flex-col gap-4">
                  {aboutHighlights.map((item) => (
                    <div
                      key={item.title}
                      id={`sobre-${slug(item.title)}`}
                      className="flex scroll-mt-24 flex-col gap-2 rounded-3xl border border-black/10 p-6"
                    >
                      <h3 className="font-title text-lg font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-base leading-7 text-black/70">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                <GithubContributions />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {activeTab !== "Asistente" && scrollSections && (
        <ScrollSpy key={activeTab} sections={scrollSections} />
      )}
      <AnimatePresence>
        {activeTab === "Asistente" && (
          <AssistantScreen
            messages={chatMessages}
            busy={chatBusy}
            onSend={sendChat}
            onClose={(ball) => {
              if (ball) setBallFlight(ball);
              setActiveTab(prevTab.current);
            }}
            notice={chatNotice}
            flight={flightRef}
            outcome={sendOutcome}
          />
        )}
      </AnimatePresence>
      {/* el dock recién sube (desde abajo del viewport) con la página cargada;
          animar el contenedor y no la nav deja intacto el morph del layoutId */}
      <motion.div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-6"
        initial={{ y: 160, scale: 1.16 }}
        animate={loaded ? { y: 0, scale: 1 } : { y: 160, scale: 1.16 }}
        transition={{
          y: { duration: 0.75, delay: 0.35, ease: [0.16, 1, 0.3, 1] },
          // entra grande, se sostiene un momento y recién ahí se achica
          // (mismo tiempo que el gap de la navbar: 1.5s de hold + 0.9s)
          scale: { duration: 0.9, delay: 1.5, ease: [0.16, 1, 0.3, 1] },
        }}
      >
        {activeTab === "Asistente" ? (
          <AssistantDock
            busy={chatBusy}
            onSend={sendChat}
            notice={chatNotice}
          />
        ) : showNotice ? (
          <DockNotice
            onClose={() => {
              setShowNotice(false);
              setNoticeSeen(true);
            }}
          />
        ) : (
          <Navbar
            active={activeTab}
            onChange={(label) => {
              setTabSwitched(true);
              if (label !== "Asistente") prevTab.current = label;
              setActiveTab(label);
            }}
            assistantBallAway={!!ballFlight}
            revealed={loaded}
          />
        )}
      </motion.div>
      {ballFlight && (
        <FlyingBall from={ballFlight} onDone={() => setBallFlight(null)} />
      )}
    </>
  );
}
