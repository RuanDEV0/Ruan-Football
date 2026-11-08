import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Domínio pendente (decisão 12.5): prévias não recebem canonical nem sitemap fictícios.
const site = process.env.PUBLIC_SITE_URL;

export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'never' },
  ...(site ? { site } : {}),
  integrations: [
    ...(site ? [sitemap()] : []),
    {
      name: 'local-editorial-review',
      hooks: {
        'astro:config:setup': ({ command, injectRoute }) => {
          if (command === 'dev') {
            injectRoute({
              pattern: '/revisao',
              entrypoint: './src/components/EditorialReview.astro',
            });
          }
        },
      },
    },
  ],
  vite: {
    build: {
      rollupOptions: {
        output: { manualChunks: (id) => (id.includes('/three/') ? 'three' : undefined) },
      },
    },
  },
});
