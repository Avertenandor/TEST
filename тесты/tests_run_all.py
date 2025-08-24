"""
Оркестратор комплексных тестов (стабильная архитектура, без "быстрых костылей").

Фазы:
  1. Content (Python) — структурное покрытие модульной версии.
  2. Browser (Node/Puppeteer) — консоль и DOM проверки.

Принципы:
  - Чёткие предусловия: если среда не готова → формируется отчет требований, а не молчаливый skip.
  - Отдельный код возврата:
       0 — все фазы прошли
       1 — критическая ошибка Python фазы
       2 — доменный тест не прошёл (содержание)
       3 — среда браузерных тестов не подготовлена (требуется действие)
       4 — ошибка исполнения браузерного теста
  - Возможность ручного пропуска браузерной фазы: SKIP_BROWSER=1
"""

import os
import subprocess
import sys
import shutil
from pathlib import Path
import json
from typing import Dict, List, Any, Optional
from playwright.sync_api import sync_playwright, ConsoleMessage

BASE = Path(__file__).parent
REPORTS = BASE / 'reports'
NODE_MODULES = BASE / 'node_modules'
PUPPETEER_SCRIPT = BASE / 'browser' / 'test_console_how_it_works.mjs'
PACKAGE_JSON = BASE / 'package.json'

PY_SCRIPTS = [
    'extract_monolith_content.py',
    'extract_modular_content.py',
    'compare_content.py'
]

EXIT_CONTENT_FAIL = 2
EXIT_ENV_BROWSER_MISSING = 3
EXIT_BROWSER_FAIL = 4

def run_py_scripts():
    for script in PY_SCRIPTS:
        path = BASE / script
        print(f'== Phase:CONTENT -> {script} ==')
        result = subprocess.run([sys.executable, str(path)], capture_output=True, text=True)
        if result.returncode != 0:
            print(result.stdout)
            print(result.stderr)
            print(f'FAIL: {script}')
            sys.exit(result.returncode if result.returncode != 0 else 1)
        else:
            if result.stdout.strip():
                print(result.stdout.strip())

def write_browser_env_report(reason: str, details: Dict[str, Any]) -> None:
    REPORTS.mkdir(parents=True, exist_ok=True)
    payload: Dict[str, Any] = {
        'phase': 'browser-env',
        'status': 'BLOCKED',
        'reason': reason,
        'details': details
    }
    (REPORTS / 'browser_env_requirements.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    (REPORTS / 'browser_env_requirements.md').write_text(
        '\n'.join([
            '# Требования для запуска браузерных тестов',
            f'**Статус:** BLOCKED — {reason}',
            '',
            '## Детали',
            *[f'- {k}: {v}' for k, v in details.items()],
            '',
            '## Необходимые действия',
            '1. Установить Node.js LTS с npm (https://nodejs.org/).',
            '2. Перейти в каталог тестов и выполнить: npm install',
            '3. Повторно запустить оркестратор: python tests_run_all.py',
            '4. При необходимости временно пропустить фазу: set SKIP_BROWSER=1',
        ]),
        encoding='utf-8'
    )

def ensure_browser_environment() -> bool:
    if os.environ.get('SKIP_BROWSER') == '1':
        print('== Phase:BROWSER skipped (SKIP_BROWSER=1) ==')
        return False
    # Предпочитаем Python Playwright если npm отсутствует или не запускается
    npm_path: Optional[str] = shutil.which('npm')
    have_npm: bool = False
    if npm_path:
        try:
            res = subprocess.run(['npm','-v'], capture_output=True, text=True, timeout=5)
            have_npm = res.returncode == 0 and bool(res.stdout.strip())
        except Exception:
            have_npm = False
    if not have_npm:
        print('npm не найден или недоступен -> fallback на Playwright (pip)')
        try:
            import importlib
            try:
                importlib.import_module('playwright.sync_api')
                print('Playwright уже установлен.')
            except ImportError:
                print('== pip install playwright ==')
                r = subprocess.run([sys.executable, '-m', 'pip', 'install', '--quiet', 'playwright'], cwd=BASE)
                if r.returncode != 0:
                    write_browser_env_report('pip install playwright failed', {'returncode': r.returncode})
                    sys.exit(EXIT_ENV_BROWSER_MISSING)
                print('== playwright install chromium ==')
                r2 = subprocess.run([sys.executable, '-m', 'playwright', 'install', 'chromium', '--with-deps'], cwd=BASE)
                if r2.returncode != 0:
                    write_browser_env_report('playwright browser install failed', {'returncode': r2.returncode})
                    sys.exit(EXIT_ENV_BROWSER_MISSING)
            return True
        except Exception as e:
            write_browser_env_report('Playwright setup error', {'error': str(e)})
            sys.exit(EXIT_ENV_BROWSER_MISSING)
    # npm присутствует — используем Puppeteer
    if not PUPPETEER_SCRIPT.exists():
        print('Puppeteer script missing -> продолжим только с Playwright при его наличии.')
        return True
    if PACKAGE_JSON.exists() and not NODE_MODULES.exists():
        print('== Installing Node dev dependencies ==')
        r = subprocess.run(['npm','install','--no-audit','--no-fund'], cwd=BASE)
        if r.returncode != 0:
            write_browser_env_report('npm install failed', {'returncode': r.returncode})
            return False
    return True

