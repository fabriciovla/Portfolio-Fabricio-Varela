<script setup>
import SectionTitle from './SectionTitle.vue'
import AboutRow from './AboutRow.vue'
import TechChip from './TechChip.vue'
import { about, sections } from '@/data/content.js'
</script>

<template>
  <section class="flex flex-col" style="gap: 48px">
    <SectionTitle id="sobre-mi">{{ sections.sobreMi }}</SectionTitle>

    <!-- introLead en negrita y siempre visible; introRest se oculta en mobile -->
    <p class="intro">
      <span class="font-semibold">{{ about.introLead }}</span>
      <span class="rest"> {{ about.introRest }}</span>
    </p>

    <div class="flex flex-col">
      <AboutRow v-for="(item, i) in about.highlights" :key="item.id" :id="`sobre-${item.id}`" :index="i + 1" :title="item.title">
        <p class="text">{{ item.text }}</p>
      </AboutRow>

      <AboutRow id="sobre-herramientas" :index="about.highlights.length + 1" :title="about.tools.title">
        <div class="flex flex-wrap gap-2">
          <TechChip v-for="tool in about.tools.items" :key="tool" :name="tool" />
        </div>
        <p class="text">{{ about.tools.note }}</p>
      </AboutRow>

      <AboutRow id="sobre-fuera" :index="about.highlights.length + 2" :title="about.offline.title">
        <p class="text">{{ about.offline.text }}</p>
      </AboutRow>

      <!-- cierra la serie: sin esta línea el último punto queda colgando -->
      <div class="end"></div>
    </div>
  </section>
</template>

<style scoped>
.intro {
  max-width: 54ch;
  font-size: 20px;
  line-height: 1.7;
}

.rest {
  display: none;
}

.text {
  max-width: 56ch;
  font-size: 18px;
  line-height: 32px;
  color: var(--text-strong);
  /* 4 líneas máximo en mobile */
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.end {
  border-top: 1px solid var(--border);
}

@media (min-width: 768px) {
  .rest {
    display: inline;
  }
  .text {
    display: block;
    overflow: visible;
  }
}
</style>
