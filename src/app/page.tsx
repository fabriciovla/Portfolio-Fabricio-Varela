"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal, flushSync } from "react-dom";
import {
  AnimatePresence,
  Reorder,
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import {
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
  HiOutlineBriefcase,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineCodeBracket,
  HiOutlineEnvelope,
  HiOutlineFolder,
  HiOutlineHome,
  HiOutlineMoon,
  HiOutlinePaperAirplane,
  HiOutlineSun,
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
import {
  LangContext,
  copy,
  useLang,
  type Copy,
  type Lang,
} from "@/lib/i18n";

// indicador de "pensando": tres pelotitas rebotando, a juego con el logo
function ThinkingDots() {
  const { t } = useLang();
  return (
    <div
      className="flex items-center gap-1.5 py-2"
      aria-label={t.assistant.thinking}
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
          data-logo-bottom
          d="M 50 56 Q 36 58 36 72 Q 38 86 52 84 Q 66 82 64 68 Q 62 56 50 56 Z"
          fill="currentColor"
          // para que al "nacer" escale desde su propio centro y no desde el
          // origen del viewBox
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
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
  "rgba(255,255,255,0.9)",
  "rgba(255,255,255,0.65)",
  "rgba(255,255,255,0.45)",
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
                  : "rgba(255,255,255,0.6)",
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
          opacity: hover
            ? "var(--holo-spectrum-hover)"
            : "var(--holo-spectrum)",
          // giro suave del espectro (~1/3 de vuelta al cruzar la tarjeta);
          // a 3.6deg el arcoíris daba una vuelta entera y estroboscopeaba
          background: `conic-gradient(from calc(var(--px) * 1.2deg) at calc(var(--px) * 1%) calc(var(--py) * 1%), ${HOLO_SPECTRUM})`,
          // la mezcla depende del tono y sale del tema (--holo-*): sobre oscuro
          // hay que sumar luz, sobre claro restarla. Con screen fijo, en claro
          // el arcoíris se volvía blanco y la tarjeta quedaba plana
          mixBlendMode: "var(--holo-blend)" as React.CSSProperties["mixBlendMode"],
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hover ? "var(--holo-sheen-hover)" : "var(--holo-sheen)",
          background: `repeating-linear-gradient(115deg, var(--holo-sheen-color) 0%, transparent 4%, transparent 8%)`,
          backgroundPosition: `calc(var(--px) * 1%) calc(var(--py) * 1%)`,
          mixBlendMode: "var(--holo-blend)" as React.CSSProperties["mixBlendMode"],
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hover ? "var(--holo-glare-hover)" : 0,
          background: `radial-gradient(circle at calc(var(--px) * 1%) calc(var(--py) * 1%), rgba(255,255,255,0.95), transparent 45%)`,
          // este es el único que se queda en blanco en los dos tonos: en claro
          // va con mezcla normal y tapa el arcoíris justo bajo el cursor, que
          // es lo que se lee como reflejo. Con screen no pasaba nada
          mixBlendMode:
            "var(--holo-glare-blend)" as React.CSSProperties["mixBlendMode"],
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
  const { t } = useLang();
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
            aria-label={t.scrollspy.goTo(section.label)}
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

// vidrio del dock: fondo, borde, blur y sombra viven en la clase .dock-glass
// (globals.css). Fuera del `style` de framer a propósito -> ver el comentario
// de la clase: con layoutId, framer reescribe el box-shadow de `style` y lo
// rompe en cada morph. Todas las formas del dock usan esta misma clase, así
// que la sombra es una sola y nunca aparece ni desaparece de golpe
const DOCK_GLASS = "dock-glass";

// dock chico a la izquierda de la navbar para cambiar el tono de la página.
// El tema real lo aplica el script del layout antes de pintar; acá solo se
// lee el estado ya puesto en el <html> y se lo alterna
// entrada de los botones del dock: nacen metidos debajo, estirados, y salen
// hacia su lado asentándose con un resorte. Es una sola vez (initial solo
// corre al montar); después `x` sigue al dock cuando cambia de ancho
const DOCK_POP_IN = 74;

// aire entre el borde del dock y los botones de tono/idioma; se mantiene
// aunque el dock se deforme, porque cada botón sigue su borde
const DOCK_SIDE_GAP = 12;

// La posición y la entrada van en capas separadas a propósito: si la misma
// `x` la anima framer y después la maneja un motion value, framer no le
// devuelve el control y el botón queda clavado donde terminó la animación.
// Afuera: sigue al borde del dock. Adentro: sale de abajo del dock estirado.
function DockSideButton({
  x,
  dir,
  visible,
  onClick,
  label,
  className,
  children,
}: {
  x: MotionValue<number>;
  dir: -1 | 1;
  visible: boolean;
  onClick: () => void;
  label: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute top-1/2 left-1/2"
      style={{ x, marginTop: -28 }}
    >
      <motion.button
        type="button"
        initial={{ x: -dir * DOCK_POP_IN, scaleX: 0.3, scaleY: 0.55, opacity: 0 }}
        animate={{
          x: 0,
          scaleX: [0.3, 1.32, 0.94, 1],
          scaleY: [0.55, 0.74, 1.06, 1],
          opacity: visible ? 1 : 0,
        }}
        transition={{
          x: { type: "spring", stiffness: 210, damping: 19, mass: 0.9 },
          scaleX: { duration: 0.95, times: [0, 0.42, 0.72, 1], ease: "easeOut" },
          scaleY: { duration: 0.95, times: [0, 0.42, 0.72, 1], ease: "easeOut" },
          opacity: { duration: 0.3 },
        }}
        // se estira desde el lado del dock, no desde su centro
        style={{
          transformOrigin: dir === -1 ? "right center" : "left center",
        }}
        onClick={onClick}
        aria-label={label}
        className={`${DOCK_GLASS} ${className}`}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}

function ThemeToggle({
  x,
  visible,
  light,
  onToggle,
}: {
  // desplazamiento desde el centro del dock: se recalcula cuando el dock
  // cambia de ancho (el aviso es más ancho) para que lo acompañe
  x: MotionValue<number>;
  visible: boolean;
  // el tono lo maneja la página: acá no hay estado propio para que el sol y la
  // luna cambien justo cuando cambia la página, y no al apretar (el cambio
  // pasa recién cuando la pelota llega al medio de la pantalla)
  light: boolean;
  onToggle: () => void;
}) {
  const { t } = useLang();

  return (
    <DockSideButton
      x={x}
      dir={-1}
      visible={visible}
      onClick={onToggle}
      label={light ? t.toggle.toDark : t.toggle.toLight}
      className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full text-black/70 transition-colors hover:text-black"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={light ? "sol" : "luna"}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="block"
        >
          {light ? (
            <HiOutlineMoon className="h-5 w-5" />
          ) : (
            <HiOutlineSun className="h-5 w-5" />
          )}
        </motion.span>
      </AnimatePresence>
    </DockSideButton>
  );
}

// gemelo del botón de tono, pero a la derecha del dock: cambia el idioma de
// todo el sitio. Muestra el código del idioma al que se pasa (no el actual),
// igual que el botón de tono muestra el ícono del tono al que se cambia
function LangToggle({ x, visible }: { x: MotionValue<number>; visible: boolean }) {
  const { lang, setLang, t } = useLang();

  return (
    <DockSideButton
      x={x}
      dir={1}
      visible={visible}
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      label={t.toggle.lang}
      className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full font-mono text-sm font-medium tracking-wide text-black/70 transition-colors hover:text-black"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={t.toggle.langCode}
          initial={{ opacity: 0, y: 8, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.6 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="block"
        >
          {t.toggle.langCode}
        </motion.span>
      </AnimatePresence>
    </DockSideButton>
  );
}

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
  big = false,
  fadeItems = false,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
  // la pelota inferior del icono de Asistente está volando de vuelta desde
  // el chat: mostrar solo dos hasta que aterrice
  assistantBallAway?: boolean;
  // fade de entrada: va acá y no en el contenedor porque un ancestro con
  // opacity < 1 convierte al dock en backdrop root y le apaga el blur del
  // vidrio; al recuperarlo de golpe el color aparecía de un saque
  revealed?: boolean;
  // estado "grande": secciones más separadas, en paralelo con la escala que
  // aplica el contenedor
  big?: boolean;
  // al volver del aviso las secciones aparecen en vez de estar ya puestas
  fadeItems?: boolean;
}) {
  const { lang, t } = useLang();
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
    navItems.findIndex((item) => item.id === active),
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

  // cada sección cambia de ancho al cambiar de idioma: la burbuja se re-mide
  // en el mismo frame para no quedar clavada sobre la palabra anterior
  useLayoutEffect(() => {
    const { x, w } = boundsOf(activeIndex);
    bubbleLeft.jump(x);
    bubbleW.jump(w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <motion.nav
      ref={navRef}
      layoutId="dock"
      data-dock-nav
      className={`${DOCK_GLASS} pointer-events-auto relative flex items-center overflow-hidden rounded-full p-1.5 will-change-transform`}
      style={{
        scaleX: navStretch,
        scaleY: navSquish,
        x: navShift,
        transformOrigin: navOrigin,
        opacity: revealed ? 1 : 0,
        // el hold de "separadas" lo marca `big` desde afuera, no un delay
        gap: big ? "1.25rem" : "0.25rem",
        transition: [
          // el fade arranca junto con la subida del dock (delay 0.35s)
          "opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.4s",
          "gap 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
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
            ? "linear-gradient(180deg, rgba(255,255,255,0.30), rgba(255,255,255,0.08))"
            : "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.09))",
          backdropFilter: dragging
            ? "blur(8px) saturate(160%) brightness(1.5)"
            : "none",
          WebkitBackdropFilter: dragging
            ? "blur(8px) saturate(160%) brightness(1.5)"
            : "none",
          border: dragging
            ? "1px solid rgba(255,255,255,0.3)"
            : "1px solid rgba(255,255,255,0)",
          boxShadow: dragging
            ? "0 10px 28px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.35), inset 0 1.5px 1.5px rgba(255,255,255,0.4), inset 0 -3px 8px rgba(0,0,0,0.3), inset 3px 0 8px rgba(255,255,255,0.15), inset -3px 0 8px rgba(255,255,255,0.15)"
            : "0 4px 12px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.28), inset 0 -1px 1px rgba(0,0,0,0.25)",
        }}
        className="pointer-events-none absolute inset-y-1.5 overflow-hidden rounded-full transition-[background,box-shadow,border,backdrop-filter] duration-300"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: dragging ? 1 : 0,
            background:
              "radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,0.35), transparent 55%)",
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
        const isActive = active === item.id;
        return (
          <a
            key={item.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            href={item.href}
            onClick={() => onChange(item.id)}
            className={`relative flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-xs transition-all ${
              isActive ? "pointer-events-none" : ""
            }`}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "rgba(255,255,255,0.09)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "";
            }}
          >
            {item.id === "asistente" ? (
              // data-assistant-icon: de acá sale (y acá vuelve) el logo que
              // vuela hacia el aviso de OneChater
              <span
                data-assistant-icon
                className="block h-5 w-5"
              >
                <OneChaterLogo
                  className="h-5 w-5"
                  hideBottom={assistantBallAway}
                />
              </span>
            ) : (
              <item.icon className="h-5 w-5" />
            )}
            <span
              className={isActive ? "font-medium text-black" : "text-black/60"}
            >
              {t.nav[item.id]}
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
          if (navItems[nearest].id !== active) onChange(navItems[nearest].id);
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
  // marcas de logo negro: en fondo oscuro van en claro
  "Next.js": { icon: SiNextdotjs, color: "#ffffff" },
  "Tailwind CSS": { icon: SiTailwindcss, color: "#06b6d4" },
  Prisma: { icon: SiPrisma, color: "#c7d2de" },
  React: { icon: SiReact, color: "#61dafb" },
};

// los enlaces que salen del sitio se abren en otra pestaña; los internos
// (anclas "#", archivos propios) siguen navegando en la misma
function externalLink(href: string) {
  return /^https?:\/\//i.test(href)
    ? { target: "_blank" as const, rel: "noreferrer" as const }
    : {};
}

// GitHub y LinkedIn son marcas; solo el currículum cambia de idioma
const linksFor = (t: Copy) => [
  { label: "GitHub", href: "https://github.com/fabriciovla" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/fabriciovarela" },
  { label: t.hero.resume, href: "#" },
];

// las secciones se identifican por id y no por su texto: así el idioma puede
// cambiar sin que se pierda la pestaña activa ni los anclajes del scroll
type TabId = "inicio" | "sobre" | "contacto" | "asistente";

const navItems: {
  id: TabId;
  href: string;
  icon: IconType | typeof OneChaterLogo;
}[] = [
  { id: "inicio", href: "#top", icon: HiOutlineHome },
  { id: "sobre", href: "#top", icon: HiOutlineUser },
  { id: "contacto", href: "#", icon: HiOutlineEnvelope },
  { id: "asistente", href: "#", icon: OneChaterLogo },
];

// datos que no dependen del idioma; la descripción y el detalle del backend
// salen del diccionario por `id`
const initialProjects: {
  id: keyof Copy["projects"];
  title: string;
  stack: string[];
  site: string;
  repo: string;
  details: string;
  featured: boolean;
  logo: string;
  // demo embebida en la tarjeta: solo la tienen los proyectos que se dejan
  // meter en un iframe. Antena 8 manda `frame-ancestors 'none'` y OneChater
  // vive detrás del login, así que ninguno de los dos puede mostrarse acá
  demo?: string;
}[] = [
  {
    id: "onechater",
    title: "OneChater",
    stack: ["TypeScript", "HTML", "CSS", "JavaScript", "PLpgSQL", "Python"],
    site: "https://onechater.com",
    repo: "#",
    details: "#",
    featured: true,
    logo: "/logos/onechater.svg",
  },
  {
    id: "antena8",
    title: "Antena 8",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma"],
    site: "https://www.antena8noticias.com.ar/",
    repo: "https://github.com/fabriciovla/Antena-8-",
    details: "#",
    featured: false,
    logo: "/logos/antena8.png",
  },
  {
    id: "colorlab",
    title: "ColorLab",
    stack: ["HTML", "CSS", "JavaScript"],
    site: "https://colorlab-olive.vercel.app/",
    repo: "https://github.com/fabriciovla/ColorLab",
    details: "#",
    featured: false,
    logo: "/logos/colorlab.svg",
    demo: "https://colorlab-olive.vercel.app/",
  },
];

// destinos que el asistente puede pedir con [[go:…]]: a qué pestaña pertenece
// cada uno y el id del elemento hasta donde hay que scrollear. Es el único
// lugar donde se traduce lo que dijo el modelo a algo del sitio: cualquier
// destino que no esté acá se ignora en silencio
const GO_TARGETS: Record<
  string,
  { tab: "inicio" | "sobre"; id: string; label: (t: Copy) => string }
> = {
  inicio: { tab: "inicio", id: "top", label: (t) => t.nav.inicio },
  proyectos: { tab: "inicio", id: "proyectos", label: (t) => t.sections.proyectos },
  onechater: { tab: "inicio", id: "proyecto-onechater", label: () => "OneChater" },
  antena8: { tab: "inicio", id: "proyecto-antena-8", label: () => "Antena 8" },
  colorlab: { tab: "inicio", id: "proyecto-colorlab", label: () => "ColorLab" },
  educacion: { tab: "inicio", id: "educacion", label: (t) => t.sections.educacion },
  certificados: {
    tab: "inicio",
    id: "certificados",
    label: (t) => t.sections.certificados,
  },
  "sobre-mi": { tab: "sobre", id: "sobre-mi", label: (t) => t.sections.sobreMi },
  contribuciones: {
    tab: "sobre",
    id: "contribuciones",
    label: (t) => t.sections.contribuciones,
  },
};

const certifications: {
  id: keyof Copy["certifications"];
  title: string;
  issuer: string;
  icon: IconType | typeof MicrosoftLogo;
  code: string;
  link: string;
}[] = [
  {
    id: "claude-code-101",
    title: "Claude Code 101",
    issuer: "Anthropic",
    icon: SiAnthropic,
    code: "CLAUDE-CODE-101",
    link: "/certificates/claude-code-101.pdf",
  },
  {
    id: "claude-code-in-action",
    title: "Claude Code in Action",
    issuer: "Anthropic",
    icon: SiAnthropic,
    code: "CLAUDE-CODE-ACTION",
    link: "/certificates/claude-code-in-action.pdf",
  },
  {
    id: "ai-skills-fest-2026",
    title: "AI Skills Fest 2026",
    issuer: "Microsoft",
    icon: MicrosoftLogo,
    code: "AI-SKILLS-FEST-2026",
    link: "https://www.credly.com/badges/269375e9-525b-47d0-8f69-f0e2d66ff87a/linked_in_profile",
  },
];

type ContributionDay = { date: string; count: number; level: number };

// escala de GitHub en su versión oscura: el nivel 0 es un hueco tenue y
// los verdes van de oscuro a brillante (al revés que en fondo claro)
const CONTRIB_LEVELS = [
  "rgba(255,255,255,0.06)",
  "#0e4429",
  "#006d32",
  "#26a641",
  "#39d353",
];

function GithubContributions() {
  const { t } = useLang();
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
    return month !== prevMonth ? t.months[month] : null;
  });

  return (
    <div id="contribuciones" className="flex w-full scroll-mt-24 flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-mono text-sm tracking-widest text-black/50 uppercase">
          {t.sections.contribuciones}
        </h2>
        {days && (
          <span className="font-mono text-xs text-black/50">
            {t.contributions.total(total)}
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
                            ? t.contributions.day(day.count, day.date)
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
              target="_blank"
              rel="noreferrer"
              className="mt-2 self-start text-sm text-black/60 hover:text-black"
            >
              {t.contributions.profile}
            </a>
          </div>
        ) : (
          <div className="h-24 w-full animate-pulse rounded-xl bg-black/5" />
        )}
      </div>
    </div>
  );
}

// acción que el asistente puede pedirle al sitio. El modelo la escribe como
// una etiqueta al final de su respuesta (el vocabulario está en el system
// prompt de /api/chat) y acá se vuelve navegación, tono, idioma o demo
type ChatAction = {
  verb: "go" | "theme" | "lang" | "demo";
  target: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  // solo las que necesitan un click; tono e idioma se aplican solos y no
  // dejan botón
  actions?: ChatAction[];
};

const ACTION_RE = /\[\[(go|theme|lang|demo):([a-z0-9-]+)\]\]/g;

// separa las etiquetas del texto visible. El visitante nunca ve un [[go:…]]:
// o se ejecutó solo, o quedó como un botón debajo de la burbuja
function extractActions(raw: string) {
  const actions: ChatAction[] = [];
  const text = raw.replace(ACTION_RE, (_full, verb: string, target: string) => {
    actions.push({ verb: verb as ChatAction["verb"], target });
    return "";
  });
  // etiqueta a medio llegar: mientras el stream escribe "[[go:pro" el texto
  // se corta ahí, si no los corchetes aparecen y desaparecen en pantalla
  const open = text.lastIndexOf("[[");
  return {
    text: (open === -1 ? text : text.slice(0, open)).trimEnd(),
    actions,
  };
}

function actionLabel(action: ChatAction, t: Copy) {
  const label = GO_TARGETS[action.target]?.label(t) ?? action.target;
  return action.verb === "demo"
    ? t.assistant.action.demo(label)
    : t.assistant.action.go(label);
}

// el texto de cada sugerencia sale del diccionario, en el mismo orden
const chatSuggestionIcons = [
  HiOutlineChatBubbleOvalLeft,
  HiOutlineFolder,
  HiOutlineCodeBracket,
  HiOutlineAcademicCap,
  HiOutlineEnvelope,
];

function AssistantScreen({
  messages,
  busy,
  onSend,
  onClose,
  onAction,
  match,
  onMatch,
  notice,
  flight,
  outcome,
}: {
  messages: ChatMessage[];
  busy: boolean;
  onSend: (text: string) => void;
  // ejecuta la acción que vino colgada de una respuesta (cierra el chat)
  onAction: (action: ChatAction) => void;
  // modo búsqueda laboral: cambia el input del dock por un área de pegado
  match: boolean;
  onMatch: (on: boolean) => void;
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
  const { t } = useLang();
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
          {t.assistant.heading}
        </h2>
        <button
          onClick={() => requestClose.current()}
          aria-label={t.assistant.close}
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
              {t.assistant.greeting}
            </h1>
            <p className="text-base text-black/50">{t.assistant.subtitle}</p>
          </motion.div>
          <div className="flex max-w-md flex-wrap justify-center gap-2">
            {t.assistant.suggestions.map((text, i) => {
              const Icon = chatSuggestionIcons[i];
              return (
              <motion.button
                key={text}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.15 + i * 0.05,
                  ease: "easeOut",
                }}
                onClick={() => {
                  if (!busy && !notice) onSend(text);
                }}
                className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 font-mono text-xs text-black/60 transition-colors hover:bg-black/5 hover:text-black"
              >
                <Icon className="h-4 w-4" />
                {text}
              </motion.button>
              );
            })}
          </div>
          {/* entrada al modo búsqueda laboral: aparte de las sugerencias y con
              más peso, porque es la pregunta que trae a quien está buscando
              contratar */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45, ease: "easeOut" }}
            onClick={() => onMatch(!match)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors ${
              match
                ? "border-black bg-black text-white"
                : "border-black/20 text-black/70 hover:bg-black/5 hover:text-black"
            }`}
          >
            <HiOutlineBriefcase className="h-4 w-4" />
            {match ? t.assistant.match.exit : t.assistant.match.chip}
          </motion.button>
          {match && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="-mt-4 max-w-xs text-sm text-black/50"
            >
              {t.assistant.match.hint}
            </motion.p>
          )}
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
              {/* la respuesta trajo una acción: se ofrece como botón porque
                  ejecutarla cierra el chat, y eso no puede pasar solo */}
              {message.actions && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.actions.map((action) => (
                    <motion.button
                      key={`${action.verb}:${action.target}`}
                      type="button"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      onClick={() => onAction(action)}
                      className="flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1.5 font-mono text-xs text-black/70 transition-colors hover:bg-black/5 hover:text-black"
                    >
                      {actionLabel(action, t)}
                      <HiOutlineArrowRight className="h-3.5 w-3.5" />
                    </motion.button>
                  ))}
                </div>
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
                  {t.assistant.saturated}
                </p>
                <p className="mt-2 text-sm italic opacity-70">
                  {t.assistant.saturatedHint}
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
  match,
  onMatch,
}: {
  busy: boolean;
  onSend: (text: string, from?: DOMRect) => void;
  // texto amigable cuando el asistente no puede recibir más preguntas
  // (descansando o cupo agotado): reemplaza el placeholder y apaga el input
  notice: string | null;
  // modo búsqueda laboral: una descripción de puesto no entra en una línea,
  // así que el campo pasa a ser un área de pegado
  match: boolean;
  onMatch: (on: boolean) => void;
}) {
  const { t } = useLang();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // también al cambiar de modo: el campo se reemplaza por el otro elemento y
  // el foco se perdería justo cuando la persona va a pegar
  useEffect(() => {
    (match ? areaRef.current : inputRef.current)?.focus();
  }, [match]);

  const fieldClass =
    "min-w-0 flex-1 bg-transparent px-4 py-2 text-base outline-none placeholder:text-black/40 disabled:cursor-not-allowed";

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
      className={`${DOCK_GLASS} pointer-events-auto flex w-full max-w-[43rem] gap-2 p-1.5 will-change-transform ${
        match ? "items-end rounded-3xl" : "items-center rounded-full"
      }`}
    >
      {match ? (
        <textarea
          ref={areaRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            // Enter manda y Shift+Enter hace salto de línea: el texto pegado
            // ya viene con sus renglones, no hace falta agregarlos a mano
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          rows={3}
          placeholder={notice ?? t.assistant.match.placeholder}
          maxLength={2000}
          disabled={!!notice}
          className={`${fieldClass} resize-none`}
        />
      ) : (
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={notice ?? t.assistant.placeholder}
          maxLength={2000}
          disabled={!!notice}
          className={fieldClass}
        />
      )}
      {/* el modo búsqueda laboral también se enciende acá: la bienvenida con
          el botón grande desaparece con el primer mensaje, y pegar un puesto
          en medio de la charla es lo más común */}
      <button
        type="button"
        onClick={() => onMatch(!match)}
        disabled={!!notice}
        aria-label={match ? t.assistant.match.exit : t.assistant.match.chip}
        title={match ? t.assistant.match.exit : t.assistant.match.chip}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-30 ${
          match
            ? "bg-black/10 text-black"
            : "text-black/40 hover:bg-black/5 hover:text-black"
        }`}
      >
        <HiOutlineBriefcase className="h-4 w-4" />
      </button>
      <button
        type="submit"
        disabled={busy || !!notice || !input.trim()}
        aria-label={t.assistant.send}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-opacity disabled:opacity-30"
      >
        <HiOutlinePaperAirplane className="h-4 w-4" />
      </button>
    </motion.form>
  );
}

// duración compartida por el morph del vidrio y el vuelo del logo: si no
// coinciden, el logo llega antes o después que el pill y se nota
const NOTICE_MORPH = { duration: 0.85, ease: [0.16, 1, 0.3, 1] } as const;
const NOTICE_FLIGHT_MS = NOTICE_MORPH.duration * 1000;
// cuánto se queda grande la navbar al volver, antes de compactarse
// fila de secciones que se revela detrás del logo mientras borra el mensaje.
// Mismo ancho intrínseco y mismo gap que la navbar grande y, como las dos van
// centradas, cada sección cae en el mismo punto de pantalla que tendrá
// después: al cambiar de componente no se mueve nada, solo se contrae el
// vidrio alrededor. El hueco de Asistente va vacío porque ahí aterriza el logo
function NavItemsGhost({
  active,
  markRef,
}: {
  active: TabId;
  markRef: React.Ref<HTMLSpanElement>;
}) {
  const { t } = useLang();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1"
    >
      {navItems.map((item) => {
        const isActive = item.id === active;
        return (
          <span
            key={item.id}
            className="flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-xs"
            // mismo pill que marca la sección activa en la navbar
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.09))",
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.28), inset 0 -1px 1px rgba(0,0,0,0.25)",
                  }
                : undefined
            }
          >
            {item.id === "asistente" ? (
              <span ref={markRef} className="block h-5 w-5" />
            ) : (
              <item.icon className="h-5 w-5" />
            )}
            <span
              className={isActive ? "font-medium text-black" : "text-black/60"}
            >
              {t.nav[item.id]}
            </span>
          </span>
        );
      })}
    </div>
  );
}

