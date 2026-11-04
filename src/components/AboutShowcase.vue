<script setup>
import { onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import MsIcon from './MsIcon.vue'
import { aboutShowcase } from '@/data/content.js'
import { vIconHover } from '@/directives/iconHover.js'

const RADIUS = 44
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

const state = { p: 0, tp: 0 }
let tween = null
let target = 0
let m = { card: null, dx: 0, dy: 0, scrollY: 0 }
let items = []

function measure() {
  items = [...list.value.children]
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

  scrim.value.style.opacity = clamp01(p / 0.85)

  if (p >= 1 && tp >= 1) {
    o.style.clipPath = ''
    o.style.backgroundColor = ''
    openHead.value.style.transform = ''
  } else {
    const c = m.card
    const sy = m.scrollY - window.scrollY
    const left = c.left * k
    const top = (c.top + sy) * k
    const right = (w - c.right) * k
    const bottom = (h - c.bottom - sy) * k
    const r = RADIUS * (1 - clamp01(p / 0.72))
    o.style.clipPath = p >= 1 ? '' : squircle(left, top, w - left - right, h - top - bottom, r)
    o.style.backgroundColor = p >= 1 ? '' : `color-mix(in srgb, var(--bg) ${p * 100}%, var(--surface))`
    openHead.value.style.transform = tp >= 1 ? '' : `translate(${m.dx * tk}px, ${(m.dy + sy) * tk}px)`
  }

  items.forEach((el, i) => {
    const lag = i * 0.03
    const appear = clamp01((p - 0.05 - lag) / 0.45)
    const focus = clamp01((p - 0.12 - lag) / (0.88 - lag))
    const done = appear >= 1 && focus >= 1
    el.style.opacity = appear >= 1 ? '' : appear
    el.style.transform = done ? '' : `translateY(${20 * (1 - focus)}px)`
    el.style.filter = done ? '' : `blur(${12 * (1 - focus)}px)`
    el.style.setProperty('--halo', 1 - focus)
    el.style.pointerEvents = target === 1 && focus >= 0.75 ? '' : 'none'
  })

  const b = clamp01((p - 0.15) / 0.4)
  closeBtn.value.style.opacity = b >= 1 ? '' : b
  closeBtn.value.style.transform = b >= 1 ? '' : `scale(${0.6 + 0.4 * b})`
  closeBtn.value.style.pointerEvents = target === 1 && b > 0.2 ? '' : 'none'
}

function goTo(to) {
  target = to
  tween?.kill()
  measure()
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

function settle() {
  tween = null
  if (target === 1) {
    closeBtn.value.focus({ preventScroll: true })
  } else {
    open.value = false
    setScrollLock(false)
    card.value.focus({ preventScroll: true })
  }
}

function openModal() {
  if (target === 1) return
  if (!open.value) {
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
  setScrollLock(false)
  goTo(0)
}

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
    <div
      ref="card"
      v-icon-hover
      class="card"
      role="button"
      tabindex="0"
      :aria-label="aboutShowcase.open"
      :aria-expanded="open"
      @click="openModal"
      @keydown.enter.prevent="openModal"
      @keydown.space.prevent="openModal"
    >
      <div ref="closedHead" class="head" :class="{ ghost: open }">
        <MsIcon name="person" :size="56" />
        <span class="title">{{ aboutShowcase.title }}</span>
      </div>
    </div>
  </section>

  <Teleport to="body">
    <div ref="scrim" class="scrim" :class="{ 'is-open': open }" aria-hidden="true"></div>
    <div
      ref="overlay"
      class="overlay"
      :class="{ 'is-open': open }"
      role="dialog"
      aria-modal="true"
      :aria-label="aboutShowcase.title"
      :inert="open ? undefined : ''"
      @click="onOverlayClick"
    >
      <button ref="closeBtn" v-icon-hover class="close" type="button" :aria-label="aboutShowcase.close" @click="closeModal">
        <MsIcon name="close" :size="26" />
      </button>

      <div class="inner">
        <ul ref="list" class="list">
          <li class="item">
            <p class="intro">{{ aboutShowcase.intro }}</p>
          </li>
          <li v-for="item in aboutShowcase.items" :key="item.id" class="item">
            <h3 class="name">{{ item.title }}</h3>
            <div v-if="item.tags" class="tags">
              <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <p class="desc">{{ item.description }}</p>
          </li>
        </ul>

        <div class="right">
          <div ref="openHead" class="head">
            <MsIcon name="person" :size="56" />
            <span class="title">{{ aboutShowcase.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.slot {
  position: relative;
  flex: 1;
  min-height: clamp(380px, 54vh, 520px);
}

.card {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  border: 1px solid transparent;
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

.head {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  text-align: right;
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

.scrim {
  position: fixed;
  inset: 0;
  z-index: 49;
  background: rgba(20, 20, 31, 0.14);
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
.scrim.is-open {
  visibility: visible;
}

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
  right: 28px;
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
  grid-template-columns: minmax(0, 560px) minmax(0, 1fr);
  align-items: start;
  gap: 56px;
  max-width: 1200px;
  min-height: 100%;
  margin: 0 auto;
  padding: 80px 32px;
}

.right {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100vh;
  margin-block: -80px;
}

.list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - 160px);
  gap: 14px;
}

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
  gap: 12px;
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

.name {
  font-family: var(--font-title);
  font-size: clamp(26px, 2.8vw, 36px);
  font-weight: 500;
  letter-spacing: -0.035em;
  line-height: 1.1;
}

.intro {
  font-size: clamp(17px, 1.6vw, 20px);
  line-height: 1.5;
  color: var(--text);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: rgba(20, 20, 45, 0.05);
  color: var(--text);
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
}

.desc {
  max-width: 46ch;
  font-size: clamp(16px, 1.5vw, 19px);
  line-height: 1.45;
  color: var(--text-muted);
}

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
  .right {
    position: static;
    order: -1;
    height: auto;
    margin-block: 0;
  }
  .list {
    min-height: auto;
  }
  .item {
    padding: 22px;
  }
}
</style>
