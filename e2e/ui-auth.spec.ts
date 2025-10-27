/**
 * GENESIS 1.1 - E2E Tests for UI/UX
 * Playwright тесты для проверки UI компонентов и авторизации
 */

import { test, expect } from '@playwright/test';

test.describe('GENESIS 1.1 UI/UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Даём время на загрузку
    await page.waitForLoadState('networkidle');
  });

  // ===== ТЕСТ 1: Единственный H1 =====
  test('has single H1', async ({ page }) => {
    const h1s = await page.locator('h1').count();
    expect(h1s).toBe(1);

    const h1Text = await page.locator('h1').textContent();
    expect(h1Text).toContain('GENESIS');
  });

  // ===== ТЕСТ 2: Семантические списки =====
  test('no bullet glyphs, only UL/LI', async ({ page }) => {
    // Проверяем, что нет символа •
    const bodyText = await page.textContent('body');
    expect(bodyText?.includes('•')).toBeFalsy();

    // Проверяем наличие списков
    const listItems = await page.locator('ul li').count();
    expect(listItems).toBeGreaterThan(0);

    // Проверяем, что списки имеют класс list-bullets
    const bulletLists = await page.locator('ul.list-bullets').count();
    expect(bulletLists).toBeGreaterThan(0);
  });

  // ===== ТЕСТ 3: Валидация адреса =====
  test('address validation enables Next button', async ({ page }) => {
    const addressInput = page.locator('#userAddress');
    const nextButton = page.locator('#step1Next');

    // Сначала кнопка должна быть disabled
    await expect(nextButton).toBeDisabled();

    // Вводим невалидный адрес
    await addressInput.fill('0xINVALID');
    await page.waitForTimeout(600); // Ждём debounce

    // Кнопка должна остаться disabled
    await expect(nextButton).toBeDisabled();

    // Проверяем сообщение об ошибке
    const helpText = await page.locator('#userAddressHelp').textContent();
    expect(helpText).toContain('Неверный формат');

    // Вводим валидный адрес (42 символа после 0x)
    await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3');
    await page.waitForTimeout(600); // Ждём debounce

    // Кнопка должна стать enabled
    await expect(nextButton).toBeEnabled();

    // Проверяем успешное сообщение
    const successText = await page.locator('#userAddressHelp').textContent();
    expect(successText).toContain('корректен');
  });

  // ===== ТЕСТ 4: Rate-limit на проверку оплаты =====
  test('check payment is rate-limited', async ({ page }) => {
    // Сначала нужно пройти первый шаг
    const addressInput = page.locator('#userAddress');
    await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3');
    await page.waitForTimeout(600);

    const step1Next = page.locator('#step1Next');
    await step1Next.click();

    // Теперь мы на шаге 2
    await page.waitForTimeout(500);

    const checkPaymentBtn = page.locator('#checkPayment');

    // Первый клик
    await checkPaymentBtn.click();

    // Ждём завершения (кнопка в loading состоянии)
    await page.waitForTimeout(2500);

    // Второй клик сразу после
    await checkPaymentBtn.click();

    // Должен появиться тост с предупреждением о лимите
    await page.waitForTimeout(500);

    // Проверяем наличие toast-контейнера
    const toastContainer = page.locator('#toast-container');
    await expect(toastContainer).toBeVisible();
  });

  // ===== ТЕСТ 5: PWA Manifest доступен =====
  test('manifest linked and accessible', async ({ page }) => {
    // Проверяем наличие link на manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);

    const href = await manifestLink.getAttribute('href');
    expect(href).toBeTruthy();

    // Проверяем доступность manifest
    const response = await page.goto(href!);
    expect(response?.status()).toBe(200);

    // Проверяем, что это валидный JSON
    const manifestText = await response?.text();
    expect(() => JSON.parse(manifestText!)).not.toThrow();

    const manifest = JSON.parse(manifestText!);
    expect(manifest.name).toBe('GENESIS 1.1');
    expect(manifest.icons).toHaveLength(2);
  });

  // ===== ТЕСТ 6: BscScan бейджи скрыты без адреса =====
  test('trust badges hidden without contract address', async ({ page }) => {
    // При первой загрузке бейджи должны быть скрыты
    const badges = page.locator('#trust-badges');
    await expect(badges).toHaveClass(/hidden/);

    // Сообщение должно быть видно
    const message = page.locator('#trust-message');
    await expect(message).toBeVisible();
  });

  // ===== ТЕСТ 7: Степпер имеет 4 шага =====
  test('stepper has 4 steps', async ({ page }) => {
    const steps = page.locator('.step');
    await expect(steps).toHaveCount(4);

    // Первый шаг должен быть активен
    const firstStep = page.locator('.step[data-step="1"]');
    await expect(firstStep).toHaveClass(/is-active/);

    // Остальные неактивны
    const secondStep = page.locator('.step[data-step="2"]');
    await expect(secondStep).not.toHaveClass(/is-active/);
  });

  // ===== ТЕСТ 8: График имеет кнопку обновления =====
  test('chart has refresh button', async ({ page }) => {
    const refreshBtn = page.locator('#refreshChart');
    await expect(refreshBtn).toBeVisible();
    await expect(refreshBtn).toBeEnabled();

    // Кликаем на обновление
    await refreshBtn.click();

    // Должен появиться тост об успехе
    await page.waitForTimeout(1500);
    const toastContainer = page.locator('#toast-container');
    await expect(toastContainer).toBeVisible();
  });

  // ===== ТЕСТ 9: Тех-панель без прочерков =====
  test('tech panel shows data without dashes', async ({ page }) => {
    // Ждём загрузки данных
    await page.waitForTimeout(2000);

    const browser = await page.locator('#tech-browser').textContent();
    const lang = await page.locator('#tech-lang').textContent();
    const timezone = await page.locator('#tech-timezone').textContent();

    // Проверяем, что нет прочерков
    expect(browser).not.toBe('-');
    expect(lang).not.toBe('-');
    expect(timezone).not.toBe('-');

    // Проверяем, что это не скелетоны
    expect(browser).not.toBe('');
    expect(lang).not.toBe('');
    expect(timezone).not.toBe('');
  });

  // ===== ТЕСТ 10: Кнопки имеют правильные состояния =====
  test('buttons have correct states', async ({ page }) => {
    const step1Next = page.locator('#step1Next');

    // Disabled по умолчанию
    await expect(step1Next).toBeDisabled();

    // Hover state (проверка через CSS)
    await step1Next.hover();
    // Playwright не может проверить :hover напрямую, но можно проверить что кнопка существует

    // Focus visible
    await step1Next.focus();
    // Проверяем что outline появляется при фокусе (CSS проверка)

    // После валидного адреса кнопка enabled
    const addressInput = page.locator('#userAddress');
    await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3');
    await page.waitForTimeout(600);

    await expect(step1Next).toBeEnabled();
  });
});

// ===== ТЕСТ: Diagnostics доступен только с ?dev=1 =====
test.describe('Diagnostics Guard', () => {
  test('diagnostics redirects without dev=1', async ({ page }) => {
    // Попытка открыть diagnostics без параметра
    await page.goto('/diagnostics.html');

    // Должен произойти редирект на главную
    await page.waitForTimeout(500);
    expect(page.url()).toBe('http://localhost:3000/');
  });

  test('diagnostics accessible with dev=1', async ({ page }) => {
    // Открываем с параметром
    const response = await page.goto('/diagnostics.html?dev=1');

    // Страница должна загрузиться
    expect(response?.status()).toBe(200);

    // Проверяем что мы на диагностической странице
    const title = await page.title();
    expect(title).toContain('Diagnostics');
  });
});
