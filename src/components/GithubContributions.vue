<script setup>
import { computed, onMounted, ref } from 'vue'
import SectionTitle from './SectionTitle.vue'
import { contributions, sections } from '@/data/content.js'

// ref() es un valor reactivo: cuando cambia, Vue vuelve a dibujar lo que lo usa
const days = ref(null)
const total = ref(0)
const failed = ref(false)

// onMounted corre una vez, cuando el componente ya está en pantalla
onMounted(async () => {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${contributions.user}?y=last`)
    const data = await res.json()
    days.value = data.contributions
    total.value = data.total.lastYear
  } catch {
    // sin la API la sección entera se esconde, no hay nada útil que mostrar
    failed.value = true
  }
})

const LEVELS = ['var(--contrib-0)', 'var(--contrib-1)', 'var(--contrib-2)', 'var(--contrib-3)', 'var(--contrib-4)']

const monthOf = (date) => new Date(`${date}T00:00:00`).getMonth()

// computed: se recalcula solo cuando cambia `days`. Acomoda los días en
// semanas de 7 (columnas), rellenando con null hasta el día de la semana en
// que arranca el primer día
const weeks = computed(() => {
  if (!days.value) return []
  const padding = Array.from({ length: new Date(`${days.value[0].date}T00:00:00`).getDay() }, () => null)
  const all = [...padding, ...days.value]
  const result = []
  for (let i = 0; i < all.length; i += 7) result.push(all.slice(i, i + 7))
  return result
})

// etiqueta de mes solo en la primera semana de cada mes nuevo
const monthLabels = computed(() =>
  weeks.value.map((week, i) => {
    if (i === 0) return null
    const first = week.find((d) => d !== null)
    const prev = weeks.value[i - 1].find((d) => d !== null)
    if (!first || !prev) return null
    return monthOf(first.date) !== monthOf(prev.date) ? contributions.months[monthOf(first.date)] : null
  }),
)
</script>

<template>
  <section v-if="!failed" id="contribuciones" class="flex flex-col gap-6 scroll-mt-24">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <SectionTitle>{{ sections.contribuciones }}</SectionTitle>
      <span v-if="days" class="font-mono text-xs text-dim">{{ contributions.total(total) }}</span>
    </div>

    <div v-if="days" class="flex flex-col gap-2">
      <!-- overflow-hidden: la etiqueta de mes es texto absoluto sobre una celda
           angosta y en la última puede sobrar más texto que casillero -->
      <div class="row overflow-hidden">
        <span v-for="(label, i) in monthLabels" :key="i" class="month font-mono">
          <span v-if="label" class="absolute" style="left: 0">{{ label }}</span>
        </span>
      </div>
      <div class="row">
        <div v-for="(week, wi) in weeks" :key="wi" class="week">
          <span
            v-for="di in 7"
            :key="di"
            class="day"
            :title="week[di - 1] ? contributions.day(week[di - 1].count, week[di - 1].date) : undefined"
            :style="{ backgroundColor: week[di - 1] ? LEVELS[week[di - 1].level] : 'transparent' }"
          ></span>
        </div>
      </div>
      <a :href="`https://github.com/${contributions.user}`" target="_blank" rel="noreferrer" class="profile self-start text-sm text-muted">
        {{ contributions.profile }}
      </a>
    </div>
    <!-- mientras carga: un bloque que parpadea -->
    <div v-else class="skeleton"></div>
  </section>
</template>

<style scoped>
.row {
  display: flex;
  width: 100%;
  gap: 2px;
}

.month {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 16px;
  font-size: 10px;
  color: var(--text-faint);
}

.week {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.day {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 2px;
}

.profile:hover {
  color: var(--text);
}

.skeleton {
  height: 96px;
  width: 100%;
  border-radius: 12px;
  background: var(--hover-bg);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
