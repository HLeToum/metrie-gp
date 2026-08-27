import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/static';

export default defineConfig({
  site: 'https://metrie-gp.fr',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: true },
    imageService: false,
  }),
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
      configFile: './tailwind.config.mjs',
    }),
    sitemap({
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: new Date(),
      customPages: [
        'https://metrie-gp.fr/',
        'https://metrie-gp.fr/scan-3d-guadeloupe',
        'https://metrie-gp.fr/plans-permis-de-construire-guadeloupe',
        'https://metrie-gp.fr/demo',
        'https://metrie-gp.fr/outils',
        'https://metrie-gp.fr/projets',
        'https://metrie-gp.fr/blog',
        'https://metrie-gp.fr/contact',
      ],
      serialize(item) {
        if (item.url.includes('/mentions-legales') || item.url.includes('/confidentialite')) {
          item.priority = 0.2;
          item.changefreq = 'yearly';
        }
        // Landings d'acquisition : cibles principales du SEO local,
        // juste sous la home.
        if (item.url.includes('/scan-3d-') || item.url.includes('/plans-permis-')) {
          item.priority = 0.9;
          item.changefreq = 'monthly';
        }
        if (item.url === 'https://metrie-gp.fr/blog') {
          item.priority = 0.7;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/blog/')) {
          item.priority = 0.6;
          item.changefreq = 'monthly';
        }
        if (item.url === 'https://metrie-gp.fr/') item.priority = 1.0;
        return item;
      },
    }),
  ],
  vite: {
    ssr: { noExternal: ['three'] },
  },
});
