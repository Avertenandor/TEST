r"""
Функциональные тесты: авторизация, навигация между страницами, кабинет.
Проверяет полный пользовательский флоу с правильной типизацией.

Запуск:
  python .\тесты\e2e\test_functional_fixed.py --url https://crypto-processing.net/ --headless 0
"""
from __future__ import annotations

import argparse
import json
import os
import time
from datetime import datetime
from typing import Any, Dict, List, TypedDict

from playwright.sync_api import ConsoleMessage, sync_playwright


class TestResult(TypedDict):
    test_name: str
    status: str
    details: Dict[str, Any]
    errors: List[str]


class FunctionalReport(TypedDict):
    url: str
    time: str
    status: str
    tests: List[TestResult]
    summary: Dict[str, Any]


def test_homepage_functionality(page: Any) -> TestResult:
    """Тест функциональности главной страницы"""
    errors: List[str] = []
    details: Dict[str, Any] = {}
    
    # Проверка загрузки и базовых элементов
    title = page.title()
    if not title or "GENESIS" not in title:
        errors.append(f"Неправильный title: {title}")
    
    # Проверка QR-кода
    qr_container = page.query_selector("#genesis-qr-code")
    details["qr_container_exists"] = bool(qr_container)
    
    if qr_container:
        time.sleep(3)  # Ждем загрузки QR
        qr_content = qr_container.inner_html()
        details["qr_loaded"] = bool(qr_content and len(qr_content) > 10)
    
    # Проверка кнопки входа в кабинет
    cabinet_btn = page.query_selector("button[onclick*='app.html']")
    details["cabinet_button_exists"] = bool(cabinet_btn)
    
    return TestResult(
        test_name="homepage_functionality",
        status="PASS" if not errors else "FAIL",
        details=details,
        errors=errors
    )


def test_cabinet_navigation(page: Any, base_url: str) -> TestResult:
    """Тест навигации в кабинет"""
    errors: List[str] = []
    details: Dict[str, Any] = {}
    
    try:
        # Переходим на страницу кабинета
        cabinet_url = base_url.rstrip('/') + '/app.html'
        page.goto(cabinet_url, wait_until="load", timeout=30000)
        time.sleep(3)
        
        # Проверяем загрузку кабинета
        current_url = page.url
        details["cabinet_url_correct"] = 'app.html' in current_url
        
        # Проверяем наличие основных элементов кабинета
        app_container = page.query_selector("#app")
        module_loader = page.evaluate("() => typeof window.ModuleLoader")
        
        details["app_container_exists"] = bool(app_container)
        details["module_loader_available"] = module_loader != "undefined"
        
        # Проверяем инициализацию модульной системы
        bootstrap_ready = page.evaluate("() => typeof window.BootstrapReady")
        details["bootstrap_ready"] = bootstrap_ready != "undefined"
        
    except Exception as e:
        errors.append(f"Ошибка навигации в кабинет: {str(e)}")
    
    return TestResult(
        test_name="cabinet_navigation",
        status="PASS" if not errors else "FAIL",
        details=details,
        errors=errors
    )


def test_auth_process(page: Any) -> TestResult:
    """Тест процесса авторизации"""
    errors: List[str] = []
    details: Dict[str, Any] = {}
    
    try:
        # Ждем инициализации auth системы
        time.sleep(2)
        
        # Проверяем наличие auth API
        auth_api = page.evaluate("() => typeof window.Auth")
        details["auth_api_available"] = auth_api != "undefined"
        
        # Проверяем элементы авторизации
        auth_elements = page.query_selector_all("[data-auth]")
        details["auth_elements_count"] = len(auth_elements)
        
        # Проверяем localStorage для сохранения состояния авторизации
        has_local_storage = page.evaluate("() => typeof Storage !== 'undefined'")
        details["local_storage_available"] = has_local_storage
        
        if auth_api == "undefined":
            errors.append("Auth API недоступен")
            
    except Exception as e:
        errors.append(f"Ошибка проверки авторизации: {str(e)}")
    
    return TestResult(
        test_name="auth_process",
        status="PASS" if not errors else "FAIL",
        details=details,
        errors=errors
    )