// delta, en coordenadas locales del elemento, para que aparezca justo encima
// de un rect de pantalla. Hace falta porque el dock está escalado y el pill
// además se está deformando: un desplazamiento en px de pantalla se
// renderizaría multiplicado por esa escala
function localOffsetTo(el: HTMLElement, target: DOMRect) {
  const now = el.getBoundingClientRect();
  const scale = now.width / el.offsetWidth || 1;
  return {
    x: (target.left + target.width / 2 - (now.left + now.width / 2)) / scale,
    y: (target.top + target.height / 2 - (now.top + now.height / 2)) / scale,
    scale: target.width / el.offsetWidth / scale,
  };
}

// la navbar misma se convierte en este aviso (layoutId "dock"). El logo vive
// adentro del pill (no en un portal): así hereda la escala del dock y viaja
// con la deformación, en vez de quedar corrido y de otro tamaño
function DockNotice({
  from,
  size,
  endSize,
  active,
  leaving,
  onClose,
}: {
  // rect del icono en la navbar, medido antes del swap: para cuando este
  // aviso monta la navbar ya no existe y no hay nada que medir
  from: DOMRect | null;
  // caja de la navbar en su estado grande, para copiarla tal cual
  size: { w: number; h: number } | null;
  // caja de la navbar compacta: a esto se contrae mientras el logo barre,
  // para terminar exactamente en la forma final
  endSize: { w: number; h: number } | null;
  active: TabId;
  leaving: boolean;
  onClose: () => void;
}) {
  const { t } = useLang();
  const slotRef = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);

  // entrada: el logo aparece sobre el icono de la navbar y cae en su hueco
  // del aviso, girando
  useLayoutEffect(() => {
    const el = markRef.current;
    if (!from || !el) return;
    const d = localOffsetTo(el, from);
    const anim = el.animate(
      [
        {
          transform: `translate(${d.x}px, ${d.y}px) scale(${d.scale}) rotate(-360deg)`,
        },
        { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
      ],
      {
        duration: NOTICE_FLIGHT_MS,
        easing: "cubic-bezier(0.16,1,0.3,1)",
        fill: "backwards",
      },
    );
    return () => anim.cancel();
  }, [from]);

  // vuelta: el logo cruza de punta a punta y a su paso borra el mensaje y
  // destapa las secciones. Los recortes van con offsets atados a la posición
  // del logo, no a un avance parejo, si no se le adelantan
  useLayoutEffect(() => {
    const text = textRef.current;
    const slotEl = slotRef.current;
    const ghost = ghostRef.current;
    const mark = markRef.current;
    if (!leaving || !text || !slotEl || !ghost || !mark) return;

    const slot = slotEl.getBoundingClientRect();
    const target = ghost.getBoundingClientRect();

    const startCx = slot.left + slot.width / 2;
    const endCx = target.left + target.width / 2;
    const span = endCx - startCx;
    const at = (x: number) =>
      Math.min(1, Math.max(0, span === 0 ? 1 : (x - startCx) / span));

    const row = ghost.closest("[data-nav-ghost]") as HTMLElement | null;
    const textBox = text.getBoundingClientRect();
    const opts = {
      duration: NOTICE_FLIGHT_MS,
      easing: "cubic-bezier(0.16,1,0.3,1)",
      fill: "forwards" as const,
    };

    // el mensaje se recorta desde la izquierda a medida que el logo lo cruza
    const wipeOut = text.animate(
      [
        { clipPath: "inset(0 0 0 0)", offset: 0 },
        { clipPath: "inset(0 0 0 0)", offset: at(textBox.left) },
        {
          clipPath: "inset(0 0 0 101%)",
          offset: Math.max(at(textBox.left) + 0.01, at(textBox.right)),
        },
        { clipPath: "inset(0 0 0 101%)", offset: 1 },
      ],
      opts,
    );
    // y las secciones se destapan justo detrás de ese mismo borde
    const rowBox = row?.getBoundingClientRect();
    const wipeIn = row?.animate(
      [
        { clipPath: "inset(0 101% 0 0)", offset: 0 },
        {
          clipPath: "inset(0 101% 0 0)",
          offset: rowBox ? at(rowBox.left) : 0,
        },
        { clipPath: "inset(0 0 0 0)", offset: rowBox ? at(rowBox.right) : 1 },
        { clipPath: "inset(0 0 0 0)", offset: 1 },
      ],
      opts,
    );

    // y el logo cruza justo sobre ese borde, hasta el hueco de Asistente
    const d = localOffsetTo(mark, target);
    const trip = mark.animate(
      [
        { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
        {
          transform: `translate(${d.x}px, ${d.y}px) scale(${d.scale}) rotate(360deg)`,
        },
      ],
      opts,
    );

    return () => {
      wipeOut.cancel();
      wipeIn?.cancel();
      trip.cancel();
    };
  }, [leaving]);

  const contentIn = {
    opacity: leaving ? 0 : 1,
    transition: { duration: leaving ? 0.18 : 0.3, delay: leaving ? 0 : 0.34 },
  };

  return (
    <motion.div
      layoutId="dock"
      transition={{ layout: NOTICE_MORPH }}
      // sin will-change: el dock está escalado 1.16 y, si se promueve a capa,
      // el navegador rasteriza el texto a 1x y después lo agranda -> borroso
      className={`${DOCK_GLASS} pointer-events-auto relative overflow-hidden rounded-full`}
      // arranca con la caja de la navbar grande y, durante el barrido, se
      // contrae hasta la compacta: al terminar ya es la forma final. La sombra
      // es la misma de la navbar y la trae la clase, así que el aviso ya nace
      // con ella y al contraerse la arrastra en vez de encenderla al final
      style={{
        width: (leaving ? endSize?.w : size?.w) ?? size?.w,
        height: (leaving ? endSize?.h : size?.h) ?? size?.h,
        transition: `width ${NOTICE_FLIGHT_MS}ms cubic-bezier(0.16,1,0.3,1), height ${NOTICE_FLIGHT_MS}ms cubic-bezier(0.16,1,0.3,1)`,
      }}
      role="status"
    >
      {/* secciones que se destapan detrás del logo */}
      {leaving && (
        <div data-nav-ghost className="absolute inset-0">
          <NavItemsGhost active={active} markRef={ghostRef} />
        </div>
      )}
      {/* mensaje: ancho fijo del tamaño grande para que no se reacomode
          mientras el pill se contrae (el recorte ya lo va tapando). Va
          centrado y no pegado al borde izquierdo: ese borde se corre hacia
          adentro al angostarse el vidrio y arrastraría al logo de más */}
      <div
        className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center gap-4 pr-3 pl-6"
        style={{ width: size?.w }}
      >
        <span
          ref={slotRef}
          data-notice-mark
          className="relative z-10 block h-9 w-9 shrink-0"
          aria-hidden
        >
          <span ref={markRef} className="block h-9 w-9 will-change-transform">
            <OneChaterLogo className="h-full w-full text-black" />
          </span>
        </span>
        <motion.p
          ref={textRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.34 } }}
          className="min-w-0 flex-1 text-base leading-6 text-black/70"
        >
          {t.notice.before}
          <a
            href="https://onechater.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-black underline decoration-black/20 underline-offset-2 hover:decoration-black"
          >
            OneChater
          </a>
          {t.notice.after}
        </motion.p>
        <motion.button
          initial={{ opacity: 0 }}
          animate={contentIn}
          onClick={onClose}
          aria-label={t.notice.close}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black"
        >
          <HiOutlineXMark className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// logo que viaja de un rect a otro girando, dibujado sobre el body para que
// la deformación del dock no le toque el recorrido
function FlyingMark({
  from,
  to,
  spin,
  onDone,
}: {
  from: DOMRect;
  to: DOMRect;
  spin: number;
  onDone?: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const anim = el.animate(
      [
        {
          transform: `translate(${from.left - to.left}px, ${
            from.top - to.top
          }px) scale(${from.width / to.width}) rotate(${-spin}deg)`,
        },
        { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
      ],
      {
        duration: NOTICE_MORPH.duration * 1000,
        easing: "cubic-bezier(0.16,1,0.3,1)",
        fill: "backwards",
      },
    );
    if (onDone) anim.addEventListener("finish", onDone);
    return () => anim.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, spin]);

  return createPortal(
    <span
      ref={ref}
      className="pointer-events-none fixed z-[61] block"
      style={{ left: to.left, top: to.top, width: to.width, height: to.height }}
      aria-hidden
    >
      <OneChaterLogo className="h-full w-full text-black" />
    </span>,
    document.body,
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

// bordes desvanecidos: dos degradados cruzados como máscara, uno por eje. A un
// iframe no se le puede difuminar el borde (su contenido lo pinta otro
// documento), así que lo que se difumina es el alfa: la demo se disuelve en
// vez de terminar en una línea recta
const CLOUD_MASK =
  "linear-gradient(to bottom, transparent 0, #000 34px, #000 calc(100% - 34px), transparent 100%), linear-gradient(to right, transparent 0, #000 34px, #000 calc(100% - 34px), transparent 100%)";

const cloudMaskStyle = {
  maskImage: CLOUD_MASK,
  WebkitMaskImage: CLOUD_MASK,
  // los dos degradados se cortan entre sí: así el desvanecido queda en los
  // cuatro lados y no solo en el último que se aplicó
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const;

// la demo no se abre como una solapa adentro de la tarjeta: sale en una nube
// que ocupa casi toda la pantalla. El halo de atrás es el que lleva el blur de
// verdad (difumina la página, no la demo) y la máscara hace que el marco se
// disuelva sobre él
function DemoCloud({
  url,
  title,
  site,
  onClose,
}: {
  url: string;
  title: string;
  site: string;
  onClose: () => void;
}) {
  const { t } = useLang();
  // el marco entra difuminado, pero el filter no puede quedar puesto: ver el
  // comentario de onAnimationComplete
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // mismo bloqueo que usa el asistente: sin esto la página de atrás
    // scrollea bajo la nube y el ancla del proyecto se pierde
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbar}px`;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* el velo es el color de la página, no negro: si no, en tono claro el
          encabezado queda con texto oscuro sobre fondo oscuro. Sin
          backdrop-filter a propósito: difuminar la pantalla entera mientras
          abajo se mueve un iframe costaba 33 de los 48 fps que faltaban */}
      <button
        type="button"
        aria-label={t.project.demoClose}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{
          backgroundColor:
            // sin blur el velo tiene que tapar más: al 93% se leía el
            // fantasma de la tarjeta de atrás
            "color-mix(in srgb, var(--background) 97%, transparent)",
        }}
      />
      <motion.div
        ref={frameRef}
        // entra difuminada y se enfoca: el gesto es de nube que se condensa,
        // no de panel que aparece
        initial={{ opacity: 0, scale: 0.94, filter: "blur(22px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.96, filter: "blur(22px)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        // framer deja el filter en "blur(0px)", que no es lo mismo que no
        // tener filter: obliga a rasterizar el iframe entero en cada frame
        // (12 fps medidos). Se saca a mano cuando la entrada termina
        onAnimationComplete={() => {
          if (frameRef.current) frameRef.current.style.filter = "none";
        }}
        className="relative flex h-[86vh] w-full max-w-6xl flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-4 px-4">
          <h3 className="font-title text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-4">
            <a
              href={site}
              {...externalLink(site)}
              className="font-mono text-xs text-black/50 hover:text-black"
            >
              {t.project.site} ↗
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.project.demoClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-black/60 transition-colors hover:bg-black/5 hover:text-black"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="relative min-h-0 flex-1">
          {/* el halo daba profundidad con backdrop-blur y costaba 12 fps: la
              misma sombra difusa, pintada una sola vez, no cuesta nada. Va en
              un div propio porque la máscara del marco también recortaría su
              sombra */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-6 rounded-[2.5rem]"
            style={{ boxShadow: "0 30px 120px rgba(0,0,0,0.45)" }}
          />
          <div
            className="relative h-full overflow-hidden rounded-[2.5rem]"
            style={cloudMaskStyle}
          >
            <iframe
              src={url}
              title={t.project.demoFrame(title)}
              loading="lazy"
              // el sitio embebido corre aislado: puede ejecutar su JS y abrir
              // enlaces, nada más
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              className="h-full w-full border-0 bg-white"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

// botón animado de la fila de enlaces del hero. Por ahora es solo la pieza
// visual: no dispara nada, la acción se define después
function AnimatedButton({ label }: { label: string }) {
  return (
    <motion.button
      type="button"
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap={{ scale: 0.96 }}
      variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className="relative flex items-center gap-2 overflow-hidden rounded-md border border-black/10 px-3 py-1.5 transition-colors hover:bg-black/5"
    >
      {/* el brillo es un span propio y no un background-position animado sobre
          el botón: animar el fondo repinta el texto en cada frame y el gris
          del tono claro parpadea. Al soltar el hover vuelve con duración 0,
          así el barrido nunca se ve en reversa (ya está fuera del recorte) */}
      <motion.span
        aria-hidden="true"
        variants={{
          rest: { x: "-150%", transition: { duration: 0 } },
          hover: {
            x: "350%",
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          },
        }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-black/10"
      />
      {/* la chispa late sola: sin eso el botón es idéntico a los enlaces de al
          lado y nada invita a tocarlo */}
      <motion.span
        aria-hidden="true"
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="h-1.5 w-1.5 rounded-full bg-black"
      />
      {label}
    </motion.button>
  );
}

export default function Home() {
  // idioma: el script del layout ya lo dejó puesto en el <html> antes de
  // pintar, así que acá se lee de ahí (leer localStorage en el render
  // rompería la hidratación)
  const [lang, setLangState] = useState<Lang>("es");
  const t = copy[lang];

  useEffect(() => {
    if (document.documentElement.lang === "en") setLangState("en");
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem("lang", next);
    } catch {
      // modo incógnito o storage bloqueado: el idioma dura la sesión
    }
  };

  const [projects, setProjects] = useState(initialProjects);
  const [activeTab, setActiveTab] = useState<TabId>("inicio");
  // demo abierta dentro de una tarjeta de proyecto (una sola a la vez: son
  // iframes de sitios enteros)
  const [openDemo, setOpenDemo] = useState<string | null>(null);
  // modo "cómo está hecho": notas sobre las partes del sitio
  // modo búsqueda laboral del asistente
  const [matchMode, setMatchMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatBusy, setChatBusy] = useState(false);
  // "resting": las APIs gratuitas están saturadas; "limit": este visitante
  // agotó sus preguntas del día. El servidor es quien decide: el front no
  // lleva su propia cuenta (contar en los dos lados adelantaba el corte y
  // bloqueaba una pregunta antes de tiempo)
  const [assistantState, setAssistantState] = useState<
    "ok" | "resting" | "limit"
  >("ok");
  const prevTab = useRef<TabId>("inicio");
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
  // fase de salida: el texto se apaga antes de que el pill vuelva a ser
  // navbar, así el cierre no corta de golpe
  const [noticeLeaving, setNoticeLeaving] = useState(false);
  const noticeFrom = useRef<DOMRect | null>(null);
  // dock en su estado "grande y con las secciones separadas": arranca así en
  // la carga y se repite al volver del aviso
  const [dockBig, setDockBig] = useState(true);
  // el botón de tono no está en la carga: aparece desprendiéndose del dock
  // recién cuando este ya terminó de entrar y compactarse
  const [toggleStage, setToggleStage] = useState<
    "hidden" | "detaching" | "done"
  >("hidden");
  const navBigSize = useRef<{ w: number; h: number } | null>(null);
  const navSmallSize = useRef<{ w: number; h: number } | null>(null);

  // Los botones se cuelgan del borde real del dock, medido cuadro a cuadro:
  // derivarlo del estado (navbar/aviso, compacto/grande) siempre terminaba
  // desincronizado, porque el dock cambia de ancho con transiciones propias
  // y la medición llegaba antes o tarde. Así siguen lo que de verdad hay.
  // Cada botón sigue su propio borde, no la mitad del ancho: al arrastrar la
  // burbuja el dock se estira anclado a un lado, así que repartir el
  // crecimiento entre los dos hacía que el borde estirado se metiera debajo
  // de un botón mientras al otro se le abría un hueco.
  // true mientras se destapa el tono nuevo. Sirve para dos cosas: cortar el
  // scroll y frenar el rAF de acá abajo, que hace dos getBoundingClientRect por
  // frame y le mete un layout sincrónico a cada frame del reveal. Vive tan
  // arriba porque ese efecto lo lee, y un const declarado después no existe
  const [themeAnim, setThemeAnim] = useState(false);
  // cerrojo de toda la secuencia del tono, reveal + espera + giro (~4.7s). El
  // guard de antes miraba themeBallAway, que ya vuelve a false antes del
  // renacimiento: apretar durante el giro arrancaba un reveal encima del otro
  const themeBusy = useRef(false);

  const dockContainer = useRef<HTMLDivElement>(null);
  const dockLeft = useMotionValue(-171);
  const dockRight = useMotionValue(171);
  const toggleX = useTransform(dockLeft, (l) => l - DOCK_SIDE_GAP - 56);
  const langX = useTransform(dockRight, (r) => r + DOCK_SIDE_GAP);

  useEffect(() => {
    // durante el reveal se apaga: son dos getBoundingClientRect por frame, o
    // sea un layout sincrónico en cada frame de la animación, y el dock no se
    // mueve igual porque la página está congelada
    if (toggleStage !== "done" || themeAnim) return;
    let raf = 0;
    const tick = () => {
      const el =
        document.querySelector("[role=status]") ?? document.querySelector("nav");
      const host = dockContainer.current;
      if (el && host) {
        const dock = el.getBoundingClientRect();
        const box = host.getBoundingClientRect();
        // los bordes vienen en px de pantalla y el contenedor está escalado
        // (entrada del dock): hay que volver al espacio local, que es donde
        // vive la `x` de los botones
        const scale = host.offsetWidth ? box.width / host.offsetWidth : 1;
        const center = box.left + box.width / 2;
        dockLeft.set((dock.left - center) / scale);
        dockRight.set((dock.right - center) / scale);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [toggleStage, themeAnim, dockLeft, dockRight]);

  // el barrido (logo borrando el mensaje y destapando las secciones) lo hace
  // el propio aviso; acá solo se espera a que termine para devolver la navbar
  // ya grande, y recién después compactarla
  function dismissNotice() {
    setNoticeLeaving(true);
    setTimeout(() => {
      // la navbar entra con la misma caja grande que tenía el aviso (cero
      // salto) y en el frame siguiente arranca a compactarse a su tamaño
      // normal, sin quedarse grande en el medio
      // el aviso ya se contrajo a la caja compacta durante el barrido, así
      // que la navbar entra en su forma final y no hay nada que reacomodar
      setShowNotice(false);
      setNoticeSeen(true);
    }, NOTICE_FLIGHT_MS);
  }
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

  // cambio de tono: la pelota de abajo del logo se va del dock, tapa la
  // pantalla mientras el tema cambia debajo, y después renace en el icono
  // fases: viaja al centro, se queda un rato mientras el tono cambia en vivo,
  // se va, y después de unos segundos de nada arranca el renacimiento
  // mientras la pelota está afuera, el icono del dock muestra solo dos
  const [themeBallAway, setThemeBallAway] = useState(false);
  // tono actual: el script del layout ya lo dejó puesto antes de pintar
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.dataset.theme === "light");
  }, []);
  // contador que dispara el renacimiento: sube cuando la pelota vuelve al DOM
  const [ballReborn, setBallReborn] = useState(0);

  function applyTheme(next: boolean) {
    const root = document.documentElement;
    if (next) root.dataset.theme = "light";
    else delete root.dataset.theme;
    setLight(next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      // modo incógnito o storage bloqueado: el tono dura la sesión
    }
  }

  // el tono nuevo se destapa por una ventana circular que nace del tamaño y en
  // el lugar exacto de la pelota de abajo del logo: desde el primer frame lo
  // que se ve adentro de la pelota ya es la página en el tono nuevo. La ventana
  // viaja al centro, se presenta y se extiende a toda la pantalla (el recorrido
  // y los tiempos están en el @keyframes theme-reveal del CSS)
  function switchTheme() {
    // secuencia en curso: el click se ignora entero. Cambiar el tono de una
    // acá tampoco sirve, porque la foto del reveal ya está sacada y quedaría
    // media pantalla en cada tono hasta que termine
    if (themeBusy.current) return;
    const next = !light;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    const root = document.documentElement;
    const icon = document.querySelector<HTMLElement>("[data-assistant-icon]");
    const rect = icon?.getBoundingClientRect();
    // sin el icono a la vista (asistente abierto, aviso en el dock), sin
    // soporte, con movimiento reducido, o con una pelota ya en el aire: el
    // tono cambia de una
    if (
      !rect ||
      !rect.width ||
      !doc.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      themeBallAway ||
      ballFlight
    ) {
      applyTheme(next);
      return;
    }

    // mismo mapeo del viewBox "14 18 74 72": la pelota de abajo está en
    // (50, 70) y mide 34 unidades
    const s = Math.min(rect.width / 74, rect.height / 72);
    const d = 34 * s;
    const cx = rect.left + rect.width / 2 + (50 - 51) * s;
    const cy = rect.top + rect.height / 2 + (70 - 54) * s;
    // clip-path circle() toma centro y radio, no esquina y diámetro
    root.style.setProperty("--ball-cx", `${cx}px`);
    root.style.setProperty("--ball-cy", `${cy}px`);
    root.style.setProperty("--ball-r", `${d / 2}px`);
    root.style.setProperty(
      "--ball-big",
      `${Math.min(window.innerWidth, window.innerHeight) * 0.21}px`,
    );

    themeBusy.current = true;
    // la pelota se va del icono ANTES de la foto del estado viejo: en las dos
    // fotos el dock tiene dos, y la tercera recién vuelve con el renacimiento
    flushSync(() => {
      setThemeBallAway(true);
      setThemeAnim(true);
    });
    // ninguna transición CSS corriendo mientras se saca la foto del estado
    // nuevo, o quedaría congelada a mitad de camino por todo el reveal
    root.dataset.morphing = "1";
    const transition = doc.startViewTransition(() => {
      flushSync(() => applyTheme(next));
    });
    // then(done, done): si la transición se saltea (otra la interrumpe, la
    // pestaña se esconde) el cierre tiene que correr igual
    const done = () => {
      delete root.dataset.morphing;
      // terminado el reveal la página vuelve a responder; el botón de tono
      // sigue trabado hasta después del giro, que es lo único que falta
      setThemeAnim(false);
      // unos segundos de nada y ahí sí giran las dos que quedaron
      setTimeout(() => {
        setThemeBallAway(false);
        setBallReborn((n) => n + 1);
      }, 1800);
    };
    transition.finished.then(done, done);
  }

  // mientras se destapa el tono, la página no se toca. El puntero lo corta el
  // CSS de [data-morphing]; el scroll no, y es el peor: mueve el DOM vivo
  // debajo de una foto quieta y el reveal se parte al medio
  useEffect(() => {
    if (!themeAnim) return;
    const stop = (e: Event) => e.preventDefault();
    const scrollKeys = new Set([
      " ",
      "PageUp",
      "PageDown",
      "Home",
      "End",
      "ArrowUp",
      "ArrowDown",
    ]);
    const stopKey = (e: KeyboardEvent) => {
      if (scrollKeys.has(e.key)) e.preventDefault();
    };
    // passive:false para poder cancelarlos, capture para llegar antes que nadie
    const opts = { passive: false, capture: true } as const;
    window.addEventListener("wheel", stop, opts);
    window.addEventListener("touchmove", stop, opts);
    window.addEventListener("keydown", stopKey, opts);
    return () => {
      window.removeEventListener("wheel", stop, true);
      window.removeEventListener("touchmove", stop, true);
      window.removeEventListener("keydown", stopKey, true);
    };
  }, [themeAnim]);

  // renacimiento: las dos pelotas que quedaron giran y de ese giro sale la
  // tercera. useLayoutEffect y no useEffect para que la pelota nunca llegue a
  // pintarse a tamaño completo antes de arrancar su animación
  useLayoutEffect(() => {
    if (!ballReborn) return;
    const icon = document.querySelector<HTMLElement>("[data-assistant-icon]");
    // recién acá se libera el botón de tono: es el último tramo de la
    // secuencia. Sin icono no hay giro que esperar, se libera enseguida
    const free = setTimeout(
      () => {
        themeBusy.current = false;
      },
      icon ? 800 : 0,
    );
    if (!icon) return () => clearTimeout(free);
    // composite "add": el giro se suma al morph/drag del dock sin pisarlos
    icon.animate(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
      {
        duration: 750,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        composite: "add",
      },
    );
    icon.querySelector<SVGPathElement>("[data-logo-bottom]")?.animate(
      [
        { transform: "scale(0)", offset: 0 },
        { transform: "scale(0)", offset: 0.3 },
        { transform: "scale(1.35)", offset: 0.7 },
        { transform: "scale(1)", offset: 1 },
      ],
      { duration: 750, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    return () => clearTimeout(free);
  }, [ballReborn]);

  // puntitos del scroll: cada sección con sus sub-puntos debajo. Los
  // proyectos se pueden reordenar arrastrando, así que la lista se arma
  // desde el estado para que el rail siga el orden que se ve en pantalla
  const scrollSections = useMemo<Section[] | null>(() => {
    if (activeTab === "inicio") {
      return [
        { id: "top", label: t.nav.inicio, depth: 0 },
        { id: "proyectos", label: t.sections.proyectos, depth: 0 },
        ...projects.map((p) => ({
          id: `proyecto-${slug(p.title)}`,
          label: p.title,
          depth: 1,
        })),
        { id: "educacion", label: t.sections.educacion, depth: 0 },
        ...t.education.map((e) => ({
          id: `edu-${e.id}`,
          label: e.short,
          depth: 1,
        })),
        { id: "certificados", label: t.sections.certificados, depth: 0 },
        ...certifications.map((c) => ({
          id: `cert-${slug(c.title)}`,
          label: c.title,
          depth: 1,
        })),
      ];
    }
    if (activeTab === "sobre") {
      return [
        { id: "top", label: t.nav.inicio, depth: 0 },
        { id: "sobre-mi", label: t.sections.sobreMi, depth: 0 },
        ...t.about.highlights.map((h) => ({
          id: `sobre-${h.id}`,
          label: h.title,
          depth: 1,
        })),
        { id: "contribuciones", label: t.sections.contribuciones, depth: 0 },
      ];
    }
    return null;
  }, [activeTab, projects, t]);

  const demoProject = projects.find((p) => p.id === openDemo);

  const chatNotice =
    assistantState === "resting"
      ? t.assistant.resting
      : assistantState === "limit"
        ? t.assistant.limit
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

  // entrada: el dock se sostiene grande 1.5s y ahí se compacta (mismo tiempo
  // que tenía antes como delay de la transición). De paso se anota cuánto
  // mide la navbar en ese estado grande: el aviso va a copiar esa geometría
  // exacta, y así los iconos que se destapan en el barrido caen justo donde
  // van a estar después
  useEffect(() => {
    if (!loaded) return;
    const nav = document.querySelector("nav");
    // en pantalla, no de layout: la navbar de la entrada se ve grande por el
    // scale del contenedor, y ese es el tamaño que tiene que copiar el aviso.
    // Al aplicarlo como medidas reales (sin transform) el texto sale nítido
    const r = nav?.getBoundingClientRect();
    if (r) navBigSize.current = { w: Math.round(r.width), h: Math.round(r.height) };
    const t = setTimeout(() => setDockBig(false), 1500);
    // 1.5s de hold + 0.9s de compactado: la gota se despega con el dock ya
    // quieto en su forma final
    const d = setTimeout(() => {
      const r = document.querySelector("nav")?.getBoundingClientRect();
      if (r)
        navSmallSize.current = {
          w: Math.round(r.width),
          h: Math.round(r.height),
        };
      setToggleStage("done");
    }, 2600);
    return () => {
      clearTimeout(t);
      clearTimeout(d);
    };
  }, [loaded]);

  // 5s desde que la página quedó lista; vuelve a ser navbar 6s después
  // (mientras dura el aviso no hay navegación, así que no se estira más)
  useEffect(() => {
    if (!loaded || noticeSeen) return;
    const show = setTimeout(() => {
      // medir el icono con la navbar todavía en pantalla
      noticeFrom.current =
        document
          .querySelector("[data-assistant-icon]")
          ?.getBoundingClientRect() ?? null;
      // caja de la navbar tal como está ahora (compacta): es a lo que se
      // contrae el aviso mientras el logo barre, para terminar clavado en la
      // forma final y que el cambio de componente no mueva nada
      const r = document.querySelector("nav")?.getBoundingClientRect();
      if (r)
        navSmallSize.current = {
          w: Math.round(r.width),
          h: Math.round(r.height),
        };
      // el aviso copia la caja de la navbar grande, pero sin la escala del
      // contenedor: el texto se dibuja a tamaño real y sale nítido
      setDockBig(false);
      setShowNotice(true);
    }, 10000);
    const hide = setTimeout(dismissNotice, 15800);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, noticeSeen]);

  // al entrar al asistente el aviso pierde sentido: ya está adentro
  useEffect(() => {
    if (activeTab !== "asistente") return;
    setShowNotice(false);
    setNoticeSeen(true);
  }, [activeTab]);


  // acciones que no sacan al visitante de la conversación: se aplican solas
  // apenas termina de escribirse la respuesta. El tono y el idioma se ven
  // igual con el chat abierto, así que no hace falta cerrarlo
  function applyAutoActions(actions: ChatAction[]) {
    for (const action of actions) {
      if (action.verb === "theme") {
        // el tono se lee del DOM y no del estado: la respuesta puede llegar
        // varios segundos después del envío y el estado del closure ya venció
        const isLight = document.documentElement.dataset.theme === "light";
        if ((action.target === "light") !== isLight) switchTheme();
      }
      if (
        action.verb === "lang" &&
        (action.target === "es" || action.target === "en") &&
        action.target !== lang
      ) {
        setLang(action.target);
      }
    }
  }

  // acciones que cierran el chat: se ejecutan cuando el visitante toca el
  // botón, nunca solas
  function runAction(action: ChatAction) {
    if (action.verb === "theme" || action.verb === "lang") {
      applyAutoActions([action]);
      return;
    }
    // el overlay del asistente se desmonta con su propia animación y recién
    // ahí el body recupera el scroll: antes de eso scrollIntoView no mueve nada
    const scrollLater = (id: string) =>
      setTimeout(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 420);

    if (action.verb === "demo") {
      const project = projects.find((p) => p.id === action.target && p.demo);
      if (!project) return;
      setTabSwitched(true);
      setActiveTab("inicio");
      prevTab.current = "inicio";
      scrollLater(`proyecto-${slug(project.title)}`);
      // la nube bloquea el scroll del body: primero se llega a la tarjeta y
      // recién ahí se abre, así al cerrarla la página quedó en el proyecto
      setTimeout(() => setOpenDemo(project.id), 900);
      return;
    }
    const to = GO_TARGETS[action.target];
    if (!to) return;
    setTabSwitched(true);
    setActiveTab(to.tab);
    prevTab.current = to.tab;
    scrollLater(to.id);
  }

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
    // el análisis de una búsqueda laboral es de una sola vez: mandado el
    // texto, el dock vuelve a ser el input normal para seguir preguntando
    const mode = matchMode;
    if (matchMode) setMatchMode(false);

    // revelado gradual: el stream llega de golpe y muy rápido; esto muestra
    // el texto a ritmo de tipeo (acelera un poco si se acumula mucho buffer)
    let target = "";
    let shown = 0;
    let streamDone = false;
    // acciones que llegaron en etiquetas dentro del texto; se separan del
    // contenido apenas entran y se aplican recién con la respuesta terminada
    let pending: ChatAction[] = [];
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
        // un botón a medio escribir no se entiende: las acciones se cuelgan
        // de la burbuja cuando el texto ya está completo
        const clickable = pending.filter(
          (action) => action.verb !== "theme" && action.verb !== "lang",
        );
        setChatMessages([
          ...history,
          {
            role: "assistant",
            content: target,
            actions: clickable.length ? clickable : undefined,
          },
        ]);
        applyAutoActions(pending);
        setChatBusy(false);
      }
    }, 30);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // el idioma viaja con la pregunta: el asistente contesta en el
        // idioma en el que se está viendo el sitio
        body: JSON.stringify({
          messages: history.slice(-20),
          lang,
          mode: mode ? "match" : undefined,
        }),
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
      // el crudo se guarda aparte: el texto que se muestra es el crudo sin las
      // etiquetas de acción, y eso hay que recalcularlo en cada pedazo porque
      // una etiqueta puede llegar partida entre dos chunks
      let raw = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        const parsed = extractActions(raw);
        target = parsed.text;
        pending = parsed.actions;
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
        { role: "assistant", content: t.assistant.oops },
      ]);
      setChatBusy(false);
    }
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
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
            <p className="text-xl text-black/60">
              {t.hero.role}
            </p>
          </motion.div>
          <motion.p
            variants={enterItem}
            className="max-w-2xl text-lg leading-7 [word-spacing:0.3em]"
          >
            {t.hero.intro}
          </motion.p>
          <motion.div
            variants={enterItem}
            className="flex flex-wrap gap-2 font-mono text-sm"
          >
            {linksFor(t).map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...externalLink(link.href)}
                className="rounded-md border border-black/10 px-3 py-1.5 hover:bg-black/5"
              >
                {link.label}
              </a>
            ))}
            <AnimatedButton label={t.hero.animation} />
          </motion.div>
        </motion.div>

        <motion.div
          className="relative w-full"
          variants={enterItem}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.24 }}
        >
          {tabSwitched && activeTab !== "asistente" && (
            <ParticleBurst key={activeTab} />
          )}
          <AnimatePresence mode="wait">
            {activeTab === "inicio" ? (
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
                  {t.sections.proyectos}
                </h2>
                <Reorder.Group
                  axis="y"
                  values={projects}
                  onReorder={setProjects}
                  className="flex flex-col gap-4"
                >
                  {projects.map((project) => (
                    <Reorder.Item
                      key={project.id}
                      id={`proyecto-${slug(project.title)}`}
                      value={project}
                      whileDrag={{
                        scale: 1.02,
                        boxShadow: "0 12px 30px rgba(0,0,0,0.55)",
                      }}
                      className={`group relative flex scroll-mt-24 cursor-grab flex-col gap-4 rounded-3xl border bg-[var(--background)] p-6 active:cursor-grabbing ${
                        project.featured
                          ? "border-black/80 shadow-lg"
                          : "border-black/10"
                      }`}
                    >
                      {project.featured && (
                        <span className="absolute -top-3 right-6 rounded-full bg-black px-3 py-1 font-mono text-xs tracking-wide text-white uppercase">
                          {t.project.featured}
                        </span>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-title text-lg font-semibold">
                          {project.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-black/60">
                          <a
                            href={project.site}
                            {...externalLink(project.site)}
                            className="hover:text-black"
                          >
                            {t.project.site}
                          </a>
                          <a
                            href={project.repo}
                            {...externalLink(project.repo)}
                            className="hover:text-black"
                          >
                            {t.project.repo}
                          </a>
                          <a
                            href={project.details}
                            {...externalLink(project.details)}
                            className="hover:text-black"
                          >
                            {t.project.details}
                          </a>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-black/[.02] p-4">
                        <p className="text-base leading-7 text-black/70">
                          {t.projects[project.id].description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h4 className="font-mono text-xs tracking-widest text-black/50 uppercase">
                          {t.project.backend}
                        </h4>
                        <p className="text-base leading-7 text-black/70">
                          {t.projects[project.id].backend}
                        </p>
                      </div>
                      {/* demo viva: el proyecto de verdad corriendo adentro de
                          la tarjeta, en vez de una captura. Solo la tienen los
                          que se dejan embeber (ver el campo `demo`) */}
                      {project.demo && (
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setOpenDemo(project.id)}
                            className="rounded-md border border-black/10 px-3 py-1.5 font-mono text-sm text-black/70 transition-colors hover:bg-black/5 hover:text-black"
                          >
                            {t.project.demo}
                          </button>
                          <span className="font-mono text-xs text-black/40">
                            {t.project.demoHint}
                          </span>
                        </div>
                      )}
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
                          alt={t.project.logoAlt(project.title)}
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
                    {t.sections.educacion}
                  </h2>
                  <div className="relative flex flex-col gap-10 pl-8">
                    <div className="absolute top-1.5 bottom-1.5 left-0 w-px bg-black/15" />
                    {t.education.map((item) => (
                      <div
                        key={item.id}
                        id={`edu-${item.id}`}
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
                    {t.sections.certificados}
                  </h2>
                  <div className="flex flex-col gap-4">
                    {certifications.map((cert) => (
                      <div
                        key={cert.id}
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
                            {t.certifications[cert.id].description}
                          </p>
                          <div className="flex flex-wrap gap-2 font-mono text-xs text-black/60">
                            {t.certifications[cert.id].tags.map((tag) => (
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
                            {...externalLink(cert.link)}
                            className="text-sm text-black/60 hover:text-black"
                          >
                            {t.cert.view}
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
                  {t.sections.sobreMi}
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-black/70">
                  {t.about.intro}
                </p>
                <div className="flex flex-col gap-4">
                  {t.about.highlights.map((item) => (
                    <div
                      key={item.id}
                      id={`sobre-${item.id}`}
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
      {activeTab !== "asistente" && scrollSections && (
        <ScrollSpy key={activeTab} sections={scrollSections} />
      )}
      <AnimatePresence>
        {activeTab === "asistente" && (
          <AssistantScreen
            messages={chatMessages}
            busy={chatBusy}
            onSend={sendChat}
            onClose={(ball) => {
              if (ball) setBallFlight(ball);
              setActiveTab(prevTab.current);
              setMatchMode(false);
            }}
            onAction={runAction}
            match={matchMode}
            onMatch={setMatchMode}
            notice={chatNotice}
            flight={flightRef}
            outcome={sendOutcome}
          />
        )}
      </AnimatePresence>
      {/* el dock recién sube (desde abajo del viewport) con la página cargada;
          animar el contenedor y no la nav deja intacto el morph del layoutId */}
      <motion.div
        ref={dockContainer}
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-6"
        initial={{ y: 160, scale: 1.16 }}
        animate={{ y: loaded ? 0 : 160, scale: dockBig ? 1.16 : 1 }}
        transition={{
          y: { duration: 0.75, delay: 0.35, ease: [0.16, 1, 0.3, 1] },
          // el hold de "grande" ya no es un delay acá: lo marca dockBig, que
          // así puede repetir el gesto cuando vuelve del aviso
          scale: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
        }}
      >
        {activeTab === "asistente" ? (
          <AssistantDock
            busy={chatBusy}
            onSend={sendChat}
            notice={chatNotice}
            match={matchMode}
            onMatch={setMatchMode}
          />
        ) : showNotice ? (
          <DockNotice
            from={noticeFrom.current}
            size={navBigSize.current}
            endSize={navSmallSize.current}
            active={activeTab}
            leaving={noticeLeaving}
            onClose={dismissNotice}
          />
        ) : (
          <Navbar
            active={activeTab}
            onChange={(label) => {
              setTabSwitched(true);
              if (label !== "asistente") prevTab.current = label;
              setActiveTab(label);
            }}
            assistantBallAway={!!ballFlight || themeBallAway}
            revealed={loaded}
            big={dockBig}
          />
        )}
        {/* fuera del ternario: el botón sigue ahí cuando el dock se convierte
            en el aviso, y por eso no repite el desprendimiento al volver */}
        {toggleStage !== "hidden" && activeTab !== "asistente" && (
          <>
            <ThemeToggle
              x={toggleX}
              visible={toggleStage === "done"}
              light={light}
              onToggle={switchTheme}
            />
            <LangToggle x={langX} visible={toggleStage === "done"} />
          </>
        )}
      </motion.div>
      {ballFlight && (
        <FlyingBall from={ballFlight} onDone={() => setBallFlight(null)} />
      )}
      <AnimatePresence>
        {demoProject?.demo && (
          <DemoCloud
            url={demoProject.demo}
            title={demoProject.title}
            site={demoProject.site}
            onClose={() => setOpenDemo(null)}
          />
        )}
      </AnimatePresence>
    </LangContext.Provider>
  );
}
