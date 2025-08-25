r"""
Комплексный тест главной страницы GENESIS с правильной типизацией.
Проверяет: структуру, QR код, навигацию, терминал, адаптивность.

Запуск:
  python .\тесты\e2e\test_full_landing_fixed.py --url https://crypto-processing.net/ --headless 1
"""
from __future__ import annotations

import argparse
import json
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, TypedDict

from playwright.sync_api import ConsoleMessage, sync_playwright


class ConsoleEntry(TypedDict):
    type: str
    text: str
    location: Dict[str, Any]


class TestResult(TypedDict):
    test_name: str
    status: str
    details: Dict[str, Any]
    errors: List[str]


class ViewportInfo(TypedDict):
    width: int
    height: int
    name: str


class TestReport(TypedDict):
    url: str
    time: str
    console_artifact: str
    screenshot_artifact: str
    results: Dict[str, Any]
    status: str
    failures: List[str]


def test_page_load(page: Any) -> TestResult:
    """Тест загрузки основных элементов страницы"""
    errors: List[str] = []
    details: Dict[str, Any] = {}
    
    # Проверка title
    title = page.title()
    if not title or "GENESIS" not in title:
        errors.append(f"Неправильный title: {title}")
    details["title"] = title
    
    # Проверка основных секций
    sections = [
        "#genesis-header",
        "#genesis-app", 
        "#qr-section",
        "#how-it-works-section"
    ]
    
    for selector in sections:
        element = page.query_selector(selector)
        if not element:
            errors.append(f"Секция не найдена: {selector}")
        details[f"section_{selector}"] = bool(element)
    
    # Проверка CSS загрузки
    css_loaded = page.evaluate("() => document.styleSheets.length > 0")
    if not css_loaded:
        errors.append("CSS не загружен")
    details["css_loaded"] = css_loaded
    
    return TestResult(
        test_name="page_load",
        status="PASS" if not errors else "FAIL",
        details=details,
        errors=errors
    )


def test_qr_functionality(page: Any) -> TestResult:
    """Тест QR-кода"""
    errors: List[str] = []
    details: Dict[str, Any] = {}
    
    # Проверка контейнера QR
    qr_container = page.query_selector("#genesis-qr-code")
    if not qr_container:
        errors.append("QR контейнер не найден")
    details["qr_container_exists"] = bool(qr_container)
    
    # Ждем загрузки QR (3 секунды)
    time.sleep(3)
    
    # Проверка содержимого QR
    if qr_container:
        qr_content = qr_container.inner_html()
        has_image = "<img" in qr_content or "<canvas" in qr_content
        has_fallback = "fallback" in qr_content.lower()
        
        details["has_qr_image"] = has_image
        details["has_fallback"] = has_fallback
        
        if not has_image and not has_fallback:
            errors.append("QR код не загружен и нет fallback")
    
    # Проверка кнопки обновления QR
    refresh_btn = page.query_selector("button[onclick*='refreshQRCode']")
    details["refresh_button_exists"] = bool(refresh_btn)
    
    return TestResult(
        test_name="qr_functionality",
        status="PASS" if not errors else "FAIL",
        details=details,
        errors=errors
    )


def test_navigation(page: Any) -> TestResult:
    """Тест навигации и кнопок"""
    errors: List[str] = []
    details: Dict[str, Any] = {}
    
    # Проверка основных кнопок навигации
    buttons = [
        "button[onclick*='app.html']",  # Кнопка входа в кабинет
        ".genesis-btn-large",           # Большие кнопки
        ".genesis-btn-neon"             # Неоновые кнопки
    ]
    
    for selector in buttons:
        element = page.query_selector(selector)
        if not element:
            errors.append(f"Кнопка не найдена: {selector}")
        details[f"button_{selector}"] = bool(element)
    
    # Проверка якорных ссылок
    anchor_links = page.query_selector_all("a[href^='#']")
    broken_links: List[str] = []
    
    for link in anchor_links[:5]:  # Проверяем первые 5
        href = link.get_attribute("href")
        if href and href != "#":
            target = page.query_selector(href)
            if not target:
                broken_links.append(href)
    
    if broken_links:
        errors.append(f"Неработающие якорные ссылки: {broken_links}")
    details["broken_anchor_links"] = broken_links
    
    return TestResult(
        test_name="navigation",
        status="PASS" if not errors else "FAIL",
        details=details,
        errors=errors
    )


def test_terminal_presence(page: Any) -> TestResult:
    """Тест наличия и корректности терминала"""
    errors: List[str] = []
    details: Dict[str, Any] = {}
    
    # Ждем инициализации терминала
    time.sleep(3)
    
    # Проверка модульного терминала
    modular_terminal = page.query_selector("#cabinet-genesis-terminal")
    details["modular_terminal_exists"] = bool(modular_terminal)
    
    # Проверка отсутствия статического терминала
    static_terminals = page.query_selector_all("#genesis-terminal")
    if static_terminals:
        errors.append(f"Найден статический терминал: {len(static_terminals)}")
    details["static_terminal_count"] = len(static_terminals)
    
    # Проверка API терминала
    terminal_api = page.evaluate("() => typeof window.GenesisTerminal")
    if terminal_api == "undefined":
        errors.append("Terminal API недоступен")
    details["terminal_api_available"] = terminal_api != "undefined"
    
    return TestResult(
        test_name="terminal_presence",
        status="PASS" if not errors else "FAIL",
        details=details,
        errors=errors
    )


