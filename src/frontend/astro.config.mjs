// noinspection JSUnusedGlobalSymbols

import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import juno from '@junobuild/vite-plugin'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

const site = process.env.JUNO_SATELLITE_URL ?? 'not-available'
const runInContainer = process.env.APP_ENV === 'local'

console.log('⚠️  astro settings', {site, runInContainer})

// https://astro.build/config
export default defineConfig({
  // Enable Vue to support Vue components.
  site: site, // @todo reflect environment
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
        container: runInContainer,
      }),
    ],
    define: {
      ['import.meta.env.APP_ENV']: JSON.stringify(process.env.APP_ENV ?? 'local')
    }
  },
})
