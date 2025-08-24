#!/usr/bin/env python3
"""
🔍 КОМПЛЕКСНАЯ ПРОВЕРКА ВСЕХ РАЗДЕЛОВ ЛИЧНОГО КАБИНЕТА GENESIS
Согласно инструкциям: проверка работоспособности и сравнение с монолитной версией
"""

import sys
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright, ConsoleMessage
from typing import Dict, List, Any

def create_detailed_test_report() -> Dict[str, Any]:
    """Создает детальный отчет о проверке всех разделов кабинета"""
    
    print("🔍 НАЧИНАЮ ПОЛНУЮ ПРОВЕРКУ ВСЕХ РАЗДЕЛОВ ЛИЧНОГО КАБИНЕТА GENESIS...")
    print("📋 Следую инструкциям: MCP + расширенное тестирование + проверка авторизации")
    print("🎯 Цель: Проверить каждый раздел и сравнить с монолитной версией")
    
    # Разделы для проверки согласно спецификации
    cabinet_modules: Dict[str, Dict[str, Any]] = {
        'dashboard': {
            'route': '/',
            'name': 'Панель управления',
            'expected_elements': [
                'h1:has-text("Панель управления")',
                '.balance-card',
                '.portfolio-overview',
                '.recent-transactions',
                '.quick-actions'
            ],
            'key_content': ['баланс', 'портфель', 'депозиты', 'доходность'],
            'monolith_sections': ['balance_overview', 'portfolio_stats', 'deposits_summary']
        },
        'deposits': {
            'route': '/deposits',
            'name': 'Депозиты',
            'expected_elements': [
                'h1:has-text("Депозиты")',
                '.deposit-plans',
                '.plan-starter',
                '.plan-ultimate',
                '.create-deposit-btn'
            ],
            'key_content': ['STARTER', 'ULTIMATE', 'PROFESSIONAL', 'создать депозит'],
            'monolith_sections': ['investment_plans', 'deposit_creation', 'active_deposits']
        },
        'portfolio': {
            'route': '/portfolio',
            'name': 'Инвестиционный портфель',
            'expected_elements': [
                'h1:has-text("Портфель")',
                '.portfolio-stats',
                '.assets-breakdown',
                '.performance-chart',
                '.holdings-table'
            ],
            'key_content': ['инвестиционный портфель', 'активы', 'доходность', 'холдинги'],
            'monolith_sections': ['portfolio_overview', 'asset_allocation', 'performance_metrics']
        },
        'bonuses': {
            'route': '/bonuses',
            'name': 'Бонусная программа',
            'expected_elements': [
                'h1:has-text("Бонусы")',
                '.bonus-program',
                '.multipliers',
                '.active-bonuses',
                '.bonus-history'
            ],
            'key_content': ['бонусная программа', 'множители', 'БОНУСНАЯ 1000', 'бустер'],
            'monolith_sections': ['bonus_system', 'multiplier_effects', 'bonus_history']
        },
        'referrals': {
            'route': '/referrals',
            'name': 'Реферальная программа',
            'expected_elements': [
                'h1:has-text("Рефералы")',
                '.referral-link',
                '.referral-stats',
                '.commission-table',
                '.referral-levels'
            ],
            'key_content': ['реферальная программа', 'реферальная ссылка', 'комиссия', 'уровни'],
            'monolith_sections': ['referral_system', 'commission_structure', 'referral_tree']
        },
        'gifts': {
            'route': '/gifts',
            'name': 'Подарочная система',
            'expected_elements': [
                'h1:has-text("Подарки")',
                '.gift-system',
                '.welcome-bonus',
                '.upcoming-gifts',
                '.gift-history'
            ],
            'key_content': ['подарочная система', 'приветственный бонус', 'подарки', 'первый депозит'],
            'monolith_sections': ['gift_mechanics', 'welcome_system', 'gift_calendar']
        },
        'settings': {
            'route': '/settings',
            'name': 'Настройки',
            'expected_elements': [
                'h1:has-text("Настройки")',
                '.profile-settings',
                '.security-settings',
                '.notification-settings',
                '.theme-selector'
            ],
            'key_content': ['настройки', 'профиль', 'безопасность', 'уведомления', 'тема'],
            'monolith_sections': ['user_profile', 'security_settings', 'preferences']
        },
        'how-it-works': {
            'route': '/how-it-works',
            'name': 'Как все устроено',
            'expected_elements': [
                'h1:has-text("Как все устроено")',
                '.tab-navigation',
                '.content-sections',
                '.overview-tab',
                '.mev-bots-tab'
            ],
            'key_content': ['как все устроено', 'MEV-боты', 'пассивный доход', 'активный доход'],
            'monolith_sections': ['how_it_works_content', 'mev_explanation', 'income_types']
        }
    }
    
    results: Dict[str, Any] = {
        'timestamp': time.time(),
        'test_type': 'comprehensive_cabinet_sections_check',
        'modules_tested': [],
        'detailed_results': {},
        'comparison_with_monolith': {},
        'overall_statistics': {},
        'errors_and_issues': [],
        'recommendations': []
    }
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, devtools=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        # Логирование всех событий
        console_logs: List[Dict[str, str]] = []
        errors: List[Dict[str, str]] = []
        
        def handle_console(msg: ConsoleMessage) -> None:
            log_entry: Dict[str, Any] = {
                'type': str(msg.type),
                'text': str(msg.text),
                'timestamp': time.time()
            }
            console_logs.append(log_entry)
            print(f"🖥️ CONSOLE [{msg.type.upper()}]: {msg.text}")
        
        def handle_error(error: Exception) -> None:
            error_entry: Dict[str, Any] = {
                'message': str(error),
                'timestamp': time.time()
            }
            errors.append(error_entry)
            print(f"❌ PAGE ERROR: {error}")
        
        page.on('console', handle_console)
        page.on('pageerror', handle_error)
        
        try:
            # 1. Загрузка модульной версии
            print("\n🎯 ЭТАП 1: Загрузка модульной версии")
            modular_url = 'http://127.0.0.1:5502/app.html'
            print(f"🚀 Переход к модульной версии: {modular_url}")
            
            page.goto(modular_url, wait_until='domcontentloaded', timeout=30000)
            page.wait_for_timeout(5000)  # Ждем инициализации
            
            # 2. Проверка авторизации (согласно инструкциям)
            print("\n🔐 ЭТАП 2: Проверка и прохождение авторизации")
            auth_result = test_authentication(page)
            results['authentication'] = auth_result
            
            # 3. Проверка каждого раздела
            print("\n📋 ЭТАП 3: Проверка всех разделов кабинета")
            for module_key, module_config in cabinet_modules.items():
                print(f"\n🔍 Проверяю раздел: {module_config['name']} ({module_config['route']})")
                
                module_result = test_cabinet_module(page, module_key, module_config)
                results['detailed_results'][module_key] = module_result
                results['modules_tested'].append(module_key)
                
                # Небольшая пауза между проверками
                page.wait_for_timeout(2000)
            
            # 4. Сравнение с монолитной версией
            print("\n🔍 ЭТАП 4: Сравнение с монолитной версией")
            monolith_comparison = compare_with_monolith(results['detailed_results'])
            results['comparison_with_monolith'] = monolith_comparison
            
            # 5. Генерация статистики
            print("\n📊 ЭТАП 5: Генерация статистики")
            statistics = generate_statistics(results['detailed_results'])
            results['overall_statistics'] = statistics
            
        except Exception as e:
            print(f"❌ Критическая ошибка при тестировании: {e}")
            results['critical_error'] = str(e)
        
        finally:
            # Сохранение логов
            results['console_logs'] = console_logs[-50:]  # Последние 50 логов
            results['errors'] = errors
            
            browser.close()
    
    # Сохранение результатов
    save_test_results(results)
    generate_detailed_report(results)
    
    return results

