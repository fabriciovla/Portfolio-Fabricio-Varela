import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// editor que abre Vue DevTools al clickear un componente (Alt+Shift). Si ya hay
// una LAUNCH_EDITOR en el sistema se respeta
process.env.LAUNCH_EDITOR ??= 'zed'

export default defineConfig({
  // vueDevTools solo actúa en dev (no entra al build). Alt+Shift mantenido
  // sobre la página resalta cada componente y al clickear abre su archivo
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
