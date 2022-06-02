import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import presetWind from '@unocss/preset-wind'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/rails-inspector.ts',
      formats: ['es']
    },
    rollupOptions: {
      external: /^lit/
    },
  },
  plugins: [
    Unocss({
      mode: 'shadow-dom',
      presets: [
        presetWind(),
      ],
    }),
  ],
})
