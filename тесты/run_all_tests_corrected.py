"""
Мастер-скрипт для запуска всех исправленных тестов GENESIS.
Координирует выполнение всех типов тестов и создает сводный отчет.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
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


class MasterReport(TypedDict):
    url: str
    timestamp: str
    total_execution_time: float
    test_suites: List[TestSuiteResult]
    summary: Dict[str, Any]
    status: str


def run_test_suite(test_file: str, url: str, headless: int, timeout: int = 30000) -> TestSuiteResult:
    """Запуск одного набора тестов"""
    print(f"🔄 Запуск {test_file}...")
    
    start_time = time.time()
    
    try:
        # Подготавливаем команду
        cmd = [
            sys.executable,
            test_file,
            "--url", url,
            "--headless", str(headless),
            "--timeout", str(timeout)
        ]
        
        # Запускаем тест
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout // 1000 + 60,  # Таймаут в секундах + запас
            cwd=Path(__file__).parent.parent
        )
        
        execution_time = time.time() - start_time
        
        status = "PASS" if result.returncode == 0 else "FAIL"
        
        return TestSuiteResult(
            name=Path(test_file).stem,
            status=status,
            exit_code=result.returncode,
            output=result.stdout + result.stderr,
            execution_time=execution_time
        )
        
    except subprocess.TimeoutExpired:
        execution_time = time.time() - start_time
        return TestSuiteResult(
            name=Path(test_file).stem,
            status="TIMEOUT",
            exit_code=-1,
            output="Test timed out",
            execution_time=execution_time
        )
    except Exception as e:
        execution_time = time.time() - start_time
        return TestSuiteResult(
            name=Path(test_file).stem,
            status="ERROR",
            exit_code=-1,
            output=f"Error running test: {str(e)}",
            execution_time=execution_time
        )


def run_all_tests(url: str, headless: int = 1, timeout: int = 30000) -> MasterReport:
    """Запуск всех тестовых наборов"""
    start_time = time.time()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Список исправленных тестов
    test_files = [
        "тесты/e2e/test_landing_chrome.py",
        "тесты/e2e/test_full_landing_fixed.py", 
        "тесты/e2e/test_functional_fixed.py",
        "тесты/e2e/test_console_monitor.py",
        "тесты/performance/test_performance_fixed.py"
    ]
    
    # Проверяем существование файлов
    existing_tests: List[str] = []
    for test_file in test_files:
        test_path = Path(__file__).parent.parent / test_file
        if test_path.exists():
            existing_tests.append(str(test_path))
        else:
            print(f"⚠️  Тест не найден: {test_file}")
    
    print(f"🚀 Запуск {len(existing_tests)} тестовых наборов...")
    print(f"📍 URL: {url}")
    print(f"👁️  Headless: {'Да' if headless else 'Нет'}")
    print("-" * 60)
    
    # Запускаем тесты последовательно
    test_results: List[TestSuiteResult] = []
    
    for test_file in existing_tests:
        result = run_test_suite(test_file, url, headless, timeout)
        test_results.append(result)
        
        # Выводим краткий результат
        status_emoji = "✅" if result["status"] == "PASS" else "❌" if result["status"] == "FAIL" else "⏰"
        print(f"{status_emoji} {result['name']}: {result['status']} ({result['execution_time']:.1f}s)")
    
    total_time = time.time() - start_time
    
    # Подсчитываем статистику
    passed = len([r for r in test_results if r["status"] == "PASS"])
    failed = len([r for r in test_results if r["status"] == "FAIL"])
    errors = len([r for r in test_results if r["status"] == "ERROR"])
    timeouts = len([r for r in test_results if r["status"] == "TIMEOUT"])
    
    overall_status = "PASS" if passed == len(test_results) else "FAIL"
    
    summary: Dict[str, Any] = {
        "total_suites": len(test_results),
        "passed": passed,
        "failed": failed,
        "errors": errors,
        "timeouts": timeouts,
        "pass_rate": (passed / len(test_results) * 100) if test_results else 0
    }
    
    return MasterReport(
        url=url,
        timestamp=timestamp,
        total_execution_time=total_time,
        test_suites=test_results,
        summary=summary,
        status=overall_status
    )


def save_report(report: MasterReport) -> None:
    """Сохранение отчета"""
    artifacts_dir = Path("тесты/_artifacts")
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    
    report_file = artifacts_dir / f"master_test_report_{report['timestamp']}.json"
    
    try:
        report_file.write_text(
            json.dumps(report, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
        print(f"📄 Отчет сохранен: {report_file}")
    except Exception as e:
        print(f"⚠️  Ошибка сохранения отчета: {e}")


def print_summary(report: MasterReport) -> None:
    """Вывод итогового отчета"""
    print("\n" + "=" * 60)
    print("📊 ИТОГОВЫЙ ОТЧЕТ")
    print("=" * 60)
    
    summary = report["summary"]
    print(f"🌐 URL: {report['url']}")
    print(f"⏱️  Общее время: {report['total_execution_time']:.1f} сек")
    print(f"📈 Проходимость: {summary['pass_rate']:.1f}%")
    print(f"✅ Пройдено: {summary['passed']}")
    print(f"❌ Провалено: {summary['failed']}")
    print(f"💥 Ошибки: {summary['errors']}")
    print(f"⏰ Таймауты: {summary['timeouts']}")
    
    print(f"\n🎯 Общий статус: {report['status']}")
    
    # Детали по каждому тесту
    print("\n📋 Детали по тестам:")
    for suite in report["test_suites"]:
        status_emoji = "✅" if suite["status"] == "PASS" else "❌" if suite["status"] == "FAIL" else "⚠️ "
        print(f"  {status_emoji} {suite['name']}: {suite['status']} ({suite['execution_time']:.1f}s)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Запуск всех тестов GENESIS")
    parser.add_argument("--url", default=os.environ.get("GENESIS_SITE_URL", "https://crypto-processing.net/"))
    parser.add_argument("--headless", type=int, default=int(os.environ.get("HEADLESS", "1")))
    parser.add_argument("--timeout", type=int, default=30000)
    parser.add_argument("--save-report", action="store_true", help="Сохранить JSON отчет")
    args = parser.parse_args()
    
    try:
        # Запускаем все тесты
        report = run_all_tests(args.url, args.headless, args.timeout)
        
        # Выводим результаты
        print_summary(report)
        
        # Сохраняем отчет если нужно
        if args.save_report:
            save_report(report)
        
        # Возвращаем код выхода
        exit_code = 0 if report["status"] == "PASS" else 1
        raise SystemExit(exit_code)
        
    except KeyboardInterrupt:
        print("\n⏹️  Тестирование прервано пользователем")
        raise SystemExit(130)
    except Exception as e:
        print(f"\n💥 Критическая ошибка: {e}")
        raise SystemExit(1)
