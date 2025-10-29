/**
 * Скрипт проверки адаптивности
 * Запуск: node scripts/check-responsive.js
 */

const fs = require('fs');
const path = require('path');

const checks = [
    {
        name: 'Viewport Meta Tag в index.html',
        check: () => {
            const html = fs.readFileSync('index.html', 'utf8');
            return html.includes('name="viewport"') &&
                   html.includes('width=device-width');
        }
    },
    {
        name: 'Viewport Meta Tag в app.html',
        check: () => {
            const html = fs.readFileSync('app.html', 'utf8');
            return html.includes('name="viewport"') &&
                   html.includes('width=device-width');
        }
    },
    {
        name: 'Responsive CSS существует',
        check: () => {
            return fs.existsSync('shared/css/responsive.css');
        }
    },
    {
        name: 'Navigation CSS существует',
        check: () => {
            return fs.existsSync('shared/css/navigation.css');
        }
    },
    {
        name: 'Navigation JS существует',
        check: () => {
            return fs.existsSync('shared/js/navigation.js');
        }
    },
    {
        name: 'Buttons CSS существует',
        check: () => {
            return fs.existsSync('shared/css/buttons.css');
        }
    },
    {
        name: 'Forms CSS существует',
        check: () => {
            return fs.existsSync('shared/css/forms.css');
        }
    },
    {
        name: 'Cards CSS существует',
        check: () => {
            return fs.existsSync('shared/css/cards.css');
        }
    },
    {
        name: 'Media Queries в Responsive CSS',
        check: () => {
            const css = fs.readFileSync('shared/css/responsive.css', 'utf8');
            return css.includes('@media') &&
                   css.includes('min-width');
        }
    },
    {
        name: 'Touch targets в Responsive CSS',
        check: () => {
            const css = fs.readFileSync('shared/css/responsive.css', 'utf8');
            return css.includes('--touch-target-min');
        }
    },
    {
        name: 'Responsive CSS подключен в app.html',
        check: () => {
            const html = fs.readFileSync('app.html', 'utf8');
            return html.includes('shared/css/responsive.css');
        }
    },
    {
        name: 'Responsive CSS подключен в index.html',
        check: () => {
            const html = fs.readFileSync('index.html', 'utf8');
            return html.includes('shared/css/responsive.css');
        }
    }
];

console.log('=== Проверка адаптивности GENESIS ===\n');

let passed = 0;
let failed = 0;

checks.forEach(({ name, check }) => {
    try {
        const result = check();

        if (result) {
            console.log(`✅ ${name}`);
            passed++;
        } else {
            console.log(`❌ ${name}`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ ${name} (ошибка: ${err.message})`);
        failed++;
    }
});

console.log(`\n=== Итого: ${passed} / ${checks.length} ===`);

if (failed > 0) {
    console.log(`\n⚠️  ${failed} проверок не прошли`);
    process.exit(1);
} else {
    console.log('\n✅ Все проверки пройдены!');
    process.exit(0);
}
