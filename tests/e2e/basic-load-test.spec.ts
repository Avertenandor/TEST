import { test, expect } from '@playwright/test';

test.describe('Site Basic Load Test', () => {
  test('Site should load at all', async ({ page }) => {
    // Устанавливаем обработчик ошибок
    page.on('pageerror', error => {
      console.error('❌ Page error:', error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Console error:', msg.text());
      }
    });
    
    // Пробуем загрузить с самым минимальным таймаутом
    try {
      const response = await page.goto('https://crypto-processing.net/', { 
        waitUntil: 'commit', // Только commit, не ждем загрузки
        timeout: 10000 
      });
      
      console.log('✅ Page commit successful, status:', response?.status());
      
      // Ждем немного чтобы увидеть что происходит
      await page.waitForTimeout(2000);
      
      // Проверяем что DOM вообще загрузился
      const hasBody = await page.evaluate(() => !!document.body);
      console.log('✅ Body exists:', hasBody);
      
      // Проверяем title
      const title = await page.title();
      console.log('✅ Title:', title);
      
      // Проверяем есть ли ошибки в консоли
      const errors = await page.evaluate(() => {
        return window.errors || [];
      });
      
      if (errors.length > 0) {
        console.error('❌ Errors found:', errors);
      }
      
      expect(hasBody).toBe(true);
      expect(title).toBeTruthy();
      
    } catch (error: any) {
      console.error('❌ Failed to load page:', error.message);
      
      // Пробуем получить информацию об ошибке
      try {
        const pageInfo = await page.evaluate(() => {
          return {
            readyState: document.readyState,
            url: window.location.href,
            hasBody: !!document.body,
            scriptsCount: document.querySelectorAll('script').length
          };
        });
        console.log('Page info:', pageInfo);
      } catch (e) {
        console.error('Cannot get page info:', e);
      }
      
      throw error;
    }
  });
  
  test('Check for blocking scripts', async ({ page }) => {
    await page.goto('https://crypto-processing.net/', { 
      waitUntil: 'commit',
      timeout: 10000 
    });
    
    await page.waitForTimeout(1000);
    
    // Проверяем скрипты которые могут блокировать
    const scriptsInfo = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.map(s => ({
        src: s.src || 'inline',
        async: s.async,
        defer: s.defer,
        type: s.type
      }));
    });
    
    console.log('Scripts found:', scriptsInfo.length);
    scriptsInfo.forEach((s, i) => {
      if (i < 10) console.log(`  ${i + 1}. ${s.src.substring(0, 50)}...`);
    });
    
    // Проверяем что нет бесконечных циклов
    const hasInfiniteLoop = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        if (script.textContent) {
          const text = script.textContent;
          if (text.includes('while(true)') || 
              text.includes('for(;;)') ||
              text.includes('while (true)') ||
              text.includes('for (;;)')) {
            return true;
          }
        }
      }
      return false;
    });
    
    expect(hasInfiniteLoop).toBe(false);
  });
});

