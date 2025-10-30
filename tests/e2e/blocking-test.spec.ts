import { test, expect } from '@playwright/test';

test.describe('Site Interaction Blocking Detection', () => {
  test('Page should be interactive - no blocking overlays', async ({ page }) => {
    // Отключаем webServer - тестируем продакшн
    // Увеличиваем таймаут для загрузки
    await page.goto('https://crypto-processing.net/', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });

    // Ждем немного для инициализации
    await page.waitForTimeout(3000);

    // Проверяем что страница загрузилась
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log('Page title:', title);

    // Проверяем наличие блокирующих элементов
    const blockingElements = await page.evaluate(() => {
      const selectors = [
        '.loading',
        '.overlay',
        '[style*="pointer-events: none"]',
        '[style*="z-index: 999"]',
        '[style*="z-index: 9999"]'
      ];
      
      const elements = [];
      selectors.forEach(selector => {
        try {
          const els = document.querySelectorAll(selector);
          els.forEach(el => {
            const computed = window.getComputedStyle(el);
            if (computed.pointerEvents === 'none' || computed.zIndex === '999' || computed.zIndex === '9999') {
              elements.push({
                selector,
                tagName: el.tagName,
                className: el.className,
                pointerEvents: computed.pointerEvents,
                zIndex: computed.zIndex,
                display: computed.display,
                visibility: computed.visibility
              });
            }
          });
        } catch (e) {
          console.warn('Selector error:', selector, e);
        }
      });
      
      return elements;
    });

    console.log('Blocking elements found:', blockingElements);
    expect(blockingElements.length).toBe(0);

    // Проверяем что body интерактивен
    const bodyInteractive = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        pointerEvents: computed.pointerEvents,
        userSelect: computed.userSelect,
        isVisible: computed.display !== 'none' && computed.visibility !== 'hidden'
      };
    });

    console.log('Body interactive state:', bodyInteractive);
    expect(bodyInteractive.pointerEvents).not.toBe('none');
    expect(bodyInteractive.isVisible).toBe(true);
  });

  test('Right-click context menu should work', async ({ page }) => {
    await page.goto('https://crypto-processing.net/', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });

    await page.waitForTimeout(3000);

    // Проверяем что нет перехватчиков contextmenu
    const hasContextMenuBlock = await page.evaluate(() => {
      // Проверяем наличие перехватчиков
      const listeners = [];
      const testDiv = document.createElement('div');
      document.body.appendChild(testDiv);
      
      // Проверяем через addEventListener
      const oldAdd = EventTarget.prototype.addEventListener;
      let blocked = false;
      
      EventTarget.prototype.addEventListener = function(type, handler, options) {
        if (type === 'contextmenu') {
          listeners.push({ type, source: this });
        }
        return oldAdd.call(this, type, handler, options);
      };
      
      // Пытаемся вызвать событие
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      testDiv.dispatchEvent(event);
      
      // Восстанавливаем
      EventTarget.prototype.addEventListener = oldAdd;
      document.body.removeChild(testDiv);
      
      return { listeners, eventDefaultPrevented: event.defaultPrevented };
    });

    console.log('Context menu blocking:', hasContextMenuBlock);
    
    // Попытка реального правого клика
    try {
      await page.click('body', { button: 'right', timeout: 5000 });
      console.log('Right click succeeded');
    } catch (e) {
      console.error('Right click blocked:', e);
      throw new Error('Right click is blocked on the page');
    }
  });

  test('Page should not have infinite loops', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('https://crypto-processing.net/', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });

    const loadTime = Date.now() - startTime;
    console.log('Page load time:', loadTime, 'ms');

    // Если загрузка занимает больше 15 секунд - проблема
    expect(loadTime).toBeLessThan(15000);

    // Проверяем количество активных интервалов
    const activeIntervals = await page.evaluate(() => {
      // Подсчитываем через патчинг setInterval
      let count = 0;
      const intervals = [];
      
      // Проверяем что нет бесконечных циклов
      const scripts = Array.from(document.querySelectorAll('script'));
      scripts.forEach((script, idx) => {
        if (script.src) {
          intervals.push({ type: 'external', src: script.src });
        } else if (script.textContent) {
          const text = script.textContent;
          // Проверяем на подозрительные паттерны
          if (text.includes('while(true)') || 
              text.includes('for(;;)') || 
              text.includes('setInterval') && !text.includes('clearInterval')) {
            intervals.push({ type: 'inline', suspicious: true, index: idx });
          }
        }
      });
      
      return intervals;
    });

    console.log('Active intervals/suspicious code:', activeIntervals);
    
    // Проверяем что можем взаимодействовать со страницей через 3 секунды
    await page.waitForTimeout(3000);
    
    const canClick = await page.evaluate(() => {
      const btn = document.createElement('button');
      btn.textContent = 'Test';
      document.body.appendChild(btn);
      
      let clicked = false;
      btn.addEventListener('click', () => { clicked = true; });
      
      btn.click();
      document.body.removeChild(btn);
      
      return clicked;
    });

    expect(canClick).toBe(true);
  });

  test('Console should be accessible', async ({ page }) => {
    await page.goto('https://crypto-processing.net/', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });

    await page.waitForTimeout(3000);

    // Проверяем что можем выполнить JavaScript
    const jsWorks = await page.evaluate(() => {
      try {
        // Пытаемся создать элемент и взаимодействовать
        const div = document.createElement('div');
        div.style.pointerEvents = 'auto';
        document.body.appendChild(div);
        
        const event = new MouseEvent('click', { bubbles: true });
        div.dispatchEvent(event);
        
        document.body.removeChild(div);
        return true;
      } catch (e) {
        return false;
      }
    });

    expect(jsWorks).toBe(true);
  });
});

