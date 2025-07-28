// PROFESSIONAL DEDUPLICATION TOOL для cabinet.html
const fs = require('fs');

console.log('🔧 MCP DEDUPLICATION TOOL v2.0');
console.log('================================');

try {
    // Читаем исходный файл
    const content = fs.readFileSync('cabinet.html', 'utf8');
    const lines = content.split('\n');
    
    console.log(`📄 Загружен файл: ${lines.length} строк`);
    
    // Находим все дублированные методы
    const methodMap = new Map();
    const methodRegex = /^\s*(\w+):\s*function\(\)/;
    
    lines.forEach((line, index) => {
        const match = line.match(methodRegex);
        if (match) {
            const methodName = match[1];
            if (!methodMap.has(methodName)) {
                methodMap.set(methodName, []);
            }
            methodMap.get(methodName).push({
                line: index,
                content: line,
                lineNumber: index + 1
            });
        }
    });
    
    // Находим дубликаты
    const duplicates = new Map();
    for (let [methodName, occurrences] of methodMap) {
        if (occurrences.length > 1) {
            duplicates.set(methodName, occurrences);
            console.log(`🔍 Найден дубликат: ${methodName} (${occurrences.length} раз)`);
            occurrences.forEach((occ, i) => {
                console.log(`   ${i + 1}. Строка ${occ.lineNumber}: ${occ.content.trim()}`);
            });
        }
    }
    
    console.log(`\n⚡ Найдено дублированных методов: ${duplicates.size}`);
    
    // Создаем план дедупликации
    let linesToRemove = new Set();
    
    for (let [methodName, occurrences] of duplicates) {
        // Оставляем последний, удаляем предыдущие
        for (let i = 0; i < occurrences.length - 1; i++) {
            const startLine = occurrences[i].line;
            
            // Находим конец метода (ищем закрывающую скобку и запятую)
            let endLine = startLine;
            let braceCount = 0;
            let foundOpenBrace = false;
            
            for (let j = startLine; j < lines.length; j++) {
                const line = lines[j];
                
                // Считаем фигурные скобки
                const openBraces = (line.match(/\{/g) || []).length;
                const closeBraces = (line.match(/\}/g) || []).length;
                
                if (openBraces > 0) foundOpenBrace = true;
                braceCount += openBraces - closeBraces;
                
                // Если нашли закрывающую скобку метода
                if (foundOpenBrace && braceCount <= 0 && line.includes('},')) {
                    endLine = j;
                    break;
                }
            }
            
            console.log(`❌ Удаляем дубликат ${methodName}: строки ${startLine + 1}-${endLine + 1}`);
            
            // Добавляем все строки метода в список для удаления
            for (let k = startLine; k <= endLine; k++) {
                linesToRemove.add(k);
            }
        }
    }
    
    console.log(`\n🗑️ Строк к удалению: ${linesToRemove.size}`);
    
    // Создаем очищенный контент
    const cleanedLines = lines.filter((line, index) => !linesToRemove.has(index));
    const cleanedContent = cleanedLines.join('\n');
    
    // Сохраняем результат
    fs.writeFileSync('cabinet_clean.html', cleanedContent);
    
    console.log(`\n✅ ДЕДУПЛИКАЦИЯ ЗАВЕРШЕНА!`);
    console.log(`📊 Статистика:`);
    console.log(`   • Исходный файл: ${lines.length} строк`);
    console.log(`   • Очищенный файл: ${cleanedLines.length} строк`);
    console.log(`   • Удалено строк: ${lines.length - cleanedLines.length}`);
    console.log(`   • Удалено дубликатов: ${duplicates.size} методов`);
    console.log(`\n💾 Создан файл: cabinet_clean.html`);
    
} catch (error) {
    console.error('❌ ОШИБКА:', error.message);
}