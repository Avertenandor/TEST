r"""
E2E: Проверка главной страницы в системном Chrome (через Playwright).
Проверки:
- Ровно один модульный терминал (#cabinet-genesis-terminal), статических нет (#genesis-terminal)
- Нет сырых тройных бэктиков ``` на странице
- Нет дублирующихся id в DOM
- Ошибки "Ошибка генерации QR кода через мост" не спамятся

Запуск (PowerShell):
    $env:BROWSER_CHANNEL='chrome'; python .\тесты\e2e\test_landing_chrome.py --url https://crypto-processing.net/ --timeout 25000 --headless 1
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


class ConsoleEntry(TypedDict, total=False):
    type: str
    text: str
    location: Dict[str, Any]


def run(url: str, timeout: int = 20000, headless: bool = True) -> int:
    artifacts_dir = Path("тесты/e2e/_artifacts")
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    console_log_path = artifacts_dir / f"console_{ts}.json"

    console_messages: List[ConsoleEntry] = []
    qr_error_count = 0

    with sync_playwright() as p:
        channel_env = os.environ.get("BROWSER_CHANNEL", "chrome")
        try:
            browser = p.chromium.launch(channel=channel_env, headless=headless)
        except Exception:
            browser = p.chromium.launch(headless=headless)
        context = browser.new_context()
        page = context.new_page()

        def on_console(msg: ConsoleMessage) -> None:
            nonlocal qr_error_count
            # У разных версий API в Python text бывает методом; приводим безопасно
            try:
                m_text = msg.text()  # type: ignore[operator]
            except Exception:
                m_text = str(getattr(msg, "text", ""))
            entry: ConsoleEntry = {
                "type": str(getattr(msg, "type", "")),
                "text": m_text,
                "location": getattr(msg, "location", {}) or {},
            }
            console_messages.append(entry)
            if "Ошибка генерации QR кода через мост" in entry.get("text", ""):
                qr_error_count += 1

        page.on("console", on_console)

        page.goto(url, wait_until="load", timeout=timeout)
        try:
            page.wait_for_load_state("networkidle", timeout=timeout)
        except Exception:
            pass
        time.sleep(3)

        mod_terms = page.query_selector_all("#cabinet-genesis-terminal")
        static_terms = page.query_selector_all("#genesis-terminal")

        body_text = page.evaluate("() => document.body.innerText || ''")
        has_backticks = "```" in (body_text or "")

        dup_ids: List[List[Any]] = page.evaluate(
            "() => {const ids={}; for(const el of document.querySelectorAll('[id]')){ids[el.id]=(ids[el.id]||0)+1;} return Object.entries(ids).filter(([,c])=>c>1);}"
        )

        qr_spam = qr_error_count > 2

        try:
            console_log_path.write_text(json.dumps(console_messages, ensure_ascii=False, indent=2), encoding="utf-8")
        except Exception:
            pass

        browser.close()

    failures: List[str] = []
    if len(static_terms) > 0:
        failures.append(f"На странице найден статический терминал (#genesis-terminal): {len(static_terms)}")
    if len(mod_terms) != 1:
        failures.append(
            f"Ожидался ровно один модульный терминал (#cabinet-genesis-terminal), найдено: {len(mod_terms)}"
        )
    if has_backticks:
        failures.append("На странице обнаружены тройные бэктики ``` (сырой код)")
    if dup_ids:
        failures.append(f"Дубли id в DOM: {dup_ids}")
    if qr_spam:
        failures.append(f"Спам ошибок QR в консоли: {qr_error_count}")

    report: Dict[str, Any] = {
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
    return 0 if not failures else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=os.environ.get("GENESIS_SITE_URL", "http://127.0.0.1:5500/index.html"))
    parser.add_argument("--timeout", type=int, default=20000)
    parser.add_argument("--headless", type=int, default=int(os.environ.get("HEADLESS", "1")))
    args = parser.parse_args()
    raise SystemExit(run(args.url, args.timeout, bool(args.headless)))
