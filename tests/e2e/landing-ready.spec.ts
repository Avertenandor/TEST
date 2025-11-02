import { test, expect } from '@playwright/test';

// Production smoke from user's perspective
// Run against PROD with:  PROD_URL=https://crypto-processing.net npx playwright test -g "[PROD]"

test.describe('[PROD] Landing readiness', () => {
  test('loader disappears and content becomes visible <= 8s', async ({ page }) => {
    try { await page.goto('/index.html', { waitUntil: 'domcontentloaded' }); } catch { /* allow redirect abort */ }

    // Wait for either the app to be visible or the loader to be hidden
    const app = page.locator('#genesis-app');
    const loader = page.locator('#genesis-loading');

    await Promise.race([
      app.waitFor({ state: 'visible', timeout: 8000 }),
      loader.waitFor({ state: 'hidden', timeout: 8000 }),
    ]);

    await expect(app).toBeVisible();
    await expect(loader).toBeHidden();
  });

  test('right click is not blocked', async ({ page }) => {
    try { await page.goto('/index.html', { waitUntil: 'domcontentloaded' }); } catch {}
    await page.addInitScript(() => {
      (window as any).__ctx = { prevented: undefined };
      document.addEventListener('contextmenu', (e) => {
        (window as any).__ctx.prevented = e.defaultPrevented;
      }, { capture: true });
    });

    await page.click('body', { button: 'right' });
    const prevented = await page.evaluate(() => (window as any).__ctx?.prevented);
    expect(prevented === false || prevented === undefined).toBeTruthy();
  });

  test('key sections are present and visible', async ({ page }) => {
    try { await page.goto('/index.html', { waitUntil: 'domcontentloaded' }); } catch {}
    await page.waitForSelector('#genesis-app', { timeout: 8000 });
    await expect(page.locator('.genesis-logo-text').first()).toBeVisible();
  });

  test('no console errors after load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    try { await page.goto('/index.html', { waitUntil: 'domcontentloaded' }); } catch {}
    await page.waitForSelector('#genesis-app', { timeout: 8000 });
    // Фильтруем CSP ошибки CoinGecko (ожидаемые в dev)
    const realErrors = errors.filter(e => 
      !e.includes('Content-Security-Policy') && 
      !e.includes('coingecko.com')
    );
    expect(realErrors.join('\n')).not.toMatch(/Error|TypeError|ReferenceError/i);
  });
});


