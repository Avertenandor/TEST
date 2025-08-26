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
    """Сбор метрик производительности (безопасно для внешнего сайта)."""
    # Основные временные метрики (с защитой от отсутствующих значений)
    navigation_timing = page.evaluate(
        """() => {
        const nav = (performance.getEntriesByType('navigation') || [])[0];
        // Fallback на старый API, если нужно
        const t = nav || performance.timing || {};
        const loadEventEnd = t.loadEventEnd || 0;
        const domContentLoadedEventEnd = t.domContentLoadedEventEnd || 0;
        const fetchStart = t.fetchStart || performance.timeOrigin || 0;
        return { loadEventEnd, domContentLoadedEventEnd, fetchStart };
    }"""
    )

    # Web Vitals (LCP, CLS) через PerformanceObserver с буферизацией
    web_vitals = page.evaluate(
        """() => new Promise((resolve) => {
        const vitals = { lcp: 0, cls: 0 };
        try {
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                if (entries.length) {
                    vitals.lcp = entries[entries.length - 1].startTime;
                }
            }).observe({ type: 'largest-contentful-paint', buffered: true });

            new PerformanceObserver((list) => {
                vitals.cls += list.getEntries().reduce((acc, entry) => {
                    return entry.hadRecentInput ? acc : acc + (entry.value || 0);
                }, 0);
            }).observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
            // Игнорируем, если API недоступно
        }
        setTimeout(() => resolve(vitals), 2000);
    })"""
    )

    # Память
    memory_info = page.evaluate(
        """() => {
        const m = performance.memory;
        if (m) {
            return { usedJSHeapSize: m.usedJSHeapSize / 1024 / 1024 };
        }
        return { usedJSHeapSize: 0 };
    }"""
    )

    # Сетевые запросы
    network_requests = page.evaluate(
        """() => (performance.getEntriesByType('resource') || []).length"""
    )

    # Вычисления с фоллбэками
    try:
        page_load_time = max(
            0.0,
            (float(navigation_timing["loadEventEnd"]) - float(navigation_timing["fetchStart"])) / 1000.0,
        )
    except Exception:
        page_load_time = 0.0

    try:
        dom_content_loaded = max(
            0.0,
            (float(navigation_timing["domContentLoadedEventEnd"]) - float(navigation_timing["fetchStart"])) / 1000.0,
        )
    except Exception:
        dom_content_loaded = 0.0

    lcp = float(web_vitals.get("lcp", 0.0)) / 1000.0 if web_vitals else 0.0
    cls = float(web_vitals.get("cls", 0.0)) if web_vitals else 0.0
    memory_used = float(memory_info.get("usedJSHeapSize", 0.0)) if memory_info else 0.0

    return {
        "page_load_time": page_load_time,
        "dom_content_loaded": dom_content_loaded,
        "lcp": lcp,
        "cls": cls,
        "memory_used": memory_used,
        "network_requests": int(network_requests or 0),
    }


def analyze_performance(
    metrics: PerformanceMetrics,
    *,
    strict: bool = False,
    cls_threshold: float = 0.25,
    page_load_threshold: float = 3.5,
) -> tuple[str, List[str]]:
    """Анализ метрик производительности
    strict=False: CLS учитывается как предупреждение, не валящий тест.
    cls_threshold: порог для CLS (по умолчанию 0.25 — допустимый уровень).
    """
    failures: List[str] = []
    
    # Проверка времени загрузки (порог настраивается)
    if metrics["page_load_time"] > page_load_threshold:
        failures.append(
            f"Медленная загрузка страницы: {metrics['page_load_time']:.2f}s"
        )
    
    # Проверка LCP (должно быть < 2.5 сек)
    if metrics["lcp"] > 2.5:
        failures.append(f"Медленный LCP: {metrics['lcp']:.2f}s")
    
    # Проверка CLS (по умолчанию мягкий режим)
    if metrics["cls"] > cls_threshold:
        if strict:
            failures.append(f"Высокий CLS: {metrics['cls']:.3f}")
        else:
            # Мягкий режим — не валим тест, но логируем в консоль
            print(f"[perf][warn] Высокий CLS: {metrics['cls']:.3f} > {cls_threshold}")
    
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
            # Более мягкая стратегия загрузки для внешних сайтов
            page.goto(url, wait_until="domcontentloaded", timeout=timeout)
            time.sleep(3)
            metrics = collect_performance_metrics(page)
            strict = os.environ.get("PERF_STRICT", "0") == "1"
            cls_threshold = float(os.environ.get("CLS_THRESHOLD", "0.25"))
            page_load_threshold = float(os.environ.get("PAGELOAD_THRESHOLD", "3.5"))
            status, failures = analyze_performance(
                metrics,
                strict=strict,
                cls_threshold=cls_threshold,
                page_load_threshold=page_load_threshold,
            )
            # Повторная попытка, если LCP/время выглядят нереалистично малыми
            if metrics["lcp"] <= 0 or metrics["page_load_time"] <= 0:
                time.sleep(2)
                metrics = collect_performance_metrics(page)
                status, failures = analyze_performance(
                    metrics,
                    strict=strict,
                    cls_threshold=cls_threshold,
                    page_load_threshold=page_load_threshold,
                )

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