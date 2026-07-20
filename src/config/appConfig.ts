export const appConfig = {
  name: 'Quadrilha do Sesc 2026',
  shortName: 'Quadrilha 2026',
  subtitle: 'Roteiro Sonoro Oficial',
  professor: 'Professor Júlio Rangel',
  credit: 'Autor do aplicativo: Edy Marques Freelancer',
  author: 'Edy Marques Freelancer',
  storageKey: 'quadrilha-sesc-2026-progress-v1',
  splashDuration: 4200,
  icons: {
    favicon: `${import.meta.env.BASE_URL}icons/app-icon-192.png`,
    splash: `${import.meta.env.BASE_URL}icons/app-icon-512.png`,
    appleTouch: `${import.meta.env.BASE_URL}icons/app-icon-180.png`,
    pwa192: 'icons/app-icon-192.png',
    pwa512: 'icons/app-icon-512.png',
    maskable512: 'icons/app-icon-maskable-512.png',
  },
  colors: {
    theme: '#44151b',
    background: '#1c090c',
    gold: '#f3b33e',
    wine: '#57171c',
  },
} as const
