// tests/e2e/smoke.spec.js
// E2E smoke тесты для GENESIS

const { test, expect } = require('@playwright/test');

test.describe('GENESIS Smoke Tests', () => {
  test('should load main page', async ({ page }) => {
    await page.goto('/');
    
    // Проверяем загрузку страницы
    await expect(page).toHaveTitle(/GENESIS/);
    
    // Проверяем наличие основных секций
    await expect(page.locator('#hero-section')).toBeVisible();
    await expect(page.locator('#token-info-section')).toBeVisible();
    await expect(page.locator('#cta-grid-section')).toBeVisible();
    
    console.log('✅ Main page loaded successfully');
  });

  test('should load all modules', async ({ page }) => {
    await page.goto('/');
    
    // Ждем загрузки модулей
    await page.waitForSelector('#app:not(.hidden)', { timeout: 10000 });
    
    // Проверяем, что модули загружены
    const heroContent = await page.locator('#hero-section').innerHTML();
    expect(heroContent.trim()).not.toBe('');
    
    const tokenInfoContent = await page.locator('#token-info-section').innerHTML();
    expect(tokenInfoContent.trim()).not.toBe('');
    
    const ctaGridContent = await page.locator('#cta-grid-section').innerHTML();
    expect(ctaGridContent.trim()).not.toBe('');
    
    console.log('✅ All modules loaded successfully');
  });

  test('should handle terminal module', async ({ page }) => {
    await page.goto('/');
    
    // Ждем загрузки терминала
    await page.waitForSelector('#terminal-section', { timeout: 10000 });
    
    // Проверяем наличие терминала
    const terminalContent = await page.locator('#terminal-section').innerHTML();
    expect(terminalContent.trim()).not.toBe('');
    
    console.log('✅ Terminal module loaded successfully');
  });

  test('should work offline', async ({ page }) => {
    await page.goto('/');
    
    // Ждем загрузки страницы
    await page.waitForSelector('#app:not(.hidden)', { timeout: 10000 });
    
    // Отключаем сеть
    await page.context().setOffline(true);
    
    // Обновляем страницу
    await page.reload();
    
    // Проверяем, что страница все еще работает
    await expect(page.locator('#hero-section')).toBeVisible();
    
    console.log('✅ Offline functionality works');
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Переходим на несуществующую страницу
    await page.goto('/non-existent-page');
    
    // Проверяем, что есть fallback
    const content = await page.content();
    expect(content).toContain('GENESIS');
    
    console.log('✅ Error handling works');
  });
});