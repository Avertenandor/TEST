/**
 * Утилита для удаления console.log из продакшен сборки
 * Использование: node scripts/remove-console.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoriesToProcess = [
    'js',
    'core',
    'modules',
    'shared',
    'src'
];

const extensions = ['.js', '.ts'];

function shouldProcessFile(filePath) {
    // Пропускаем архив, node_modules и другие ненужные папки
    if (filePath.includes('архив') || 
        filePath.includes('archive') ||
        filePath.includes('node_modules') ||
        filePath.includes('dist') ||
        filePath.includes('.git')) {
        return false;
    }
    
    return extensions.some(ext => filePath.endsWith(ext));
}

function removeConsoleLogs(content, filePath) {
    let modified = content;
    let changesCount = 0;
    
    // Удаляем console.log, console.error, console.warn, console.info, console.debug
    // Но оставляем их в режиме разработки или с флагом DEBUG
    const consolePatterns = [
        /console\.(log|error|warn|info|debug|trace)\([^)]*\);?\s*/g,
        /console\.(log|error|warn|info|debug|trace)\([^)]*\)\s*/g
    ];
    
    consolePatterns.forEach(pattern => {
        const matches = modified.match(pattern);
        if (matches) {
            // Удаляем только если это не закомментированный код и не в условии DEBUG
            modified = modified.replace(pattern, (match) => {
                // Проверяем, есть ли перед этим условие DEBUG
                const beforeMatch = modified.substring(
                    Math.max(0, modified.indexOf(match) - 100),
                    modified.indexOf(match)
                );
                
                // Если есть проверка на DEBUG или development - оставляем
                if (beforeMatch.includes('DEBUG') || 
                    beforeMatch.includes('development') ||
                    beforeMatch.includes('VITE_DEBUG')) {
                    return match;
                }
                
                changesCount++;
                return '';
            });
        }
    });
    
    return { content: modified, changes: changesCount };
}

function processDirectory(dirPath) {
    let totalChanges = 0;
    let filesProcessed = 0;
    
    function walkDir(currentPath) {
        const files = fs.readdirSync(currentPath);
        
        files.forEach(file => {
            const filePath = path.join(currentPath, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                if (shouldProcessFile(filePath)) {
                    walkDir(filePath);
                }
            } else if (shouldProcessFile(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const result = removeConsoleLogs(content, filePath);
                    
                    if (result.changes > 0) {
                        fs.writeFileSync(filePath, result.content, 'utf8');
                        totalChanges += result.changes;
                        filesProcessed++;
                        console.log(`✓ ${filePath}: удалено ${result.changes} console вызовов`);
                    }
                } catch (error) {
                    console.error(`✗ Ошибка при обработке ${filePath}:`, error.message);
                }
            }
        });
    }
    
    directoriesToProcess.forEach(dir => {
        const fullPath = path.join(__dirname, '..', dir);
        if (fs.existsSync(fullPath)) {
            walkDir(fullPath);
        }
    });
    
    return { totalChanges, filesProcessed };
}

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🧹 Удаление console.log из продакшен файлов...\n');
    const result = processDirectory(__dirname);
    console.log(`\n✅ Готово! Обработано файлов: ${result.filesProcessed}, удалено console вызовов: ${result.totalChanges}`);
}

export { removeConsoleLogs, processDirectory };

