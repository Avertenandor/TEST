// GENESIS Modules Console Test Script\n// Скопируйте и вставьте в консоль браузера\n\n\n// 📊 Панель управления\n
// Тест модуля dashboard
(async function testDashboardModule() {
    console.log('🧪 Тестируем модуль dashboard...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/dashboard';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль dashboard не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль dashboard тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля dashboard:', error);
        return false;
    }
})();
\n// 💰 Депозиты\n
// Тест модуля deposits
(async function testDepositsModule() {
    console.log('🧪 Тестируем модуль deposits...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/deposits';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль deposits не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль deposits тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля deposits:', error);
        return false;
    }
})();
\n// 💼 Портфель\n
// Тест модуля portfolio
(async function testPortfolioModule() {
    console.log('🧪 Тестируем модуль portfolio...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/portfolio';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль portfolio не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль portfolio тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля portfolio:', error);
        return false;
    }
})();
\n// 📋 Транзакции\n
// Тест модуля transactions
(async function testTransactionsModule() {
    console.log('🧪 Тестируем модуль transactions...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/transactions';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль transactions не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль transactions тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля transactions:', error);
        return false;
    }
})();
\n// 📈 Аналитика\n
// Тест модуля analytics
(async function testAnalyticsModule() {
    console.log('🧪 Тестируем модуль analytics...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/analytics';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль analytics не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль analytics тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля analytics:', error);
        return false;
    }
})();
\n// 🎁 Бонусы\n
// Тест модуля bonuses
(async function testBonusesModule() {
    console.log('🧪 Тестируем модуль bonuses...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/bonuses';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль bonuses не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль bonuses тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля bonuses:', error);
        return false;
    }
})();
\n// 🎈 Подарки\n
// Тест модуля gifts
(async function testGiftsModule() {
    console.log('🧪 Тестируем модуль gifts...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/gifts';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль gifts не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль gifts тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля gifts:', error);
        return false;
    }
})();
\n// 👥 Рефералы\n
// Тест модуля referrals
(async function testReferralsModule() {
    console.log('🧪 Тестируем модуль referrals...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/referrals';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль referrals не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль referrals тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля referrals:', error);
        return false;
    }
})();
\n// ⚡ Множители\n
// Тест модуля multipliers
(async function testMultipliersModule() {
    console.log('🧪 Тестируем модуль multipliers...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/multipliers';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль multipliers не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль multipliers тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля multipliers:', error);
        return false;
    }
})();
\n// ⛏️ Аренда майнинга\n
// Тест модуля mining-rent
(async function testMiningRentModule() {
    console.log('🧪 Тестируем модуль mining-rent...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/mining-rent';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль mining-rent не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль mining-rent тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля mining-rent:', error);
        return false;
    }
})();
\n// 🔧 Устройство\n
// Тест модуля device
(async function testDeviceModule() {
    console.log('🧪 Тестируем модуль device...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/device';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль device не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль device тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля device:', error);
        return false;
    }
})();
\n// 🪙 PLEX Coin\n
// Тест модуля plex-coin
(async function testPlexCoinModule() {
    console.log('🧪 Тестируем модуль plex-coin...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/plex-coin';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль plex-coin не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль plex-coin тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля plex-coin:', error);
        return false;
    }
})();
\n// 🌟 Опыт\n
// Тест модуля experience
(async function testExperienceModule() {
    console.log('🧪 Тестируем модуль experience...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/experience';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль experience не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль experience тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля experience:', error);
        return false;
    }
})();
\n// 🏆 Ранг\n
// Тест модуля rank
(async function testRankModule() {
    console.log('🧪 Тестируем модуль rank...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/rank';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль rank не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль rank тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля rank:', error);
        return false;
    }
})();
\n// ⚙️ Настройки\n
// Тест модуля settings
(async function testSettingsModule() {
    console.log('🧪 Тестируем модуль settings...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/settings';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль settings не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль settings тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля settings:', error);
        return false;
    }
})();
\n// 💻 Терминал\n
// Тест модуля terminal
(async function testTerminalModule() {
    console.log('🧪 Тестируем модуль terminal...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/terminal';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль terminal не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль terminal тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля terminal:', error);
        return false;
    }
})();
\n// 🔐 Доступ к платформе\n
// Тест модуля platform-access
(async function testPlatformAccessModule() {
    console.log('🧪 Тестируем модуль platform-access...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/platform-access';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль platform-access не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль platform-access тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля platform-access:', error);
        return false;
    }
})();
\n// 🛠️ Как все устроено\n
// Тест модуля how-it-works
(async function testHowItWorksModule() {
    console.log('🧪 Тестируем модуль how-it-works...');
    
    try {
        // 1. Проверяем переход к модулю
        window.location.hash = '/how-it-works';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {
            console.error('❌ Основной контейнер не найден');
            return false;
        }
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {
            console.error('❌ Модуль how-it-works не загрузил контент');
            return false;
        }
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль how-it-works тест завершен:', {
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        });
        
        return {
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        };
        
    } catch (error) {
        console.error('❌ Ошибка тестирования модуля how-it-works:', error);
        return false;
    }
})();
