// tests/e2e/smoke.spec.js
// E2E smoke тесты для GENESIS (ESM)

import { test, expect } from '@playwright/test';

test.describe('GENESIS Smoke Tests', () => {
  test('should load main page', async ({ page }) => {
    try { await page.goto('/index.html', { waitUntil: 'domcontentloaded' }); } catch {}
    await expect(page).toHaveTitle(/GENESIS/i);
    await expect(page.locator('#genesis-app')).toBeVisible({ timeout: 10000 });
    // Достаточно проверить, что основной контейнер показан и бренд есть
      await expect(page.locator('.genesis-logo-text').first()).toBeVisible();
  });

  test('should not hang on loader', async ({ page }) => {
    try { await page.goto('/index.html', { waitUntil: 'domcontentloaded' }); } catch {}
    const app = page.locator('#genesis-app');
    const loader = page.locator('#genesis-loading');
    await Promise.race([
      app.waitFor({ state: 'visible', timeout: 8000 }),
      loader.waitFor({ state: 'hidden', timeout: 8000 }),
    ]);
    await expect(app).toBeVisible();
    await expect(loader).toBeHidden();
  });

  test('404 fallback renders brand', async ({ page }) => {
    try { await page.goto('/non-existent-page', { waitUntil: 'domcontentloaded' }); } catch {}
    // Допускаем, что редирект ведёт на / или /app.html, тогда проверяем бренд на итоговой странице
    const content = await page.content();
    expect(content).toMatch(/GENESIS/i);
  });
});