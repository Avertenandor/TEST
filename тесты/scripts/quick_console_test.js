// Быстрый тест модулей GENESIS в консоли браузера
// 1. Откройте http://127.0.0.1:5502/app.html
// 2. Авторизуйтесь с тестовым адресом: 0x1234567890123456789012345678901234567890
// 3. Скопируйте и вставьте этот код в консоль браузера

console.log('🚀 Запускаем быстрый тест модулей GENESIS...');

// Список модулей для тестирования
const testModules = [
    { name: 'dashboard', title: '📊 Панель управления' },
    { name: 'deposits', title: '💰 Депозиты' },
    { name: 'portfolio', title: '💼 Портфель' },
    { name: 'transactions', title: '📋 Транзакции' },
    { name: 'analytics', title: '📈 Аналитика' },
    { name: 'bonuses', title: '🎁 Бонусы' },
    { name: 'gifts', title: '🎈 Подарки' },
    { name: 'device', title: '🔧 Устройство' },
    { name: 'settings', title: '⚙️ Настройки' },
    { name: 'platform-access', title: '🔐 Доступ к платформе' },
    { name: 'how-it-works', title: '🛠️ Как все устроено' }
];

// Функция тестирования одного модуля
async function testModule(module) {
    console.log(`\n🧪 Тестируем ${module.title}...`);
    
    try {
        // Переходим к модулю
        window.location.hash = `/${module.name}`;
        
        // Ждем загрузки
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Проверяем контент
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error(`❌ ${module.title}: Основной контейнер не найден`);
            return { success: false, error: 'No main content' };
        }
        
        const hasContent = mainContent.innerHTML.trim().length > 100;
        const navElements = document.querySelectorAll('.nav-link, [data-page], .navigation a').length;
        const buttons = document.querySelectorAll('button, .btn').length;
        const inputs = document.querySelectorAll('input, select, textarea').length;
        
        if (hasContent) {
            console.log(`✅ ${module.title}: Контент загружен (${mainContent.innerHTML.length} символов)`);
            console.log(`   📊 Навигация: ${navElements} элементов`);
            console.log(`   🎮 Кнопки: ${buttons} элементов`);
            console.log(`   📝 Поля ввода: ${inputs} элементов`);
            return { 
                success: true, 
                contentSize: mainContent.innerHTML.length,
                navElements,
                buttons,
                inputs
            };
        } else {
            console.error(`❌ ${module.title}: Контент не загрузился или пуст`);
            return { success: false, error: 'Empty content' };
        }
        
    } catch (error) {
        console.error(`❌ ${module.title}: Ошибка тестирования:`, error);
        return { success: false, error: error.message };
    }
}

// Функция запуска всех тестов
async function runAllTests() {
    console.log('📋 Начинаем тестирование всех модулей...');
    
    const results = {};
    let successCount = 0;
    
    for (const module of testModules) {
        const result = await testModule(module);
        results[module.name] = result;
        
        if (result.success) {
            successCount++;
        }
        
        // Пауза между тестами
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Итоговый отчет
    console.log('\n' + '='.repeat(60));
    console.log('📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ');
    console.log('='.repeat(60));
    console.log(`🎯 Успешных: ${successCount}/${testModules.length} (${Math.round(successCount/testModules.length*100)}%)`);
    
    console.log('\n✅ Работающие модули:');
    testModules.forEach(module => {
        if (results[module.name].success) {
            const r = results[module.name];
            console.log(`   ${module.title} - Контент: ${r.contentSize} символов, Элементы: ${r.navElements + r.buttons + r.inputs}`);
        }
    });
    
    console.log('\n❌ Проблемные модули:');
    testModules.forEach(module => {
        if (!results[module.name].success) {
            console.log(`   ${module.title} - ${results[module.name].error}`);
        }
    });
    
    return results;
}

// Запускаем тесты
console.log('💡 Используйте: runAllTests() для запуска всех тестов');
console.log('💡 Или: testModule({name: "dashboard", title: "📊 Панель управления"}) для одного модуля');

// Автозапуск через 3 секунды
setTimeout(() => {
    console.log('🚀 Автозапуск тестирования через 3 секунды...');
    setTimeout(runAllTests, 3000);
}, 1000);
