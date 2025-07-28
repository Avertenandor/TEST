// MCP CLEANUP SCRIPT - Удаление остатков дублированного HTML
const fs = require('fs');

console.log('🧹 MCP HTML CLEANUP TOOL');
console.log('==========================');

try {
    // Читаем файл
    const content = fs.readFileSync('cabinet.html', 'utf8');
    const lines = content.split('\n');
    
    console.log(`📄 Загружен файл: ${lines.length} строк`);
    
    // Создаем backup
    fs.writeFileSync('cabinet_before_html_cleanup.html', content);
    console.log('💾 Создан backup: cabinet_before_html_cleanup.html');
    
    // Ищем проблемные участки с HTML вне функций
    let inFunction = false;
    let braceCount = 0;
    let cleanedLines = [];
    let removedLinesCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Подсчитываем фигурные скобки
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        braceCount += openBraces - closeBraces;
        
        // Определяем, находимся ли мы в функции
        if (trimmed.includes(': function(') || trimmed.includes('function ')) {
            inFunction = true;
        }
        
        // Проверяем, не является ли строка HTML вне функции
        const isHTMLLine = trimmed.startsWith('<') && 
                          !inFunction && 
                          !trimmed.startsWith('<!--') &&
                          !trimmed.includes('MCP-MARKER') &&
                          !trimmed.includes('//');
        
        const isStrayHTML = (trimmed.includes('<div') || 
                           trimmed.includes('<h2') || 
                           trimmed.includes('<h3') || 
                           trimmed.includes('<p') ||
                           trimmed.includes('<ul') ||
                           trimmed.includes('<li') ||
                           trimmed.includes('</div>') ||
                           trimmed.includes('</h2>') ||
                           trimmed.includes('</h3>') ||
                           trimmed.includes('</p>') ||
                           trimmed.includes('</ul>') ||
                           trimmed.includes('</li>')) && 
                          !inFunction &&
                          !trimmed.includes('return `') &&
                          !trimmed.includes('`');
        
        // Если это не HTML вне функции, добавляем строку
        if (!isHTMLLine && !isStrayHTML) {
            cleanedLines.push(line);
        } else {
            removedLinesCount++;
            console.log(`❌ Удаляем HTML строку ${i + 1}: ${trimmed.substring(0, 80)}...`);
        }
        
        // Сбрасываем inFunction если закрылись все скобки
        if (braceCount <= 0 && inFunction) {
            inFunction = false;
        }
    }
    
    // Создаем очищенный контент
    const cleanedContent = cleanedLines.join('\n');
    
    // Сохраняем результат
    fs.writeFileSync('cabinet_html_cleaned.html', cleanedContent);
    
    console.log(`\n✅ HTML ОЧИСТКА ЗАВЕРШЕНА!`);
    console.log(`📊 Статистика:`);
    console.log(`   • Исходный файл: ${lines.length} строк`);
    console.log(`   • Очищенный файл: ${cleanedLines.length} строк`);
    console.log(`   • Удалено HTML строк: ${removedLinesCount}`);
    console.log(`\n💾 Создан файл: cabinet_html_cleaned.html`);
    
} catch (error) {
    console.error('❌ ОШИБКА:', error.message);
}