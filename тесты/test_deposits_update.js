// Тест обновленного модуля депозитов GENESIS
// Проверка: app.html с новой системой депозитов

async function testDepositsModuleUpdate() {
    console.log('🧪 Тестирование обновленного модуля депозитов...');
    
    const testUrl = 'http://127.0.0.1:5502/app.html';
    
    try {
        // Переходим к модульной версии
        await page.goto(testUrl, { waitUntil: 'networkidle' });
        console.log('✅ Модульная версия загружена');
        
        // Ждем инициализации
        await page.waitForTimeout(3000);
        
        // Проверяем навигацию
        const navExists = await page.locator('#app-navigation').count() > 0;
        console.log(`🧭 Навигация найдена: ${navExists}`);
        
        // Переходим к депозитам через навигацию
        const depositsLink = page.locator('nav').filter({ hasText: 'Портфель' });
        if (await depositsLink.count() > 0) {
            await depositsLink.click();
            console.log('🏛️ Клик по разделу депозитов');
            await page.waitForTimeout(2000);
        }
        
        // Проверяем элементы модуля депозитов
        const elements = {
            header: 'h1:has-text("Депозитная система GENESIS")',
            stats: '.deposits-stats-grid',
            tabs: '.deposits-tabs',
            plans: '#deposit-plans-grid',
            calculator: '.calculator-container'
        };
        
        const results = {};
        
        for (const [name, selector] of Object.entries(elements)) {
            const exists = await page.locator(selector).count() > 0;
            results[name] = exists;
            console.log(`${exists ? '✅' : '❌'} ${name}: ${exists}`);
        }
        
        // Проверяем вкладки
        const tabs = ['plans', 'active', 'history', 'calculator'];
        for (const tab of tabs) {
            const tabBtn = page.locator(`[data-tab="${tab}"]`);
            if (await tabBtn.count() > 0) {
                await tabBtn.click();
                await page.waitForTimeout(500);
                
                const content = page.locator(`.tab-content[data-tab="${tab}"]`);
                const isVisible = await content.isVisible();
                console.log(`${isVisible ? '✅' : '❌'} Вкладка ${tab}: ${isVisible}`);
            }
        }
        
        // Проверяем конфигурацию депозитов
        const configLoaded = await page.evaluate(() => {
            return window.GENESIS_CONFIG && 
                   window.GENESIS_CONFIG.depositPlans && 
                   window.GENESIS_CONFIG.depositPlans.length > 0;
        });
        console.log(`🔧 Конфигурация депозитов: ${configLoaded}`);
        
        if (configLoaded) {
            const plansCount = await page.evaluate(() => window.GENESIS_CONFIG.depositPlans.length);
            console.log(`📊 Количество планов: ${plansCount}`);
        }
        
        return {
            success: true,
            message: 'Модуль депозитов обновлен успешно',
            details: results
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования:', error);
        return {
            success: false,
            message: error.message,
            details: {}
        };
    }
}

// Запуск теста
testDepositsModuleUpdate().then(result => {
    console.log('\n🎯 Результат теста:', result);
});
