"""
Unit тесты для JS модулей сайта.
Проверяет:
- Загрузку и инициализацию модулей
- Корректность API
- Обработку ошибок
"""
from __future__ import annotations

import argparse
import json
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, TypedDict

from playwright.sync_api import Page, sync_playwright


class ModuleTestResult(TypedDict):
    module: str
    status: str
    details: str
    errors: List[str]


class UnitTestReport(TypedDict):
    url: str
    time: str
    results: Dict[str, Any]
    status: str
    failures: List[str]


def test_home_module(page: Page) -> ModuleTestResult:
    """Тест модуля home.module.js"""
    errors: List[str] = []
    
    try:
        # Проверяем загрузку модуля
        module_exists = page.evaluate("() => window.GenesisModules && window.GenesisModules.home ? true : false")
        if not module_exists:
            errors.append("Home модуль не загружен")

        # Проверяем API модуля
        has_api = page.evaluate("() => typeof window.GenesisModules?.home?.init === 'function'")
        if not has_api:
            errors.append("Home модуль не имеет API init")

    except Exception as e:
        errors.append(f"Ошибка при тесте home модуля: {str(e)}")

    return {
        "module": "home",
        "status": "PASS" if not errors else "FAIL",
        "details": f"Проверен home модуль. Ошибок: {len(errors)}",
        "errors": errors
    }


def test_terminal_module(page: Page) -> ModuleTestResult:
    """Тест модуля terminal"""
    errors: List[str] = []
    
    try:
        # Проверяем bootstrap терминала
        bootstrap_loaded = page.evaluate("() => window.GenesisTerminal ? true : false")
        if not bootstrap_loaded:
            errors.append("Terminal bootstrap не загружен")

        # Проверяем API bootstrap
        api_methods = page.evaluate("""() => {
            const api = window.GenesisTerminal;
            if (!api) return [];
            return Object.keys(api).filter(key => typeof api[key] === 'function');
        }""")
        
        expected_methods = ["show", "hide", "toggle", "clear"]
        missing_methods = [m for m in expected_methods if m not in api_methods]
        if missing_methods:
            errors.append(f"Отсутствуют методы API: {missing_methods}")

    except Exception as e:
        errors.append(f"Ошибка при тесте terminal модуля: {str(e)}")

    return {
        "module": "terminal",
        "status": "PASS" if not errors else "FAIL", 
        "details": f"Проверен terminal модуль. Ошибок: {len(errors)}",
        "errors": errors
    }


def test_auth_module(page: Page) -> ModuleTestResult:
    """Тест модуля авторизации"""
    errors: List[str] = []
    
    try:
        # Проверяем константы авторизации
        auth_config = page.evaluate("() => window.AUTH_CONFIG || null")
        if not auth_config:
            errors.append("AUTH_CONFIG не определен")
        else:
            required_fields = ["address", "network", "chainId"]
            missing_fields = [f for f in required_fields if f not in auth_config]
            if missing_fields:
                errors.append(f"AUTH_CONFIG: отсутствуют поля {missing_fields}")

        # Проверяем функции QR
        qr_functions = page.evaluate("""() => {
            return {
                generateQRCode: typeof window.generateQRCode,
                refreshQRCode: typeof window.refreshQRCode,
                copyAddress: typeof window.copyAddress
            };
        }""")
        
        if qr_functions.get("generateQRCode") != "function":
            errors.append("generateQRCode функция не найдена")

    except Exception as e:
        errors.append(f"Ошибка при тесте auth модуля: {str(e)}")

    return {
        "module": "auth",
        "status": "PASS" if not errors else "FAIL",
        "details": f"Проверен auth модуль. Ошибок: {len(errors)}",
        "errors": errors
    }


def run_unit_tests(url: str, timeout: int = 30000, headless: bool = True) -> UnitTestReport:
    """Запуск unit тестов JS модулей"""
    artifacts_dir = Path("тесты/unit/_artifacts")
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    test_results: List[ModuleTestResult] = []

    with sync_playwright() as p:
        channel_env = os.environ.get("BROWSER_CHANNEL", "chrome")
        try:
            browser = p.chromium.launch(channel=channel_env, headless=headless)
        except Exception:
            browser = p.chromium.launch(headless=headless)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Загружаем страницу
            page.goto(url, wait_until="load", timeout=timeout)
            page.wait_for_load_state("networkidle", timeout=timeout)
            time.sleep(3)  # Ждём инициализации модулей

            # Запускаем тесты модулей
            test_results.append(test_home_module(page))
            test_results.append(test_terminal_module(page))
            test_results.append(test_auth_module(page))

        except Exception as e:
            error_result: ModuleTestResult = {
                "module": "critical_error",
                "status": "FAIL",
                "details": f"Критическая ошибка: {str(e)}",
                "errors": [str(e)]
            }
            test_results.append(error_result)

        finally:
            browser.close()

    # Собираем статистику
    passed = sum(1 for test in test_results if test["status"] == "PASS")
    total = len(test_results)

    all_errors: List[str] = []
    for test in test_results:
        all_errors.extend(test["errors"])

    report: UnitTestReport = {
        "url": url,
        "time": ts,
        "results": {
            "total_modules": total,
            "passed": passed,
            "failed": total - passed,
            "modules": test_results
        },
        "status": "PASS" if passed == total else "FAIL",
        "failures": all_errors,
    }

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=os.environ.get("GENESIS_SITE_URL", "http://127.0.0.1:5500/index.html"))
    parser.add_argument("--timeout", type=int, default=30000)
    parser.add_argument("--headless", type=int, default=int(os.environ.get("HEADLESS", "1")))
    args = parser.parse_args()
    
    result = run_unit_tests(args.url, args.timeout, bool(args.headless))
    raise SystemExit(0 if result["status"] == "PASS" else 1)