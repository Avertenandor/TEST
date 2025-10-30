// vite.config.ts
// Минимальная конфигурация Vite для сборки TypeScript

import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    // Загружаем переменные окружения
    const env = loadEnv(mode, process.cwd(), '');

    return {
    // Режим сборки
    mode: mode,

    // Базовый путь для GitHub Pages
    // Для кастомного домена используем '/', для подпапки - '/TEST/'
    base: env.VITE_BASE_PATH || (process.env.GITHUB_PAGES && !process.env.CUSTOM_DOMAIN ? '/TEST/' : '/'),

    // Корневая директория проекта
    root: '.',

    // Директория для сборки
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: mode === 'production', // Удаляем console в продакшене
                drop_debugger: true,
                pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : []
            }
        },
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
                    const name = assetInfo.name ?? '';
                    const info = name.split('.');
                    const ext = info[info.length - 1];
                    if (/\.(css)$/.test(name)) {
                        return `css/[name]-[hash].${ext}`;
                    }
                    if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(name)) {
                        return `images/[name]-[hash].${ext}`;
                    }
                    if (/\.(woff2?|eot|ttf|otf)$/.test(name)) {
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
        target: 'es2020',
        drop: mode === 'production' ? ['console', 'debugger'] : []
    },

    // Плагины
    plugins: [],

    // Определяем глобальные константы для замены во время сборки
    define: {
        '__VITE_BSCSCAN_API_KEY_AUTHORIZATION__': JSON.stringify(env.VITE_BSCSCAN_API_KEY_AUTHORIZATION || ''),
        '__VITE_BSCSCAN_API_KEY_DEPOSITS__': JSON.stringify(env.VITE_BSCSCAN_API_KEY_DEPOSITS || ''),
        '__VITE_BSCSCAN_API_KEY_SUBSCRIPTION__': JSON.stringify(env.VITE_BSCSCAN_API_KEY_SUBSCRIPTION || ''),
        '__VITE_GENESIS_VERSION__': JSON.stringify(env.VITE_GENESIS_VERSION || '1.4.2'),
        '__VITE_SYSTEM_ADDRESS__': JSON.stringify(env.VITE_SYSTEM_ADDRESS || ''),
        '__VITE_ACCESS_ADDRESS__': JSON.stringify(env.VITE_ACCESS_ADDRESS || ''),
        '__VITE_DEBUG_MODE__': env.VITE_DEBUG_MODE === 'true'
    }
};
});