def test_terminal_functionality(page: Any) -> TestResult:
    """Тест функциональности терминала"""
    errors: List[str] = []
    details: Dict[str, Any] = {}
    
    try:
        # Ждем загрузки терминала
        time.sleep(3)
        
        # Проверяем модульный терминал
        terminal_container = page.query_selector("#cabinet-genesis-terminal")
        details["terminal_container_exists"] = bool(terminal_container)
        
        # Проверяем API терминала
        terminal_api = page.evaluate("() => typeof window.GenesisTerminal")
        cabinet_terminal_api = page.evaluate("() => typeof window.CabinetTerminal")
        
        details["genesis_terminal_api"] = terminal_api != "undefined"
        details["cabinet_terminal_api"] = cabinet_terminal_api != "undefined"
        
        # Проверяем методы терминала
        if terminal_api != "undefined":
            terminal_methods = page.evaluate("""() => {
                const terminal = window.GenesisTerminal;
                return {
                    show: typeof terminal.show,
                    hide: typeof terminal.hide,
                    clear: typeof terminal.clear,
                    toggle: typeof terminal.toggle
                };
            }""")
            details["terminal_methods"] = terminal_methods
        
        if not terminal_container and terminal_api == "undefined":
            errors.append("Терминал не инициализирован")
            
    except Exception as e:
        errors.append(f"Ошибка проверки терминала: {str(e)}")
    
    return TestResult(
        test_name="terminal_functionality",
        status="PASS" if not errors else "FAIL",
        details=details,
        errors=errors
    )


def test_console_monitoring(page: Any) -> TestResult:
    """Тест мониторинга консоли на ошибки"""
    errors: List[str] = []
    details: Dict[str, Any] = {}
    
    console_errors: List[str] = []
    console_warnings: List[str] = []
    
    def handle_console(msg: ConsoleMessage) -> None:
        try:
            # Безопасное получение текста
            if hasattr(msg, 'text') and callable(getattr(msg, 'text')):
                text = str(msg.text())  # type: ignore[operator]
            else:
                text = str(getattr(msg, "text", ""))
                
            msg_type = str(getattr(msg, "type", ""))
            
            if msg_type == "error":
                console_errors.append(text)
            elif msg_type == "warning":
                console_warnings.append(text)
        except Exception:
            pass
    
    page.on("console", handle_console)
    
    # Даем время для сбора сообщений консоли
    time.sleep(5)
    
    details["console_errors_count"] = len(console_errors)
    details["console_warnings_count"] = len(console_warnings)
    details["console_errors"] = console_errors[:5]  # Первые 5 ошибок
    details["console_warnings"] = console_warnings[:5]  # Первые 5 предупреждений
    
    # Допускаем небольшое количество предупреждений, но не ошибок
    critical_errors = [err for err in console_errors if "TypeError" in err or "ReferenceError" in err]
    
    if critical_errors:
        errors.append(f"Критические ошибки в консоли: {len(critical_errors)}")
    
    return TestResult(
        test_name="console_monitoring",
        status="PASS" if not errors else "FAIL",
        details=details,
        errors=errors
    )


def run_functional_tests(url: str, timeout: int = 30000, headless: bool = True) -> FunctionalReport:
    """Запуск всех функциональных тестов"""
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    with sync_playwright() as p:
        channel_env = os.environ.get("BROWSER_CHANNEL", "chrome")
        try:
            browser = p.chromium.launch(channel=channel_env, headless=headless)
        except Exception:
            browser = p.chromium.launch(headless=headless)
        
        context = browser.new_context()
        page = context.new_page()
        
        # Загружаем главную страницу
        page.goto(url, wait_until="load", timeout=timeout)
        try:
            page.wait_for_load_state("networkidle", timeout=timeout)
        except Exception:
            pass
        
        time.sleep(3)
        
        # Запускаем тесты последовательно
        test_results: List[TestResult] = []
        
        test_results.append(test_homepage_functionality(page))
        test_results.append(test_cabinet_navigation(page, url))
        test_results.append(test_auth_process(page))
        test_results.append(test_terminal_functionality(page))
        test_results.append(test_console_monitoring(page))
        
        browser.close()
    
    # Подсчитываем результаты
    passed_tests = [t for t in test_results if t["status"] == "PASS"]
    failed_tests = [t for t in test_results if t["status"] == "FAIL"]
    
    return FunctionalReport(
        url=url,
        time=ts,
        status="PASS" if not failed_tests else "FAIL",
        tests=test_results,
        summary={
            "total_tests": len(test_results),
            "passed": len(passed_tests),
            "failed": len(failed_tests),
            "pass_rate": len(passed_tests) / len(test_results) * 100 if test_results else 0
        }
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=os.environ.get("GENESIS_SITE_URL", "http://127.0.0.1:5500/index.html"))
    parser.add_argument("--timeout", type=int, default=30000)
    parser.add_argument("--headless", type=int, default=int(os.environ.get("HEADLESS", "1")))
    args = parser.parse_args()
    
    report = run_functional_tests(args.url, args.timeout, bool(args.headless))
    print(json.dumps(report, ensure_ascii=False, indent=2))
    
    raise SystemExit(0 if report["status"] == "PASS" else 1)
