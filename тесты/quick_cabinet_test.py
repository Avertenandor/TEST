#!/usr/bin/env python3
"""
GENESIS Modular Cabinet - Quick Test with MCP
Быстрый тест модульного кабинета с принудительной авторизацией
"""

import asyncio
from typing import List, Tuple
from playwright.async_api import async_playwright

async def test_modular_cabinet_quick():
    """Быстрый тест модульного кабинета с принудительной авторизацией"""
    
    print("🚀 БЫСТРЫЙ ТЕСТ МОДУЛЬНОГО КАБИНЕТА GENESIS")
    print("=" * 60)
    
    try:
        async with async_playwright() as p:
            # Запускаем браузер
            browser = await p.chromium.launch(headless=False, slow_mo=1000)
            page = await browser.new_page()
            
            # Переходим к модульной версии
            print("🌐 Загружаю модульную версию...")
            await page.goto("http://127.0.0.1:5502/app.html", wait_until="domcontentloaded")
            await page.wait_for_timeout(3000)
            
            # Ищем тестовую кнопку авторизации
            print("🔧 Ищу тестовую кнопку авторизации...")
            test_btn = page.locator("#test-auth-button")
            
            if await test_btn.count() > 0:
                print("✅ Тестовая кнопка найдена! Кликаю...")
                await test_btn.click()
                await page.wait_for_timeout(2000)
            else:
                print("❌ Тестовая кнопка не найдена, пробую обычную авторизацию...")
                # Пробуем заполнить форму авторизации
                address_input = page.locator("#wallet-address")
                if await address_input.count() > 0:
                    await address_input.fill("0x1234567890123456789012345678901234567890")
                    auth_btn = page.locator("#auth-button")
                    await auth_btn.click()
                    await page.wait_for_timeout(3000)
            
            # Проверяем исчез ли overlay
            print("🔍 Проверяю auth-screen-overlay...")
            overlay = page.locator(".auth-screen-overlay")
            overlay_count = await overlay.count()
            
            if overlay_count == 0:
                print("✅ Auth overlay скрыт!")
            else:
                print(f"❌ Auth overlay всё ещё виден (count: {overlay_count})")
                # Пробуем скрыть принудительно
                await page.evaluate("document.querySelector('.auth-module-container').style.display = 'none'")
                print("🔧 Принудительно скрыл auth container")
            
            # Тестируем навигацию по модулям
            modules_to_test: List[Tuple[str, str]] = [
                ("/deposits", "Депозиты"),
                ("/portfolio", "Портфель"), 
                ("/bonuses", "Бонусы")
            ]
            
            results: List[Tuple[str, str]] = []
            
            for route, name in modules_to_test:
                print(f"\n🔍 Тестирую модуль: {name} ({route})")
                
                try:
                    # Пробуем кликнуть по навигации
                    nav_link = page.locator(f"[data-route='{route}']").first
                    
                    if await nav_link.count() > 0:
                        print(f"  📍 Найдена навигация для {name}")
                        await nav_link.click()
                        await page.wait_for_timeout(2000)
                        
                        # Проверяем загрузился ли модуль
                        content = await page.inner_text("main")
                        if route.replace("/", "") in content.lower() or name.lower() in content.lower():
                            print(f"  ✅ Модуль {name} загружен успешно!")
                            results.append((name, "✅ Работает"))
                        else:
                            print(f"  ⚠️ Модуль {name} загружен, но контент неясен")
                            results.append((name, "⚠️ Частично"))
                    else:
                        print(f"  ❌ Навигация для {name} не найдена")
                        results.append((name, "❌ Не найден"))
                        
                except Exception as e:
                    print(f"  ❌ Ошибка при тестировании {name}: {e}")
                    results.append((name, f"❌ Ошибка: {str(e)[:50]}"))
            
            # Выводим результаты
            print("\n" + "=" * 60)
            print("📊 РЕЗУЛЬТАТЫ БЫСТРОГО ТЕСТА:")
            print("=" * 60)
            
            for name, status in results:
                print(f"{status:15} | {name}")
            
            working = len([r for r in results if "✅" in r[1]])
            total = len(results)
            
            print(f"\n📈 Статистика: {working}/{total} модулей работают")
            
            if working == total:
                print("🎉 ВСЕ МОДУЛИ РАБОТАЮТ!")
            elif working > 0:
                print("⚠️ ЧАСТИЧНО РАБОТАЕТ - требуется доработка")
            else:
                print("❌ КРИТИЧЕСКИЕ ПРОБЛЕМЫ - кабинет не функционирует")
            
            await browser.close()
            
    except Exception as e:
        print(f"💥 КРИТИЧЕСКАЯ ОШИБКА: {e}")

if __name__ == "__main__":
    asyncio.run(test_modular_cabinet_quick())