def test_authentication(page: Any) -> Dict[str, Any]:
    """Тестирует систему авторизации согласно инструкциям"""
    print("🔐 Проверяю авторизацию...")
    
    auth_result: Dict[str, Any] = {
        'required': False,
        'form_present': False,
        'test_mode_active': False,
        'bypass_successful': False,
        'status': 'unknown'
    }
    
    try:
        # Проверяем есть ли форма авторизации
        auth_form = page.locator('.auth-form, .login-form, #auth-modal').first
        if auth_form.count() > 0:
            auth_result['form_present'] = True
            auth_result['required'] = True
            
            # Пытаемся авторизоваться в тестовом режиме
            test_login = page.locator('input[type="email"], input[name="email"]').first
            test_password = page.locator('input[type="password"]').first
            
            if test_login.count() > 0 and test_password.count() > 0:
                test_login.fill('test@genesis.local')
                test_password.fill('test123')
                
                submit_btn = page.locator('button[type="submit"], .auth-submit').first
                if submit_btn.count() > 0:
                    submit_btn.click()
                    page.wait_for_timeout(3000)
                    
                    # Проверяем успешность авторизации
                    if page.locator('.dashboard, .cabinet-main, #app-container').count() > 0:
                        auth_result['bypass_successful'] = True
                        auth_result['test_mode_active'] = True
                        auth_result['status'] = 'success'
                        print("✅ Авторизация в тестовом режиме успешна")
                    else:
                        auth_result['status'] = 'failed'
                        print("❌ Авторизация не удалась")
        else:
            # Авторизация не требуется
            auth_result['status'] = 'not_required'
            print("✅ Авторизация не требуется")
    
    except Exception as e:
        auth_result['error'] = str(e)
        auth_result['status'] = 'error'
        print(f"❌ Ошибка при проверке авторизации: {e}")
    
    return auth_result

