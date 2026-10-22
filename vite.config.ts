import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function resolveBasePath(isBuild: boolean): string {
  // 1. Explicit override from environment
  if (process.env.VITE_BASE_PATH) {
    const p = process.env.VITE_BASE_PATH.trim();
    return p.endsWith('/') ? p : `${p}/`;
  }
  if (process.env.BASE_PATH) {
    const p = process.env.BASE_PATH.trim();
    if (!p || p === '/') return '/';
    return p.endsWith('/') ? p : `${p}/`;
  }

  // 2. Automated extraction from GitHub Actions standard environment
  if (process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    if (repo) {
      if (owner && repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
        return '/';
      }
      return `/${repo}/`;
    }
  }

  // 3. Fallback when GITHUB_PAGES flag is provided
  if (process.env.GITHUB_PAGES === 'true') {
    return process.env.REPO_NAME ? `/${process.env.REPO_NAME}/` : './';
  }

  // 4. In production builds, default to './' (relative) so assets load correctly on ANY GitHub Pages repository or custom domain.
  // In development mode (dev server), use root '/' for SPA navigation.
  return isBuild ? './' : '/';
}

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build' || mode === 'production' || process.env.NODE_ENV === 'production';
  const base = resolveBasePath(isBuild);

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: './',
          name: 'GNIOT Lost & Found AI',
          short_name: 'GNIOT L&F',
          description: 'Premium 3D campus lost and found platform for GNIOT Greater Noida with AI matching, visual search, and claim verification.',
          theme_color: '#30152F',
          background_color: '#1D1020',
          display: 'standalone',
          start_url: './',
          scope: './',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,jpg,jpeg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false, // Keep dev lightweight
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || process.cwd(), '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // Explicitly disable HMR if requested by environment (such as AI Studio preview iframe)
      hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
