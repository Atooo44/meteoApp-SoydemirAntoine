import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Configuration du proxy pour contourner les problèmes CORS
    proxy: {
      // Proxy pour l'API v1
      '/api/v1/weathers': {
        target: 'https://freetestapi.com',
        changeOrigin: true,
        secure: false, // Ignorer les erreurs de certificat SSL
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Ajouter des en-têtes pour éviter les problèmes de CORS
            proxyReq.setHeader('Origin', 'https://freetestapi.com');
            proxyReq.setHeader('Referer', 'https://freetestapi.com/');
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      
      // Proxy pour l'API legacy
      '/apis/weathers': {
        target: 'https://freetestapi.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('legacy proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('Origin', 'https://freetestapi.com');
            proxyReq.setHeader('Referer', 'https://freetestapi.com/');
            console.log('Sending Legacy Request:', req.method, req.url);
          });
        },
      }
    },
  },
}); 