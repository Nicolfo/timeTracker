import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA} from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'custom-sw.js',
            injectRegister: 'auto',
            injectManifest: {
                globPatterns: []
            },
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'Time Tracker',
                start_url: '/',
                short_name: 'Time Tracker',
                description: 'Time Tracker',
                display: 'standalone',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: 'apple-touch-icon.png',
                        sizes: 'any',
                        type: 'image/png',
                    },
                    {
                        src: 'vite.svg',
                        sizes: 'any',
                        type: 'image/svg',
                    },


                ]
            }
        })],

    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },
})
