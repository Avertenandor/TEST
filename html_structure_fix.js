// MCP HTML STRUCTURE RESTORATION SCRIPT
const fs = require('fs');

console.log('🔧 MCP HTML STRUCTURE RESTORATION');
console.log('===================================');

try {
    // Читаем очищенный файл (без HTML структуры)
    const cleanedContent = fs.readFileSync('cabinet.html', 'utf8');
    
    // Читаем backup с корректной HTML структурой
    const backupContent = fs.readFileSync('cabinet_before_html_cleanup.html', 'utf8');
    
    console.log('📄 Файлы загружены');
    
    // Извлекаем HTML структуру из backup (DOCTYPE до <style>)
    const backupLines = backupContent.split('\n');
    const cleanedLines = cleanedContent.split('\n');
    
    // Находим где начинается <style> в backup
    let styleStartIndex = -1;
    for (let i = 0; i < backupLines.length; i++) {
        if (backupLines[i].trim().startsWith('<style>')) {
            styleStartIndex = i;
            break;
        }
    }
    
    // Находим где заканчивается </html> в backup
    let htmlEndIndex = -1;
    for (let i = backupLines.length - 1; i >= 0; i--) {
        if (backupLines[i].trim() === '</html>') {
            htmlEndIndex = i;
            break;
        }
    }
    
    if (styleStartIndex === -1 || htmlEndIndex === -1) {
        throw new Error('Не найдены критические элементы HTML структуры');
    }
    
    // Берем HTML заголовок из backup (до <style>)
    const htmlHeader = backupLines.slice(0, styleStartIndex);
    
    // Берем HTML окончание из backup (</body></html>)
    const htmlFooter = backupLines.slice(htmlEndIndex);
    
    // Объединяем: HTML заголовок + очищенный контент + HTML окончание
    const restoredContent = [
        ...htmlHeader,
        ...cleanedLines,
        ...htmlFooter
    ].join('\n');
    
    // Создаем backup текущего файла
    fs.writeFileSync('cabinet_before_structure_fix.html', cleanedContent);
    console.log('💾 Создан backup: cabinet_before_structure_fix.html');
    
    // Сохраняем восстановленный файл
    fs.writeFileSync('cabinet_structure_restored.html', restoredContent);
    
    console.log(`\n✅ HTML СТРУКТУРА ВОССТАНОВЛЕНА!`);
    console.log(`📊 Статистика:`);
    console.log(`   • HTML заголовок: ${htmlHeader.length} строк`);
    console.log(`   • Основной контент: ${cleanedLines.length} строк`);
    console.log(`   • HTML окончание: ${htmlFooter.length} строк`);
    console.log(`   • Итого строк: ${htmlHeader.length + cleanedLines.length + htmlFooter.length}`);
    console.log(`\n💾 Создан файл: cabinet_structure_restored.html`);
    
} catch (error) {
    console.error('❌ ОШИБКА:', error.message);
}