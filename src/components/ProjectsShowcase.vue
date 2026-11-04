<script setup>
import { onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import MsIcon from './MsIcon.vue'
import { projects, showcase } from '@/data/content.js'
import { vIconHover } from '@/directives/iconHover.js'

// cada app de la vista abierta se arma con sus textos cortos (showcase.apps)
// más el sitio y el repo del proyecto de verdad (projects)
const apps = showcase.apps.map((app) => {
  const project = projects.find((p) => p.id === app.id)
  return { ...app, site: project.site, repo: project.repo, logo: project.logo, wide: app.id === 'antena8' }
})

// radio inicial de las esquinas de la tarjeta cerrada; al abrir se va
// reduciendo rápido hasta 0 a medida que los bordes llegan a la pantalla
const RADIUS = 44
// duración base del recorrido completo (con curvas ease-out de GSAP, la mayor
// parte del movimiento ocurre en el primer tramo y el resto es el frenado suave)
const FULL_TIME = 0.5

const open = ref(false)
const card = ref(null)
const overlay = ref(null)
const scrim = ref(null)
const closedHead = ref(null)
const openHead = ref(null)
const list = ref(null)
const closeBtn = ref(null)

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp01 = (v) => Math.min(1, Math.max(0, v))

// Cómo está hecha la animación (y por qué se puede abrir y cerrar a la
// velocidad que se quiera sin que se rompa):
//
// 1. `state.p` (0 = cerrada, 1 = abierta) controla la tarjeta y las apps con
//    `power3.out`, y `state.tp` controla el viaje del título con `expo.out`.
// 2. Todo el aspecto sale de `state` en `render()`: el recorte del overlay, las
//    esquinas, el color de fondo, el viaje del título, la entrada de cada app
//    y el botón de cerrar. Si se aprieta cerrar a mitad de camino, ambos
//    valores cambian de sentido desde donde estén con desaceleración suave.
// 3. Hay DOS copias del título y el icono: una en la tarjeta cerrada y otra en
//    el overlay, que es un overlay fijo ya maquetado en su tamaño FINAL. Nada
//    cambia de ancho ni de alto: el overlay solo se recorta con clip-path y el
//    título viaja con transform (x/y), sin escalarse nunca. Así el texto no se
//    re-maqueta ni cambia de resolución.
const state = { p: 0, tp: 0 }
let tween = null
// hacia dónde va la animación en este momento: 1 abriendo/abierto, 0 cerrando/cerrado
let target = 0
// medidas del estado cerrado (se toman al empezar cada recorrido)
let m = { card: null, dx: 0, dy: 0, scrollY: 0 }
let items = []

function measure() {
  items = [...list.value.children]
  // la copia abierta se mide sin su desplazamiento. El overlay oculto con
  // visibility sigue maquetado, así que se puede medir en cualquier momento
  openHead.value.style.transform = ''
  const to = openHead.value.getBoundingClientRect()
  const from = closedHead.value.getBoundingClientRect()
  m = {
    card: card.value.getBoundingClientRect(),
    dx: from.left - to.left,
    dy: from.top - to.top,
    scrollY: window.scrollY,
  }
}

// Rectángulo con esquinas de curvatura continua ("squircle", como las de iOS):
// en vez de un arco de círculo, la curva entra tangente al borde con curvatura
// que crece de a poco, así que no hay un "codo" donde empieza la esquina. Se
// arma con curvas Bézier; `e` es cuánto del borde ocupa cada esquina y `t` la
// distancia de los puntos de control (control largo = entrada más suave)
function squircle(x, y, w, h, r) {
  const e = Math.min(r * 1.25, w / 2, h / 2)
  const t = e * 0.25
  const R = x + w
  const B = y + h
  return `path('M${x + e} ${y}H${R - e}C${R - t} ${y} ${R} ${y + t} ${R} ${y + e}V${B - e}C${R} ${B - t} ${R - t} ${B} ${R - e} ${B}H${x + e}C${x + t} ${B} ${x} ${B - t} ${x} ${B - e}V${y + e}C${x} ${y + t} ${x + t} ${y} ${x + e} ${y}Z')`
}

function render() {
  const p = state.p
  const tp = state.tp
  const w = document.documentElement.clientWidth
  const h = window.innerHeight
  const k = 1 - p
  const tk = 1 - tp
  const o = overlay.value

  // el fondo detrás de la tarjeta acompaña la apertura y el cierre
  scrim.value.style.opacity = clamp01(p / 0.85)

  // Recorte del overlay: los cuatro bordes van directo de la tarjeta a los
  // bordes de la ventana y el radio se desredondea antes de terminar (p = 0.72),
  // sin frenar a mitad de camino ni demorar las esquinas.
  if (p >= 1 && tp >= 1) {
    o.style.clipPath = ''
    o.style.backgroundColor = ''
    openHead.value.style.transform = ''
  } else {
    const c = m.card
    // si el usuario hace scroll en la página mientras el modal se cierra (o abre),
    // `sy` compensa el desplazamiento para que el recorte siga anclado a la tarjeta
    // real en el documento y no flote pegado a la pantalla
    const sy = m.scrollY - window.scrollY
    const left = c.left * k
    const top = (c.top + sy) * k
    const right = (w - c.right) * k
    const bottom = (h - c.bottom - sy) * k
    const r = RADIUS * (1 - clamp01(p / 0.72))
    o.style.clipPath = p >= 1 ? '' : squircle(left, top, w - left - right, h - top - bottom, r)
    // el color de fondo pasa del de la tarjeta al de la página (lo mezcla el CSS)
    o.style.backgroundColor = p >= 1 ? '' : `color-mix(in srgb, var(--bg) ${p * 100}%, var(--surface))`
    // el título viaja con su propia curva de velocidad de GSAP (expo.out)
    openHead.value.style.transform = tp >= 1 ? '' : `translate(${m.dx * tk}px, ${(m.dy + sy) * tk}px)`
  }

  // las apps acompañan el progreso suavizado por GSAP
  items.forEach((el, i) => {
    const lag = i * 0.03
    const appear = clamp01((p - 0.05 - lag) / 0.45)
    const focus = clamp01((p - 0.12 - lag) / (0.88 - lag))
    const done = appear >= 1 && focus >= 1
    el.style.opacity = appear >= 1 ? '' : appear
    el.style.transform = done ? '' : `translateY(${20 * (1 - focus)}px)`
    el.style.filter = done ? '' : `blur(${12 * (1 - focus)}px)`
    el.style.setProperty('--halo', 1 - focus)
    // bloquea clicks en los botones mientras la tarjeta aún no terminó de aparecer o se está cerrando
    el.style.pointerEvents = target === 1 && focus >= 0.75 ? '' : 'none'
  })

  // el botón de cerrar aparece pronto para poder cerrar enseguida
  const b = clamp01((p - 0.15) / 0.4)
  closeBtn.value.style.opacity = b >= 1 ? '' : b
  closeBtn.value.style.transform = b >= 1 ? '' : `scale(${0.6 + 0.4 * b})`
  closeBtn.value.style.pointerEvents = target === 1 && b > 0.2 ? '' : 'none'
}

// lleva el progreso hacia 0 o 1 desde donde esté ahora mismo
function goTo(to) {
  target = to
  tween?.kill()
  measure()
  // measure() sacó el transform del título: se reaplica antes de que se pinte
  render()

  if (reduced()) {
    state.p = to
    state.tp = to
    render()
    settle()
    return
  }

  const dist = Math.max(Math.abs(to - state.p), Math.abs(to - state.tp))
  tween = gsap
    .timeline({ onUpdate: render, onComplete: settle })
    .to(
      state,
      {
        p: to,
        duration: Math.max(0.18, FULL_TIME * dist),
        ease: 'power3.out',
      },
      0,
    )
    .to(
      state,
      {
        tp: to,
        duration: Math.max(0.2, (FULL_TIME + 0.06) * dist),
        ease: 'expo.out',
      },
      0,
    )
}

function setScrollLock(locked) {
  const val = locked ? 'hidden' : ''
  document.documentElement.style.overflow = val
  document.body.style.overflow = val
}

// el recorrido terminó (solo corre si no lo interrumpieron)
function settle() {
  tween = null
  if (target === 1) {
    closeBtn.value.focus({ preventScroll: true })
  } else {
    // el overlay se oculta y la copia cerrada del título reaparece en el mismo cuadro
    open.value = false
    setScrollLock(false)
    card.value.focus({ preventScroll: true })
  }
}

function openModal() {
  if (target === 1) return
  if (!open.value) {
    // se prepara el primer cuadro (overlay recortado sobre la tarjeta) ANTES de
    // hacerlo visible: si no, se vería la pantalla completa un instante
    overlay.value.scrollTop = 0
    measure()
    render()
    open.value = true
  }
  setScrollLock(true)
  goTo(1)
}

function closeModal() {
  if (target === 0 || !open.value) return
  // se libera el scroll de la página enseguida al cerrar; `render()` compensa
  // `window.scrollY` en vivo para que la tarjeta siga anclada a su lugar en la página
  setScrollLock(false)
  goTo(0)
}

// con el overlay encogiéndose, un click sobre él vuelve a abrirlo. Los clicks
// del botón de cerrar y de los enlaces se ignoran: suben (bubbling) hasta
// acá, y el de cerrar justo habría dejado target en 0 y reabierto el modal
function onOverlayClick(event) {
  if (event.target.closest('.close, a')) return
  if (target === 0 && open.value) openModal()
}

function onKey(event) {
  if (event.key === 'Escape') closeModal()
}

function onScroll() {
  if (open.value && (state.p < 1 || state.tp < 1)) render()
}

// los listeners viven en window solo mientras el componente existe
window.addEventListener('keydown', onKey)
window.addEventListener('scroll', onScroll, { passive: true })
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('scroll', onScroll)
  setScrollLock(false)
  tween?.kill()
})

