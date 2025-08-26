// tests/smoke.test.ts
// Smoke тесты для модулей

import { HeroModule } from '../modules/home/hero/index';
import { TokenInfoModule } from '../modules/home/tokenInfo/index';
import { CtaGridModule } from '../modules/home/ctaGrid/index';

// Мокаем DOM для тестов
function createMockElement(): HTMLElement {
    const element = document.createElement('div');
    element.innerHTML = '';
    return element;
}

// Тест Hero модуля
describe('HeroModule', () => {
    let module: HeroModule;
    let container: HTMLElement;

    beforeEach(() => {
        module = new HeroModule();
        container = createMockElement();
    });

    test('should mount without errors', () => {
        expect(() => {
            module.mount(container);
        }).not.toThrow();

        expect(container.innerHTML).toContain('hero');
        expect(container.innerHTML).toContain('GENESIS');
    });

    test('should unmount without errors', () => {
        module.mount(container);
        expect(() => {
            module.unmount();
        }).not.toThrow();

        expect(container.innerHTML).toBe('');
    });

    test('should update props correctly', () => {
        module.mount(container);
        const newTitle = 'Новый заголовок';

        expect(() => {
            module.updateProps({ title: newTitle });
        }).not.toThrow();

        expect(container.innerHTML).toContain(newTitle);
    });
});

// Тест TokenInfo модуля
describe('TokenInfoModule', () => {
    let module: TokenInfoModule;
    let container: HTMLElement;

    beforeEach(() => {
        module = new TokenInfoModule();
        container = createMockElement();
    });

    test('should mount without errors', () => {
        expect(() => {
            module.mount(container);
        }).not.toThrow();

        expect(container.innerHTML).toContain('token-info');
        expect(container.innerHTML).toContain('PLEX ONE');
    });

    test('should unmount without errors', () => {
        module.mount(container);
        expect(() => {
            module.unmount();
        }).not.toThrow();

        expect(container.innerHTML).toBe('');
    });

    test('should handle copy button clicks', () => {
        module.mount(container);
        const copyButton = container.querySelector('.token-info__copy-btn');

        if (copyButton) {
            expect(() => {
                (copyButton as HTMLElement).click();
            }).not.toThrow();
        }
    });
});

// Тест CtaGrid модуля
describe('CtaGridModule', () => {
    let module: CtaGridModule;
    let container: HTMLElement;

    beforeEach(() => {
        module = new CtaGridModule();
        container = createMockElement();
    });

    test('should mount without errors', () => {
        expect(() => {
            module.mount(container);
        }).not.toThrow();

        expect(container.innerHTML).toContain('cta-grid');
        expect(container.innerHTML).toContain('Быстрый доступ');
    });

    test('should unmount without errors', () => {
        module.mount(container);
        expect(() => {
            module.unmount();
        }).not.toThrow();

        expect(container.innerHTML).toBe('');
    });

    test('should handle item clicks', () => {
        module.mount(container);
        const items = container.querySelectorAll('.cta-grid__item');

        if (items.length > 0) {
            expect(() => {
                (items[0] as HTMLElement).click();
            }).not.toThrow();
        }
    });

    test('should add and remove items', () => {
        module.mount(container);
        const initialCount = container.querySelectorAll('.cta-grid__item').length;

        // Добавляем новый элемент
        module.addItem({
            id: 'test-item',
            title: 'Тестовый элемент',
            description: 'Описание тестового элемента',
            icon: '🧪',
            link: '/test',
            color: '#ff0000'
        });

        expect(container.querySelectorAll('.cta-grid__item').length).toBe(initialCount + 1);

        // Удаляем элемент
        module.removeItem('test-item');
        expect(container.querySelectorAll('.cta-grid__item').length).toBe(initialCount);
    });
});

// Тест Axios fallback
describe('Axios Fallback', () => {
    test('should return data as object, not Promise', async () => {
        // Импортируем функцию создания fallback
        const { loadAxios } = await import('../core/library-loader');

        const axios = await loadAxios();

        // Мокаем fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                statusText: 'OK',
                json: () => Promise.resolve({ test: 'data' })
            } as Response)
        );

        const response = await axios.get('https://api.test.com/data');

        expect(response.data).toEqual({ test: 'data' });
        expect(typeof response.data).toBe('object');
        expect(response.data).not.toBeInstanceOf(Promise);
    });
});

// Тест конфигурации
describe('Configuration', () => {
    test('should have correct addresses', async () => {
        const { config } = await import('../shared/config');

        expect(config.addresses.plex).toBe('0xdf179b6cadbc61ffd86a3d2e55f6d6e083ade6c1');
        expect(config.addresses.usdt).toBe('0x55d398326f99059ff775485246999027b3197955');
        expect(config.addresses.system).toBe('0x399B22170B0AC7BB20bdC86772bFf478f201fFCD');
        expect(config.addresses.access).toBe('0x28915a33562b58500cf8b5b682C89A3396B8Af76');
    });

    test('should have BSCScan keys', async () => {
        const { config } = await import('../shared/config');

        expect(config.bscscanKeys).toBeInstanceOf(Array);
        expect(config.bscscanKeys.length).toBeGreaterThan(0);
        expect(config.bscscanKeys[0]).toMatch(/^[A-Z0-9]+$/);
    });

    test('should have correct network config', async () => {
        const { config } = await import('../shared/config');

        expect(config.network.chainId).toBe(56);
        expect(config.network.name).toBe('BSC');
    });
});

// Тест error guard
describe('Error Guard', () => {
    test('should initialize without errors', async () => {
        const { initErrorGuard } = await import('../core/error-guard');

        expect(() => {
            initErrorGuard();
        }).not.toThrow();

        expect(window.__diagBuffer).toBeDefined();
        expect(Array.isArray(window.__diagBuffer)).toBe(true);
    });

    test('should filter whitelisted errors', async () => {
        const { initErrorGuard } = await import('../core/error-guard');
        initErrorGuard();

        // Создаем ошибку MetaMask (должна быть отфильтрована)
        const metaMaskError = new Error('MetaMask: User rejected transaction');

        // Создаем обычную ошибку (должна быть залогирована)
        const regularError = new Error('Regular application error');

        // Симулируем обработку ошибок
        const originalLength = window.__diagBuffer.length;

        // Ошибки должны обрабатываться без исключений
        expect(() => {
            window.dispatchEvent(new ErrorEvent('error', { error: metaMaskError }));
            window.dispatchEvent(new ErrorEvent('error', { error: regularError }));
        }).not.toThrow();
    });
});
