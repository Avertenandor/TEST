#!/usr/bin/env python3
"""
Проверка работоспособности модулей через консоль браузера
Тест навигации и загрузки содержимого
"""

import requests
import time
import json
from pathlib import Path
from typing import Dict, List, Any, Tuple

class GenesisModulesRealTest:
    def __init__(self) -> None:
        self.base_url: str = "http://127.0.0.1:5502"
        self.modules_path: Path = Path(__file__).parent.parent / "modules"
        
        self.test_results: Dict[str, Any] = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "modules_tested": [],
            "working_modules": [],
            "broken_modules": [],
            "missing_templates": [],
            "console_test_results": [],
            "overall_health": 0
        }
        
        # Модули для тестирования
        self.modules_to_test: List[Tuple[str, str, str]] = [
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

    def check_module_files(self, module_name: str) -> Dict[str, Any]:
        """Проверка наличия файлов модуля"""
        module_path = self.modules_path / module_name
        
        file_check: Dict[str, Any] = {
            "module_exists": module_path.exists(),
            "has_index": False,
            "has_template": False,
            "has_styles": False,
            "has_module_js": False,
            "has_api": False,
            "template_file": None,
            "styles_file": None,
            "missing_files": []
        }
        
        if not file_check["module_exists"]:
            file_check["missing_files"].append("Папка модуля")
            return file_check
        
        # Проверяем index.js
        if (module_path / "index.js").exists():
            file_check["has_index"] = True
        else:
            file_check["missing_files"].append("index.js")
        
        # Проверяем template с правильным именем
        template_file = module_path / f"{module_name}.template.html"
        if template_file.exists():
            file_check["has_template"] = True
            file_check["template_file"] = template_file.name
        else:
            # Проверяем альтернативное имя
            alt_template = module_path / "template.html"
            if alt_template.exists():
                file_check["has_template"] = True
                file_check["template_file"] = alt_template.name
            else:
                file_check["missing_files"].append(f"{module_name}.template.html")
        
        # Проверяем styles с правильным именем
        styles_file = module_path / f"{module_name}.styles.css"
        if styles_file.exists():
            file_check["has_styles"] = True
            file_check["styles_file"] = styles_file.name
        else:
            # Проверяем альтернативное имя
            alt_styles = module_path / "styles.css"
            if alt_styles.exists():
                file_check["has_styles"] = True
                file_check["styles_file"] = alt_styles.name
            else:
                file_check["missing_files"].append(f"{module_name}.styles.css")
        
        # Проверяем основной модуль
        module_file = module_path / f"{module_name}.module.js"
        if module_file.exists():
            file_check["has_module_js"] = True
        else:
            file_check["missing_files"].append(f"{module_name}.module.js")
        
        # Проверяем API
        api_files = list(module_path.glob("*.api.js"))
        file_check["has_api"] = len(api_files) > 0
        
        return file_check

    def analyze_template_content(self, module_name: str) -> Dict[str, Any]:
        """Анализ содержимого шаблона"""
        module_path = self.modules_path / module_name
        
        content_analysis: Dict[str, Any] = {
            "template_size": 0,
            "has_content": False,
            "has_navigation": False,
            "has_data_sections": False,
            "has_forms": False,
            "interactive_elements": 0,
            "unique_sections": 0,
            "quality_score": 0
        }
        
        # Проверяем основной шаблон
        template_file = module_path / f"{module_name}.template.html"
        if not template_file.exists():
            template_file = module_path / "template.html"
        
        if template_file.exists():
            try:
                template_content = template_file.read_text(encoding='utf-8')
                content_analysis["template_size"] = len(template_content)
                
                if len(template_content) > 100:
                    content_analysis["has_content"] = True
                
                # Поиск навигации
                nav_patterns = ['nav', 'navigation', 'sidebar', 'menu']
                content_analysis["has_navigation"] = any(
                    pattern in template_content.lower() for pattern in nav_patterns
                )
                
                # Поиск секций данных
                data_patterns = ['data-', 'info-', 'stat-', 'balance-', 'chart', 'table']
                content_analysis["has_data_sections"] = any(
                    pattern in template_content.lower() for pattern in data_patterns
                )
                
                # Поиск форм
                form_patterns = ['<form', '<input', '<button', '<select']
                content_analysis["has_forms"] = any(
                    pattern in template_content.lower() for pattern in form_patterns
                )
                
                # Подсчет интерактивных элементов
                interactive_patterns = ['onclick', 'addEventListener', 'data-action', 'btn-']
                for pattern in interactive_patterns:
                    content_analysis["interactive_elements"] += template_content.lower().count(pattern)
                
                # Подсчет уникальных секций
                section_patterns = ['<div class=', '<section', '<article', '<aside']
                for pattern in section_patterns:
                    content_analysis["unique_sections"] += template_content.lower().count(pattern)
                
                # Качественная оценка
                score = 0
                if content_analysis["template_size"] > 1000: score += 2
                if content_analysis["has_navigation"]: score += 2
                if content_analysis["has_data_sections"]: score += 2
                if content_analysis["has_forms"]: score += 1
                if content_analysis["interactive_elements"] > 3: score += 1
                if content_analysis["unique_sections"] > 5: score += 2
                
                content_analysis["quality_score"] = score
                
            except Exception as e:
                print(f"   ⚠️ Ошибка чтения шаблона: {e}")
        
        return content_analysis

    def test_module_accessibility(self, module_name: str) -> Dict[str, Any]:
        """Тест доступности файлов модуля через HTTP"""
        accessibility: Dict[str, Any] = {
            "template_accessible": False,
            "styles_accessible": False,
            "module_accessible": False,
            "http_errors": []
        }
        
        # Тест доступности template
        template_url = f"{self.base_url}/modules/{module_name}/{module_name}.template.html"
        try:
            response = requests.get(template_url, timeout=5)
            if response.status_code == 200:
                accessibility["template_accessible"] = True
            else:
                accessibility["http_errors"].append(f"Template HTTP {response.status_code}")
        except Exception as e:
            accessibility["http_errors"].append(f"Template: {e}")
        
        # Тест доступности styles
        styles_url = f"{self.base_url}/modules/{module_name}/{module_name}.styles.css"
        try:
            response = requests.get(styles_url, timeout=5)
            if response.status_code == 200:
                accessibility["styles_accessible"] = True
            else:
                accessibility["http_errors"].append(f"Styles HTTP {response.status_code}")
        except Exception as e:
            accessibility["http_errors"].append(f"Styles: {e}")
        
        # Тест доступности модуля
        module_url = f"{self.base_url}/modules/{module_name}/{module_name}.module.js"
        try:
            response = requests.get(module_url, timeout=5)
            if response.status_code == 200:
                accessibility["module_accessible"] = True
            else:
                accessibility["http_errors"].append(f"Module HTTP {response.status_code}")
        except Exception as e:
            accessibility["http_errors"].append(f"Module: {e}")
        
        return accessibility

    def generate_console_test_script(self, module_name: str) -> str:
        """Генерация JavaScript для тестирования в консоли"""
        return f'''
// Тест модуля {module_name}
(async function test{module_name.title().replace('-', '')}Module() {{
    console.log('🧪 Тестируем модуль {module_name}...');
    
    try {{
        // 1. Проверяем переход к модулю
        window.location.hash = '/{module_name}';
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Проверяем наличие контента
        const mainContent = document.getElementById('main_content');
        if (!mainContent) {{
            console.error('❌ Основной контейнер не найден');
            return false;
        }}
        
        // 3. Проверяем загрузку модуля
        const hasContent = mainContent.innerHTML.trim().length > 100;
        if (!hasContent) {{
            console.error('❌ Модуль {module_name} не загрузил контент');
            return false;
        }}
        
        // 4. Проверяем консоль на ошибки
        const errors = console.errors || [];
        const criticalErrors = errors.filter(err => 
            err.level === 'error' && 
            !err.message.includes('MetaMask') && 
            !err.message.includes('inpage.js')
        );
        
        if (criticalErrors.length > 0) {{
            console.warn('⚠️ Найдены ошибки:', criticalErrors.length);
        }}
        
        // 5. Проверяем навигационные элементы
        const navElements = document.querySelectorAll('[data-page], .nav-link, .navigation a');
        const interactiveElements = document.querySelectorAll('button, input, select, .btn');
        
        console.log('✅ Модуль {module_name} тест завершен:', {{
            hasContent: hasContent,
            navElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errors: criticalErrors.length
        }});
        
        return {{
            success: hasContent && criticalErrors.length === 0,
            contentLoaded: hasContent,
            navigationElements: navElements.length,
            interactiveElements: interactiveElements.length,
            errorCount: criticalErrors.length
        }};
        
    }} catch (error) {{
        console.error('❌ Ошибка тестирования модуля {module_name}:', error);
        return false;
    }}
}})();
'''

    def run_comprehensive_test(self):
        """Запуск комплексного тестирования"""
        print("🔬 Запускаем комплексное тестирование модулей GENESIS")
        print("=" * 70)
        
        working_modules = 0
        total_modules = len(self.modules_to_test)
        
        # Создаем скрипт для консольного тестирования
        console_script = "// GENESIS Modules Console Test Script\\n"
        console_script += "// Скопируйте и вставьте в консоль браузера\\n\\n"
        
        for i, (module_name, display_name, icon) in enumerate(self.modules_to_test, 1):
            print(f"\\n📋 Модуль {i}/{total_modules}: {icon} {display_name}")
            print("-" * 50)
            
            # 1. Проверка файлов
            file_check = self.check_module_files(module_name)
            print(f"📁 Файлы модуля:")
            print(f"   📦 Модуль существует: {'✅' if file_check['module_exists'] else '❌'}")
            
            if file_check["module_exists"]:
                print(f"   📜 index.js: {'✅' if file_check['has_index'] else '❌'}")
                print(f"   🎨 template: {'✅' if file_check['has_template'] else '❌'}")
                print(f"   💄 styles: {'✅' if file_check['has_styles'] else '❌'}")
                print(f"   ⚙️ module.js: {'✅' if file_check['has_module_js'] else '❌'}")
                print(f"   🔌 API: {'✅' if file_check['has_api'] else '❌'}")
                
                if file_check["missing_files"]:
                    print(f"   ❌ Отсутствует: {', '.join(file_check['missing_files'])}")
                
                # 2. Анализ содержимого
                content_analysis = self.analyze_template_content(module_name)
                print(f"📊 Анализ содержимого:")
                print(f"   📏 Размер шаблона: {content_analysis['template_size']} символов")
                print(f"   📄 Есть контент: {'✅' if content_analysis['has_content'] else '❌'}")
                print(f"   🧭 Навигация: {'✅' if content_analysis['has_navigation'] else '❌'}")
                print(f"   📈 Секции данных: {'✅' if content_analysis['has_data_sections'] else '❌'}")
                print(f"   📝 Формы: {'✅' if content_analysis['has_forms'] else '❌'}")
                print(f"   🎮 Интерактивных элементов: {content_analysis['interactive_elements']}")
                print(f"   💎 Оценка качества: {content_analysis['quality_score']}/10")
                
                # 3. HTTP доступность
                accessibility = self.test_module_accessibility(module_name)
                print(f"🌐 HTTP доступность:")
                print(f"   🎨 Template: {'✅' if accessibility['template_accessible'] else '❌'}")
                print(f"   💄 Styles: {'✅' if accessibility['styles_accessible'] else '❌'}")
                print(f"   ⚙️ Module: {'✅' if accessibility['module_accessible'] else '❌'}")
                
                if accessibility["http_errors"]:
                    print(f"   ⚠️ HTTP ошибки: {', '.join(accessibility['http_errors'])}")
                
                # Оценка модуля
                module_score = 0
                if file_check["has_index"]: module_score += 1
                if file_check["has_template"]: module_score += 2
                if file_check["has_styles"]: module_score += 1
                if file_check["has_module_js"]: module_score += 2
                if content_analysis["has_content"]: module_score += 2
                if content_analysis["quality_score"] >= 5: module_score += 2
                
                module_working = module_score >= 7  # Из 10 возможных
                
                if module_working:
                    working_modules += 1
                    self.test_results["working_modules"].append(f"{icon} {display_name}")
                    print(f"✅ Модуль работоспособен ({module_score}/10)")
                else:
                    self.test_results["broken_modules"].append(f"{icon} {display_name}")
                    print(f"⚠️ Модуль требует доработки ({module_score}/10)")
                
                # Добавляем в консольный скрипт
                console_script += f"\\n// {icon} {display_name}\\n"
                console_script += self.generate_console_test_script(module_name)
                
                # Сохраняем результат модуля
                module_result: Dict[str, Any] = {
                    "name": module_name,
                    "display_name": display_name,
                    "icon": icon,
                    "files": file_check,
                    "content": content_analysis,
                    "accessibility": accessibility,
                    "score": module_score,
                    "working": module_working
                }
                
                self.test_results["modules_tested"].append(module_result)
            else:
                print(f"❌ Модуль {module_name} не найден!")
                self.test_results["broken_modules"].append(f"{icon} {display_name} (не найден)")
        
        # Подсчет общего результата
        self.test_results["overall_health"] = round((working_modules / total_modules) * 100, 1)
        
        # Сохранение консольного скрипта
        script_path = Path(__file__).parent.parent / "console_test_script.js"
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(console_script)
        
        # Итоговый отчет
        print("\\n" + "=" * 70)
        print("📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ КОМПЛЕКСНОГО ТЕСТИРОВАНИЯ")
        print("=" * 70)
        print(f"🎯 Общее здоровье: {working_modules}/{total_modules} ({self.test_results['overall_health']}%)")
        print(f"✅ Работающих модулей: {working_modules}")
        print(f"⚠️ Требующих доработки: {total_modules - working_modules}")
        
        if self.test_results["working_modules"]:
            print(f"\\n✅ Полностью работающие модули:")
            for module in self.test_results["working_modules"]:
                print(f"   - {module}")
        
        if self.test_results["broken_modules"]:
            print(f"\\n⚠️ Требующие доработки:")
            for module in self.test_results["broken_modules"]:
                print(f"   - {module}")
        
        print(f"\\n🧪 Консольный тест-скрипт сохранен в: console_test_script.js")
        print("   Скопируйте и вставьте в консоль браузера для интерактивного тестирования")

    def save_results(self):
        """Сохранение результатов"""
        filename = "comprehensive_modules_test_final.json"
        filepath = Path(__file__).parent.parent / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, ensure_ascii=False, indent=2)
        
        print(f"\\n💾 Результаты сохранены в {filename}")

def main():
    tester = GenesisModulesRealTest()
    try:
        tester.run_comprehensive_test()
        tester.save_results()
    except KeyboardInterrupt:
        print("\\n⏹️ Тестирование прервано пользователем")
    except Exception as e:
        print(f"\\n❌ Критическая ошибка: {e}")

if __name__ == "__main__":
    main()
