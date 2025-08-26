// tests/smoke.js
// Smoke тесты для модулей GENESIS

import { loadAxios } from '../core/library-loader.ts';
import { getDiagnosticBuffer } from '../core/error-guard.ts';

// Тест Axios fallback
async function testAxiosFallback() {
    console.log('🧪 Testing Axios fallback...');
    
    try {
        const axios = await loadAxios();
        
        // Тест GET запроса
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
        
        // Проверяем, что data - это объект, а не Promise
        if (typeof response.data === 'object' && !response.data.then) {
            console.log('✅ Axios fallback GET test passed');
        } else {
            throw new Error('Response.data is not an object or is a Promise');
        }
        
        // Проверяем структуру ответа
        if (response.status && response.ok !== undefined) {
            console.log('✅ Axios fallback response structure test passed');
        } else {
            throw new Error('Response missing status or ok property');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Axios fallback test failed:', error);
        return false;
    }
}

// Тест Error Guard
function testErrorGuard() {
    console.log('🧪 Testing Error Guard...');
    
    try {
        const buffer = getDiagnosticBuffer();
        
        if (Array.isArray(buffer)) {
            console.log('✅ Error Guard buffer test passed');
        } else {
            throw new Error('Diagnostic buffer is not an array');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error Guard test failed:', error);
        return false;
    }
}

// Тест модулей mount/unmount
async function testModules() {
    console.log('🧪 Testing modules mount/unmount...');
    
    const modules = [
        { name: 'hero', path: '../modules/home/hero/index.ts' },
        { name: 'tokenInfo', path: '../modules/home/tokenInfo/index.ts' },
        { name: 'ctaGrid', path: '../modules/home/ctaGrid/index.ts' },
        { name: 'terminal', path: '../modules/terminal/index.js' }
    ];
    
    const results = [];
    
    for (const module of modules) {
        try {
            // Создаем тестовый контейнер
            const container = document.createElement('div');
            container.id = `test-${module.name}`;
            document.body.appendChild(container);
            
            // Импортируем модуль
            const moduleExport = await import(module.path);
            const moduleInstance = moduleExport.default || moduleExport.module;
            
            if (moduleInstance && typeof moduleInstance.mount === 'function') {
                // Тестируем mount
                moduleInstance.mount(container);
                
                // Проверяем, что контейнер не пустой
                if (container.innerHTML.trim()) {
                    console.log(`✅ ${module.name} module mount test passed`);
                    
                    // Тестируем unmount если есть
                    if (typeof moduleInstance.unmount === 'function') {
                        moduleInstance.unmount(container);
                        console.log(`✅ ${module.name} module unmount test passed`);
                    }
                    
                    results.push({ module: module.name, status: 'passed' });
                } else {
                    throw new Error('Container is empty after mount');
                }
            } else {
                throw new Error('Module does not have mount function');
            }
            
            // Очищаем
            document.body.removeChild(container);
            
        } catch (error) {
            console.error(`❌ ${module.name} module test failed:`, error);
            results.push({ module: module.name, status: 'failed', error: error.message });
        }
    }
    
    return results;
}

// Тест конфигурации
function testConfig() {
    console.log('🧪 Testing configuration...');
    
    try {
        const config = window.__CONFIG;
        
        if (config && config.network && config.addresses) {
            console.log('✅ Configuration test passed');
            return true;
        } else {
            throw new Error('Configuration is missing required properties');
        }
    } catch (error) {
        console.error('❌ Configuration test failed:', error);
        return false;
    }
}

// Основная функция тестирования
async function runSmokeTests() {
    console.log('🚀 Starting smoke tests...');
    
    const results = {
        axios: false,
        errorGuard: false,
        modules: [],
        config: false
    };
    
    // Тест Axios fallback
    results.axios = await testAxiosFallback();
    
    // Тест Error Guard
    results.errorGuard = testErrorGuard();
    
    // Тест модулей
    results.modules = await testModules();
    
    // Тест конфигурации
    results.config = testConfig();
    
    // Подсчет результатов
    const passed = [
        results.axios,
        results.errorGuard,
        results.config,
        ...results.modules.filter(m => m.status === 'passed')
    ].length;
    
    const total = 3 + results.modules.length;
    
    console.log(`\n📊 Smoke test results: ${passed}/${total} passed`);
    
    if (passed === total) {
        console.log('🎉 All smoke tests passed!');
        return true;
    } else {
        console.log('⚠️ Some tests failed');
        return false;
    }
}

// Экспорт для использования в других тестах
export {
    testAxiosFallback,
    testErrorGuard,
    testModules,
    testConfig,
    runSmokeTests
};

// Запуск тестов если файл выполняется напрямую
if (typeof window !== 'undefined') {
    window.runSmokeTests = runSmokeTests;
}