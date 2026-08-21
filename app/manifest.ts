import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ball Roll',
    short_name: 'Ball Roll',
    description: 'An endless space runner game.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#050510',
    theme_color: '#050510',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}