"""
E2E: Функциональный тест главной страницы.
Включает:
- Проверка загрузки всех секций
- Валидация QR-кода
- Проверка навигации и кнопок
- Мониторинг консоли браузера
- Проверка адаптивности
"""
from __future__ import annotations

import argparse
import json
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, TypedDict

from playwright.sync_api import ConsoleMessage, Page, sync_playwright


class ConsoleEntry(TypedDict):
    type: str
    text: str
    location: Dict[str, Any]


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


def test_page_load(page: Page, failures: List[str]) -> None:
    """Проверка загрузки основных элементов страницы."""
    try:
        # Проверяем основные секции
        sections = [
            "#hero-section",
            "#qr-section", 
            "#features-section",
            "#quick-access-section"
        ]
        
        for section in sections:
            element = page.query_selector(section)
            if not element:
                failures.append(f"Секция {section} не найдена")
                
        # Проверяем заголовок
        title = page.title()
        if not title or "GENESIS" not in title:
            failures.append(f"Неправильный заголовок страницы: {title}")
            
    except Exception as e:
        failures.append(f"Ошибка при проверке загрузки страницы: {str(e)}")


def test_qr_code(page: Page, failures: List[str]) -> None:
    """Проверка QR-кода."""
    try:
        qr_container = page.query_selector("#genesis-qr-code")
        if not qr_container:
            failures.append("QR контейнер не найден")
            return
            
        # Ждём появления QR-кода (изображение или canvas)
        page.wait_for_timeout(3000)
        
        qr_image = qr_container.query_selector("img, canvas")
        if not qr_image:
            failures.append("QR-код не сгенерирован (нет img или canvas)")
            
    except Exception as e:
        failures.append(f"Ошибка при проверке QR-кода: {str(e)}")


def test_navigation(page: Page, failures: List[str]) -> None:
    """Проверка навигации."""
    try:
        # Кнопка входа в кабинет
        cabinet_btn = page.query_selector("button:has-text('Войти в личный кабинет')")
        if not cabinet_btn:
            failures.append("Кнопка входа в кабинет не найдена")
        
        # Кнопка обновления QR
        refresh_btn = page.query_selector("button:has-text('Обновить QR код')")
        if not refresh_btn:
            failures.append("Кнопка обновления QR не найдена")
            
    except Exception as e:
        failures.append(f"Ошибка при проверке навигации: {str(e)}")


def test_terminal_presence(page: Page, failures: List[str]) -> None:
    """Проверка наличия модульного терминала."""
    try:
        # Ждём загрузки модульного терминала
        page.wait_for_timeout(5000)
        
        mod_terms = page.query_selector_all("#cabinet-genesis-terminal")
        static_terms = page.query_selector_all("#genesis-terminal")
        
        if len(mod_terms) != 1:
            failures.append(f"Ожидался 1 модульный терминал, найдено: {len(mod_terms)}")
            
        if len(static_terms) > 0:
            failures.append(f"Найдены статические терминалы: {len(static_terms)}")
            
    except Exception as e:
        failures.append(f"Ошибка при проверке терминала: {str(e)}")


def test_console_logs(console_messages: List[ConsoleEntry], failures: List[str]) -> None:
    """Анализ логов консоли."""
    error_count = 0
    qr_error_count = 0
    
    for entry in console_messages:
        msg_text = entry.get("text", "")
        msg_type = entry.get("type", "")
        
        if msg_type == "error":
            error_count += 1
            
        if "Ошибка генерации QR кода через мост" in msg_text:
            qr_error_count += 1
    
    # Проверки
    if error_count > 5:
        failures.append(f"Слишком много ошибок в консоли: {error_count}")
        
    if qr_error_count > 3:
        failures.append(f"Спам ошибок QR: {qr_error_count}")


