<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import MsIcon from '@/components/MsIcon.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import ProjectsShowcase from '@/components/ProjectsShowcase.vue'
import AboutShowcase from '@/components/AboutShowcase.vue'
import { hero, showcase } from '@/data/content.js'
import { vIconHover } from '@/directives/iconHover.js'

const root = ref(null)
const showcaseRef = ref(null)
// el nombre se parte en palabras para que cada una "suba" desde una máscara
const words = hero.name.split(' ')

// gsap.context junta todas las animaciones creadas adentro: al desmontar,
// revert() las limpia (y deja los estilos como estaban)
let ctx
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  ctx = gsap.context(() => {
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .from('.site-header .header-inner > *', { y: -18, opacity: 0, duration: 0.6, stagger: 0.08 })
      .from('.hero', { scale: 0.985, opacity: 0, duration: 0.7, clearProps: 'transform,opacity' }, 0.05)
      .from('.word-inner', { yPercent: 115, duration: 0.9, stagger: 0.09 }, 0.15)
      .from('.role', { y: 16, opacity: 0, duration: 0.65 }, 0.45)
      .from('.hero-actions > *', { y: 14, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.55)
      // clearProps: al terminar no queda ningún transform inline en la tarjeta
      .from('.slot', { y: 50, opacity: 0, duration: 0.8, clearProps: 'transform,opacity' }, 0.65)
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="root" class="page">
    <SiteHeader />

    <!-- primera pantalla: tarjeta grande con el nombre, subtítulo y accesos centrados -->
    <section id="top" class="hero">
      <h1 class="name" :aria-label="hero.name">
        <!-- cada palabra dentro de una máscara (overflow hidden): al subir
             desde abajo parece que sale de una línea invisible -->
        <span v-for="word in words" :key="word" class="word" aria-hidden="true">
          <span class="word-inner">{{ word }}</span>
        </span>
      </h1>
      <p class="role text-muted">{{ hero.role }}</p>

      <div class="hero-actions">
        <button v-icon-hover type="button" class="cta-primary" @click="showcaseRef?.openModal()">
          <MsIcon name="apps" :size="18" />
          {{ showcase.title }}
        </button>
        <a class="cta-secondary" :href="hero.links[0].href" target="_blank" rel="noreferrer">
          {{ hero.links[0].label }} ↗
        </a>
      </div>
    </section>

    <!-- secciones debajo: cada tarjeta ocupa todo el ancho y se abre a pantalla completa -->
    <ProjectsShowcase ref="showcaseRef" />
    <AboutShowcase />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 1920px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 68px 20px 28px;
}

/* contenedor grande redondeado para el nombre, ocupando la primera pantalla */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: calc(100vh - 88px);
  border-radius: 36px;
  background: var(--surface);
  padding: 48px 24px;
  text-align: center;
}

.name {
  font-family: var(--font-title);
  font-size: clamp(54px, 9.2vw, 132px);
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 0.96;
}

.word {
  display: inline-block;
  overflow: hidden;
  margin: 0 0.02em;
  /* margen interno dentro de la máscara: evita que el letter-spacing negativo
     o el remate de las letras se recorte a los lados o abajo */
  padding: 0.04em 0.08em 0.12em;
  vertical-align: top;
}
.word-inner {
  display: inline-block;
}

.role {
  font-family: var(--font-body);
  font-size: clamp(18px, 2vw, 26px);
  font-weight: 400;
  letter-spacing: -0.02em;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
}

.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  border: none;
  border-radius: 9999px;
  background: var(--text);
  color: var(--bg);
  padding: 0 22px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}
.cta-primary:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  opacity: 0.85;
  transition: opacity 0.2s;
}
.cta-secondary:hover {
  opacity: 1;
}

@media (max-width: 860px) {
  .page {
    padding: 64px 16px 24px;
  }
  .hero {
    min-height: calc(100vh - 80px);
    border-radius: 28px;
  }
}
</style>
