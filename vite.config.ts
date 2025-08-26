// vite.config.ts
// Минимальная конфигурация Vite для сборки TypeScript

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // Режим сборки
    mode: 'production',

    // Корневая директория проекта
    root: '.',

    // Директория для сборки
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                app: resolve(__dirname, 'app.html')
            },
            output: {
                // Сохраняем структуру модулей
                preserveModules: true,
                entryFileNames: 'js/[name]-[hash].js',
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const ext = info[info.length - 1];
                    if (/\.(css)$/.test(assetInfo.name)) {
                        return `css/[name]-[hash].${ext}`;
                    }
                    if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(assetInfo.name)) {
                        return `images/[name]-[hash].${ext}`;
                    }
                    if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
                        return `fonts/[name]-[hash].${ext}`;
                    }
                    return `assets/[name]-[hash].${ext}`;
                }
            }
        }
    },

    // Настройки сервера разработки
    server: {
        port: 3000,
        open: true,
        cors: true
    },

    // Разрешения для импортов
    resolve: {
        alias: {
            '@': resolve(__dirname, '.'),
            '@core': resolve(__dirname, 'core'),
            '@shared': resolve(__dirname, 'shared'),
            '@modules': resolve(__dirname, 'modules')
        }
    },

    // Обработка CSS
    css: {
        modules: {
            localsConvention: 'camelCase'
        }
    },

    // Оптимизация зависимостей
    optimizeDeps: {
        include: []
    },

    // Настройки для TypeScript
    esbuild: {
        target: 'es2020'
    },

    // Плагины
    plugins: []
});
