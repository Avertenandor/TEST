#!/usr/bin/env python3
"""
Комплексная проверка модульного кабинета GENESIS
Следуя инструкциям: всегда используй MCP, расширенное тестирование,
проверка авторизации, тестирование консоли сайта
"""

import sys
from playwright.sync_api import sync_playwright, ConsoleMessage
import json
import time
from typing import List, Dict, Any, Union, Optional

def test_modular_cabinet_comprehensive() -> bool:
    """Полная проверка модульного кабинета GENESIS"""
    
    print("🔍 Начинаю комплексную проверку модульного кабинета GENESIS...")
    print("📋 Следую инструкциям: MCP + расширенное тестирование + проверка авторизации")
    
    # Инициализируем переменные по умолчанию
    architecture_results: Dict[str, bool] = {}
    auth_results: Dict[str, int] = {}
    all_nav_elements: List[Dict[str, Optional[str]]] = []
    bypass_results: Dict[str, Dict[str, Union[bool, str]]] = {}
    success_rate: float = 0.0
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, devtools=True)
        context = browser.new_context()
        page = context.new_page()
        
        # Включаем логирование консоли для полной картины
        console_logs: List[str] = []
        errors: List[str] = []
        
        def handle_console(msg: ConsoleMessage) -> None:
            console_logs.append(f"[{msg.type}] {msg.text}")
            print(f"📜 Console: [{msg.type.upper()}] {msg.text}")
            
        def handle_error(error: Exception) -> None:
            errors.append(str(error))
            print(f"❌ Error: {error}")
            
        page.on("console", handle_console)
        page.on("pageerror", handle_error)
        
        try:
            print("\n🎯 ЭТАП 1: Загрузка модульной версии")
            
            # Проверяем модульную версию app.html
            app_url = 'http://127.0.0.1:5502/app.html'
            print(f"🚀 Переход к модульной версии: {app_url}")
            
            page.goto(app_url)
            page.wait_for_timeout(5000)
            
            print("\n🔍 ЭТАП 2: Анализ архитектуры и загрузки")
            
            # Проверяем основные элементы архитектуры
            architecture_elements: Dict[str, str] = {
                'app_container': '#app',
                'router_container': '[data-router]',
                'navigation': 'nav, .navigation, .nav-menu',
                'main_content': 'main, .main-content, .content',
                'auth_overlay': '.auth-screen-overlay, .auth-screen, .overlay',
                'loading_screen': '.loading-screen, .loader, .spinner'
            }
            
            architecture_results: Dict[str, bool] = {}
            for name, selector in architecture_elements.items():
                exists = page.locator(selector).count() > 0
                architecture_results[name] = exists
                status = "✅" if exists else "❌"
                print(f"  {status} {name}: {exists}")
                
            print("\n🔐 ЭТАП 3: Анализ системы авторизации")
            
            # Проверяем элементы авторизации
            auth_elements: Dict[str, str] = {
                'auth_form': 'form[id*="auth"], .auth-form',
                'wallet_input': 'input[type="text"], input[placeholder*="0x"]',
                'auth_button': 'button[type="submit"], button:has-text("авторизац")',
                'system_address': 'input[readonly], .system-address',
                'access_address': '.access-address',
                'auth_instructions': '.auth-instruction, .instruction'
            }
            
            auth_results: Dict[str, int] = {}
            for name, selector in auth_elements.items():
                try:
                    elements = page.locator(selector)
                    count = elements.count()
                    auth_results[name] = count
                    print(f"  📍 {name}: {count} элементов")
                    
                    if count > 0 and name == 'wallet_input':
                        # Проверяем, можем ли заполнить поле
                        try:
                            elements.first.fill('0x1234567890123456789012345678901234567890')
                            print(f"    ✅ Поле {name} заполняется")
                        except:
                            print(f"    ⚠️ Поле {name} не заполняется")
                            
                except Exception as e:
                    auth_results[name] = 0
                    print(f"  ❌ {name}: ошибка - {e}")
            
            print("\n🧭 ЭТАП 4: Тестирование навигации")
            
            # Ищем навигационные элементы
            nav_selectors: List[str] = [
                '[data-route]',
                'nav a',
                '.nav-link',
                '.menu-item',
                'button[onclick*="navigate"]',
                'a[href*="#"]'
            ]
            
            all_nav_elements: List[Dict[str, Optional[str]]] = []
            for selector in nav_selectors:
                elements = page.locator(selector).all()
                for element in elements:
                    try:
                        text = element.text_content()
                        href = element.get_attribute('href') or element.get_attribute('data-route')
                        if text and (href or 'navigate' in (element.get_attribute('onclick') or '')):
                            all_nav_elements.append({
                                'text': text.strip(),
                                'href': href,
                                'selector': selector
                            })
                    except:
                        pass
            
            print(f"  📍 Найдено навигационных элементов: {len(all_nav_elements)}")
            for i, elem in enumerate(all_nav_elements[:10]):  # Показываем первые 10
                print(f"    {i+1}. '{elem['text']}' → {elem['href']}")
            
            if len(all_nav_elements) > 10:
                print(f"    ... и еще {len(all_nav_elements) - 10} элементов")
            
            print("\n🚪 ЭТАП 5: Попытка обхода авторизации")
            
            # Пробуем разные способы попасть в кабинет
            bypass_attempts: List[tuple[str, str]] = [
                ('Прямой переход к дашборду', 'http://127.0.0.1:5502/app.html#/dashboard'),
                ('Прямой переход к депозитам', 'http://127.0.0.1:5502/app.html#/deposits'),
                ('Прямой переход к портфелю', 'http://127.0.0.1:5502/app.html#/portfolio'),
                ('Прямой переход к "как все устроено"', 'http://127.0.0.1:5502/app.html#/how-it-works')
            ]
            
            bypass_results: Dict[str, Dict[str, Union[bool, str]]] = {}
            for attempt_name, url in bypass_attempts:
                print(f"  🎯 {attempt_name}: {url}")
                try:
                    page.goto(url)
                    page.wait_for_timeout(3000)
                    
                    # Проверяем, загрузился ли контент
                    content_indicators: List[str] = [
                        '.module-content',
                        '.tab-content',
                        '.dashboard-content',
                        '.deposits-content',
                        '.portfolio-content',
                        '.how-it-works-module'
                    ]
                    
                    content_found = False
                    for indicator in content_indicators:
                        if page.locator(indicator).count() > 0:
                            content_found = True
                            break
                    
                    # Проверяем, есть ли оверлей авторизации
                    auth_overlay_visible = page.locator('.auth-screen-overlay, .overlay').count() > 0
                    
                    bypass_results[attempt_name] = {
                        'content_found': content_found,
                        'auth_overlay': auth_overlay_visible,
                        'success': content_found and not auth_overlay_visible
                    }
                    
                    status = "✅" if bypass_results[attempt_name]['success'] else "❌"
                    print(f"    {status} Контент: {content_found}, Оверлей: {auth_overlay_visible}")
                    
                except Exception as e:
                    bypass_results[attempt_name] = {'error': str(e)}
                    print(f"    ❌ Ошибка: {e}")
            
            print("\n🧪 ЭТАП 6: Попытка авторизации")
            
            # Возвращаемся к основной странице и пробуем авторизоваться
            page.goto(app_url)
            page.wait_for_timeout(3000)
            
            # Ищем форму авторизации
            auth_form = page.locator('form, .auth-form').first
            if auth_form.count() > 0:
                print("  📝 Форма авторизации найдена, пробуем заполнить...")
                
                # Ищем поле для адреса
                address_input = page.locator('input[type="text"], input[placeholder*="0x"]').first
                if address_input.count() > 0:
                    test_address = '0x1234567890123456789012345678901234567890'
                    try:
                        address_input.fill(test_address)
                        print(f"  ✅ Адрес заполнен: {test_address}")
                        
                        # Ищем кнопку отправки
                        submit_button = page.locator('button[type="submit"], button:has-text("авторизац")').first
                        if submit_button.count() > 0:
                            print("  🚀 Попытка отправки формы...")
                            submit_button.click()
                            page.wait_for_timeout(5000)
                            
                            # Проверяем результат
                            success_indicators = [
                                '.dashboard, .cabinet-content',
                                '.success-message',
                                'main:not(.auth-screen)'
                            ]
                            
                            auth_success = any(page.locator(indicator).count() > 0 for indicator in success_indicators)
                            print(f"  {'✅' if auth_success else '❌'} Авторизация {'успешна' if auth_success else 'неудачна'}")
                        else:
                            print("  ⚠️ Кнопка отправки не найдена")
                    except Exception as e:
                        print(f"  ❌ Ошибка при заполнении: {e}")
                else:
                    print("  ⚠️ Поле для адреса не найдено")
            else:
                print("  ⚠️ Форма авторизации не найдена")
            
            print("\n📊 ЭТАП 7: Анализ консоли и ошибок")
            
            # Анализируем накопленные логи
            print(f"  📜 Всего сообщений консоли: {len(console_logs)}")
            print(f"  ❌ Всего ошибок: {len(errors)}")
            
            # Показываем критические ошибки
            critical_errors = [log for log in console_logs if 'error' in log.lower() or 'failed' in log.lower()]
            if critical_errors:
                print("  🚨 Критические ошибки:")
                for error in critical_errors[:5]:  # Первые 5
                    print(f"    - {error}")
            
            # Показываем предупреждения
            warnings = [log for log in console_logs if 'warn' in log.lower()]
            if warnings:
                print(f"  ⚠️ Предупреждения ({len(warnings)}):")
                for warning in warnings[:3]:  # Первые 3
                    print(f"    - {warning}")
            
            print("\n📋 ЭТАП 8: Итоговая оценка")
            
            # Подсчитываем общие результаты
            total_checks = len(architecture_results) + len(auth_results) + len(bypass_results)
            successful_checks = sum(1 for result in architecture_results.values() if result)
            successful_checks += sum(1 for result in auth_results.values() if result > 0)
            successful_checks += sum(1 for result in bypass_results.values() if result.get('success', False))
            
            success_rate = (successful_checks / total_checks) * 100 if total_checks > 0 else 0
            
            print(f"  📊 Общий успех: {successful_checks}/{total_checks} ({success_rate:.1f}%)")
            print(f"  🧭 Навигация: {len(all_nav_elements)} элементов")
            print(f"  🔐 Авторизация: {'Настроена' if sum(auth_results.values()) > 3 else 'Требует настройки'}")
            print(f"  🏗️ Архитектура: {'Модульная' if architecture_results.get('app_container') else 'Неопределена'}")
            
            # Рекомендации
            print("\n💡 РЕКОМЕНДАЦИИ:")
            
            if not any(result.get('success', False) for result in bypass_results.values()):
                print("  🔑 Настроить тестовую авторизацию или режим разработки")
            
            if len(all_nav_elements) < 10:
                print("  🧭 Проверить систему навигации и роутинг")
            
            critical_errors = [log for log in console_logs if 'error' in log.lower() or 'failed' in log.lower()]
            if len(critical_errors) > 0:
                print("  🚨 Исправить критические ошибки в консоли")
            
            if success_rate < 70:
                print("  ⚙️ Требуется доработка модульной архитектуры")
            else:
                print("  ✅ Модульная архитектура работает корректно")
            
            return success_rate > 70
            
        except Exception as e:
            print(f"❌ Критическая ошибка при тестировании: {e}")
            return False
        finally:
            # Сохраняем детальные логи для анализа
            test_results: Dict[str, Any] = {
                'timestamp': time.time(),
                'architecture': architecture_results,
                'auth_elements': auth_results,
                'navigation_count': len(all_nav_elements),
                'bypass_attempts': bypass_results,
                'console_logs': console_logs[-20:],  # Последние 20 логов
                'errors': errors,
                'success_rate': success_rate
            }
            
            # Сохраняем в MCP память
            try:
                with open('modular_cabinet_test_results.json', 'w', encoding='utf-8') as f:
                    json.dump(test_results, f, ensure_ascii=False, indent=2)
                print(f"\n💾 Результаты сохранены в modular_cabinet_test_results.json")
            except:
                pass
            
            browser.close()

if __name__ == "__main__":
    success = test_modular_cabinet_comprehensive()
    sys.exit(0 if success else 1)