def test_cabinet_module(page: Any, module_key: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """Тестирует отдельный модуль кабинета"""
    
    result: Dict[str, Any] = {
        'module': module_key,
        'name': config['name'],
        'route': config['route'],
        'navigation_success': False,
        'elements_found': {},
        'content_analysis': {},
        'functionality_check': {},
        'completeness_score': 0,
        'issues': []
    }
    
    try:
        # Навигация к модулю
        if config['route'] != '/':
            nav_link = page.locator(f'[data-route="{config["route"]}"], a[href*="{config["route"]}"]').first
            if nav_link.count() > 0:
                nav_link.click()
                page.wait_for_timeout(3000)
                result['navigation_success'] = True
                print(f"✅ Навигация к {config['name']} успешна")
            else:
                # Прямой переход через URL
                page.evaluate(f'window.router && window.router.navigate("{config["route"]}")')
                page.wait_for_timeout(3000)
                print(f"🔄 Попытка прямого перехода к {config['name']}")
        else:
            result['navigation_success'] = True
        
        # Проверка элементов интерфейса
        print(f"🔍 Проверяю элементы интерфейса для {config['name']}")
        elements_found: int = 0
        for element_selector in config['expected_elements']:
            element = page.locator(element_selector)
            found: bool = bool(element.count() > 0)
            result['elements_found'][element_selector] = found
            if found:
                elements_found += 1
        
        result['elements_found_count'] = elements_found
        result['elements_expected_count'] = len(config['expected_elements'])
        
        # Анализ контента
        print(f"📝 Анализирую контент для {config['name']}")
        page_content: str = str(page.inner_text('main, .content, #app-container')).lower()
        content_matches: int = 0
        for key_content in config['key_content']:
            found: bool = key_content.lower() in page_content
            result['content_analysis'][key_content] = found
            if found:
                content_matches += 1
        
        result['content_matches_count'] = content_matches
        result['content_expected_count'] = len(config['key_content'])
        
        # Проверка функциональности
        functionality_result: Dict[str, Any] = test_module_functionality(page, module_key, config)
        result['functionality_check'] = functionality_result
        
        # Расчет общей полноты
        elements_score: float = (elements_found / len(config['expected_elements'])) * 40
        content_score: float = (content_matches / len(config['key_content'])) * 40
        functionality_score: float = float(functionality_result.get('score', 0)) * 20
        
        result['completeness_score'] = round(elements_score + content_score + functionality_score, 2)
        
        print(f"📊 Результат для {config['name']}: {result['completeness_score']}%")
        
    except Exception as e:
        result['error'] = str(e)
        result['issues'].append(f"Error during testing: {e}")
        print(f"❌ Ошибка при проверке {config['name']}: {e}")
    
    return result

def test_module_functionality(page: Any, module_key: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """Тестирует специфическую функциональность модуля"""
    
    functionality: Dict[str, Any] = {
        'interactive_elements': 0,
        'forms_present': 0,
        'api_calls_detected': 0,
        'errors_count': 0,
        'score': 0,
        'specific_tests': {}
    }
    
    try:
        # Общие проверки
        buttons: int = int(page.locator('button, .btn, input[type="submit"]').count())
        forms: int = int(page.locator('form').count())
        links: int = int(page.locator('a').count())
        
        functionality['interactive_elements'] = buttons + links
        functionality['forms_present'] = forms
        
        # Специфические проверки по модулям
        if module_key == 'deposits':
            # Проверка планов депозитов
            plans: int = int(page.locator('.plan, .deposit-plan').count())
            create_btn: int = int(page.locator('button:has-text("Создать"), .create-deposit').count())
            functionality['specific_tests']['deposit_plans'] = plans
            functionality['specific_tests']['create_button'] = create_btn > 0
            
        elif module_key == 'portfolio':
            # Проверка портфеля
            charts: int = int(page.locator('.chart, canvas, svg').count())
            tables: int = int(page.locator('table, .table').count())
            functionality['specific_tests']['charts'] = charts
            functionality['specific_tests']['data_tables'] = tables
            
        elif module_key == 'bonuses':
            # Проверка бонусов
            multipliers: int = int(page.locator('.multiplier, .bonus').count())
            functionality['specific_tests']['bonus_elements'] = multipliers
            
        elif module_key == 'how-it-works':
            # Проверка вкладочной системы
            tabs: int = int(page.locator('.tab, [data-tab]').count())
            tab_content: int = int(page.locator('.tab-content, .tab-pane').count())
            functionality['specific_tests']['tabs'] = tabs
            functionality['specific_tests']['tab_content'] = tab_content
        
        # Расчет общего скора функциональности
        base_score: float = min(float(functionality['interactive_elements']) * 10, 50)
        forms_score: float = min(float(functionality['forms_present']) * 20, 30)
        specific_score: float = float(len([v for v in functionality['specific_tests'].values() if v]) * 10)
        
        functionality['score'] = min((base_score + forms_score + specific_score) / 100, 1.0)
        
    except Exception as e:
        functionality['error'] = str(e)
    
    return functionality

def compare_with_monolith(modular_results: Dict[str, Any]) -> Dict[str, Any]:
    """Сравнивает результаты модульной версии с монолитной"""
    
    comparison: Dict[str, Any] = {
        'modules_comparison': {},
        'overall_coverage': {},
        'missing_features': [],
        'improvements': [],
        'parity_score': 0
    }
    
    # Эталонные данные из монолитной версии (из спецификации)
    monolith_baseline: Dict[str, Dict[str, Any]] = {
        'dashboard': {'completeness': 85, 'features': ['balance', 'overview', 'transactions']},
        'deposits': {'completeness': 90, 'features': ['plans', 'creation', 'history']},
        'portfolio': {'completeness': 80, 'features': ['assets', 'performance', 'allocation']},
        'bonuses': {'completeness': 75, 'features': ['multipliers', 'history', 'activation']},
        'referrals': {'completeness': 70, 'features': ['links', 'statistics', 'commission']},
        'gifts': {'completeness': 65, 'features': ['calendar', 'welcome', 'history']},
        'settings': {'completeness': 85, 'features': ['profile', 'security', 'preferences']},
        'how-it-works': {'completeness': 95, 'features': ['explanation', 'tabs', 'content']}
    }
    
    total_modular_score: float = 0
    total_monolith_score: float = 0
    modules_compared: int = 0
    
    for module_key, modular_data in modular_results.items():
        if module_key in monolith_baseline:
            modules_compared += 1
            modular_score: float = float(modular_data.get('completeness_score', 0))
            monolith_score: float = float(monolith_baseline[module_key].get('completeness', 0))
            
            module_comparison: Dict[str, Any] = {
                'modular_score': modular_score,
                'monolith_score': monolith_score,
                'difference': modular_score - monolith_score,
                'status': 'improved' if modular_score >= monolith_score else 'needs_attention'
            }
            
            comparison['modules_comparison'][module_key] = module_comparison
            total_modular_score += modular_score
            total_monolith_score += monolith_score
            
            # Анализ недостающих функций
            if modular_score < monolith_score:
                comparison['missing_features'].append({
                    'module': module_key,
                    'gap': monolith_score - modular_score,
                    'priority': 'high' if monolith_score - modular_score > 20 else 'medium'
                })
    
    if modules_compared > 0:
        avg_modular: float = total_modular_score / modules_compared
        avg_monolith: float = total_monolith_score / modules_compared
        comparison['parity_score'] = round((avg_modular / avg_monolith) * 100, 2)
    
    comparison['overall_coverage'] = {
        'average_modular_score': round(total_modular_score / modules_compared, 2) if modules_compared > 0 else 0,
        'average_monolith_score': round(total_monolith_score / modules_compared, 2) if modules_compared > 0 else 0,
        'modules_compared': modules_compared
    }
    
    return comparison

def generate_statistics(results: Dict[str, Any]) -> Dict[str, Any]:
    """Генерирует общую статистику проверки"""
    
    stats: Dict[str, Any] = {
        'modules_tested': len(results),
        'successful_modules': 0,
        'failed_modules': 0,
        'average_completeness': 0,
        'best_module': {'name': '', 'score': 0},
        'worst_module': {'name': '', 'score': 100},
        'total_elements_checked': 0,
        'total_content_items_checked': 0,
        'recommendations': []
    }
    
    total_score: float = 0
    
    for module_key, module_data in results.items():
        if 'completeness_score' in module_data:
            score: float = float(module_data['completeness_score'])
            total_score += score
            
            if score >= 70:
                stats['successful_modules'] += 1
            else:
                stats['failed_modules'] += 1
            
            if score > stats['best_module']['score']:
                stats['best_module'] = {'name': module_key, 'score': score}
            
            if score < stats['worst_module']['score']:
                stats['worst_module'] = {'name': module_key, 'score': score}
            
            stats['total_elements_checked'] += module_data.get('elements_expected_count', 0)
            stats['total_content_items_checked'] += module_data.get('content_expected_count', 0)
    
    if len(results) > 0:
        stats['average_completeness'] = round(total_score / len(results), 2)
    
    # Генерация рекомендаций
    if stats['average_completeness'] < 70:
        stats['recommendations'].append("Общая полнота кабинета ниже 70% - требуется доработка")
    
    if stats['failed_modules'] > stats['successful_modules']:
        stats['recommendations'].append("Больше половины модулей требуют внимания")
    
    if stats['worst_module']['score'] < 50:
        stats['recommendations'].append(f"Модуль {stats['worst_module']['name']} критически неполный")
    
    return stats

def save_test_results(results: Dict[str, Any]) -> None:
    """Сохраняет результаты тестирования"""
    
    # Сохранение в JSON
    results_file = Path('cabinet_sections_test_results.json')
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2, default=str)
    
    print(f"💾 Результаты сохранены в {results_file}")

def generate_detailed_report(results: Dict[str, Any]) -> None:
    """Генерирует детальный отчет в markdown"""
    
    report_lines = [
        "# 🔍 ДЕТАЛЬНЫЙ ОТЧЕТ ПРОВЕРКИ РАЗДЕЛОВ ЛИЧНОГО КАБИНЕТА GENESIS",
        f"**Дата проверки:** {time.strftime('%d.%m.%Y %H:%M:%S')}",
        f"**Тип теста:** Комплексная проверка всех разделов кабинета",
        "",
        "## 📊 ОБЩАЯ СТАТИСТИКА"
    ]
    
    if 'overall_statistics' in results:
        stats = results['overall_statistics']
        report_lines.extend([
            f"- **Модулей протестировано:** {stats['modules_tested']}",
            f"- **Успешных модулей:** {stats['successful_modules']}",
            f"- **Требующих внимания:** {stats['failed_modules']}",
            f"- **Средняя полнота:** {stats['average_completeness']}%",
            f"- **Лучший модуль:** {stats['best_module']['name']} ({stats['best_module']['score']}%)",
            f"- **Худший модуль:** {stats['worst_module']['name']} ({stats['worst_module']['score']}%)",
            ""
        ])
    
    # Детальные результаты по модулям
    report_lines.append("## 📋 ДЕТАЛЬНЫЕ РЕЗУЛЬТАТЫ ПО МОДУЛЯМ")
    report_lines.append("")
    
    for module_key, module_data in results.get('detailed_results', {}).items():
        report_lines.extend([
            f"### 🔧 {module_data.get('name', module_key)}",
            f"- **Маршрут:** {module_data.get('route', 'N/A')}",
            f"- **Навигация:** {'✅' if module_data.get('navigation_success') else '❌'}",
            f"- **Полнота:** {module_data.get('completeness_score', 0)}%",
            f"- **Элементов найдено:** {module_data.get('elements_found_count', 0)}/{module_data.get('elements_expected_count', 0)}",
            f"- **Контент найден:** {module_data.get('content_matches_count', 0)}/{module_data.get('content_expected_count', 0)}",
            ""
        ])
    
    # Сравнение с монолитной версией
    if 'comparison_with_monolith' in results:
        comparison = results['comparison_with_monolith']
        report_lines.extend([
            "## ⚖️ СРАВНЕНИЕ С МОНОЛИТНОЙ ВЕРСИЕЙ",
            f"- **Паритет:** {comparison.get('parity_score', 0)}%",
            f"- **Средний балл модульной версии:** {comparison.get('overall_coverage', {}).get('average_modular_score', 0)}%",
            f"- **Средний балл монолитной версии:** {comparison.get('overall_coverage', {}).get('average_monolith_score', 0)}%",
            ""
        ])
        
        if comparison.get('missing_features'):
            report_lines.append("### ❌ НЕДОСТАЮЩИЕ ФУНКЦИИ:")
            for missing in comparison['missing_features']:
                report_lines.append(f"- **{missing['module']}:** отставание на {missing['gap']}% (приоритет: {missing['priority']})")
            report_lines.append("")
    
    # Рекомендации
    if 'overall_statistics' in results and results['overall_statistics'].get('recommendations'):
        report_lines.extend([
            "## 💡 РЕКОМЕНДАЦИИ",
            ""
        ])
        for rec in results['overall_statistics']['recommendations']:
            report_lines.append(f"- {rec}")
        report_lines.append("")
    
    # Сохранение отчета
    report_content = '\n'.join(report_lines)
    report_file = Path('cabinet_sections_detailed_report.md')
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print(f"📄 Детальный отчет сохранен в {report_file}")
    
    # Вывод краткой сводки
    print("\n" + "="*60)
    print("📊 КРАТКАЯ СВОДКА РЕЗУЛЬТАТОВ:")
    print("="*60)
    
    if 'overall_statistics' in results:
        stats = results['overall_statistics']
        print(f"✅ Успешно: {stats['successful_modules']} модулей")
        print(f"⚠️  Требует внимания: {stats['failed_modules']} модулей")
        print(f"📊 Средняя полнота: {stats['average_completeness']}%")
    
    if 'comparison_with_monolith' in results:
        print(f"⚖️  Паритет с монолитом: {results['comparison_with_monolith'].get('parity_score', 0)}%")

if __name__ == '__main__':
    try:
        results = create_detailed_test_report()
        
        # Определение общего статуса
        avg_completeness = results.get('overall_statistics', {}).get('average_completeness', 0)
        if avg_completeness >= 80:
            print("\n🎉 ОТЛИЧНО: Кабинет в отличном состоянии!")
            sys.exit(0)
        elif avg_completeness >= 60:
            print("\n⚠️ ХОРОШО: Кабинет функционирует, но есть области для улучшения")
            sys.exit(0)
        else:
            print("\n❌ ТРЕБУЕТ ВНИМАНИЯ: Кабинет нуждается в серьезной доработке")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n💥 КРИТИЧЕСКАЯ ОШИБКА: {e}")
        sys.exit(2)