def test_responsive_design(page: Page, failures: List[str]) -> None:
    """Проверка адаптивности."""
    viewports: List[ViewportInfo] = [
        {"width": 1920, "height": 1080, "name": "Desktop"},
        {"width": 1024, "height": 768, "name": "Tablet"},
        {"width": 375, "height": 667, "name": "Mobile"}
    ]
    
    try:
        for viewport in viewports:
            page.set_viewport_size({"width": viewport["width"], "height": viewport["height"]})
            page.wait_for_timeout(1000)
            
            # Проверяем, что контент не выходит за границы
            body_width = page.evaluate("() => document.body.scrollWidth")
            if body_width > viewport["width"] + 50:  # +50px погрешность
                failures.append(f"Горизонтальная прокрутка на {viewport['name']}")
                
            # Проверяем видимость основных элементов
            hero = page.query_selector("#hero-section")
            if hero and not page.is_visible("#hero-section"):
                failures.append(f"Hero секция не видна на {viewport['name']}")
                
    except Exception as e:
        failures.append(f"Ошибка при проверке адаптивности: {str(e)}")


def run_full_landing_test(url: str, timeout: int = 30000, headless: bool = True) -> TestReport:
    """Запуск полного функционального теста главной страницы."""
    artifacts_dir = Path("тесты/e2e/_artifacts")
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    console_log_path = artifacts_dir / f"console_full_{ts}.json"
    screenshot_path = artifacts_dir / f"screenshot_full_{ts}.png"

    console_messages: List[ConsoleEntry] = []
    all_failures: List[str] = []

    with sync_playwright() as p:
        channel_env = os.environ.get("BROWSER_CHANNEL", "chrome")
        try:
            browser = p.chromium.launch(channel=channel_env, headless=headless)
        except Exception:
            browser = p.chromium.launch(headless=headless)
        context = browser.new_context()
        page = context.new_page()

        def on_console(msg: ConsoleMessage) -> None:
            m_text: str
            try:
                # В некоторых версиях Playwright для Python msg.text – метод, в других – свойство
                _t = getattr(msg, "text", None)
                m_text = str(_t()) if callable(_t) else str(_t or "")
            except Exception:
                m_text = ""
                
            entry: ConsoleEntry = {
                "type": str(getattr(msg, "type", "")),
                "text": m_text,
                "location": getattr(msg, "location", {}) or {},
            }
            console_messages.append(entry)

        page.on("console", on_console)

        try:
            # Загружаем страницу
            page.goto(url, wait_until="load", timeout=timeout)
            page.wait_for_load_state("networkidle", timeout=timeout)
            time.sleep(3)

            # Запускаем все тесты
            test_page_load(page, all_failures)
            test_qr_code(page, all_failures)
            test_navigation(page, all_failures)
            test_terminal_presence(page, all_failures)
            test_responsive_design(page, all_failures)
            
            # Анализируем консоль
            test_console_logs(console_messages, all_failures)

            # Сохраняем скриншот
            try:
                page.screenshot(path=str(screenshot_path), full_page=True)
            except Exception:
                pass

        except Exception as e:
            all_failures.append(f"Критическая ошибка теста: {str(e)}")

        finally:
            browser.close()

    # Сохраняем артефакты
    try:
        console_log_path.write_text(
            json.dumps(console_messages, ensure_ascii=False, indent=2), 
            encoding="utf-8"
        )
    except Exception:
        pass

    final_report: TestReport = {
        "url": url,
        "time": ts,
        "console_artifact": str(console_log_path),
        "screenshot_artifact": str(screenshot_path),
        "results": {
            "total_failures": len(all_failures),
            "console_messages": len(console_messages),
            "critical_errors": len([f for f in all_failures if "Критическая" in f])
        },
        "status": "PASS" if not all_failures else "FAIL",
        "failures": all_failures,
    }

    print(json.dumps(final_report, ensure_ascii=False, indent=2))
    return final_report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=os.environ.get("GENESIS_SITE_URL", "http://127.0.0.1:5500/index.html"))
    parser.add_argument("--timeout", type=int, default=30000)
    parser.add_argument("--headless", type=int, default=int(os.environ.get("HEADLESS", "1")))
    args = parser.parse_args()
    
    result = run_full_landing_test(args.url, args.timeout, bool(args.headless))
    raise SystemExit(0 if result["status"] == "PASS" else 1)