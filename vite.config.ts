import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import presetWind from '@unocss/preset-wind'
import presetIcons from '@unocss/preset-icons'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/rails-inspector.ts',
      formats: ['es']
    },
  },
  plugins: [
    Unocss({
      mode: 'shadow-dom',
      presets: [
        presetWind(),
        presetIcons({
          cdn: 'https://esm.sh/'
        }),
      ],
    }),
  ],
})
