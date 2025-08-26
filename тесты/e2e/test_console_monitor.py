"""
Мониторинг консоли и сети для прод/локальной среды.
Fail-условия:
- Любой console.error или pageerror
- Любой requestfailed
- Любой ответ со статусом >= 500
- Сообщения, содержащие шаблоны ошибок QR-моста
"""
from __future__ import annotations

import argparse
import json
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, TypedDict, cast

from playwright.sync_api import ConsoleMessage, Response, Request, sync_playwright


class ConsoleEntry(TypedDict):
	type: str
	text: str
	location: Dict[str, Any]


class NetworkFailure(TypedDict):
	url: str
	method: str
	reason: str


class HttpError(TypedDict):
	url: str
	status: int
	status_text: str


class MonitorReport(TypedDict):
	url: str
	time: str
	duration_ms: int
	console_errors: int
	page_errors: int
	request_failures: int
	http_errors: int
	artifacts: Dict[str, str]
	status: str
	findings: List[str]


ERROR_PATTERNS = [
	"Ошибка генерации QR кода через мост",
	"Bridge generation failed",
]


def run_console_monitor(url: str, duration_ms: int = 15000, headless: bool = True) -> MonitorReport:
	artifacts_dir = Path("тесты/e2e/_artifacts")
	artifacts_dir.mkdir(parents=True, exist_ok=True)
	ts = datetime.now().strftime("%Y%m%d_%H%M%S")
	console_path = artifacts_dir / f"console_monitor_{ts}.json"
	network_path = artifacts_dir / f"network_monitor_{ts}.json"
	screenshot_path = artifacts_dir / f"console_monitor_{ts}.png"

	console_entries: List[ConsoleEntry] = []
	page_errors: List[str] = []
	request_failures: List[NetworkFailure] = []
	http_errors: List[HttpError] = []

	with sync_playwright() as p:
		channel_env = os.environ.get("BROWSER_CHANNEL", "chrome")
		try:
			browser = p.chromium.launch(channel=channel_env, headless=headless)
		except Exception:
			browser = p.chromium.launch(headless=headless)

		context = browser.new_context()
		page = context.new_page()

		# Console
		def on_console(msg: ConsoleMessage) -> None:
			m_text: str
			try:
				_t = getattr(msg, "text", None)
				m_text = str(_t()) if callable(_t) else str(_t or "")
			except Exception:
				m_text = ""

			entry: ConsoleEntry = {
				"type": str(getattr(msg, "type", "")),
				"text": m_text,
				"location": getattr(msg, "location", {}) or {},
			}
			console_entries.append(entry)

		page.on("console", on_console)

		# Page errors
		def on_page_error(err: object) -> None:
			page_errors.append(str(err))

		page.on("pageerror", on_page_error)

		# Network failures
		def on_request_failed(request: Request) -> None:
			reason: str = "unknown"
			try:
				# В разных версиях Playwright: failure может быть атрибутом (str|dict|None) или методом.
				raw = getattr(request, "failure", None)
				val: Any
				if callable(raw):
					val = raw()
				else:
					val = raw

				if isinstance(val, dict):
					fd = cast(Dict[str, Any], val)
					reason = str(fd.get("errorText") or fd.get("error_text") or fd.get("error") or "unknown")
				elif isinstance(val, str) and val:
					reason = val
			except Exception:
				pass
			request_failures.append(
				{
					"url": request.url,
					"method": request.method,
					"reason": reason,
				}
			)

		page.on("requestfailed", on_request_failed)

		# HTTP >= 500
		def on_response(resp: Response) -> None:
			try:
				status = resp.status
			except Exception:
				status = 0
			if status >= 500:
				http_errors.append(
					{
						"url": resp.url,
						"status": status,
						"status_text": resp.status_text or "",
					}
				)

		page.on("response", on_response)

		# Go
		page.goto(url, wait_until="load")
		page.wait_for_load_state("networkidle")

		# Наблюдаем указанное время
		time.sleep(max(1, duration_ms // 1000))

		# Скриншот для отчёта
		try:
			page.screenshot(path=str(screenshot_path), full_page=True)
		except Exception:
			pass

		browser.close()

	# Persist artifacts
	try:
		console_path.write_text(json.dumps(console_entries, ensure_ascii=False, indent=2), encoding="utf-8")
		network_path.write_text(
			json.dumps(
				{
					"request_failures": request_failures,
					"http_errors": http_errors,
				},
				ensure_ascii=False,
				indent=2,
			),
			encoding="utf-8",
		)
	except Exception:
		pass

	# Evaluate findings
	findings: List[str] = []

	# console errors
	console_error_count = sum(1 for e in console_entries if e.get("type") == "error")
	findings += [f"console.error: {console_error_count}"] if console_error_count else []

	# page errors
	page_error_count = len(page_errors)
	findings += [f"pageerror: {page_error_count}"] if page_error_count else []

	# request failures
	req_fail_count = len(request_failures)
	findings += [f"requestfailed: {req_fail_count}"] if req_fail_count else []

	# http errors
	http_err_count = len(http_errors)
	findings += [f"http >=500: {http_err_count}"] if http_err_count else []

	# specific patterns even if not error-type
	pattern_hits = [
		e for e in console_entries if any(pat.lower() in e.get("text", "").lower() for pat in ERROR_PATTERNS)
	]
	pat_count = len(pattern_hits)
	findings += [f"pattern_hits: {pat_count}"] if pat_count else []

	has_fail = (
		console_error_count > 0
		or page_error_count > 0
		or req_fail_count > 0
		or http_err_count > 0
		or pat_count > 0
	)

	report: MonitorReport = {
		"url": url,
		"time": ts,
		"duration_ms": duration_ms,
		"console_errors": console_error_count,
		"page_errors": page_error_count,
		"request_failures": req_fail_count,
		"http_errors": http_err_count,
		"artifacts": {
			"console": str(console_path),
			"network": str(network_path),
			"screenshot": str(screenshot_path),
		},
		"status": "FAIL" if has_fail else "PASS",
		"findings": findings,
	}

	print(json.dumps(report, ensure_ascii=False, indent=2))
	return report


if __name__ == "__main__":
	parser = argparse.ArgumentParser()
	parser.add_argument("--url", default=os.environ.get("GENESIS_SITE_URL", "http://127.0.0.1:5500/index.html"))
	parser.add_argument("--duration", type=int, default=int(os.environ.get("MONITOR_DURATION_MS", "15000")))
	parser.add_argument("--headless", type=int, default=int(os.environ.get("HEADLESS", "1")))
	args = parser.parse_args()

	result = run_console_monitor(args.url, args.duration, bool(args.headless))
	raise SystemExit(0 if result["status"] == "PASS" else 1)

