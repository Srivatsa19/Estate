import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT) || 5173,
  },
  preview: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT) || 5173,
  },
});
