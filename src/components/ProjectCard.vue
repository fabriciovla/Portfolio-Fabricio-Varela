<script setup>
import TechChip from './TechChip.vue'
import { projectLabels } from '@/data/content.js'

// un solo prop: el objeto del proyecto entero. El componente se dibuja a
// partir de él y el padre lo repite con v-for
defineProps({
  project: { type: Object, required: true },
})

const isExternal = (href) => /^https?:\/\//i.test(href)
const slug = (text) => text.toLowerCase().replace(/\s+/g, '-')
</script>

<template>
  <article :id="`proyecto-${slug(project.title)}`" class="card scroll-mt-24 relative flex flex-col gap-4" :class="{ featured: project.featured }">
    <span v-if="project.featured" class="badge font-mono text-xs uppercase">{{ projectLabels.featured }}</span>

    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="font-title font-semibold" style="font-size: 18px">{{ project.title }}</h3>
      <div class="links flex flex-wrap gap-4 text-sm text-muted">
        <a :href="project.site" :target="isExternal(project.site) ? '_blank' : undefined" rel="noreferrer">{{ projectLabels.site }}</a>
        <a :href="project.repo" :target="isExternal(project.repo) ? '_blank' : undefined" rel="noreferrer">{{ projectLabels.repo }}</a>
        <a :href="project.details" :target="isExternal(project.details) ? '_blank' : undefined" rel="noreferrer">{{ projectLabels.details }}</a>
      </div>
    </div>

    <div class="panel">
      <p class="description text-body">{{ project.description }}</p>
    </div>

    <!-- en mobile el detalle de backend se saca: sumado a la descripción la
         tarjeta ocupaba varias pantallas -->
    <div class="backend flex flex-col gap-2">
      <h4 class="font-mono text-xs uppercase tracking-widest text-dim">{{ projectLabels.backend }}</h4>
      <p class="text-body" style="font-size: 16px; line-height: 28px">{{ project.backend }}</p>
    </div>

    <div class="footer flex items-end justify-between gap-5">
      <div class="flex flex-wrap gap-2">
        <TechChip v-for="tech in project.stack" :key="tech" :name="tech" icon-only-mobile />
      </div>
      <img class="logo shrink-0" :src="project.logo" :alt="projectLabels.logoAlt(project.title)" loading="lazy" decoding="async" />
    </div>
  </article>
</template>

<style scoped>
.card {
  border: 1px solid var(--border);
  border-radius: 24px;
  background: var(--bg);
  padding: 16px;
}
.card.featured {
  border-color: var(--text-strong);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
}

.badge {
  position: absolute;
  top: -12px;
  right: 24px;
  border-radius: 9999px;
  background: var(--text);
  color: var(--bg);
  padding: 4px 12px;
  letter-spacing: 0.025em;
}

.links a:hover {
  color: var(--text);
}

.panel {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--bg-soft);
  padding: 12px;
}

.description {
  font-size: 16px;
  line-height: 28px;
  /* recortada a 4 líneas en mobile; en desktop se ve entera (ver media query) */
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.backend {
  display: none;
}

.footer {
  border-top: 1px solid var(--border-soft);
  padding-top: 16px;
}

.logo {
  display: none;
  height: 32px;
  width: auto;
  max-width: 120px;
  align-self: center;
  object-fit: contain;
  opacity: 0.6;
  filter: grayscale(1);
  transition: opacity 0.5s, filter 0.5s;
}
.card:hover .logo {
  opacity: 1;
  filter: grayscale(0);
}

@media (min-width: 640px) {
  .card {
    padding: 24px;
  }
  .panel {
    padding: 16px;
  }
  .logo {
    display: block;
  }
}

@media (min-width: 768px) {
  .description {
    display: block;
    overflow: visible;
  }
  .backend {
    display: flex;
  }
}
</style>
