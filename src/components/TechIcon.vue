<script setup>
import { computed } from 'vue'
import { techIcons } from '@/data/techIcons.js'

// props: lo que el componente padre le pasa. Acá solo hace falta el nombre
// de la tecnología y el tamaño del icono
const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 14 },
})

const entry = computed(() => techIcons[props.name])
</script>

<template>
  <!-- logo de Microsoft: son cuatro cuadrados de colores, no entra en simple-icons -->
  <svg v-if="name === 'Microsoft'" viewBox="0 0 21 21" :width="size" :height="size" aria-hidden="true">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
  <!-- sin v-if no hay nada que dibujar: "VS Code" no tiene icono y el chip queda con solo el nombre -->
  <svg v-else-if="entry" viewBox="0 0 24 24" :width="size" :height="size" :fill="entry.color" aria-hidden="true">
    <path :d="entry.icon.path" />
  </svg>
</template>
