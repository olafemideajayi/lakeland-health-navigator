import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lakeland Health Navigator',
    short_name: 'LHN',
    description: 'Find care fast in the Lakeland region',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0066CC',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