defineExpose({ openModal })
</script>

<template>
  <section class="slot">
    <!-- tarjeta cerrada: un div con role=button (adentro no hay nada
         interactivo, pero el overlay sí lo tiene, así que no es un <button>) -->
    <div
      ref="card"
      v-icon-hover
      class="card"
      role="button"
      tabindex="0"
      :aria-label="showcase.open"
      :aria-expanded="open"
      @click="openModal"
      @keydown.enter.prevent="openModal"
      @keydown.space.prevent="openModal"
    >
      <!-- .ghost: mientras la vista abierta está activa esta copia se esconde
           (sigue ocupando su lugar para poder medirla) -->
      <div ref="closedHead" class="head" :class="{ ghost: open }">
        <MsIcon name="apps" :size="56" />
        <span class="title">{{ showcase.title }}</span>
      </div>
    </div>
  </section>

  <!-- Teleport: el overlay se monta directo en <body>. Si quedara dentro de la
       página, cualquier transform de un ancestro (las animaciones de entrada)
       lo volvería "fixed" respecto de esa caja y no de la ventana -->
  <Teleport to="body">
    <!-- velo oscuro detrás de la tarjeta (su opacidad la maneja render) -->
    <div ref="scrim" class="scrim" :class="{ 'is-open': open }" aria-hidden="true"></div>
    <div
      ref="overlay"
      class="overlay"
      :class="{ 'is-open': open }"
      role="dialog"
      aria-modal="true"
      :aria-label="showcase.title"
      :inert="open ? undefined : ''"
      @click="onOverlayClick"
    >
      <button ref="closeBtn" v-icon-hover class="close" type="button" :aria-label="showcase.close" @click="closeModal">
        <MsIcon name="close" :size="26" />
      </button>

      <div class="inner">
        <div class="left">
          <div ref="openHead" class="head">
            <MsIcon name="apps" :size="56" />
            <span class="title">{{ showcase.title }}</span>
          </div>
        </div>

        <ul ref="list" class="list">
          <li v-for="app in apps" :key="app.id" class="item">
            <div class="name-row">
              <span class="icon" :class="{ wide: app.wide }">
                <img :src="app.logo" alt="" />
              </span>
              <h3 class="name">{{ app.name }}</h3>
            </div>
            <p class="desc">{{ app.description }}</p>
            <div class="actions">
              <a v-icon-hover class="btn primary" :href="app.site" target="_blank" rel="noreferrer">
                <MsIcon name="open_in_new" :size="20" />
                {{ showcase.openApp }}
              </a>
              <a
                v-icon-hover
                class="btn secondary"
                :href="app.repo !== '#' ? app.repo : app.site"
                target="_blank"
                rel="noreferrer"
              >
                <MsIcon name="visibility" :size="20" />
                {{ showcase.moreInfo }}
              </a>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* la tarjeta ocupa el alto que le deja la página (flex: 1 en App.vue) */
