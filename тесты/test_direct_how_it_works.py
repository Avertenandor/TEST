#!/usr/bin/env python3
"""
Тест прямого доступа к модулю "Как все устроено"
"""

import sys
from playwright.sync_api import sync_playwright, ConsoleMessage
from typing import List

def test_direct_how_it_works_access() -> bool:
    """Тест прямого доступа к модулю через правильный URL"""
    print("🧪 Тестирование прямого доступа к модулю 'Как все устроено'...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, devtools=True)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            # Правильный URL для модульной версии с хеш-роутингом
            correct_url = 'http://127.0.0.1:5502/app.html#/how-it-works'
            print(f"🎯 Переход к правильному URL: {correct_url}")
            
            page.goto(correct_url)
            
            # Ждем инициализации
            print("⏳ Ждем инициализации приложения...")
            page.wait_for_timeout(5000)
            
            # Проверяем консольные ошибки
            console_messages: List[str] = []
            def handle_console(msg: ConsoleMessage) -> None:
                console_messages.append(f"{msg.type}: {msg.text}")
                print(f"🖥️ CONSOLE [{msg.type.upper()}]: {msg.text}")
            
            page.on('console', handle_console)
            
            # Ждем еще немного для загрузки модуля
            page.wait_for_timeout(3000)
            
            # Проверяем, загрузился ли модуль
            module_container = page.locator('.how-it-works-module')
            module_exists = module_container.count() > 0
            
            print(f"📦 Модуль загружен: {'✅' if module_exists else '❌'}")
            
            if module_exists:
                # Проверяем основные элементы
                elements_check = {
                    'header': 'h1:has-text("Как все устроено")',
                    'tabs': '.tabs-nav',
                    'overview_tab': '[data-tab="overview"]',
                    'mev_tab': '[data-tab="mev-bots"]',
                    'content': '.tabs-content'
                }
                
                for name, selector in elements_check.items():
                    exists = page.locator(selector).count() > 0
                    status = "✅" if exists else "❌"
                    print(f"{status} {name}: {exists}")
                
                # Проверяем новый контент
                new_content_check = {
                    'income_types': '.income-types',
                    'mev_section': '.mev-section', 
                    'plex_section': '.plex-section',
                    'requirements': '.requirements-section'
                }
                
                print("\n🔍 Проверка нового контента:")
                for name, selector in new_content_check.items():
                    exists = page.locator(selector).count() > 0
                    status = "✅" if exists else "❌"
                    print(f"{status} {name}: {exists}")
                    
                # Тестируем переключение на вкладку MEV-боты
                print("\n🤖 Тестируем вкладку MEV-боты:")
                mev_tab = page.locator('[data-tab="mev-bots"]')
                if mev_tab.count() > 0:
                    mev_tab.click()
                    page.wait_for_timeout(1000)
                    
                    mev_content = page.locator('#tab-mev-bots')
                    mev_visible = mev_content.count() > 0
                    print(f"✅ MEV вкладка отображается: {mev_visible}")
                    
                    if mev_visible:
                        # Проверяем специфичный контент MEV
                        mev_elements = {
                            'workflow': '.mev-workflow',
                            'stats': '.stats-grid',
                            'transparency': '.mev-transparency'
                        }
                        
                        for name, selector in mev_elements.items():
                            exists = page.locator(selector).count() > 0
                            print(f"  📊 {name}: {'✅' if exists else '❌'}")
                else:
                    print("❌ MEV вкладка не найдена")
                
                return True
                
            else:
                print("❌ Модуль не загрузился")
                
                # Проверяем ошибки в консоли
                if console_messages:
                    print("\n🔍 Ошибки в консоли:")
                    for msg in console_messages:
                        print(f"  {msg}")
                
                return False
                
        except Exception as e:
            print(f"❌ Критическая ошибка: {e}")
            return False
        finally:
            # Небольшая пауза для просмотра результата
            page.wait_for_timeout(5000)
            browser.close()

if __name__ == "__main__":
    success = test_direct_how_it_works_access()
    if success:
        print("\n🎉 Модуль 'Как все устроено' работает корректно!")
    else:
        print("\n⚠️ Обнаружены проблемы с модулем")
    
    sys.exit(0 if success else 1)
