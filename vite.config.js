import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
   define: {
      global: 'globalThis',
   },
   esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
   },
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
            // Tăng giới hạn kích thước file để precache (mặc định 2MB, file hiện tại 3.39MB)
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
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
         '@common': path.resolve(__dirname, './src/common'),
         '@features': path.resolve(__dirname, './src/features'),
         '@pages': path.resolve(__dirname, './src/pages'),
         '@auth': path.resolve(__dirname, './src/features/auth'),
         '@admin': path.resolve(__dirname, './src/features/admin'),
         '@landing': path.resolve(__dirname, './src/features/landing'),
         '@LandingPage': path.resolve(__dirname, './src/features/landing/components'),
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
            manualChunks: (id) => {
               // Tách các thư viện lớn thành chunks riêng
               if (id.includes('node_modules')) {
                  // React core
                  if (id.includes('react') || id.includes('react-dom')) {
                     return 'vendor-react';
                  }
                  // Ant Design
                  if (id.includes('antd')) {
                     return 'vendor-antd';
                  }
                  // Chart libraries
                  if (id.includes('recharts') || id.includes('chart.js') || id.includes('chartjs')) {
                     return 'vendor-charts';
                  }
                  // Excel/PDF libraries
                  if (id.includes('exceljs') || id.includes('xlsx') || id.includes('jspdf') || id.includes('html2canvas')) {
                     return 'vendor-export';
                  }
                  // UI libraries
                  if (id.includes('lucide-react') || id.includes('@radix-ui')) {
                     return 'vendor-ui';
                  }
                  // Date/time libraries
                  if (id.includes('dayjs') || id.includes('moment')) {
                     return 'vendor-date';
                  }
                  // Router
                  if (id.includes('react-router')) {
                     return 'vendor-router';
                  }
                  // Redux/State management
                  if (id.includes('redux') || id.includes('@reduxjs')) {
                     return 'vendor-redux';
                  }
                  // SignalR
                  if (id.includes('signalr') || id.includes('@microsoft/signalr')) {
                     return 'vendor-signalr';
                  }
                  // Other vendor libraries
                  return 'vendor';
               }
            }
         }
      },
      chunkSizeWarningLimit: 1000
   },
   optimizeDeps: {
      include: [
         'react',
         'react-dom',
         'react-is',
         'lucide-react',
         'dayjs',
         'dayjs/plugin/weekday',
         'dayjs/plugin/localeData',
         'dayjs/plugin/weekOfYear',
         'dayjs/plugin/customParseFormat',
         'dayjs/plugin/advancedFormat',
         'dayjs/plugin/weekYear',
         'dayjs/plugin/dayOfYear',
         'dayjs/plugin/isSameOrAfter',
         'dayjs/plugin/isSameOrBefore',
         'dayjs/plugin/utc',
         'dayjs/plugin/timezone',
         'json2mq',
         'copy-to-clipboard',
         'classnames',
         'rc-picker',
         'rc-util',
         'rc-motion',
         'rc-field-form',
         'rc-select',
         'rc-dropdown',
         'rc-menu',
         'rc-tooltip',
         'rc-notification',
         'rc-dialog',
         'rc-drawer',
         'rc-table',
         'rc-tabs',
         'rc-tree',
         'rc-tree-select',
         'rc-upload',
         'rc-virtual-list',
         'rc-pagination',
         'rc-slider',
         'rc-steps',
         'rc-switch',
         'rc-rate',
         'rc-progress',
         'rc-segmented',
         'rc-checkbox',
         'rc-collapse',
         'rc-image',
         'rc-input',
         'rc-input-number',
         'rc-mentions',
         'rc-overflow',
         'rc-resize-observer',
         'rc-textarea',
         'rc-cascader'
      ],
      exclude: ['antd']
   },
   ssr: {
      noExternal: [
         'json2mq',
         'copy-to-clipboard',
         'classnames',
         'react-is',
         'rc-picker',
         'rc-util',
         'rc-motion',
         'rc-field-form',
         'rc-select',
         'rc-dropdown',
         'rc-menu',
         'rc-tooltip',
         'rc-notification',
         'rc-dialog',
         'rc-drawer',
         'rc-table',
         'rc-tabs',
         'rc-tree',
         'rc-tree-select',
         'rc-upload',
         'rc-virtual-list',
         'rc-pagination',
         'rc-slider',
         'rc-steps',
         'rc-switch',
         'rc-rate',
         'rc-progress',
         'rc-segmented',
         'rc-checkbox',
         'rc-collapse',
         'rc-image',
         'rc-input',
         'rc-input-number',
         'rc-mentions',
         'rc-overflow',
         'rc-resize-observer',
         'rc-textarea',
         'rc-cascader'
      ]
   }
}); 