.slot {
  position: relative;
  flex: 1;
  min-height: clamp(380px, 54vh, 520px);
}

/* ---- tarjeta cerrada ---- */
.card {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  border: 1px solid transparent;
  /* igual al RADIUS del script: la esquina de la tarjeta cerrada y la del
     recorte con el que arranca la animación tienen que coincidir */
  border-radius: 44px;
  background: var(--surface);
  padding: 40px;
  cursor: pointer;
  transition: background 0.3s, border-color 0.3s;
}
.card:hover {
  background: var(--surface-hover);
  border-color: var(--border);
}
.card:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 4px;
}

/* ---- título + icono: iguales en las dos copias (mismo tamaño, sin escalar) ---- */
.head {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* el título no se parte en dos líneas nunca: su ancho es el mismo en las dos copias */
  white-space: nowrap;
}
.head.ghost {
  visibility: hidden;
}

.title {
  font-family: var(--font-title);
  font-size: clamp(44px, 5.2vw, 68px);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
}

/* velo: queda justo debajo del overlay (z-index 49 vs 50) y no recibe clicks */
.scrim {
  position: fixed;
  inset: 0;
  z-index: 49;
  /* gris suave, como en la referencia: apenas oscurece la página */
  background: rgba(20, 20, 31, 0.14);
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
.scrim.is-open {
  visibility: visible;
}

/* ---- vista abierta: overlay fijo, ya maquetado en su tamaño final ---- */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--bg);
  visibility: hidden;
}
.overlay.is-open {
  visibility: visible;
}

