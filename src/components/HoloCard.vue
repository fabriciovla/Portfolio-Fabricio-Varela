<script setup>
import { ref } from 'vue'

// espectro del arcoíris que se mueve con el cursor
const SPECTRUM = '#ff3d81, #ff8a3d, #ffe83d, #4dff7a, #3de0ff, #6a3dff, #ff3dd6, #ff3d81'

const card = ref(null)
const hover = ref(false)
// posición del cursor en % dentro de la tarjeta; 50/50 = centro (reposo)
const px = ref(50)
const py = ref(50)

function onMove(event) {
  const rect = card.value.getBoundingClientRect()
  px.value = ((event.clientX - rect.left) / rect.width) * 100
  py.value = ((event.clientY - rect.top) / rect.height) * 100
}

function onLeave() {
  hover.value = false
  px.value = 50
  py.value = 50
}
</script>

<template>
  <div
    ref="card"
    class="holo"
    :style="{
      '--px': px,
      '--py': py,
      '--spectrum': SPECTRUM,
      transform: hover
        ? 'perspective(800px) rotateX(calc((50 - var(--py)) * 0.1deg)) rotateY(calc((var(--px) - 50) * 0.1deg)) scale(1.015)'
        : 'perspective(800px) scale(1)',
      // un pelín de suavizado al seguir el mouse: sin esto el tilt engancha
      // de golpe al entrar y tiembla con cada pixel
      transition: hover ? 'transform 0.12s ease-out' : 'transform 0.5s ease',
    }"
    @mousemove="onMove"
    @mouseenter="hover = true"
    @mouseleave="onLeave"
  >
    <!-- tres capas decorativas: arcoíris, rayado y brillo bajo el cursor -->
    <div class="layer spectrum" :class="{ on: hover }" aria-hidden="true"></div>
    <div class="layer sheen" :class="{ on: hover }" aria-hidden="true"></div>
    <div class="layer glare" :class="{ on: hover }" aria-hidden="true"></div>
    <div class="content flex flex-col gap-4 relative">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.holo {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 24px;
  background: var(--bg);
  padding: 24px;
  will-change: transform;
}

.layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.spectrum {
  opacity: var(--holo-spectrum);
  /* giro suave del espectro (~1/3 de vuelta al cruzar la tarjeta) */
  background: conic-gradient(
    from calc(var(--px) * 1.2deg) at calc(var(--px) * 1%) calc(var(--py) * 1%),
    var(--spectrum)
  );
  mix-blend-mode: var(--holo-blend);
}
.spectrum.on {
  opacity: var(--holo-spectrum-hover);
}

.sheen {
  opacity: var(--holo-sheen);
  background: repeating-linear-gradient(115deg, var(--holo-sheen-color) 0%, transparent 4%, transparent 8%);
  background-position: calc(var(--px) * 1%) calc(var(--py) * 1%);
  mix-blend-mode: var(--holo-blend);
}
.sheen.on {
  opacity: var(--holo-sheen-hover);
}

.glare {
  opacity: 0;
  background: radial-gradient(circle at calc(var(--px) * 1%) calc(var(--py) * 1%), rgba(255, 255, 255, 0.95), transparent 45%);
  mix-blend-mode: var(--holo-glare-blend);
}
.glare.on {
  opacity: var(--holo-glare-hover);
}
</style>
