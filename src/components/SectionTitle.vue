<script setup>
// el id es el ancla de la sección (#proyectos, #educacion...): cuando se
// rehaga el dock, cada botón va a scrollear hasta acá
defineProps({
  id: { type: String, default: undefined },
})
</script>

<template>
  <!-- <slot /> es el hueco donde va lo que se escribe entre las etiquetas:
       <SectionTitle>Proyectos</SectionTitle> -->
  <h2 :id="id" class="title font-mono text-sm uppercase tracking-widest text-dim scroll-mt-24">
    <slot />
  </h2>
</template>
