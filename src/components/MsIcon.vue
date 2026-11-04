<script setup>
// icono de Google Material Symbols: el nombre del icono se escribe como texto
// y la fuente lo convierte en dibujo (ligaduras). Los iconos disponibles son
// los que se piden en el <link> de index.html (icon_names)
defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 24 },
})
</script>

<template>
  <span class="ms" aria-hidden="true" :style="{ fontSize: `${size}px` }">{{ name }}</span>
</template>