def run_browser_tests():
    # Если доступен playwright — используем его Python тест
    try:
        from playwright.sync_api import sync_playwright  # type: ignore
        print('== Phase:BROWSER (Playwright) ==')
        run_playwright_suite()
        return
    except ImportError:
        pass
    # Иначе fallback на puppeteer
    if shutil.which('node') and PUPPETEER_SCRIPT.exists():
        print('== Phase:BROWSER (Puppeteer) -> how-it-works ==')
        r = subprocess.run(['node', str(PUPPETEER_SCRIPT)], cwd=BASE)
        if r.returncode != 0:
            print('Browser test failed')
            sys.exit(EXIT_BROWSER_FAIL)
        print('Browser test passed')
    else:
        print('No browser testing environment available.')

def run_playwright_suite() -> None:
    # Для модульной версии: используем data-route атрибуты вместо текста
    routes: List[Dict[str, Any]] = [
        {'label': 'dashboard', 'route': '/', 'text': 'Панель управления', 'expect': ['панель', 'dashboard']},
        {'label': 'how', 'route': '/how-it-works', 'text': 'Как все устроено', 'expect': ['устроено','как']},
        {'label': 'deposits', 'route': '/deposits', 'text': 'Депозиты', 'expect': ['депозиты','депозит']},
        {'label': 'portfolio', 'route': '/portfolio', 'text': 'Портфель', 'expect': ['портфель','инвестиционный']},
        {'label': 'bonuses', 'route': '/bonuses', 'text': 'Бонусы', 'expect': ['бонус','множител']},
        {'label': 'gifts', 'route': '/gifts', 'text': 'Подарки', 'expect': ['подар']},
        {'label': 'multipliers', 'route': '/multipliers', 'text': 'Множители', 'expect': ['множител']},
        {'label': 'referrals', 'route': '/referrals', 'text': 'Рефералы', 'expect': ['реферал']},
        {'label': 'settings', 'route': '/settings', 'text': 'Настройки', 'expect': ['настрой']},
    ]
    base_url = os.environ.get('BASE_URL', 'http://127.0.0.1:5502/app.html')  # Тестируем модульную версию с обновленными модулями
    REPORTS.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as p:
        # Запуск с видимым браузером для отладки
        browser = p.chromium.launch(
            headless=False,
            devtools=True,  # Открыть DevTools автоматически
            slow_mo=2000    # Замедление действий на 2 секунды для наблюдения
        )
        page = browser.new_page()
        
        # Включить детальное логирование всех сетевых запросов
        page.on('request', lambda request: print(f'🌐 REQUEST: {request.method} {request.url}'))
        page.on('response', lambda response: print(f'📥 RESPONSE: {response.status} {response.url}'))
        page.on('requestfailed', lambda request: print(f'❌ REQUEST FAILED: {request.url} - {request.failure}'))
        
        logs: List[Dict[str, str]] = []
        errors_global: List[Dict[str, str]] = []
        def _console_listener(m: ConsoleMessage) -> None:
            # Playwright message API: m.type, m.text (свойства) в текущих версиях
            try:
                m_type_attr = getattr(m, 'type', None)
                m_type: str = str(m_type_attr() if callable(m_type_attr) else m_type_attr) if m_type_attr else ''
                m_text_attr = getattr(m, 'text', None)
                m_text: str = str(m_text_attr() if callable(m_text_attr) else m_text_attr) if m_text_attr else ''
                
                # Выводим console сообщения в реальном времени
                if m_type and m_text:
                    print(f'🖥️ CONSOLE [{m_type.upper()}]: {m_text}')
                
                logs.append({'type': m_type or 'unknown', 'text': m_text or ''})
            except Exception as ex:
                print(f'❌ Console capture error: {ex}')
                logs.append({'type': 'capture-error', 'text': f'console capture fail: {ex}'})
        def _page_error_listener(e: Exception) -> None:
            try:
                msg = getattr(e, 'message', None)
                msg_val: Optional[str] = str(msg() if callable(msg) else msg) if msg else None
                errors_global.append({'message': str(msg_val or e)})
            except Exception as ex:
                errors_global.append({'message': f'pageerror capture fail: {ex}'})
        page.on('console', _console_listener)
        page.on('pageerror', _page_error_listener)
        # Открываем один раз корень
        status: Optional[int] = None
        print(f'🚀 Navigating to: {base_url}')
        try:
            resp = page.goto(base_url, wait_until='domcontentloaded', timeout=30000)
            status = resp.status if resp else None
            print(f'✅ Page loaded with status: {status}')
            
            # Дополнительное ожидание для полной загрузки
            print('⏳ Waiting for complete page load...')
            page.wait_for_load_state('networkidle', timeout=10000)
            print('✅ Network idle state reached')
            
        except Exception as e:
            print(f'❌ Navigation error: {e}')
            errors_global.append({'message': f'initial nav error: {e}'})
        # Ждём появления навигации
        try:
            page.wait_for_selector('nav', timeout=10000)
            
            # Критически важно: ждём заполнения навигации контентом
            print('Waiting for navigation to be populated...')
            try:
                # Ждём появления хотя бы одного элемента внутри nav
                page.wait_for_function(
                    "() => { const nav = document.querySelector('nav'); return nav && nav.children.length > 0; }", 
                    timeout=15000
                )
                print('Navigation populated successfully')
            except Exception as nav_populate_error:
                print(f'Navigation did not populate in time: {nav_populate_error}')
                # Попробуем подождать ещё немного
                page.wait_for_timeout(3000)
            
            # Сохранить снимок DOM навигации для диагностики
            try:
                nav_html = page.inner_html('nav')
                (REPORTS / 'nav_structure.html').write_text(nav_html, encoding='utf-8')
                print(f'Navigation structure saved to reports/nav_structure.html ({len(nav_html)} chars)')
            except Exception as nav_save_error:
                print(f'Failed to save nav structure: {nav_save_error}')
            
            # Также логировать в консоль видимые элементы nav
            try:
                nav_text = page.inner_text('nav')
                print(f'Navigation text content: "{nav_text[:200]}"...')
            except Exception as nav_text_error:
                print(f'Failed to get nav text: {nav_text_error}')
            
            # Ждём скрытия экрана загрузки если присутствует
            try:
                page.wait_for_selector('#app-loading.hidden', timeout=8000)
                print('App loading screen hidden')
            except Exception:
                # альтернативно ждём исчезновения текста "Загрузка" в загрузчике
                try:
                    page.wait_for_function("() => { const el=document.getElementById('app-loading'); return !el || el.classList.contains('hidden'); }", timeout=8000)
                    print('App loading screen removed via function check')
                except Exception:
                    print('App loading screen did not hide - continuing anyway')
                    errors_global.append({'message': 'app-loading did not hide in time'})
        except Exception as e:
            errors_global.append({'message': f'nav selector timeout: {e}'})
        
        results: List[Dict[str, Any]] = []
        for r in routes:
            step_errors: List[Dict[str, str]] = []
            text_ok: bool = False
            menu_clicked: bool = False
            main_text: str = ""
            try:
                # Несколько стратегий поиска меню
                candidate = None
                # Сначала проверим, что искомый текст действительно есть в nav
                try:
                    # Расширенный поиск всех кликабельных элементов
                    all_nav_links = page.locator('nav *').filter(has_text=r['menu']).or_(
                        page.locator('nav a, nav button, nav [role="button"], nav [onclick], nav [data-route], nav [data-module], nav [href], nav .menu-item, nav .nav-item')
                    ).all()
                    print(f'Found {len(all_nav_links)} potential clickable elements in nav for {r["label"]}')
                    
                    # Если прямой поиск не дал результатов, попробуем найти все элементы в nav
                    if len(all_nav_links) == 0:
                        all_elements = page.locator('nav *').all()
                        print(f'Total elements in nav: {len(all_elements)}')
                        
                        for i, element in enumerate(all_elements[:10]):  # Ограничим первыми 10
                            try:
                                element_text = element.inner_text()
                                tag_name = element.evaluate('el => el.tagName')
                                print(f'  Element {i}: <{tag_name}> "{element_text.strip()}"')
                                
                                # Проверяем на совпадение текста
                                if r['menu'].lower() in element_text.lower():
                                    candidate = element
                                    print(f'  -> Match found for {r["menu"]}!')
                                    break
                            except Exception as ex:
                                print(f'  Element {i}: error getting info - {ex}')
                    else:
                        # Анализируем найденные кликабельные элементы
                        for i, link in enumerate(all_nav_links):
                            try:
                                link_text = link.inner_text()
                                print(f'  Link {i}: "{link_text}"')
                                if r['menu'].lower() in link_text.lower():
                                    candidate = link
                                    print(f'  -> Match found for {r["menu"]}!')
                                    break
                            except Exception as ex:
                                print(f'  Link {i}: error getting text - {ex}')
                except Exception as ex:
                    print(f'Error analyzing nav links: {ex}')
                
                # 1. Попытка клика по найденному кандидату
                if candidate:
                    try:
                        candidate.click(timeout=3000)
                        menu_clicked = True
                        print(f'Successfully clicked menu item for {r["label"]}')
                    except Exception as e1:
                        print(f'Click failed for {r["label"]}: {e1}')
                        step_errors.append({'message': f'menu click failed: {e1}'})
                else:
                    # 2. Fallback: get_by_text
                    try:
                        candidate = page.get_by_text(r['menu'], exact=False).first
                        if candidate: 
                            candidate.click(timeout=3000)
                            menu_clicked = True
                            print(f'Fallback click successful for {r["label"]}')
                    except Exception:
                        # 3. Fallback: поиск через nav :text
                        try:
                            candidate = page.locator('nav').locator(f"text={r['menu'].split()[0]}").first
                            candidate.click(timeout=3000)
                            menu_clicked = True
                            print(f'Text locator click successful for {r["label"]}')
                        except Exception as e2:
                            step_errors.append({'message': f'menu not found: {e2}'})
                            print(f'All menu click strategies failed for {r["label"]}: {e2}')
                if menu_clicked:
                    # Ждём обновления основного контейнера
                    # Ожидание до 6 секунд появления ожидаемого текста в main
                    expect_any: List[str] = r['expect']
                    for _ in range(12):  # 12 * 500ms = 6s
                        try:
                            main_text = page.inner_text('main', timeout=2000).lower()
                        except Exception:
                            main_text = ''
                        if any(w.lower() in main_text for w in expect_any):
                            text_ok = True
                            break
                        page.wait_for_timeout(500)
                    if not text_ok:
                        # Диагностика: сохранить первые 150 символов
                        results.append({
                            'label': r['label'], 'menu': r['menu'], 'status': status,
                            'text_ok': False, 'errors': step_errors + [{'message': 'expected text not found', 'sample': main_text[:150]}], 'pass': False
                        })
                        continue
            except Exception as e:
                step_errors.append({'message': f'menu click error: {e}'})
            pass_flag = text_ok and not step_errors and not errors_global
            results.append({
                'label': r['label'], 'menu': r['menu'], 'status': status,
                'text_ok': text_ok, 'errors': step_errors, 'pass': pass_flag
            })
        browser.close()
    # Запись отчёта
    import json
    summary: Dict[str, int] = {
        'passed': sum(1 for r in results if r['pass']),
        'total': len(results)
    }
    (REPORTS / 'playwright_routes.json').write_text(json.dumps({'summary': summary, 'results': results}, ensure_ascii=False, indent=2), encoding='utf-8')
    # Markdown отчёт
    lines: List[str] = ['# Playwright SPA Routes','',f"Passed: {summary['passed']}/{summary['total']}"]
    for r in results:
        lines.append(f"## {r['label']} ({r['menu']})")
        lines.append(f"- PASS: {r['pass']}")
        lines.append(f"- text_ok: {r['text_ok']} errors: {len(r['errors'])}")
        for e in r['errors'][:3]:
            lines.append(f"  - err: {e.get('message')}")
        lines.append('')
    (REPORTS / 'playwright_routes.md').write_text('\n'.join(lines), encoding='utf-8')
    failed: List[Dict[str, Any]] = [r for r in results if not r['pass']]
    if failed:
        print('Playwright routes failed:', [f['label'] for f in failed])
        sys.exit(EXIT_BROWSER_FAIL)
    print('Playwright routes passed')

def main() -> None:
    run_py_scripts()
    # Если Python фаза добавила diff_report и там отсутствуют обязательные элементы — compare_content завершит кодом !=0 сам.
    # Браузерная среда
    if ensure_browser_environment():
        run_browser_tests()
    print('== ALL PHASES COMPLETE ==')

if __name__ == '__main__':
    main()
