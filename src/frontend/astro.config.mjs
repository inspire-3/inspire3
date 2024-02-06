import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import juno from '@junobuild/vite-plugin'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  // Enable Vue to support Vue components.
  site: 'https://nkzsw-gyaaa-aaaal-ada3a-cai.icp0.io', // @todo reflect environment
  output: 'static',
  server: {
    port: 4321,
    host: true,
  },
  integrations: [
    mdx(),
    sitemap(),
    vue(),
    tailwind({
      nesting: true,
    }),
  ],
  vite: {
    plugins: [
      // @todo extend config https://juno.build/docs/miscellaneous/local-development
      juno({
        container: true,
      }),
    ],
  },
})
