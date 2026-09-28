import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      'educk-front': path.resolve(__dirname, 'src/__mocks__/educk-front.js'),
    },
  },
});
