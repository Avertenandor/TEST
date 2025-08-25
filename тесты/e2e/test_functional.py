"""
E2E: Функциональные тесты авторизации и кабинета.
Тестирует:
- Процесс авторизации через PLEX
- Переход в личный кабинет  
- Работу терминала в кабинете
- Базовую навигацию
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


class TestResult(TypedDict):
    name: str
    status: str
    details: str
    errors: List[str]


class FunctionalTestReport(TypedDict):
    url: str
    time: str
    results: Dict[str, Any]
    status: str
    failures: List[str]


def test_authorization_flow(page: Page) -> TestResult:
    """Тест процесса авторизации"""
    errors: List[str] = []
    
    try:
        # Проверяем наличие QR секции
        qr_section = page.query_selector("#qr-section")
        if not qr_section:
            errors.append("QR секция не найдена")
            return {
                "name": "authorization_flow",
                "status": "FAIL", 
                "details": "QR секция отсутствует",
                "errors": errors
            }

        # Проверяем адрес авторизации
        auth_address = page.query_selector(".auth-address")
        if not auth_address:
            errors.append("Адрес авторизации не найден")

        # Проверяем QR код
        qr_code = page.query_selector("#genesis-qr-code img, #genesis-qr-code canvas")
        if not qr_code:
            errors.append("QR код не сгенерирован")

    except Exception as e:
        errors.append(f"Ошибка при тесте авторизации: {str(e)}")

    return {
        "name": "authorization_flow",
        "status": "PASS" if not errors else "FAIL",
        "details": f"Проверено: QR секция, адрес, код. Ошибок: {len(errors)}",
        "errors": errors
    }


def test_cabinet_access(page: Page) -> TestResult:
    """Тест доступа к кабинету"""
    errors: List[str] = []
    
    try:
        # Ищем кнопку входа в кабинет
        cabinet_btn = page.query_selector("button:has-text('Войти в личный кабинет')")
        if not cabinet_btn:
            errors.append("Кнопка входа в кабинет не найдена")
            return {
                "name": "cabinet_access",
                "status": "FAIL",
                "details": "Кнопка входа отсутствует",
                "errors": errors
            }

        # Пытаемся перейти в кабинет
        page.click("button:has-text('Войти в личный кабинет')")
        page.wait_for_timeout(3000)
        
        # Проверяем, что попали на страницу кабинета
        current_url = page.url
        if "app.html" not in current_url:
            errors.append(f"Не удалось перейти в кабинет, URL: {current_url}")

    except Exception as e:
        errors.append(f"Ошибка при переходе в кабинет: {str(e)}")

    return {
        "name": "cabinet_access", 
        "status": "PASS" if not errors else "FAIL",
        "details": f"Проверен переход в кабинет. Ошибок: {len(errors)}",
        "errors": errors
    }


def test_terminal_in_cabinet(page: Page) -> TestResult:
    """Тест терминала в кабинете"""
    errors: List[str] = []
    
    try:
        # Проверяем, что мы в кабинете
        if "app.html" not in page.url:
            errors.append("Не находимся в кабинете")
            return {
                "name": "terminal_in_cabinet",
                "status": "FAIL", 
                "details": "Тест запущен не в кабинете",
                "errors": errors
            }

        # Ждём загрузки модульного терминала
        page.wait_for_timeout(5000)
        
        # Проверяем наличие модульного терминала
        terminal = page.query_selector("#cabinet-genesis-terminal")
        if not terminal:
            errors.append("Терминал не найден в кабинете")

        # Проверяем API терминала
        terminal_api = page.evaluate("() => window.CabinetTerminal ? 'present' : 'missing'")
        if terminal_api != "present":
            errors.append("Terminal API недоступен")

    except Exception as e:
        errors.append(f"Ошибка при проверке терминала: {str(e)}")

    return {
        "name": "terminal_in_cabinet",
        "status": "PASS" if not errors else "FAIL",
        "details": f"Проверен терминал в кабинете. Ошибок: {len(errors)}",
        "errors": errors
    }


def run_functional_tests(url: str, timeout: int = 30000, headless: bool = True) -> FunctionalTestReport:
    """Запуск всех функциональных тестов"""
    artifacts_dir = Path("тесты/e2e/_artifacts")
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    test_results: List[TestResult] = []
    
    with sync_playwright() as p:
        channel_env = os.environ.get("BROWSER_CHANNEL", "chrome")
        try:
            browser = p.chromium.launch(channel=channel_env, headless=headless)
        except Exception:
            browser = p.chromium.launch(headless=headless)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Загружаем главную страницу
            page.goto(url, wait_until="load", timeout=timeout)
            page.wait_for_load_state("networkidle", timeout=timeout)
            time.sleep(2)

            # Тест авторизации
            auth_test = test_authorization_flow(page)
            test_results.append(auth_test)

            # Тест доступа к кабинету
            cabinet_test = test_cabinet_access(page)
            test_results.append(cabinet_test)

            # Если удалось попасть в кабинет, тестируем терминал
            if cabinet_test["status"] == "PASS":
                terminal_test = test_terminal_in_cabinet(page)
                test_results.append(terminal_test)

        except Exception as e:
            error_result: TestResult = {
                "name": "critical_error",
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

    report: FunctionalTestReport = {
        "url": url,
        "time": ts,
        "results": {
            "total_tests": total,
            "passed": passed,
            "failed": total - passed,
            "tests": test_results
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
    
    result = run_functional_tests(args.url, args.timeout, bool(args.headless))
    raise SystemExit(0 if result["status"] == "PASS" else 1)