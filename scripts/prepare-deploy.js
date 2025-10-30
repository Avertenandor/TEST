/**
 * Скрипт подготовки к деплою на GitHub Pages
 * Копирует необходимые файлы, исключая архив и ненужное
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const excludeDirs = [
    'node_modules',
    '.git',
    'архив',
    'archive',
    'dist',
    'tests',
    'тесты',
    '.github',
    'e2e',
    'TEST'
];

const excludeFiles = [
    '.env',
    '.env.local',
    'package-lock.json',
    'tsconfig.json',
    'vite.config.ts',
    'playwright.config.js',
    'jest.config.js',
    '.eslintrc',
    '.gitignore',
    'bot_data.db',
    'DEPLOYMENT.md'
];

const excludePatterns = [
    /^PR_/,
    /^CREATE_PR/,
    /REPORT/i,
    /ОТЧЕТ/i,
    /DEPLOYMENT/i
];

function shouldExclude(filePath) {
    const relativePath = path.relative(rootDir, filePath);
    
    // Проверяем директории
    for (const exclude of excludeDirs) {
        if (relativePath.includes(exclude)) {
            return true;
        }
    }
    
    // Проверяем файлы
    const fileName = path.basename(filePath);
    if (excludeFiles.includes(fileName)) {
        return true;
    }
    
    // Исключаем отчеты и документацию разработки
    if (excludePatterns.some(pattern => pattern.test(fileName))) {
        return true;
    }
    
    // Исключаем README файлы кроме основного
    if (fileName.includes('README') && fileName !== 'README.md') {
        return true;
    }
    
    return false;
}

function copyFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
}

function copyDirectory(srcDir, destDir) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);
        
        if (shouldExclude(srcPath)) {
            continue;
        }
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            copyFile(srcPath, destPath);
        }
    }
}

function prepareDeploy() {
    const distDir = path.join(rootDir, 'dist');
    
    // Очищаем dist
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    fs.mkdirSync(distDir, { recursive: true });
    
    console.log('📦 Подготовка к деплою...\n');
    
    // Копируем все необходимые файлы
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(rootDir, entry.name);
        const destPath = path.join(distDir, entry.name);
        
        if (shouldExclude(srcPath) || entry.name === 'dist') {
            continue;
        }
        
        if (entry.isDirectory()) {
            console.log(`📁 Копирую директорию: ${entry.name}`);
            copyDirectory(srcPath, destPath);
        } else {
            console.log(`📄 Копирую файл: ${entry.name}`);
            copyFile(srcPath, destPath);
        }
    }
    
    console.log('\n✅ Подготовка завершена! Файлы в папке dist/ готовы к деплою.');
    console.log(`📊 Статистика: ${countFiles(distDir)} файлов подготовлено`);
}

function countFiles(dir) {
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            count += countFiles(fullPath);
        } else {
            count++;
        }
    }
    
    return count;
}

// Запуск
const isMainModule = import.meta.url === `file://${path.resolve(process.argv[1])}`.replace(/\\/g, '/');
if (isMainModule || import.meta.url.includes('prepare-deploy')) {
    prepareDeploy();
}

export { prepareDeploy };

