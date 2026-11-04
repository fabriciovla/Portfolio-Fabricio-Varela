<script setup>
// fila de "Sobre Mí": número y etiqueta a la izquierda, contenido a la derecha,
// separada de la anterior por una línea
defineProps({
  id: { type: String, required: true },
  index: { type: Number, required: true },
  title: { type: String, required: true },
})
</script>

<template>
  <div :id="id" class="row scroll-mt-24">
    <div class="flex items-baseline gap-3">
      <span class="font-mono text-xs text-faint">{{ String(index).padStart(2, '0') }}</span>
      <h3 class="font-title font-semibold" style="font-size: 16px">{{ title }}</h3>
    </div>
    <div class="flex flex-col gap-4">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.row {
  display: grid;
  gap: 12px 32px;
  border-top: 1px solid var(--border);
  padding: 32px 0;
}

@media (min-width: 640px) {
  .row {
    grid-template-columns: 10rem 1fr;
  }
}
</style>
