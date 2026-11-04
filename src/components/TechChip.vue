<script setup>
import TechIcon from './TechIcon.vue'

defineProps({
  name: { type: String, required: true },
  // en mobile los proyectos muestran solo el icono: con `iconOnlyMobile` el
  // nombre queda oculto pero legible para lectores de pantalla
  iconOnlyMobile: { type: Boolean, default: false },
})
</script>

<template>
  <span class="chip font-mono text-xs flex items-center gap-2" :title="name">
    <TechIcon :name="name" />
    <span :class="{ 'chip-name': iconOnlyMobile }">{{ name }}</span>
  </span>
</template>

<style scoped>
.chip {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 8px;
  color: var(--text-muted);
}

@media (max-width: 639px) {
  .chip-name {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
}
</style>
