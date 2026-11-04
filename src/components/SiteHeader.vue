<script setup>
import MsIcon from './MsIcon.vue'
import { header, hero } from '@/data/content.js'
import { vIconHover } from '@/directives/iconHover.js'
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand-text" href="#top" :aria-label="header.brandLabel">
        {{ hero.name }}
      </a>
      <nav class="nav">
        <a v-for="link in header.links" :key="link.label" class="link text-muted" :href="link.href" target="_blank" rel="noreferrer">
          {{ link.label }}
        </a>
        <a v-icon-hover class="contact" :href="`mailto:${header.email}`">
          <MsIcon name="mail" :size="18" />
          {{ header.contact }}
        </a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1120px;
  height: 64px;
  margin: 0 auto;
  padding: 0 24px;
}

.brand-text {
  font-family: var(--font-title);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--text);
}

/* monograma: cuadrado de tinta con las iniciales */
.brand {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--text);
  color: var(--bg);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.nav {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 15px;
}

.link {
  transition: color 0.2s;
}
.link:hover {
  color: var(--text);
}

.contact {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0 16px;
  font-weight: 500;
  transition: background 0.2s;
}
.contact:hover {
  background: var(--hover-bg);
}

@media (max-width: 520px) {
  .nav {
    gap: 14px;
  }
  /* en pantallas chicas quedan solo las redes cortas + contacto */
  .link:nth-child(2) {
    display: none;
  }
}
</style>
