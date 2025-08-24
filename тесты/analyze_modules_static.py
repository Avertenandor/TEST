#!/usr/bin/env python3
"""
Комплексная проверка модулей GENESIS без Selenium
Статический анализ файлов и структуры модулей
"""

import os
import json
import time
import re
from pathlib import Path

class GenesisModulesAnalyzer:
    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        self.modules_path = self.base_path / "modules"
        self.cabinet_path = self.base_path / "cabinet.html"
        
        self.test_results = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "modules_analyzed": [],
            "structure_analysis": {},
            "content_completeness": {},
            "missing_components": [],
            "recommendations": [],
            "overall_score": 0
        }

    def analyze_module_structure(self, module_name):
        """Анализ структуры модуля"""
        module_path = self.modules_path / module_name
        
        structure = {
            "exists": False,
            "has_index": False,
            "has_template": False,
            "has_styles": False,
            "has_api": False,
            "file_count": 0,
            "files": []
        }
        
        if module_path.exists():
            structure["exists"] = True
            
            # Получаем список файлов
            files = list(module_path.glob("*"))
            structure["file_count"] = len(files)
            structure["files"] = [f.name for f in files]
            
            # Проверяем ключевые файлы
            structure["has_index"] = (module_path / "index.js").exists()
            structure["has_template"] = (module_path / "template.html").exists()
            structure["has_styles"] = (module_path / "styles.css").exists()
            
            # Ищем API файлы
            api_files = list(module_path.glob("*.api.js"))
            structure["has_api"] = len(api_files) > 0
            
        return structure

    def analyze_module_content(self, module_name):
        """Анализ содержимого модуля"""
        module_path = self.modules_path / module_name
        
        content = {
            "template_size": 0,
            "has_navigation": False,
            "has_data_display": False,
            "has_forms": False,
            "has_interactive_elements": False,
            "javascript_functions": 0,
            "css_rules": 0,
            "content_richness": 0
        }
        
        # Анализ template.html
        template_file = module_path / "template.html"
        if template_file.exists():
            try:
                template_content = template_file.read_text(encoding='utf-8')
                content["template_size"] = len(template_content)
                
                # Поиск элементов навигации
                nav_patterns = ['nav', 'navigation', 'menu', 'sidebar']
                content["has_navigation"] = any(pattern in template_content.lower() for pattern in nav_patterns)
                
                # Поиск элементов отображения данных
                data_patterns = ['table', 'chart', 'graph', 'data-', 'info-card', 'stat']
                content["has_data_display"] = any(pattern in template_content.lower() for pattern in data_patterns)
                
                # Поиск форм
                form_patterns = ['<form', '<input', '<select', '<button']
                content["has_forms"] = any(pattern in template_content.lower() for pattern in form_patterns)
                
                # Поиск интерактивных элементов
                interactive_patterns = ['onclick', 'addEventListener', 'click', 'interactive']
                content["has_interactive_elements"] = any(pattern in template_content.lower() for pattern in interactive_patterns)
                
            except Exception as e:
                print(f"Ошибка чтения template.html для {module_name}: {e}")
        
        # Анализ index.js
        index_file = module_path / "index.js"
        if index_file.exists():
            try:
                js_content = index_file.read_text(encoding='utf-8')
                
                # Подсчет функций
                function_patterns = [r'function\s+\w+', r'\w+\s*=\s*function', r'\w+\s*=>\s*{', r'async\s+\w+']
                for pattern in function_patterns:
                    content["javascript_functions"] += len(re.findall(pattern, js_content))
                
            except Exception as e:
                print(f"Ошибка чтения index.js для {module_name}: {e}")
        
        # Анализ styles.css
        styles_file = module_path / "styles.css"
        if styles_file.exists():
            try:
                css_content = styles_file.read_text(encoding='utf-8')
                
                # Подсчет CSS правил
                content["css_rules"] = len(re.findall(r'{[^}]*}', css_content))
                
            except Exception as e:
                print(f"Ошибка чтения styles.css для {module_name}: {e}")
        
        # Оценка богатства содержимого
        richness_score = 0
        if content["template_size"] > 1000: richness_score += 1
        if content["has_navigation"]: richness_score += 1
        if content["has_data_display"]: richness_score += 1
        if content["has_forms"]: richness_score += 1
        if content["has_interactive_elements"]: richness_score += 1
        if content["javascript_functions"] > 5: richness_score += 1
        if content["css_rules"] > 10: richness_score += 1
        
        content["content_richness"] = richness_score
        
        return content

    def compare_with_cabinet(self, module_name):
        """Сравнение с cabinet.html"""
        comparison = {
            "cabinet_has_section": False,
            "similarity_score": 0,
            "notes": []
        }
        
        try:
            if self.cabinet_path.exists():
                cabinet_content = self.cabinet_path.read_text(encoding='utf-8')
                
                # Поиск упоминаний модуля
                module_keywords = {
                    "dashboard": ["панель управления", "dashboard", "главная"],
                    "deposits": ["депозит", "вклад", "deposit"],
                    "portfolio": ["портфель", "portfolio", "кошелек"],
                    "transactions": ["транзакц", "операц", "transaction"],
                    "analytics": ["аналитика", "анализ", "analytics"],
                    "bonuses": ["бонус", "bonus", "награда"],
                    "gifts": ["подарок", "gift", "подарки"],
                    "referrals": ["реферал", "referral", "партнер"],
                    "multipliers": ["множител", "multiplier", "усилитель"],
                    "mining-rent": ["аренда", "майнинг", "mining"],
                    "device": ["устройство", "device", "девайс"],
                    "plex-coin": ["plex", "монета", "токен"],
                    "experience": ["опыт", "experience", "уровень"],
                    "rank": ["ранг", "rank", "звание"],
                    "settings": ["настройки", "settings", "конфигурация"],
                    "terminal": ["терминал", "terminal", "консоль"],
                    "platform-access": ["доступ", "access", "платформа"],
                    "how-it-works": ["как работает", "принцип", "устройство"]
                }
                
                keywords = module_keywords.get(module_name, [module_name])
                
                # Проверка наличия ключевых слов
                found_keywords = 0
                for keyword in keywords:
                    if keyword.lower() in cabinet_content.lower():
                        found_keywords += 1
                        comparison["cabinet_has_section"] = True
                
                if found_keywords > 0:
                    comparison["similarity_score"] = min(found_keywords * 30, 100)
                    comparison["notes"].append(f"Найдено {found_keywords} совпадений из {len(keywords)}")
                else:
                    comparison["notes"].append("Совпадений с cabinet.html не найдено")
                    
        except Exception as e:
            comparison["notes"].append(f"Ошибка сравнения: {e}")
        
        return comparison

    def get_module_recommendations(self, module_name, structure, content, comparison):
        """Генерация рекомендаций для модуля"""
        recommendations = []
        
        # Проверка структуры
        if not structure["has_index"]:
            recommendations.append(f"❌ {module_name}: Отсутствует index.js")
        if not structure["has_template"]:
            recommendations.append(f"❌ {module_name}: Отсутствует template.html")
        if not structure["has_styles"]:
            recommendations.append(f"⚠️ {module_name}: Отсутствует styles.css")
        
        # Проверка содержимого
        if content["template_size"] < 500:
            recommendations.append(f"⚠️ {module_name}: Шаблон слишком мал ({content['template_size']} символов)")
        if not content["has_data_display"]:
            recommendations.append(f"⚠️ {module_name}: Отсутствуют элементы отображения данных")
        if content["javascript_functions"] < 3:
            recommendations.append(f"⚠️ {module_name}: Мало JavaScript функций ({content['javascript_functions']})")
        
        # Сравнение с cabinet
        if not comparison["cabinet_has_section"]:
            recommendations.append(f"📋 {module_name}: Нет соответствующего раздела в cabinet.html")
        
        return recommendations

    def analyze_all_modules(self):
        """Анализ всех модулей"""
        print("🔍 Начинаем комплексный анализ модулей GENESIS")
        print("=" * 70)
        
        # Список модулей для анализа
        modules_to_analyze = [
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
        
        total_modules = len(modules_to_analyze)
        complete_modules = 0
        
        for i, (module_name, display_name, icon) in enumerate(modules_to_analyze, 1):
            print(f"\n📋 Модуль {i}/{total_modules}: {icon} {display_name}")
            print("-" * 50)
            
            # Анализ структуры
            structure = self.analyze_module_structure(module_name)
            print(f"📁 Структура: {'✅' if structure['exists'] else '❌'} Существует")
            
            if structure["exists"]:
                print(f"   📄 Файлов: {structure['file_count']}")
                print(f"   📜 index.js: {'✅' if structure['has_index'] else '❌'}")
                print(f"   🎨 template.html: {'✅' if structure['has_template'] else '❌'}")
                print(f"   💄 styles.css: {'✅' if structure['has_styles'] else '❌'}")
                print(f"   🔌 API: {'✅' if structure['has_api'] else '❌'}")
                
                # Анализ содержимого
                content = self.analyze_module_content(module_name)
                print(f"📊 Содержимое:")
                print(f"   📏 Размер шаблона: {content['template_size']} символов")
                print(f"   🧭 Навигация: {'✅' if content['has_navigation'] else '❌'}")
                print(f"   📈 Отображение данных: {'✅' if content['has_data_display'] else '❌'}")
                print(f"   📝 Формы: {'✅' if content['has_forms'] else '❌'}")
                print(f"   🎮 Интерактивность: {'✅' if content['has_interactive_elements'] else '❌'}")
                print(f"   ⚙️ JS функций: {content['javascript_functions']}")
                print(f"   💎 Богатство содержимого: {content['content_richness']}/7")
                
                # Сравнение с cabinet.html
                comparison = self.compare_with_cabinet(module_name)
                print(f"📋 Сравнение с cabinet.html:")
                print(f"   🔗 Найден раздел: {'✅' if comparison['cabinet_has_section'] else '❌'}")
                print(f"   📊 Схожесть: {comparison['similarity_score']}%")
                
                # Рекомендации
                recommendations = self.get_module_recommendations(module_name, structure, content, comparison)
                if recommendations:
                    print(f"💡 Рекомендации:")
                    for rec in recommendations[:3]:  # Показываем только первые 3
                        print(f"   {rec}")
                
                # Оценка полноты модуля
                completeness_score = 0
                if structure["has_index"]: completeness_score += 2
                if structure["has_template"]: completeness_score += 2
                if structure["has_styles"]: completeness_score += 1
                if content["content_richness"] >= 4: completeness_score += 2
                if comparison["cabinet_has_section"]: completeness_score += 1
                
                module_complete = completeness_score >= 6  # Из 8 возможных
                if module_complete:
                    complete_modules += 1
                    print(f"✅ Модуль полный ({completeness_score}/8)")
                else:
                    print(f"⚠️ Модуль требует доработки ({completeness_score}/8)")
                    self.test_results["missing_components"].extend(recommendations)
                
                # Сохраняем результаты модуля
                module_result = {
                    "name": module_name,
                    "display_name": display_name,
                    "icon": icon,
                    "structure": structure,
                    "content": content,
                    "comparison": comparison,
                    "completeness_score": completeness_score,
                    "is_complete": module_complete,
                    "recommendations": recommendations
                }
                
                self.test_results["modules_analyzed"].append(module_result)
            else:
                print(f"❌ Модуль {module_name} не найден!")
                self.test_results["missing_components"].append(f"Отсутствует модуль {display_name}")
        
        # Подсчет общего результата
        self.test_results["overall_score"] = round((complete_modules / total_modules) * 100, 1)
        
        # Итоговый отчет
        print("\n" + "=" * 70)
        print("📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ АНАЛИЗА МОДУЛЕЙ")
        print("=" * 70)
        print(f"🎯 Общая полнота: {complete_modules}/{total_modules} ({self.test_results['overall_score']}%)")
        print(f"✅ Полных модулей: {complete_modules}")
        print(f"⚠️ Требующих доработки: {total_modules - complete_modules}")
        
        # Топ проблем
        if self.test_results["missing_components"]:
            print(f"\n🔧 Основные проблемы:")
            unique_issues = {}
            for issue in self.test_results["missing_components"]:
                if "Отсутствует" in issue:
                    key = issue.split(":")[1].strip() if ":" in issue else issue
                    unique_issues[key] = unique_issues.get(key, 0) + 1
            
            sorted_issues = sorted(unique_issues.items(), key=lambda x: x[1], reverse=True)
            for issue, count in sorted_issues[:5]:
                print(f"   - {issue} (в {count} модулях)")

    def save_results(self):
        """Сохранение результатов"""
        filename = "modules_analysis_results.json"
        filepath = self.base_path / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 Результаты сохранены в {filename}")

def main():
    analyzer = GenesisModulesAnalyzer()
    try:
        analyzer.analyze_all_modules()
        analyzer.save_results()
    except KeyboardInterrupt:
        print("\n⏹️ Анализ прерван пользователем")
    except Exception as e:
        print(f"\n❌ Критическая ошибка: {e}")

if __name__ == "__main__":
    main()
