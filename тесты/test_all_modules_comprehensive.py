#!/usr/bin/env python3
"""
Комплексная проверка всех разделов модульной версии GENESIS
Сравнение с монолитом и проверка работоспособности через консоль
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class GenesisModulesComprehensiveTest:
    def __init__(self):
        self.setup_driver()
        self.test_results = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "modules_tested": [],
            "comparison_results": {},
            "console_errors": [],
            "missing_features": [],
            "working_features": [],
            "overall_score": 0
        }
        
        # Список всех модулей для проверки
        self.modules_to_test = [
            ("dashboard", "Панель управления", "📊"),
            ("deposits", "Депозиты", "💰"),
            ("portfolio", "Портфель", "💼"),
            ("transactions", "Транзакции", "📋"),
            ("analytics", "Аналитика", "📈"),
            ("bonuses", "Бонусы", "🎁"),
            ("gifts", "Подарки", "🎈"),
            ("referrals", "Рефералы", "👥"),
            ("multipliers", "Множители", "⚡"),
            ("mining-rent", "Аренда майнинга", "⛏️"),
            ("device", "Устройство", "🔧"),
            ("plex-coin", "PLEX Coin", "🪙"),
            ("experience", "Опыт", "🌟"),
            ("rank", "Ранг", "🏆"),
            ("settings", "Настройки", "⚙️"),
            ("terminal", "Терминал", "💻"),
            ("platform-access", "Доступ к платформе", "🔐"),
            ("how-it-works", "Как все устроено", "🛠️")
        ]

    def setup_driver(self):
        """Настройка браузера"""
        options = Options()
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument('--disable-web-security')
        options.add_argument('--allow-running-insecure-content')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-extensions')
        options.add_argument('--window-size=1920,1080')
        
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 15)
        
        # Скрываем webdriver
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    def get_console_logs(self):
        """Получение логов консоли"""
        try:
            logs = self.driver.get_log('browser')
            return [log for log in logs if log['level'] in ['SEVERE', 'WARNING']]
        except:
            return []

    def authenticate(self):
        """Авторизация в системе"""
        print("🔐 Проводим авторизацию...")
        
        # Переходим к модульной версии
        self.driver.get("http://127.0.0.1:5502/app.html")
        time.sleep(3)
        
        try:
            # Ждем загрузки формы авторизации
            wallet_input = self.wait.until(
                EC.presence_of_element_located((By.ID, "wallet_input"))
            )
            
            # Заполняем адрес
            test_address = "0x1234567890123456789012345678901234567890"
            wallet_input.clear()
            wallet_input.send_keys(test_address)
            time.sleep(1)
            
            # Нажимаем кнопку авторизации
            auth_button = self.driver.find_element(By.ID, "auth_button")
            auth_button.click()
            
            # Ждем успешной авторизации
            self.wait.until(
                EC.presence_of_element_located((By.ID, "main_content"))
            )
            
            print("✅ Авторизация успешна")
            return True
            
        except Exception as e:
            print(f"❌ Ошибка авторизации: {e}")
            return False

    def test_module_navigation(self, module_path, module_name, icon):
        """Тестирование навигации к модулю"""
        print(f"\n🧭 Тестируем навигацию к модулю: {icon} {module_name}")
        
        # Переходим по прямой ссылке
        module_url = f"http://127.0.0.1:5502/app.html#{module_path}"
        self.driver.get(module_url)
        time.sleep(3)
        
        # Проверяем консоль на ошибки
        console_errors = self.get_console_logs()
        if console_errors:
            critical_errors = [err for err in console_errors if err['level'] == 'SEVERE']
            if critical_errors:
                print(f"❌ Критические ошибки в консоли: {len(critical_errors)}")
                for error in critical_errors[:3]:  # Показываем только первые 3
                    print(f"   - {error['message']}")
                return False
        
        # Проверяем наличие контента
        try:
            # Ищем основной контейнер модуля
            main_content = self.driver.find_element(By.ID, "main_content")
            if main_content.is_displayed():
                print(f"✅ Модуль {module_name} загружен успешно")
                return True
            else:
                print(f"❌ Контент модуля {module_name} не отображается")
                return False
        except NoSuchElementException:
            print(f"❌ Основной контейнер модуля {module_name} не найден")
            return False

    def analyze_module_content(self, module_path, module_name):
        """Анализ содержимого модуля"""
        print(f"🔍 Анализируем содержимое модуля: {module_name}")
        
        content_analysis = {
            "has_title": False,
            "has_navigation": False,
            "has_data_display": False,
            "has_interactive_elements": False,
            "error_count": 0,
            "missing_elements": []
        }
        
        try:
            # Проверяем заголовок
            titles = self.driver.find_elements(By.CSS_SELECTOR, "h1, h2, .page-title, .module-title")
            if titles:
                content_analysis["has_title"] = True
                print(f"  ✅ Заголовок найден: {titles[0].text}")
            else:
                content_analysis["missing_elements"].append("Заголовок страницы")
            
            # Проверяем навигацию
            nav_elements = self.driver.find_elements(By.CSS_SELECTOR, "nav, .navigation, .nav-menu, .sidebar")
            if nav_elements:
                content_analysis["has_navigation"] = True
                print(f"  ✅ Навигация найдена")
            else:
                content_analysis["missing_elements"].append("Навигационные элементы")
            
            # Проверяем отображение данных
            data_elements = self.driver.find_elements(By.CSS_SELECTOR, 
                ".data-card, .info-card, .stat-card, .balance-card, table, .chart, .graph")
            if data_elements:
                content_analysis["has_data_display"] = True
                print(f"  ✅ Элементы отображения данных найдены: {len(data_elements)}")
            else:
                content_analysis["missing_elements"].append("Элементы отображения данных")
            
            # Проверяем интерактивные элементы
            interactive_elements = self.driver.find_elements(By.CSS_SELECTOR, 
                "button, input, select, .btn, .interactive, .clickable")
            if interactive_elements:
                content_analysis["has_interactive_elements"] = True
                print(f"  ✅ Интерактивные элементы найдены: {len(interactive_elements)}")
            else:
                content_analysis["missing_elements"].append("Интерактивные элементы")
            
            # Считаем консольные ошибки
            console_errors = self.get_console_logs()
            content_analysis["error_count"] = len([err for err in console_errors if err['level'] == 'SEVERE'])
            
        except Exception as e:
            print(f"  ❌ Ошибка анализа содержимого: {e}")
            content_analysis["error_count"] += 1
        
        return content_analysis

    def compare_with_cabinet(self, module_path, module_name):
        """Сравнение с соответствующим разделом в cabinet.html"""
        print(f"📊 Сравниваем с разделом в cabinet.html: {module_name}")
        
        # Переходим к cabinet.html для сравнения
        cabinet_url = "http://127.0.0.1:5502/cabinet.html"
        original_url = self.driver.current_url
        
        comparison_result = {
            "cabinet_accessible": False,
            "similar_content": False,
            "feature_parity": 0,  # процент схожести функций
            "notes": []
        }
        
        try:
            # Сохраняем снимок модульной версии
            module_text = self.driver.find_element(By.TAG_NAME, "body").text
            module_elements = len(self.driver.find_elements(By.CSS_SELECTOR, "*"))
            
            # Переходим к cabinet.html
            self.driver.get(cabinet_url)
            time.sleep(2)
            
            # Проверяем доступность cabinet.html
            try:
                cabinet_body = self.driver.find_element(By.TAG_NAME, "body")
                if cabinet_body:
                    comparison_result["cabinet_accessible"] = True
                    cabinet_text = cabinet_body.text
                    cabinet_elements = len(self.driver.find_elements(By.CSS_SELECTOR, "*"))
                    
                    # Простое сравнение по количеству элементов
                    if cabinet_elements > 0:
                        similarity = min(module_elements / cabinet_elements * 100, 100)
                        comparison_result["feature_parity"] = round(similarity, 1)
                        
                        if similarity > 70:
                            comparison_result["similar_content"] = True
                            comparison_result["notes"].append("Высокая схожесть содержимого")
                        elif similarity > 40:
                            comparison_result["notes"].append("Средняя схожесть содержимого")
                        else:
                            comparison_result["notes"].append("Низкая схожесть содержимого")
                    
            except Exception as e:
                comparison_result["notes"].append(f"Ошибка доступа к cabinet.html: {e}")
            
            # Возвращаемся к модульной версии
            self.driver.get(original_url)
            time.sleep(2)
            
        except Exception as e:
            comparison_result["notes"].append(f"Ошибка сравнения: {e}")
        
        return comparison_result

    def test_all_modules(self):
        """Тестирование всех модулей"""
        print("🚀 Начинаем комплексное тестирование всех модулей GENESIS")
        print("=" * 70)
        
        # Авторизация
        if not self.authenticate():
            print("❌ Не удалось авторизоваться. Завершаем тестирование.")
            return
        
        total_modules = len(self.modules_to_test)
        successful_tests = 0
        
        for i, (module_path, module_name, icon) in enumerate(self.modules_to_test, 1):
            print(f"\n📋 Модуль {i}/{total_modules}: {icon} {module_name}")
            print("-" * 50)
            
            module_result = {
                "path": module_path,
                "name": module_name,
                "icon": icon,
                "navigation_success": False,
                "content_analysis": {},
                "cabinet_comparison": {},
                "overall_success": False
            }
            
            # Тест навигации
            if self.test_module_navigation(module_path, module_name, icon):
                module_result["navigation_success"] = True
                
                # Анализ содержимого
                module_result["content_analysis"] = self.analyze_module_content(module_path, module_name)
                
                # Сравнение с cabinet.html
                module_result["cabinet_comparison"] = self.compare_with_cabinet(module_path, module_name)
                
                # Определяем общий успех
                content_score = sum([
                    module_result["content_analysis"].get("has_title", False),
                    module_result["content_analysis"].get("has_navigation", False),
                    module_result["content_analysis"].get("has_data_display", False),
                    module_result["content_analysis"].get("has_interactive_elements", False),
                    module_result["content_analysis"].get("error_count", 10) == 0
                ])
                
                if content_score >= 3:  # Минимум 3 из 5 критериев
                    module_result["overall_success"] = True
                    successful_tests += 1
                    self.test_results["working_features"].append(f"{icon} {module_name}")
                else:
                    self.test_results["missing_features"].extend(
                        module_result["content_analysis"].get("missing_elements", [])
                    )
            
            self.test_results["modules_tested"].append(module_result)
            
            # Краткий отчет по модулю
            if module_result["overall_success"]:
                print(f"✅ Модуль {module_name} работает корректно")
            else:
                print(f"❌ Модуль {module_name} требует доработки")
            
            time.sleep(1)  # Пауза между тестами
        
        # Подсчет общего результата
        self.test_results["overall_score"] = round((successful_tests / total_modules) * 100, 1)
        
        print("\n" + "=" * 70)
        print("📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ КОМПЛЕКСНОГО ТЕСТИРОВАНИЯ")
        print("=" * 70)
        print(f"🎯 Общий успех: {successful_tests}/{total_modules} ({self.test_results['overall_score']}%)")
        print(f"✅ Работающих модулей: {successful_tests}")
        print(f"❌ Требующих доработки: {total_modules - successful_tests}")
        
        if self.test_results["working_features"]:
            print(f"\n✅ Успешно работающие разделы:")
            for feature in self.test_results["working_features"]:
                print(f"   - {feature}")
        
        if self.test_results["missing_features"]:
            print(f"\n❌ Отсутствующие элементы:")
            unique_missing = list(set(self.test_results["missing_features"]))
            for missing in unique_missing[:10]:  # Показываем только первые 10
                print(f"   - {missing}")

    def save_results(self):
        """Сохранение результатов тестирования"""
        filename = "comprehensive_modules_test_results.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, ensure_ascii=False, indent=2)
        print(f"\n💾 Результаты сохранены в {filename}")

    def cleanup(self):
        """Очистка ресурсов"""
        if hasattr(self, 'driver'):
            self.driver.quit()

def main():
    tester = GenesisModulesComprehensiveTest()
    try:
        tester.test_all_modules()
        tester.save_results()
    except KeyboardInterrupt:
        print("\n⏹️ Тестирование прервано пользователем")
    except Exception as e:
        print(f"\n❌ Критическая ошибка: {e}")
    finally:
        tester.cleanup()

if __name__ == "__main__":
    main()
