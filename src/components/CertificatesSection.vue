<script setup>
import SectionTitle from './SectionTitle.vue'
import HoloCard from './HoloCard.vue'
import TechIcon from './TechIcon.vue'
import { certifications, certLabels, sections } from '@/data/content.js'

const isExternal = (href) => /^https?:\/\//i.test(href)
const slug = (text) => text.toLowerCase().replace(/\s+/g, '-')
</script>

<template>
  <section class="flex flex-col gap-6">
    <SectionTitle id="certificados">{{ sections.certificados }}</SectionTitle>
    <div class="flex flex-col gap-4">
      <!-- el id va en este wrapper (siempre presente) y no en las dos
           variantes de adentro: si no, habría dos elementos con el mismo id -->
      <div v-for="cert in certifications" :key="cert.id" :id="`cert-${slug(cert.title)}`" class="scroll-mt-24">
        <!-- mobile: solo logo + nombre, y toda la tarjeta es el link -->
        <a :href="cert.link" :target="isExternal(cert.link) ? '_blank' : undefined" rel="noreferrer" class="mobile">
          <HoloCard>
            <div class="flex flex-col items-center gap-3 text-center" style="padding: 8px 0">
              <TechIcon :name="cert.icon" :size="32" />
              <h3 class="font-title font-semibold" style="font-size: 16px">{{ cert.title }}</h3>
            </div>
          </HoloCard>
        </a>

        <!-- desktop: tarjeta completa -->
        <div class="desktop">
          <HoloCard>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <TechIcon :name="cert.icon" :size="20" />
                <h3 class="font-title font-semibold" style="font-size: 18px">{{ cert.title }}</h3>
                <span class="text-faint">·</span>
                <span class="text-muted" style="font-size: 16px">{{ cert.issuer }}</span>
              </div>
              <span class="font-mono text-sm text-faint">{{ cert.code }}</span>
            </div>
            <div class="panel flex flex-col gap-3">
              <p class="text-body" style="font-size: 16px; line-height: 28px">{{ cert.description }}</p>
              <div class="flex flex-wrap gap-2 font-mono text-xs text-muted">
                <span v-for="tag in cert.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
              <a :href="cert.link" :target="isExternal(cert.link) ? '_blank' : undefined" rel="noreferrer" class="view text-sm text-muted">
                {{ certLabels.view }}
              </a>
            </div>
          </HoloCard>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mobile {
  display: block;
}
.desktop {
  display: none;
}

.panel {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--bg-soft);
  padding: 16px;
}

.tag {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 8px;
}

.view:hover {
  color: var(--text);
}

@media (min-width: 768px) {
  .mobile {
    display: none;
  }
  .desktop {
    display: block;
  }
}
</style>