def test_responsive_design(page: Any) -> TestResult:
    """Тест адаптивного дизайна"""
    errors: List[str] = []
    details: Dict[str, Any] = {}
    
    # Тестируемые разрешения
    viewports: List[ViewportInfo] = [
        ViewportInfo(width=1920, height=1080, name="Desktop"),
        ViewportInfo(width=768, height=1024, name="Tablet"),
        ViewportInfo(width=375, height=667, name="Mobile")
    ]
    
    for viewport in viewports:
        page.set_viewport_size(viewport["width"], viewport["height"])
        time.sleep(1)
        
        # Проверка видимости основных элементов
        header_visible = page.is_visible("header")
        app_visible = page.is_visible("#genesis-app")
        
        if not header_visible:
            errors.append(f"Header не виден на {viewport['name']}")
        if not app_visible:
            errors.append(f"App не виден на {viewport['name']}")
            
        details[f"{viewport['name']}_header_visible"] = header_visible
        details[f"{viewport['name']}_app_visible"] = app_visible
    
    # Возвращаем к стандартному разрешению
    page.set_viewport_size(1920, 1080)
    
    return TestResult(
        test_name="responsive_design",
        status="PASS" if not errors else "FAIL",
        details=details,
        errors=errors
    )


def run_full_test(url: str, timeout: int = 30000, headless: bool = True) -> TestReport:
    """Запуск полного набора тестов"""
    artifacts_dir = Path("тесты/e2e/_artifacts")
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    console_log_path = artifacts_dir / f"full_landing_console_{ts}.json"
    screenshot_path = artifacts_dir / f"full_landing_screenshot_{ts}.png"
    
    console_messages: List[ConsoleEntry] = []
    
    with sync_playwright() as p:
        channel_env = os.environ.get("BROWSER_CHANNEL", "chrome")
        try:
            browser = p.chromium.launch(channel=channel_env, headless=headless)
        except Exception:
            browser = p.chromium.launch(headless=headless)
        
        context = browser.new_context()
        page = context.new_page()
        
        def on_console(msg: ConsoleMessage) -> None:
            try:
                # Безопасное получение текста из ConsoleMessage
                if hasattr(msg, 'text') and callable(getattr(msg, 'text')):
                    m_text = str(msg.text())  # type: ignore[operator]
                else:
                    m_text = str(getattr(msg, "text", ""))
            except Exception:
                m_text = str(getattr(msg, "text", ""))
                
            entry = ConsoleEntry(
                type=str(getattr(msg, "type", "")),
                text=m_text,
                location=getattr(msg, "location", {}) or {}
            )
            console_messages.append(entry)
        
        page.on("console", on_console)
        
        # Загружаем страницу
        page.goto(url, wait_until="load", timeout=timeout)
        try:
            page.wait_for_load_state("networkidle", timeout=timeout)
        except Exception:
            pass
        
        time.sleep(3)  # Даем время инициализации
        
        # Запускаем все тесты
        test_results: List[TestResult] = []
        test_results.append(test_page_load(page))
        test_results.append(test_qr_functionality(page))
        test_results.append(test_navigation(page))
        test_results.append(test_terminal_presence(page))
        test_results.append(test_responsive_design(page))
        
        # Делаем скриншот
        try:
            page.screenshot(path=str(screenshot_path), full_page=True)
        except Exception:
            pass
        
        browser.close()
    
    # Собираем все ошибки
    all_errors: List[str] = []
    for result in test_results:
        all_errors.extend(result["errors"])
    
    final_report = TestReport(
        url=url,
        time=ts,
        console_artifact=str(console_log_path),
        screenshot_artifact=str(screenshot_path),
        results={
            "tests": test_results,
            "console_messages_count": len(console_messages)
        },
        status="PASS" if not all_errors else "FAIL",
        failures=all_errors
    )
    
    # Сохраняем артефакты
    try:
        console_log_path.write_text(
            json.dumps(console_messages, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
    except Exception:
        pass
    
    return final_report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=os.environ.get("GENESIS_SITE_URL", "http://127.0.0.1:5500/index.html"))
    parser.add_argument("--timeout", type=int, default=30000)
    parser.add_argument("--headless", type=int, default=int(os.environ.get("HEADLESS", "1")))
    args = parser.parse_args()
    
    report = run_full_test(args.url, args.timeout, bool(args.headless))
    print(json.dumps(report, ensure_ascii=False, indent=2))
    
    raise SystemExit(0 if report["status"] == "PASS" else 1)
