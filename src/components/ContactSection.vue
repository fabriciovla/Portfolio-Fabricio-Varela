<script setup>
import SectionTitle from './SectionTitle.vue'
import TechIcon from './TechIcon.vue'
import { contact, sections } from '@/data/content.js'
</script>

<template>
  <section class="flex flex-col" style="gap: 48px">
    <SectionTitle id="contacto">{{ sections.contacto }}</SectionTitle>

    <div class="flex flex-col gap-4">
      <p class="lede">{{ contact.lede }}</p>
      <p class="font-mono text-sm text-dim">{{ contact.location }}</p>
    </div>

    <!-- cada fila es el enlace entero: el objetivo del cursor es toda la banda -->
    <div class="flex flex-col">
      <a
        v-for="channel in contact.channels"
        :key="channel.id"
        :id="`contacto-${channel.id}`"
        :href="channel.href"
        target="_blank"
        rel="noreferrer"
        class="channel scroll-mt-24"
      >
        <div class="flex items-center gap-3">
          <!-- LinkedIn no está en simple-icons: va dibujado a mano -->
          <svg v-if="channel.id === 'linkedin'" class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
          </svg>
          <TechIcon v-else class="icon" :name="channel.label" :size="16" />
          <span class="font-title font-semibold" style="font-size: 18px">{{ channel.label }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="handle font-mono text-sm text-dim">{{ channel.handle }}</span>
          <span class="desc text-body">{{ channel.description }}</span>
        </div>
        <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </a>
    </div>
  </section>
</template>

<style scoped>
.lede {
  max-width: 54ch;
  font-size: 20px;
  line-height: 1.7;
}

.channel {
  display: grid;
  align-items: center;
  gap: 8px 32px;
  border-top: 1px solid var(--border);
  padding: 28px 0;
}

.icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--text-faint);
  transition: color 0.2s;
}
.channel:hover .icon {
  color: var(--text);
}

.handle {
  text-underline-offset: 4px;
  transition: color 0.2s;
}
.channel:hover .handle {
  color: var(--text);
  text-decoration: underline;
}

.desc {
  max-width: 52ch;
  font-size: 16px;
  line-height: 28px;
}

.arrow {
  display: none;
  width: 20px;
  height: 20px;
  color: rgba(242, 239, 232, 0.25);
  transition: transform 0.2s, color 0.2s;
}
.channel:hover .arrow {
  transform: translateX(4px);
  color: var(--text);
}

@media (min-width: 640px) {
  .channel {
    grid-template-columns: 10rem 1fr auto;
  }
  .arrow {
    display: block;
  }
}
</style>
