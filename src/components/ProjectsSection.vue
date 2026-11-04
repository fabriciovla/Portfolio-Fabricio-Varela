<script setup>
import SectionTitle from './SectionTitle.vue'
import ProjectCard from './ProjectCard.vue'
import { projects, sections } from '@/data/content.js'
</script>

<template>
  <section class="flex flex-col gap-6">
    <SectionTitle id="proyectos">{{ sections.proyectos }}</SectionTitle>
    <div class="flex flex-col gap-4">
      <!-- v-for repite el componente una vez por proyecto; :key le da a Vue
           una identidad estable para cada uno -->
      <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
    </div>
  </section>
</template>
