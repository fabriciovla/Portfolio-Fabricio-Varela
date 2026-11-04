<script setup>
import { hero } from '@/data/content.js'

// los enlaces que salen del sitio se abren en otra pestaña; los internos
// (anclas "#", archivos propios) siguen en la misma
const isExternal = (href) => /^https?:\/\//i.test(href)
</script>

<template>
  <header class="hero flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <h1 class="font-title font-semibold" style="font-size: 36px">{{ hero.name }}</h1>
      <p class="text-muted" style="font-size: 20px">{{ hero.role }}</p>
    </div>
    <p class="intro">{{ hero.intro }}</p>
    <div class="flex flex-wrap gap-2 font-mono text-sm">
      <a
        v-for="link in hero.links"
        :key="link.label"
        :href="link.href"
        :target="isExternal(link.href) ? '_blank' : undefined"
        :rel="isExternal(link.href) ? 'noreferrer' : undefined"
        class="link"
      >
        {{ link.label }}
      </a>
    </div>
  </header>
</template>

<style scoped>
/* entrada: cada bloque sube y aparece con un pequeño retraso */
.hero > * {
  animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.hero > :nth-child(2) {
  animation-delay: 0.08s;
}
.hero > :nth-child(3) {
  animation-delay: 0.16s;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

.intro {
  max-width: 42rem;
  font-size: 18px;
  line-height: 28px;
  word-spacing: 0.3em;
}

.link {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 12px;
}
.link:hover {
  background: var(--hover-bg);
}
</style>
