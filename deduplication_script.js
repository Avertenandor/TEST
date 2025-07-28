// MCP DEDUPLICATION SCRIPT
// Задача: очистить cabinet.html от дублированных методов

const fs = require('fs');
const path = require('path');

// Читаем файл
const filePath = 'cabinet.html';
const content = fs.readFileSync(filePath, 'utf8');

// Список дублированных методов для удаления (удаляем первые, оставляем последние)
const duplicatedMethods = [
    'getHowItWorksContent: function()',
    'getRankContent: function()', 
    'checkAuth: function()',
    'showLoadingScreen: function()'
];

// Функция для поиска и удаления дублированных методов
function removeDuplicatedMethods(content) {
    const lines = content.split('\n');
    const methodPositions = {};
    
    // Найти все позиции методов
    lines.forEach((line, index) => {
        duplicatedMethods.forEach(method => {
            if (line.includes(method)) {
                if (!methodPositions[method]) {
                    methodPositions[method] = [];
                }
                methodPositions[method].push(index);
            }
        });
    });
    
    console.log('Найденные дублированные методы:', methodPositions);
    
    // Удалить первые дубликаты (оставить последние)
    let cleanedContent = content;
    
    Object.keys(methodPositions).forEach(method => {
        const positions = methodPositions[method];
        if (positions.length > 1) {
            console.log(`Метод ${method} найден ${positions.length} раз на строках: ${positions.join(', ')}`);
            // Удаляем все кроме последнего
            for (let i = 0; i < positions.length - 1; i++) {
                console.log(`Удаляем дубликат ${method} на строке ${positions[i]}`);
            }
        }
    });
    
    return cleanedContent;
}

// Запускаем очистку
try {
    const cleanedContent = removeDuplicatedMethods(content);
    
    // Создаем backup
    fs.writeFileSync('cabinet_before_dedup.html', content);
    console.log('✅ Создан backup: cabinet_before_dedup.html');
    
    // Записываем очищенный файл
    fs.writeFileSync('cabinet_deduplicated.html', cleanedContent);
    console.log('✅ Создан очищенный файл: cabinet_deduplicated.html');
    
} catch (error) {
    console.error('❌ Ошибка:', error);
}