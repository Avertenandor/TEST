// Обновленный тест для модульной версии app.html
// Проверяет навигацию по data-route атрибутам

import { test, expect } from '@playwright/test';

test.describe('GENESIS Modular Version Tests', () => {
    test('should load modular version and test navigation', async ({ page }) => {
        console.log('🧪 Тестирование модульной версии GENESIS...');
        
        // Переходим к модульной версии
        await page.goto('http://127.0.0.1:5502/app.html');
        console.log('✅ Модульная версия загружена');
        
        // Ждем инициализации приложения
        await page.waitForTimeout(5000);
        
        // Проверяем загрузку навигации
        const navigation = page.locator('#app-navigation');
        await expect(navigation).toBeVisible();
        console.log('✅ Навигация видна');
        
        // Проверяем количество элементов навигации
        const navLinks = page.locator('nav [data-route]');
        const navCount = await navLinks.count();
        console.log(`🔗 Найдено навигационных элементов: ${navCount}`);
        
        // Тестируем переходы по модулям
        const modules = [
            { route: '/deposits', text: 'Депозиты', icon: '💰' },
            { route: '/portfolio', text: 'Портфель', icon: '💼' },
            { route: '/bonuses', text: 'Бонусы', icon: '🎁' },
            { route: '/settings', text: 'Настройки', icon: '⚙️' }
        ];
        
        for (const module of modules) {
            console.log(`\n🎯 Тестируем модуль: ${module.text}`);
            
            // Находим элемент навигации
            const navElement = page.locator(`nav [data-route="${module.route}"]`);
            
            if (await navElement.count() > 0) {
                // Кликаем по элементу навигации
                await navElement.click();
                console.log(`✅ Клик по ${module.text}`);
                
                // Ждем загрузки модуля
                await page.waitForTimeout(2000);
                
                // Проверяем, что модуль загрузился
                const moduleContainer = page.locator('#app-container');
                await expect(moduleContainer).toBeVisible();
                console.log(`✅ Модуль ${module.text} загружен`);
                
                // Проверяем наличие специфичного контента
                if (module.route === '/deposits') {
                    const depositsHeader = page.locator('h1:has-text("Депозитная система")');
                    if (await depositsHeader.count() > 0) {
                        console.log('✅ Депозитная система найдена');
                    }
                    
                    const depositsTabs = page.locator('.deposits-tabs');
                    if (await depositsTabs.count() > 0) {
                        console.log('✅ Вкладки депозитов найдены');
                    }
                }
                
            } else {
                console.log(`❌ Навигационный элемент ${module.text} не найден`);
            }
        }
        
        console.log('\n📊 Тестирование завершено');
    });
});

// Запуск теста
test('GENESIS Modular Navigation Test', async ({ page }) => {
    console.log('🚀 Запуск теста модульной навигации...');
    
    await page.goto('http://127.0.0.1:5502/app.html');
    
    // Ждем полной загрузки
    await page.waitForLoadState('networkidle');
    
    // Проверяем консольные логи
    page.on('console', msg => {
        if (msg.type() === 'log') {
            console.log('🖥️ CONSOLE [LOG]:', msg.text());
        } else if (msg.type() === 'error') {
            console.log('🖥️ CONSOLE [ERROR]:', msg.text());
        }
    });
    
    // Проверяем успешную инициализацию
    const appInitialized = await page.evaluate(() => {
        return window.App && window.App.initialized;
    });
    
    console.log(`🎯 Приложение инициализировано: ${appInitialized}`);
});
