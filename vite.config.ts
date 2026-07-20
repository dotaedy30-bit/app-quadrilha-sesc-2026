import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/')

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: base,
        name: 'Quadrilha do Sesc 2026 — Roteiro Sonoro Oficial',
        short_name: 'Quadrilha 2026',
        description: 'Controle oficial das músicas da apresentação da Quadrilha do Sesc 2026.',
        lang: 'pt-BR',
        theme_color: '#44151b',
        background_color: '#1c090c',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/app-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/app-icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/app-icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [{
          urlPattern: ({ request }) => request.destination === 'audio',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'quadrilha-audios-v2',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            rangeRequests: true,
            cacheableResponse: { statuses: [0, 200, 206] },
          },
        }],
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
})
