import { test, expect } from '@playwright/test';

test.describe('Quick Blocking Check - Production Site', () => {
  test('Check what blocks interaction', async ({ page }) => {
    console.log('🔍 Starting diagnostic test...');
    
    await page.goto('https://crypto-processing.net/', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });

    console.log('✅ Page loaded');

    // Ждем инициализации
    await page.waitForTimeout(5000);

    // Диагностика: что блокирует взаимодействие
    const diagnostic = await page.evaluate(() => {
      const results: any = {
        blockingElements: [],
        styles: {},
        scripts: [],
        events: []
      };

      // 1. Проверка блокирующих элементов
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const computed = window.getComputedStyle(el);
        if (
          computed.pointerEvents === 'none' ||
          (computed.position === 'fixed' && parseInt(computed.zIndex || '0') > 100) ||
          computed.display === 'none'
        ) {
          // Игнорируем фоновые элементы
          if (computed.zIndex && parseInt(computed.zIndex) < 0) return;
          
          results.blockingElements.push({
            tag: el.tagName,
            id: el.id,
            class: el.className,
            pointerEvents: computed.pointerEvents,
            zIndex: computed.zIndex,
            position: computed.position,
            display: computed.display
          });
        }
      });

      // 2. Проверка стилей body
      const body = document.body;
      const bodyStyle = window.getComputedStyle(body);
      results.styles = {
        pointerEvents: bodyStyle.pointerEvents,
        userSelect: bodyStyle.userSelect,
        overflow: bodyStyle.overflow
      };

      // 3. Проверка псевдоэлементов через getComputedStyle (косвенно)
      const testDiv = document.createElement('div');
      testDiv.style.position = 'fixed';
      testDiv.style.top = '0';
      testDiv.style.left = '0';
      testDiv.style.width = '100%';
      testDiv.style.height = '100%';
      testDiv.style.pointerEvents = 'auto';
      testDiv.style.backgroundColor = 'rgba(255,0,0,0.1)';
      testDiv.id = 'test-overlay-check';
      document.body.appendChild(testDiv);
      
      const testStyle = window.getComputedStyle(testDiv);
      results.testOverlay = {
        pointerEvents: testStyle.pointerEvents,
        zIndex: testStyle.zIndex
      };
      
      // Пытаемся кликнуть через элемент
      let clickWorked = false;
      testDiv.addEventListener('click', () => { clickWorked = true; });
      testDiv.click();
      results.testOverlay.clickWorked = clickWorked;
      
      document.body.removeChild(testDiv);

      // 4. Проверка перехватчиков событий
      const testEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      document.body.dispatchEvent(testEvent);
      results.events.push({
        type: 'contextmenu',
        defaultPrevented: testEvent.defaultPrevented,
        bubbles: testEvent.bubbles
      });

      // 5. Проверка наличия overlay классов
      const overlaySelectors = ['.overlay', '.loading', '.loader', '[class*="overlay"]', '[class*="loading"]'];
      overlaySelectors.forEach(selector => {
        const els = document.querySelectorAll(selector);
        if (els.length > 0) {
          results.blockingElements.push({
            selector,
            count: els.length,
            firstElement: {
              tag: els[0].tagName,
              className: els[0].className,
              style: (els[0] as HTMLElement).style.cssText
            }
          });
        }
      });

      return results;
    });

    console.log('📊 Diagnostic results:', JSON.stringify(diagnostic, null, 2));

    // Тест: можем ли мы кликнуть?
    const canClick = await page.evaluate(() => {
      const btn = document.createElement('button');
      btn.textContent = 'Test Click';
      btn.style.position = 'fixed';
      btn.style.top = '10px';
      btn.style.left = '10px';
      btn.style.zIndex = '99999';
      btn.style.pointerEvents = 'auto';
      document.body.appendChild(btn);
      
      let clicked = false;
      btn.addEventListener('click', () => { clicked = true; });
      
      // Пытаемся кликнуть программно
      btn.click();
      
      // Также пытаемся через событие
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      btn.dispatchEvent(clickEvent);
      
      const result = clicked;
      document.body.removeChild(btn);
      return result;
    });

    console.log('🖱️ Can click element:', canClick);

    // Попытка реального клика
    try {
      await page.click('body', { timeout: 5000 });
      console.log('✅ Real click works');
    } catch (e: any) {
      console.error('❌ Real click failed:', e.message);
      throw new Error(`Page is blocked - cannot click: ${e.message}`);
    }

    // Проверка правой кнопки
    try {
      await page.click('body', { button: 'right', timeout: 5000 });
      console.log('✅ Right click works');
    } catch (e: any) {
      console.error('❌ Right click failed:', e.message);
      
      // Детальная диагностика
      const rightClickInfo = await page.evaluate(() => {
        const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
        document.body.dispatchEvent(event);
        return {
          defaultPrevented: event.defaultPrevented,
          cancelable: event.cancelable,
          bubbles: event.bubbles
        };
      });
      
      console.log('🖱️ Right click event info:', rightClickInfo);
      
      if (rightClickInfo.defaultPrevented) {
        throw new Error('Right click is prevented by JavaScript event handler');
      }
    }

    expect(canClick).toBe(true);
    expect(diagnostic.styles.pointerEvents).not.toBe('none');
  });
});

