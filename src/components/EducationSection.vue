<script setup>
import SectionTitle from './SectionTitle.vue'
import { education, sections } from '@/data/content.js'
</script>

<template>
  <section class="flex flex-col gap-6">
    <SectionTitle id="educacion">{{ sections.educacion }}</SectionTitle>
    <div class="timeline relative flex flex-col gap-10">
      <div class="line"></div>
      <div v-for="item in education" :key="item.id" :id="`edu-${item.id}`" class="item relative flex flex-col gap-3 scroll-mt-24">
        <span class="dot"></span>
        <span class="font-mono text-sm text-dim">{{ item.period }}</span>
        <h3 class="font-title font-semibold" style="font-size: 18px">
          {{ item.institution }}
          <span class="program">· {{ item.program }}</span>
        </h3>
        <ul class="flex flex-col gap-2">
          <!-- el tercer punto en adelante se saca en mobile (clase extra) -->
          <li v-for="(bullet, i) in item.bullets" :key="bullet" class="bullet text-body" :class="{ 'hide-mobile': i >= 2 }">
            {{ bullet }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  padding-left: 32px;
}

.line {
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 0;
  width: 1px;
  background: var(--border);
}

.dot {
  position: absolute;
  top: 6px;
  left: -32px;
  width: 10px;
  height: 10px;
  transform: translateX(-50%);
  border-radius: 9999px;
  background: var(--text);
}

.program {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  color: var(--text-dim);
}

ul {
  padding-left: 20px;
}

.bullet {
  list-style: disc;
  font-size: 16px;
  line-height: 28px;
}

@media (max-width: 767px) {
  .hide-mobile {
    display: none;
  }
}
</style>
