import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: { port: 5174, strictPort: true, host: '0.0.0.0' },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: '/quadrilha-alunos/',
        name: 'Quadrilha do Sesc 2026 — Alunos',
        short_name: 'Quadrilha Alunos',
        description: 'Aplicativo musical e informativo dos quadrilheiros do Sesc 2026.',
        lang: 'pt-BR',
        theme_color: '#005ca8',
        background_color: '#edf8ff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
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
            cacheName: 'quadrilha-alunos-audios-v1',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            rangeRequests: true,
            cacheableResponse: { statuses: [0, 200, 206] },
          },
        }],
      },
      devOptions: { enabled: false, type: 'module' },
    }),
  ],
})
