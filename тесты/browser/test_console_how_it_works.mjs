// Тест консольных логов страницы /how-it-works с использованием Puppeteer
// Условия прохождения:
// 1. Нет console.error / pageerror
// 2. Поймано >= MIN_LOG_COUNT лог-сообщений
// 3. Найден ожидаемый заголовок (фрагмент текста 'устроено' или emoji 🛠️)
// 4. Создаётся JSON и Markdown отчёт

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');
const URL_DEFAULT = process.env.TEST_URL || 'http://127.0.0.1:5502/how-it-works';
const HEADLESS = (process.env.HEADLESS ?? 'true').toLowerCase() !== 'false';
const MIN_LOG_COUNT = 5;

const now = () => new Date().toISOString();

async function run() {
  const result = {
    started: now(),
    url: URL_DEFAULT,
    headless: HEADLESS,
    logs: [],
    errors: [],
    pageErrors: [],
    status: 'PENDING',
    dom: { title: null, headerFound: false },
    durations: {}
  };
  const t0 = Date.now();
  let browser;
  try {
    browser = await puppeteer.launch({ headless: HEADLESS });
    const page = await browser.newPage();

    page.on('console', msg => {
      const entry = { type: msg.type(), text: msg.text(), ts: now() };
      result.logs.push(entry);
    });
    page.on('pageerror', err => {
      result.pageErrors.push({ message: err.message, stack: err.stack, ts: now() });
    });

    const navStart = Date.now();
    const response = await page.goto(URL_DEFAULT, { waitUntil: 'domcontentloaded', timeout: 30000 });
    result.durations.navigationMs = Date.now() - navStart;
    result.httpStatus = response?.status();

    try {
      await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 });
    } catch {}

    result.dom.title = await page.title();
    const headerHandle = await page.$x("//*[contains(translate(text(),'УСТРОЕНО','устроено'),'устроено') or contains(text(),'🛠')]");
    result.dom.headerFound = headerHandle.length > 0;

    const hasErrors = result.logs.some(l => l.type === 'error') || result.pageErrors.length > 0;
    const enoughLogs = result.logs.length >= MIN_LOG_COUNT;
    const okHeader = result.dom.headerFound;
    const okStatus = !result.httpStatus || (result.httpStatus >= 200 && result.httpStatus < 400);

    if (!hasErrors && enoughLogs && okHeader && okStatus) {
      result.status = 'PASS';
    } else {
      if (hasErrors) result.errors.push('Console or page errors detected');
      if (!enoughLogs) result.errors.push(`Not enough console logs (got ${result.logs.length}, need >= ${MIN_LOG_COUNT})`);
      if (!okHeader) result.errors.push('Header (Как устроено) not found');
      if (!okStatus) result.errors.push(`HTTP status not OK: ${result.httpStatus}`);
      result.status = 'FAIL';
    }
  } catch (e) {
    result.status = 'ERROR';
    result.errors.push(e.message || String(e));
  } finally {
    if (browser) await browser.close();
    result.finished = now();
    result.durations.totalMs = Date.now() - t0;
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const jsonPath = path.join(REPORTS_DIR, 'how_it_works_console.json');
    const mdPath = path.join(REPORTS_DIR, 'how_it_works_console.md');
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
    const md = [
      '# Тест: /how-it-works консоль',
      `- URL: ${result.url}`,
      `- Статус: ${result.status}`,
      `- Логов: ${result.logs.length}`,
      `- Ошибок: ${result.errors.length}`,
      `- Заголовок найден: ${result.dom.headerFound}`,
      `- HTTP: ${result.httpStatus}`,
      '## Ошибки',
      ...(result.errors.length ? result.errors : ['(нет)']),
      '## Первые логи',
      ...result.logs.slice(0, 10).map(l => `- [${l.type}] ${l.text}`)
    ].join('\n');
    fs.writeFileSync(mdPath, md, 'utf-8');
    console.log(`Report written: ${jsonPath}`);
    process.exit(result.status === 'PASS' ? 0 : 2);
  }
}

run();