.close {
  position: fixed;
  top: 24px;
  left: 28px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
}
.close:hover {
  background: var(--hover-bg);
}

.inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 560px);
  align-items: start;
  gap: 56px;
  max-width: 1200px;
  min-height: 100%;
  margin: 0 auto;
  padding: 80px 32px;
}

.left {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  height: 100vh;
  margin-block: -80px;
}

/* ---- lista de apps ---- */
.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* sombra de entrada: capa aparte cuya opacidad (--halo) anima GSAP. En reposo
   es 0, o sea invisible */
.item::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 28px 60px rgba(20, 20, 45, 0.28);
  opacity: var(--halo, 0);
  pointer-events: none;
}

.item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid transparent;
  border-radius: 26px;
  background: var(--surface);
  padding: 28px;
  transition: background 0.3s, border-color 0.3s;
}
.item:hover {
  background: var(--surface-hover);
  border-color: var(--border);
}

.name-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  overflow: hidden;
  border-radius: 14px;
}
.icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* Antena 8 es un wordmark ancho, no un icono cuadrado: va contenido en una caja blanca */
.icon.wide {
  background: #fff;
  border: 1px solid var(--border);
  padding: 4px;
}
.icon.wide img {
  object-fit: contain;
}

.name {
  font-family: var(--font-title);
  font-size: clamp(30px, 3.2vw, 40px);
  font-weight: 500;
  letter-spacing: -0.035em;
  line-height: 1.1;
}

.desc {
  max-width: 44ch;
  font-size: clamp(16px, 1.5vw, 19px);
  line-height: 1.4;
  color: var(--text-muted);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 46px;
  border-radius: 9999px;
  padding: 0 22px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  transition: background 0.2s, transform 0.2s, filter 0.2s;
}
.btn.primary {
  border: 1px solid #09090d;
  background: #09090d;
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32), 0 1px 2px rgba(0, 0, 0, 0.16);
}
.btn.primary:hover {
  background: #1c1c26;
}
.btn.secondary {
  border: 1px solid rgba(20, 20, 45, 0.08);
  background: rgba(20, 20, 45, 0.045);
  color: var(--text-body);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 1px 2px rgba(20, 20, 45, 0.04);
}
.btn.secondary:hover {
  background: rgba(20, 20, 45, 0.08);
  color: var(--text);
}

/* ---- mobile: una sola columna ---- */
@media (max-width: 860px) {
  .card {
    padding: 28px;
  }
  .inner {
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 32px;
    padding: 96px 16px 40px;
  }
  .left {
    position: static;
    height: auto;
    margin-block: 0;
  }
  .item {
    padding: 22px;
  }
}
</style>

