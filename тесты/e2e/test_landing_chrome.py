"""
E2E: Проверка главной страницы в реальном Chrome.
Проверяем:
- Ровно один терминал (модульный) присутствует, статических дубликатов нет
- Нет 'кусков кода' (тройные бэктики) на странице
- Нет дублирующихся id в DOM
- Ошибки QR 'Ошибка генерации QR кода через мост' не спамятся

Запуск:
  python тесты/e2e/test_landing_chrome.py --url https://crypto-processing.net/ --timeout 20000 --headless 0
"""
from __future__ import annotations

import argparse
import json
import os
import time
from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright, ConsoleMessage


def run(url: str, timeout: int = 20000, headless: bool = True) -> int:
    artifacts_dir = Path("тесты/e2e/_artifacts")
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    console_log_path = artifacts_dir / f"console_{ts}.json"

    console_messages: list[dict] = []
    qr_error_count = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=headless)
        context = browser.new_context()
        page = context.new_page()

        def on_console(msg: ConsoleMessage):
            nonlocal qr_error_count
            item = {
                "type": msg.type,
                "text": msg.text(),
                "location": msg.location,
            }
            console_messages.append(item)
            if "Ошибка генерации QR кода через мост" in item["text"]:
                qr_error_count += 1

        page.on("console", on_console)

        page.goto(url, wait_until="load", timeout=timeout)
        # подождём немного активности сети/скриптов
        try:
            page.wait_for_load_state("networkidle", timeout=timeout)
        except Exception:
            pass
        # дайте времени инициализации лендинга/терминала
        time.sleep(3)

        # 1) Терминал: модульный существует, статического нет
        mod_terms = page.query_selector_all("#cabinet-genesis-terminal")
        static_terms = page.query_selector_all("#genesis-terminal")

        # 2) Нет тройных бэктиков на странице
        body_text = page.evaluate("() => document.body.innerText || ''")
        has_backticks = "```" in (body_text or "")

        # 3) Дубликаты id
        dup_ids = page.evaluate(
            "() => {const ids={}; for(const el of document.querySelectorAll('[id]')){ids[el.id]=(ids[el.id]||0)+1;} return Object.entries(ids).filter(([,c])=>c>1);}"
        )

        # 4) QR ошибки не спамятся (допустим не более 2 за короткий прогон)
        qr_spam = qr_error_count > 2

        # Сохраним консоль
        try:
            console_log_path.write_text(json.dumps(console_messages, ensure_ascii=False, indent=2), encoding="utf-8")
        except Exception:
            pass

        browser.close()

    failures: list[str] = []
    if len(static_terms) > 0:
        failures.append(f"На странице найден статический терминал (#genesis-terminal): {len(static_terms)}")
    if len(mod_terms) != 1:
        failures.append(f"Ожидался ровно один модульный терминал (#cabinet-genesis-terminal), найдено: {len(mod_terms)}")
    if has_backticks:
        failures.append("На странице обнаружены тройные бэктики ``` (сырой код)")
    if dup_ids:
        failures.append(f"Дубли id в DOM: {dup_ids}")
    if qr_spam:
        failures.append(f"Спам ошибок QR в консоли: {qr_error_count}")

    report = {
        "url": url,
        "time": ts,
        "console_artifact": str(console_log_path),
        "results": {
            "modular_terminal_count": len(mod_terms),
            "static_terminal_count": len(static_terms),
            "has_triple_backticks": has_backticks,
            "duplicate_ids": dup_ids,
            "qr_error_count": qr_error_count,
        },
        "status": "PASS" if not failures else "FAIL",
        "failures": failures,
    }

    print(json.dumps(report, ensure_ascii=False, indent=2))
    # Код возврата: 0 — PASS, 1 — FAIL
    return 0 if not failures else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=os.environ.get("GENESIS_SITE_URL", "http://127.0.0.1:5500/index.html"))
    parser.add_argument("--timeout", type=int, default=20000)
    parser.add_argument("--headless", type=int, default=int(os.environ.get("HEADLESS", "1")))
    args = parser.parse_args()
    exit(run(args.url, args.timeout, bool(args.headless)))
