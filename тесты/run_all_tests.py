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


class TestSuite(TypedDict):
    name: str
    file: str
    description: str


class TestSuiteResult(TypedDict):
    name: str
    status: str
    exit_code: int
    output: str
    execution_time: float
    suite_name: str
    description: str
    file_path: str
    error: str


class MasterReport(TypedDict):
    url: str
    timestamp: str
    total_execution_time: float
    test_suites: List[TestSuiteResult]


def run_test_suite(test_file: str, url: str, headless: bool, timeout: int = 30000) -> Dict[str, Any]:
    """Запуск одного набора тестов"""
    print(f"🔄 Запуск {test_file}...")
    
    start_time = time.time()
    
    try:
        # Подготавливаем команду
        cmd = [
            sys.executable,
            test_file,
            "--url", url,
            "--headless", str(int(headless)),
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
        
        return {
            "name": Path(test_file).stem,
            "status": status,
            "exit_code": result.returncode,
            "output": result.stdout + result.stderr,
            "execution_time": execution_time,
            "error": "" if status == "PASS" else "Test failed",
            "all_errors": []
        }
    except subprocess.TimeoutExpired:
        execution_time = time.time() - start_time
        return {
            "name": Path(test_file).stem,
            "status": "TIMEOUT",
            "exit_code": -1,
            "output": "Test timed out",
            "execution_time": execution_time,
            "error": "Test timed out",
            "all_errors": ["Test timed out"]
        }
    except Exception as e:
        execution_time = time.time() - start_time
        return {
            "name": Path(test_file).stem,
            "status": "ERROR",
            "exit_code": -1,
            "output": f"Error running test: {str(e)}",
            "execution_time": execution_time,
            "error": str(e),
            "all_errors": [str(e)]
        }


def run_all_tests(url: str, timeout: int = 25000, headless: bool = True) -> Dict[str, Any]:
    """Запуск всех тестов"""
    base_path = Path(__file__).parent
    artifacts_dir = base_path / "_artifacts"
    artifacts_dir.mkdir(exist_ok=True)
    
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    start_time = time.time()
    
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
    total_skipped = 0
    
    print(f"🚀 Запуск полного набора тестов для {url}")
    print(f"📊 Всего тестовых наборов: {len(test_suites)}")
    print("=" * 60)
    
    for i, suite in enumerate(test_suites, 1):
        print(f"[{i}/{len(test_suites)}] {suite['name']}...")
        
        test_file_path = Path(suite["file"])
        
        # Проверяем существование файла
        if not test_file_path.exists():
            result: Dict[str, Any] = {
                "name": Path(suite["file"]).stem,
                "status": "SKIP",
                "exit_code": -1,
                "output": f"Test file not found: {suite['file']}",
                "execution_time": 0,
                "error": "File not found",
                "suite_name": suite["name"],
                "description": suite["description"],
                "file_path": str(suite["file"]),
                "all_errors": [f"File not found: {suite['file']}"]
            }
            total_skipped += 1
        else:
            result = run_test_suite(str(suite["file"]), url, headless, timeout)
            result["suite_name"] = suite["name"]
            result["description"] = suite["description"]
            result["file_path"] = str(suite["file"])
            
            # Подсчет результатов
            if result["status"] == "PASS":
                total_passed += 1
            elif result["status"] != "SKIP":
                total_failed += 1
        
        results.append(result)
        
        # Вывод статуса
        if result["status"] == "PASS":
            print(f"   ✅ PASS")
        elif result["status"] == "SKIP":
            print(f"   ⏭️  SKIP - {result.get('error', 'Unknown')}")
        else:
            print(f"   ❌ FAIL - {result.get('error', 'Unknown')}")
    
    print("=" * 60)
    
    # Сводная статистика
    total_tests = total_passed + total_failed
    success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
    total_execution_time = time.time() - start_time
    
    # Сбор всех ошибок
    all_errors: List[str] = []
    for result in results:
        if "all_errors" in result and result["all_errors"]:
            all_errors.extend(result["all_errors"])
        elif result["status"] in ["FAIL", "ERROR", "TIMEOUT"] and "error" in result:
            all_errors.append(f"{result.get('suite_name', result['name'])}: {result['error']}")
    
    # Финальный отчет
    final_report: Dict[str, Any] = {
        "url": url,
        "timestamp": ts,
        "test_type": "full_test_suite",
        "total_execution_time": total_execution_time,
        "summary": {
            "total_suites": len(test_suites),
            "passed": total_passed,
            "failed": total_failed,
            "skipped": total_skipped,
            "success_rate": f"{success_rate:.1f}%"
        },
        "suite_results": results,
        "all_errors": all_errors[:20],  # Первые 20 ошибок
        "artifacts_directory": str(artifacts_dir),
        "status": "PASS" if total_failed == 0 and total_passed > 0 else "FAIL"
    }
    
    # Сохранение сводного отчета
    report_path = artifacts_dir / f"master_report_{ts}.json"
    try:
        report_path.write_text(json.dumps(final_report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"📄 Сводный отчет сохранен: {report_path}")
    except Exception as e:
        print(f"⚠️  Ошибка сохранения отчета: {e}")
    
    # Сохранение в REPORT_GENESIS.md
    try:
        genesis_report_path = Path("C:/Users/konfu/Desktop/Sites/Experiment/Experiment1/GENESIS-Website-Clean/REPORT_GENESIS.md")
        if genesis_report_path.exists():
            existing_content = genesis_report_path.read_text(encoding="utf-8")
        else:
            existing_content = "# GENESIS Test Reports\n\n"
        
        new_report = f"""
## Test Run: {ts}
- **URL**: {url}
- **Status**: {'✅ PASS' if final_report['status'] == 'PASS' else '❌ FAIL'}
- **Success Rate**: {final_report['summary']['success_rate']}
- **Passed/Total**: {total_passed}/{len(test_suites)}
- **Execution Time**: {total_execution_time:.2f}s

### Suite Results:
"""
        for result in results:
            status_icon = "✅" if result["status"] == "PASS" else "❌" if result["status"] == "FAIL" else "⏭️"
            new_report += f"- {status_icon} **{result['suite_name']}**: {result['status']} ({result['execution_time']:.2f}s)\n"
        
        if all_errors:
            new_report += "\n### Errors:\n"
            for error in all_errors[:5]:
                new_report += f"- {error}\n"
        
        new_report += "\n---\n"
        
        genesis_report_path.write_text(existing_content + new_report, encoding="utf-8")
        print(f"📝 Отчет добавлен в REPORT_GENESIS.md")
    except Exception as e:
        print(f"⚠️  Ошибка сохранения в REPORT_GENESIS.md: {e}")
    
    return final_report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Мастер-скрипт для запуска всех тестов GENESIS")
    parser.add_argument("--url", default=os.environ.get("GENESIS_SITE_URL", "https://crypto-processing.net/"))
    parser.add_argument("--timeout", type=int, default=25000)
    parser.add_argument("--headless", type=int, default=1)
    parser.add_argument("--json", action="store_true", help="Вывод только JSON результата")
    args = parser.parse_args()
    
    report = run_all_tests(args.url, args.timeout, bool(args.headless))
    
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(f"""
🎯 ИТОГОВЫЙ РЕЗУЛЬТАТ
URL: {report['url']}
Статус: {'🟢 PASS' if report['status'] == 'PASS' else '🔴 FAIL'}
Успешность: {report['summary']['success_rate']}
Прошло: {report['summary']['passed']}/{report['summary']['total_suites']}
Время выполнения: {report['total_execution_time']:.2f}с

📊 Детали по наборам:""")
        
        for result in report["suite_results"]:
            status_icon = "✅" if result["status"] == "PASS" else "❌" if result["status"] == "FAIL" else "⏭️"
            print(f"  {status_icon} {result['suite_name']} ({result['execution_time']:.2f}с)")
        
        if report["all_errors"]:
            print(f"\n⚠️  Основные ошибки:")
            for error in report["all_errors"][:5]:
                print(f"  • {error}")
    
    sys.exit(0 if report["status"] == "PASS" else 1)
