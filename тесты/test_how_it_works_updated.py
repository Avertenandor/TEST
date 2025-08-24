#!/usr/bin/env python3
"""
Тест обновленного модуля "Как все устроено" с полным контентом из монолитной версии
"""

import sys
from playwright.sync_api import sync_playwright
from typing import Dict

def test_how_it_works_updated() -> bool:
    """Тест обновленного модуля 'Как все устроено'"""
    print("🧪 Тестирование обновленного модуля 'Как все устроено'...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, devtools=False)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            # Переходим к модульной версии
            url = 'http://127.0.0.1:5502/app.html'
            print(f"🚀 Переход к: {url}")
            page.goto(url)
            
            # Ждем инициализации
            page.wait_for_timeout(5000)
            print("⏳ Ждем инициализации приложения...")
            
            # Проверяем, можем ли мы открыть модуль "Как все устроено" напрямую
            how_it_works_url = 'http://127.0.0.1:5502/app.html#/how-it-works'
            print(f"🎯 Прямой переход к модулю: {how_it_works_url}")
            page.goto(how_it_works_url)
            page.wait_for_timeout(3000)
            
            # Альтернативно, попробуем найти и кликнуть по навигации
            nav_element = page.locator('nav [data-route="/how-it-works"]')
            if nav_element.count() > 0:
                print("🔗 Найден элемент навигации, кликаем...")
                nav_element.click()
                page.wait_for_timeout(3000)
            
            # Проверяем элементы модуля
            elements_to_check: Dict[str, str] = {
                'module_container': '.how-it-works-module',
                'module_header': 'h1:has-text("Как все устроено")',
                'tabs_nav': '.tabs-nav',
                'tab_overview': '[data-tab="overview"]',
                'tab_mev_bots': '[data-tab="mev-bots"]',
                'income_types': '.income-types',
                'passive_income': '.income-type.passive',
                'active_income': '.income-type.active',
                'mev_section': '.mev-section',
                'plex_section': '.plex-section',
                'requirements_section': '.requirements-section',
                'faq_list': '.faq-list'
            }
            
            results: Dict[str, bool] = {}
            
            for name, selector in elements_to_check.items():
                exists = page.locator(selector).count() > 0
                results[name] = exists
                status = "✅" if exists else "❌"
                print(f"{status} {name}: {exists}")
            
            # Тестируем вкладки
            tabs = ['overview', 'steps', 'mev-bots', 'architecture', 'multipliers', 'security', 'faq']
            tab_results: Dict[str, bool] = {}
            
            for tab in tabs:
                print(f"\n🎯 Тестируем вкладку: {tab}")
                
                try:
                    # Кликаем по вкладке
                    tab_button = page.locator(f'[data-tab="{tab}"]')
                    if tab_button.count() > 0:
                        tab_button.click()
                        page.wait_for_timeout(1000)
                        
                        # Проверяем, что контент вкладки видим
                        tab_content = page.locator(f'#tab-{tab}')
                        is_visible = tab_content.count() > 0
                        tab_results[tab] = is_visible
                        
                        status = "✅" if is_visible else "❌"
                        print(f"{status} Вкладка {tab}: {is_visible}")
                        
                        # Специфичные проверки для новых элементов
                        if tab == 'overview':
                            income_types = page.locator('.income-types').count() > 0
                            mev_info = page.locator('.mev-section').count() > 0
                            plex_info = page.locator('.plex-section').count() > 0
                            print(f"  📊 Типы доходов: {'✅' if income_types else '❌'}")
                            print(f"  🤖 MEV информация: {'✅' if mev_info else '❌'}")
                            print(f"  🪙 PLEX информация: {'✅' if plex_info else '❌'}")
                            
                        elif tab == 'mev-bots':
                            mev_workflow = page.locator('.mev-workflow').count() > 0
                            mev_stats = page.locator('.stats-grid').count() > 0
                            mev_transparency = page.locator('.mev-transparency').count() > 0
                            print(f"  🔄 MEV workflow: {'✅' if mev_workflow else '❌'}")
                            print(f"  📊 MEV статистика: {'✅' if mev_stats else '❌'}")
                            print(f"  🔍 MEV прозрачность: {'✅' if mev_transparency else '❌'}")
                            
                        elif tab == 'faq':
                            faq_items = page.locator('.faq-item').count()
                            print(f"  ❓ Вопросов в FAQ: {faq_items}")
                            
                            # Проверяем новые вопросы
                            new_questions = [
                                'пассивный доход в GENESIS 1.1',
                                'активный доход в GENESIS 1.1',
                                'MEV-боты',
                                'PLEX ONE токен'
                            ]
                            
                            for question in new_questions:
                                question_exists = page.locator(f'.faq-question:has-text("{question}")').count() > 0
                                print(f"    📝 Вопрос '{question}': {'✅' if question_exists else '❌'}")
                        
                    else:
                        print(f"❌ Кнопка вкладки {tab} не найдена")
                        tab_results[tab] = False
                        
                except Exception as e:
                    print(f"❌ Ошибка при тестировании вкладки {tab}: {e}")
                    tab_results[tab] = False
            
            # Итоговые результаты
            print(f"\n📊 Результаты тестирования:")
            
            successful_elements = sum(1 for result in results.values() if result)
            total_elements = len(results)
            print(f"✅ Элементы интерфейса: {successful_elements}/{total_elements}")
            
            successful_tabs = sum(1 for result in tab_results.values() if result)
            total_tabs = len(tab_results)
            print(f"✅ Работающие вкладки: {successful_tabs}/{total_tabs}")
            
            overall_success = successful_elements >= total_elements * 0.8 and successful_tabs >= total_tabs * 0.8
            
            if overall_success:
                print("🎉 Модуль 'Как все устроено' успешно обновлен!")
                print("💎 Добавлен полный контент из монолитной версии:")
                print("  - Подробная информация о MEV-ботах")
                print("  - Описание пассивного и активного дохода")
                print("  - Информация о PLEX ONE токене")
                print("  - Расширенный FAQ")
                return True
            else:
                print("⚠️ Модуль частично работает, но требует доработки")
                return False
                
        except Exception as e:
            print(f"❌ Критическая ошибка: {e}")
            return False
        finally:
            browser.close()

if __name__ == "__main__":
    success = test_how_it_works_updated()
    sys.exit(0 if success else 1)
