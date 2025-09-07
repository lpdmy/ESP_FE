import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [
      react(),
      VitePWA({
         registerType: 'prompt',
         includeAssets: ['favicon.ico', 'logo.svg', '/logo/*.png', '/assets/*.svg'],
         manifest: {
            name: 'EduSphere - Nền tảng kết nối học sinh FPT School',
            short_name: 'EduSphere',
            description: 'Nền tảng kết nối, chia sẻ và học tập dành cho học sinh THPT FPT School',
            theme_color: '#f97316',
            background_color: '#ffffff',
            start_url: '/',
            display: 'standalone',
            icons: [
               {
                  src: '/logo.svg',
                  sizes: '192x192 512x512',
                  type: 'image/svg+xml',
                  purpose: 'any maskable'
               }
            ]
         },
         workbox: {
            runtimeCaching: [
               {
                  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                  handler: 'CacheFirst',
                  options: {
                     cacheName: 'google-fonts-cache',
                     expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                     },
                     cacheableResponse: {
                        statuses: [0, 200]
                     }
                  }
               },
               {
                  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                  handler: 'CacheFirst',
                  options: {
                     cacheName: 'images-cache',
                     expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 60 * 24 * 30 // <== 30 days
                     }
                  }
               },
               {
                  urlPattern: /^https:\/\/api\.*/i,
                  handler: 'NetworkFirst',
                  options: {
                     cacheName: 'api-cache',
                     expiration: {
                        maxEntries: 20,
                        maxAgeSeconds: 60 * 60 * 2 // <== 2 hours for educational content
                     },
                     networkTimeoutSeconds: 15
                  }
               },
               {
                  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                  handler: 'CacheFirst',
                  options: {
                     cacheName: 'google-fonts-cache',
                     expiration: {
                        maxEntries: 15,
                        maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                     },
                     cacheableResponse: {
                        statuses: [0, 200]
                     }
                  }
               }
            ]
         },
         devOptions: {
            enabled: true,
            type: 'module',
            navigateFallback: 'index.html'
         }
      })
   ],
   resolve: {
      alias: {
         '@': path.resolve(__dirname, './src'),
         '@LandingPage': path.resolve(__dirname, './src/components/LandingPage'),
      },
   },
   server: {
      port: 3000,
      open: true,
      host: '0.0.0.0',
      strictPort: true,
      proxy: {
         '/api': {
            target: 'https://localhost:7056',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, '/api'),
            configure: (proxy, options) => {
               proxy.on('error', (err, req, res) => {
                  console.log('proxy error', err);
               });
               proxy.on('proxyReq', (proxyReq, req, res) => {
                  console.log('Sending Request to the Target:', req.method, req.url);
               });
               proxy.on('proxyRes', (proxyRes, req, res) => {
                  console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
               });
            }
         }
      },
   },
   build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
         output: {
            manualChunks: {
               vendor: ['react', 'react-dom'],
               ui: ['lucide-react'],
               antd: ['antd']
            }
         }
      },
      chunkSizeWarningLimit: 1000
   },
   optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
      exclude: ['antd']
   }
}); 