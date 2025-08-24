/**
 * GENESIS 1.1 - Исправление CSS ошибок
 * Проблема: CSS ошибки из-за использования JavaScript template literals в HTML
 * Решение: Заменяем проблемные места на корректный синтаксис
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Применяем исправления CSS ошибок...');
    
    // Функция для замены template literals в атрибутах
    function fixTemplateLiterals() {
        // Находим все элементы с проблемными атрибутами
        const allElements = document.querySelectorAll('*');
        let fixedCount = 0;
        
        allElements.forEach(element => {
            // Проверяем атрибут style
            const style = element.getAttribute('style');
            if (style && style.includes('${')) {
                console.log('🔧 Найден проблемный style:', style);
                // Заменяем ${} на пустое значение или удаляем атрибут
                element.removeAttribute('style');
                fixedCount++;
            }
            
            // Проверяем другие атрибуты
            ['onclick', 'data-value', 'data-color', 'data-bg-color'].forEach(attr => {
                const value = element.getAttribute(attr);
                if (value && value.includes('${')) {
                    console.log(`🔧 Найден проблемный ${attr}:`, value);
                    // Для onclick пытаемся исправить
                    if (attr === 'onclick') {
                        const fixedValue = value.replace(/\$\{([^}]+)\}/g, function(match, p1) {
                            // Пытаемся вычислить значение
                            try {
                                return eval(p1);
                            } catch (e) {
                                console.error('Не удалось вычислить:', p1);
                                return '';
                            }
                        });
                        element.setAttribute(attr, fixedValue);
                    } else {
                        // Для других атрибутов удаляем
                        element.removeAttribute(attr);
                    }
                    fixedCount++;
                }
            });
        });
        
        console.log(`✅ Исправлено элементов: ${fixedCount}`);
        return fixedCount;
    }
    
    // Функция для исправления конкретных CSS проблем
    function fixSpecificCSSIssues() {
        // Исправляем прогресс-бары
        const progressBars = document.querySelectorAll('.progress-bar[data-progress]');
        progressBars.forEach(bar => {
            const progress = parseFloat(bar.getAttribute('data-progress')) || 0;
            bar.style.width = progress + '%';
        });
        
        // Исправляем динамические цвета
        document.querySelectorAll('[data-color]').forEach(el => {
            const color = el.getAttribute('data-color');
            if (color && !color.includes('${')) {
                el.style.color = color;
            }
        });
        
        // Исправляем динамические фоны
        document.querySelectorAll('[data-bg-color]').forEach(el => {
            const bgColor = el.getAttribute('data-bg-color');
            if (bgColor && !bgColor.includes('${')) {
                el.style.background = bgColor;
            }
        });
    }
    
    // Функция для проверки и исправления CSS в стилях
    function fixInlineCSS() {
        // Находим все style теги
        const styleTags = document.querySelectorAll('style');
        styleTags.forEach(styleTag => {
            let cssText = styleTag.textContent;
            // Проверяем на наличие проблемных паттернов
            if (cssText.includes('${')) {
                console.log('⚠️ Найден template literal в CSS');
                // Заменяем template literals на значения по умолчанию
                cssText = cssText.replace(/\$\{[^}]+\}/g, 'inherit');
                styleTag.textContent = cssText;
            }
        });
    }
    
    // Применяем исправления
    fixTemplateLiterals();
    fixSpecificCSSIssues();
    fixInlineCSS();
    
    // Повторяем через 2 секунды для динамически создаваемых элементов
    setTimeout(() => {
        console.log('🔄 Повторная проверка CSS ошибок...');
        fixTemplateLiterals();
        fixSpecificCSSIssues();
    }, 2000);
    
    console.log('✅ Исправления CSS ошибок применены');
});

// Экспортируем функцию для ручного вызова
window.fixCSSErrors = function() {
    console.log('🔧 Ручной вызов исправления CSS ошибок...');
    
    // Находим все элементы с inline стилями
    const elementsWithStyle = document.querySelectorAll('[style]');
    let fixedCount = 0;
    
    elementsWithStyle.forEach(element => {
        const style = element.getAttribute('style');
        // Проверяем на наличие проблемных паттернов
        if (style && (style.includes('${') || style.includes('undefined') || style.includes('null'))) {
            console.log('🔧 Исправляем style:', style);
            
            // Пытаемся исправить или удаляем
            const cleanedStyle = style
                .replace(/\$\{[^}]+\}/g, '0')
                .replace(/undefined/g, '0')
                .replace(/null/g, '0');
            
            if (cleanedStyle.trim()) {
                element.setAttribute('style', cleanedStyle);
            } else {
                element.removeAttribute('style');
            }
            fixedCount++;
        }
    });
    
    console.log(`🎯 Исправлено inline стилей: ${fixedCount}`);
    return fixedCount;
};

// Автоматически применяем исправления при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.fixCSSErrors);
} else {
    window.fixCSSErrors();
}

console.log('💊 Fix CSS Errors loaded. Используйте window.fixCSSErrors() для ручного исправления.');
