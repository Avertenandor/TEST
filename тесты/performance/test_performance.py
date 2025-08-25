"""
Performance тесты для GENESIS сайта.
Проверяет:
- Время загрузки страницы
- Метрики производительности (LCP, FID, CLS)
- Использование памяти и ресурсов
- Сетевые запросы
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


class PerformanceMetrics(TypedDict):
    page_load_time: float
    dom_content_loaded: float
    lcp: float
    cls: float
    memory_used: float
    network_requests: int


class PerformanceTestReport(TypedDict):
    url: str
    time: str
    metrics: PerformanceMetrics
    results: Dict[str, Any]
    status: str
    failures: List[str]


def collect_performance_metrics(page: Page) -> PerformanceMetrics:
    """Сбор метрик производительности"""
    
    # Основные временные метрики
    navigation_timing = page.evaluate("""() => {
        const nav = performance.getEntriesByType('navigation')[0];
        return {
            loadEventEnd: nav.loadEventEnd,
            domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
            responseStart: nav.responseStart,
            fetchStart: nav.fetchStart
        };
    }""")
    
    # Web Vitals
    web_vitals = page.evaluate("""() => {
        return new Promise((resolve) => {
            const vitals = { lcp: 0, cls: 0 };
            
            // LCP
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                vitals.lcp = entries[entries.length - 1].startTime;
            }).observe({type: 'largest-contentful-paint', buffered: true});
            
            // CLS
            new PerformanceObserver((list) => {
                vitals.cls = list.getEntries().reduce((cls, entry) => {
                    if (!entry.hadRecentInput) {
                        return cls + entry.value;
                    }
                    return cls;
                }, 0);
            }).observe({type: 'layout-shift', buffered: true});
            
            setTimeout(() => resolve(vitals), 2000);
        });
    }""")
    
    # Память
    memory_info = page.evaluate("""() => {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize / 1024 / 1024,
                totalJSHeapSize: performance.memory.totalJSHeapSize / 1024 / 1024
            };
        }
        return { usedJSHeapSize: 0, totalJSHeapSize: 0 };
    }""")
    
    # Сетевые запросы
    network_requests = page.evaluate("""() => {
        return performance.getEntriesByType('resource').length;
    }""")
    
    page_load_time = (navigation_timing["loadEventEnd"] - navigation_timing["fetchStart"]) / 1000
    dom_content_loaded = (navigation_timing["domContentLoadedEventEnd"] - navigation_timing["fetchStart"]) / 1000
    
    return {
        "page_load_time": page_load_time,
        "dom_content_loaded": dom_content_loaded,
        "lcp": web_vitals["lcp"] / 1000,
        "cls": web_vitals["cls"],
        "memory_used": memory_info["usedJSHeapSize"],
        "network_requests": network_requests
    }


def analyze_performance(metrics: PerformanceMetrics) -> tuple[str, List[str]]:
    """Анализ метрик производительности"""
    failures: List[str] = []
    
    # Проверка времени загрузки (должно быть < 3 сек)
    if metrics["page_load_time"] > 3.0:
        failures.append(f"Медленная загрузка страницы: {metrics['page_load_time']:.2f}s")
    
    # Проверка LCP (должно быть < 2.5 сек)
    if metrics["lcp"] > 2.5:
        failures.append(f"Медленный LCP: {metrics['lcp']:.2f}s")
    
    # Проверка CLS (должно быть < 0.1)
    if metrics["cls"] > 0.1:
        failures.append(f"Высокий CLS: {metrics['cls']:.3f}")
    
    # Проверка памяти (должно быть < 50MB)
    if metrics["memory_used"] > 50:
        failures.append(f"Высокое потребление памяти: {metrics['memory_used']:.1f}MB")
    
    # Проверка количества запросов (должно быть < 100)
    if metrics["network_requests"] > 100:
        failures.append(f"Много сетевых запросов: {metrics['network_requests']}")
    
    status = "PASS" if not failures else "FAIL"
    return status, failures


def run_performance_tests(url: str, timeout: int = 30000, headless: bool = True) -> PerformanceTestReport:
    """Запуск performance тестов"""
    artifacts_dir = Path("тесты/performance/_artifacts")
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    with sync_playwright() as p:
        channel_env = os.environ.get("BROWSER_CHANNEL", "chrome")
        try:
            browser = p.chromium.launch(channel=channel_env, headless=headless)
        except Exception:
            browser = p.chromium.launch(headless=headless)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Загружаем страницу с измерением времени
            page.goto(url, wait_until="load", timeout=timeout)
            page.wait_for_load_state("networkidle", timeout=timeout)
            
            # Ждём стабилизации метрик
            time.sleep(3)
            
            # Собираем метрики
            metrics = collect_performance_metrics(page)
            
            # Анализируем результаты
            status, failures = analyze_performance(metrics)

        except Exception as e:
            # Дефолтные метрики при ошибке
            metrics: PerformanceMetrics = {
                "page_load_time": 999.0,
                "dom_content_loaded": 999.0,
                "lcp": 999.0,
                "cls": 999.0,
                "memory_used": 999.0,
                "network_requests": 0
            }
            status = "FAIL"
            failures = [f"Критическая ошибка: {str(e)}"]

        finally:
            browser.close()

    report: PerformanceTestReport = {
        "url": url,
        "time": ts,
        "metrics": metrics,
        "results": {
            "performance_score": "good" if status == "PASS" else "poor",
            "total_failures": len(failures),
            "analysis": {
                "page_load_ok": metrics["page_load_time"] <= 3.0,
                "lcp_ok": metrics["lcp"] <= 2.5,
                "cls_ok": metrics["cls"] <= 0.1,
                "memory_ok": metrics["memory_used"] <= 50,
                "requests_ok": metrics["network_requests"] <= 100
            }
        },
        "status": status,
        "failures": failures,
    }

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=os.environ.get("GENESIS_SITE_URL", "http://127.0.0.1:5500/index.html"))
    parser.add_argument("--timeout", type=int, default=30000)
    parser.add_argument("--headless", type=int, default=int(os.environ.get("HEADLESS", "1")))
    args = parser.parse_args()
    
    result = run_performance_tests(args.url, args.timeout, bool(args.headless))
    raise SystemExit(0 if result["status"] == "PASS" else 1)