import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// GitHub Pages serves the site from a subpath; the deploy workflow passes `--base` for it.
export default defineConfig({
  plugins: [react()],
});
