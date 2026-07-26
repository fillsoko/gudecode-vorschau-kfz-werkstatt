// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://gudecode-vorschau-kfz-werkstatt.vercel.app',
  output: 'static',
  adapter: vercel(),
  integrations: [react()],
  image: { quality: 90 },
  vite: { plugins: [tailwindcss()] },
});
