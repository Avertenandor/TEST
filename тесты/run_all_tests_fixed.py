"""
Исправленный мастер-скрипт для запуска всех тестов.
Координирует выполнение всех типов тестов и создает сводный отчет.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, TypedDict


class TestSuite(TypedDict):
    name: str
    file: str
    description: str


class TestResult(TypedDict):
    name: str
    status: str
    duration: float
    report: Dict[str, Any]
    error: str


def run_test_suite(test_file: str, url: str, timeout: int, headless: bool) -> Dict[str, Any]:
    """Запуск одного набора тестов"""
    try:
        cmd = [
            sys.executable, test_file,
            "--url", url,
            "--timeout", str(timeout),
            "--headless", str(int(headless))
        ]
        
        start_time = datetime.now()
        
        if os.name == 'nt':  # Windows
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                timeout=timeout/1000 + 60,
                creationflags=subprocess.CREATE_NO_WINDOW
            )
        else:
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                timeout=timeout/1000 + 60
            )
        
        duration = (datetime.now() - start_time).total_seconds()
        
        # Парсим JSON вывод
        if result.stdout.strip():
            try:
                report = json.loads(result.stdout.strip())
                return {
                    "status": "PASS" if result.returncode == 0 else "FAIL",
                    "duration": duration,
                    "report": report,
                    "error": result.stderr if result.stderr else ""
                }
            except json.JSONDecodeError:
                return {
                    "status": "FAIL",
                    "duration": duration,
                    "report": {"raw_output": result.stdout},
                    "error": f"Invalid JSON output: {result.stderr}"
                }
        else:
            return {
                "status": "FAIL",
                "duration": duration,
                "report": {},
                "error": result.stderr or "No output"
            }
            
    except subprocess.TimeoutExpired:
        return {
            "status": "TIMEOUT",
            "duration": timeout/1000,
            "report": {},
            "error": f"Test timed out after {timeout}ms"
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "duration": 0.0,
            "report": {},
            "error": str(e)
        }


def run_all_tests(url: str, timeout: int = 25000, headless: bool = True) -> Dict[str, Any]:
    """Запуск всех тестов"""
    base_path = Path(__file__).parent
    artifacts_dir = base_path / "_artifacts"
    artifacts_dir.mkdir(exist_ok=True)
    
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Список всех тестов
    test_suites: List[TestSuite] = [
        TestSuite(
            name="Landing Chrome Test",
            file=str(base_path / "e2e" / "test_landing_chrome.py"),
            description="Базовая проверка терминалов и DOM"
        ),
        TestSuite(
            name="Full Landing Test", 
            file=str(base_path / "e2e" / "test_full_landing.py"),
            description="Полная проверка функциональности лендинга"
        ),
        TestSuite(
            name="Console Monitor",
            file=str(base_path / "e2e" / "test_console_monitor.py"), 
            description="Мониторинг консоли и сетевых запросов"
        ),
        TestSuite(
            name="Functional Tests",
            file=str(base_path / "e2e" / "test_functional.py"),
            description="Функциональные тесты авторизации и кабинета"
        ),
        TestSuite(
            name="JavaScript Unit Tests",
            file=str(base_path / "unit" / "test_js_modules.py"),
            description="Unit тесты JavaScript модулей"
        ),
        TestSuite(
            name="Performance Tests",
            file=str(base_path / "performance" / "test_performance.py"),
            description="Performance, accessibility, SEO тесты"
        )
    ]
    
    results: List[Dict[str, Any]] = []
    total_passed = 0
    total_failed = 0
    
    print(f"🚀 Запуск полного набора тестов для {url}")
    print(f"📊 Всего тестовых наборов: {len(test_suites)}")
    print("=" * 60)
    
    for i, suite in enumerate(test_suites, 1):
        print(f"[{i}/{len(test_suites)}] {suite['name']}...")
        
        test_file_path = Path(suite["file"])
        if not test_file_path.exists():
            result: Dict[str, Any] = {
                "suite_name": suite["name"],
                "status": "SKIP",
                "duration": 0.0,
                "report": {},
                "error": f"Test file not found: {test_file_path}",
                "file_path": suite["file"]
            }
        else:
            result = run_test_suite(suite["file"], url, timeout, headless)
            result["suite_name"] = suite["name"]
            result["file_path"] = suite["file"]

        results.append(result)
        
        # Вывод результата
        if result["status"] == "PASS":
            print(f"   ✅ PASS - {result.get('duration', 0):.1f}s")
            total_passed += 1
        elif result["status"] == "SKIP":
            print(f"   ⏭️  SKIP - {result.get('error', 'Unknown')}")
        else:
            print(f"   ❌ FAIL - {result.get('error', 'Unknown')}")
            total_failed += 1
    
    # Общая статистика
    total_tests = total_passed + total_failed
    success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
    
    print("\n" + "=" * 60)
    print(f"📈 Итоговая статистика:")
    print(f"   ✅ Пройдено: {total_passed}")
    print(f"   ❌ Не пройдено: {total_failed}")
    print(f"   📊 Процент успеха: {success_rate:.1f}%")
    
    # Создание итогового отчета
    final_report: Dict[str, Any] = {
        "timestamp": ts,
        "url": url,
        "config": {
            "timeout": timeout,
            "headless": headless
        },
        "summary": {
            "total_suites": len(test_suites),
            "passed": total_passed,
            "failed": total_failed,
            "skipped": len(test_suites) - total_tests,
            "success_rate": success_rate
        },
        "results": results
    }
    
    # Сохранение отчета
    report_file = artifacts_dir / f"full_test_report_{ts}.json"
    try:
        report_file.write_text(
            json.dumps(final_report, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
        print(f"📋 Отчет сохранен: {report_file}")
    except Exception as e:
        print(f"⚠️  Ошибка сохранения отчета: {e}")
    
    return final_report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Запуск всех тестов GENESIS DeFi Platform")
    parser.add_argument(
        "--url", 
        default=os.environ.get("GENESIS_SITE_URL", "https://crypto-processing.net/"),
        help="URL сайта для тестирования"
    )
    parser.add_argument(
        "--timeout", 
        type=int, 
        default=30000,
        help="Timeout для каждого теста в миллисекундах"
    )
    parser.add_argument(
        "--headless", 
        type=int, 
        default=int(os.environ.get("HEADLESS", "1")),
        help="Headless режим (1=да, 0=нет)"
    )
    
    args = parser.parse_args()
    
    try:
        final_report = run_all_tests(args.url, args.timeout, bool(args.headless))
        
        # Код выхода зависит от результатов
        success_rate = final_report["summary"]["success_rate"]
        if success_rate >= 80:
            sys.exit(0)  # Успех
        elif success_rate >= 50:
            sys.exit(1)  # Частичный успех
        else:
            sys.exit(2)  # Неудача
            
    except KeyboardInterrupt:
        print("\n⚠️ Тестирование прервано пользователем")
        sys.exit(130)
    except Exception as e:
        print(f"💥 Критическая ошибка: {e}")
        sys.exit(3)
