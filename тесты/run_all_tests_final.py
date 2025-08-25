"""
Мастер-запуск всех тестов GENESIS сайта.
Запускает:
- E2E тесты (landing, functional, console monitor)
- Unit тесты JS модулей
- Performance тесты
- Сохранение отчётов
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, TypedDict


class TestSuiteResult(TypedDict):
    name: str
    status: str
    exit_code: int
    output: str
    execution_time: float


class MasterTestReport(TypedDict):
    timestamp: str
    total_suites: int
    passed_suites: int
    failed_suites: int
    results: List[TestSuiteResult]
    status: str


def run_test_suite(name: str, description: str, file_path: str, url: str, timeout: int, headless: int) -> TestSuiteResult:
    """Запуск одной тестовой сюиты"""
    print(f"\n🔍 Запуск {name}: {description}")
    
    start_time = time.time()
    
    env = os.environ.copy()
    env["BROWSER_CHANNEL"] = "chrome"
    
    try:
        result = subprocess.run(
            ["python", file_path, "--url", url, "--timeout", str(timeout), "--headless", str(headless)],
            capture_output=True,
            text=True,
            timeout=timeout // 1000 + 60,  # Конвертируем в секунды + запас
            env=env
        )
        
        execution_time = time.time() - start_time
        
        return {
            "name": name,
            "status": "PASS" if result.returncode == 0 else "FAIL",
            "exit_code": result.returncode,
            "output": result.stdout + result.stderr,
            "execution_time": execution_time
        }
        
    except subprocess.TimeoutExpired:
        execution_time = time.time() - start_time
        return {
            "name": name,
            "status": "FAIL",
            "exit_code": -1,
            "output": f"Тест {name} превысил лимит времени {timeout//1000}s",
            "execution_time": execution_time
        }
    except Exception as e:
        execution_time = time.time() - start_time
        return {
            "name": name,
            "status": "FAIL", 
            "exit_code": -2,
            "output": f"Ошибка запуска {name}: {str(e)}",
            "execution_time": execution_time
        }


def run_all_tests(url: str, timeout: int = 30000, headless: int = 1, save_report: bool = False) -> MasterTestReport:
    """Запуск всех тестовых сюит"""
    print(f"🚀 Запуск всех тестов для {url}")
    print(f"⚙️  Параметры: timeout={timeout}ms, headless={bool(headless)}")
    
    test_suites = [
        {
            "name": "E2E_Landing_Chrome",
            "description": "E2E тест главной страницы в Chrome", 
            "file_path": "тесты/e2e/test_landing_chrome.py"
        },
        {
            "name": "E2E_Full_Landing",
            "description": "Полный функциональный тест главной страницы",
            "file_path": "тесты/e2e/test_full_landing.py"
        },
        {
            "name": "E2E_Functional",
            "description": "Тесты авторизации и кабинета",
            "file_path": "тесты/e2e/test_functional.py"
        },
        {
            "name": "E2E_Console_Monitor", 
            "description": "Мониторинг консоли браузера",
            "file_path": "тесты/e2e/test_console_monitor.py"
        },
        {
            "name": "Unit_JS_Modules",
            "description": "Unit тесты JS модулей",
            "file_path": "тесты/unit/test_js_modules.py"
        },
        {
            "name": "Performance",
            "description": "Тесты производительности",
            "file_path": "тесты/performance/test_performance.py"
        }
    ]
    
    results: List[TestSuiteResult] = []
    
    for suite in test_suites:
        # Проверяем существование файла
        if not Path(suite["file_path"]).exists():
            results.append({
                "name": suite["name"],
                "status": "FAIL",
                "exit_code": -3,
                "output": f"Файл теста не найден: {suite['file_path']}",
                "execution_time": 0.0
            })
            continue
            
        result = run_test_suite(
            suite["name"],
            suite["description"], 
            suite["file_path"],
            url,
            timeout,
            headless
        )
        results.append(result)
        
        # Показываем статус
        status_emoji = "✅" if result["status"] == "PASS" else "❌"
        print(f"{status_emoji} {suite['name']}: {result['status']} ({result['execution_time']:.1f}s)")

    # Статистика
    passed = sum(1 for r in results if r["status"] == "PASS")
    total = len(results)

    report: MasterTestReport = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_suites": total,
        "passed_suites": passed,
        "failed_suites": total - passed,
        "results": results,
        "status": "PASS" if passed == total else "FAIL"
    }

    # Выводим итоговую статистику
    print(f"\n📊 ИТОГИ:")
    print(f"   Всего тестов: {total}")
    print(f"   Прошли: {passed}")
    print(f"   Упали: {total - passed}")
    print(f"   Статус: {'🟢 PASS' if report['status'] == 'PASS' else '🔴 FAIL'}")

    # Сохраняем отчёт
    if save_report:
        artifacts_dir = Path("тесты/_reports")
        artifacts_dir.mkdir(parents=True, exist_ok=True)
        report_path = artifacts_dir / f"master_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        try:
            report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"💾 Отчёт сохранён: {report_path}")
        except Exception as e:
            print(f"⚠️  Ошибка сохранения отчёта: {e}")

    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Запуск всех тестов GENESIS сайта")
    parser.add_argument("--url", default=os.environ.get("GENESIS_SITE_URL", "https://crypto-processing.net/"))
    parser.add_argument("--timeout", type=int, default=30000)
    parser.add_argument("--headless", type=int, default=int(os.environ.get("HEADLESS", "1")))
    parser.add_argument("--save-report", action="store_true", help="Сохранить отчёт в JSON")
    args = parser.parse_args()
    
    result = run_all_tests(args.url, args.timeout, args.headless, args.save_report)
    raise SystemExit(0 if result["status"] == "PASS" else 1)