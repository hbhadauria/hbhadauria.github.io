import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { AstroPWAIntegration as AstroPWA } from '@vite-pwa/astro';

export default defineConfig({
  site: 'https://hbhadauria.github.io',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx(),
    sitemap(),
    AstroPWA({
      registerType: 'prompt',
      includeManifestIcons: false,
      manifest: {
        name: 'Harshit Bhadauria · HSB Learnings',
        short_name: 'HSB Learnings',
        description: 'Designing Scalable Systems · Shipping Faster with AI',
        theme_color: '#0b0d12',
        background_color: '#fbfaf7',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
      generateSW: {
        globPatterns: [
          '**/*.{css,js,svg,woff,woff2}',
          'index.html',
          'projects/index.html',
          'about/index.html',
          'apple-touch-icon.png',
          'favicon.svg',
        ],
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/(www\.googletagmanager\.com|www\.google-analytics\.com)\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /\/posts\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hsb-posts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 2592000,
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'hsb-images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 2592000,
              },
            },
          },
          {
            urlPattern: /\/pagefind\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'hsb-pagefind',
            },
          },
        ],
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: false,
    },
  },
});
