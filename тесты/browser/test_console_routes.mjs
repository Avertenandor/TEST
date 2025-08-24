// Много-маршрутный тест консоли и базового содержимого
// Маршруты конфигурируемы через routes.json или ENV BASE_URL
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT, 'reports');
const CONFIG_FILE = path.join(ROOT, 'routes.json');
const HEADLESS = (process.env.HEADLESS ?? 'true').toLowerCase() !== 'false';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5502';

// Значения по умолчанию
const defaultRoutes = [
  { path: '/how-it-works', label: 'how', reqText: ['устроено','как','🛠'] },
  { path: '/', label: 'root', reqText: ['портфель','инвестиционный'] },
  { path: '/dashboard', label: 'dashboard', reqText: ['портфель','депозит'] },
  { path: '/bonuses', label: 'bonuses', reqText: ['бонус','множител'] },
  { path: '/gifts', label: 'gifts', reqText: ['подар'] },
  { path: '/multipliers', label: 'multipliers', reqText: ['множител'] },
  { path: '/referrals', label: 'referrals', reqText: ['реферал'] },
  { path: '/settings', label: 'settings', reqText: ['настрой'] }
];

let routeConfigs = defaultRoutes;
if (fs.existsSync(CONFIG_FILE)) {
  try { routeConfigs = JSON.parse(fs.readFileSync(CONFIG_FILE,'utf-8')); } catch { /* ignore */ }
}

const now = () => new Date().toISOString();

async function testRoute(page, routeCfg) {
  const fullUrl = BASE_URL.replace(/\/$/,'') + routeCfg.path;
  const logs = [];
  const errors = [];
  page.removeAllListeners('console');
  page.on('console', m => logs.push({ type: m.type(), text: m.text(), ts: now() }));
  page.on('pageerror', e => errors.push({ message: e.message, stack: e.stack, ts: now() }));
  const t0 = Date.now();
  let status = null; let navOk = false;
  try {
    const resp = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    status = resp?.status();
    await page.waitForTimeout(500);
    try { await page.waitForNetworkIdle({ idleTime: 400, timeout: 3000 }); } catch {}
    navOk = !status || (status >=200 && status < 400);
  } catch (e) {
    errors.push({ message: 'Navigation error: '+e.message });
  }
  // Поиск требуемого текста в body (case-insensitive)
  const body = await page.content();
  const lower = body.toLowerCase();
  const textOk = routeCfg.reqText.some(t => lower.includes(t.toLowerCase()));
  const hasConsoleErrors = logs.some(l => l.type === 'error') || errors.length>0;
  const pass = navOk && textOk && !hasConsoleErrors;
  return {
    url: fullUrl,
    label: routeCfg.label,
    required: routeCfg.reqText,
    statusCode: status,
    navOk,
    textOk,
    hasConsoleErrors,
    pass,
    durationMs: Date.now()-t0,
    logCount: logs.length,
    errorCount: errors.length,
    sampleLogs: logs.slice(0,8),
    sampleErrors: errors.slice(0,4)
  };
}

async function run() {
  const startTs = now();
  const browser = await puppeteer.launch({ headless: HEADLESS });
  const page = await browser.newPage();
  const results = [];
  for (const r of routeConfigs) {
    const res = await testRoute(page, r);
    results.push(res);
  }
  await browser.close();
  const summary = {
    started: startTs,
    finished: now(),
    headless: HEADLESS,
    baseUrl: BASE_URL,
    total: results.length,
    passed: results.filter(r=>r.pass).length,
    failed: results.filter(r=>!r.pass).length,
    avgDurationMs: Math.round(results.reduce((a,b)=>a+b.durationMs,0)/results.length)
  };
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(REPORTS_DIR,'routes_console.json'), JSON.stringify({summary, results}, null, 2), 'utf-8');
  const md = [
    '# Маршрутный консольный тест',
    `- База: ${summary.baseUrl}`,
    `- Результат: ${summary.passed}/${summary.total} PASS`,
    `- Средняя длительность: ${summary.avgDurationMs} ms`,
    '',
    '## Детали'
  ];
  for (const r of results) {
    md.push(`### ${r.label} (${r.url})`);
    md.push(`- PASS: ${r.pass}`);
    md.push(`- HTTP: ${r.statusCode}`);
    md.push(`- navOk: ${r.navOk} | textOk: ${r.textOk} | consoleErrors: ${r.hasConsoleErrors}`);
    md.push(`- duration: ${r.durationMs} ms | logs: ${r.logCount} | errors: ${r.errorCount}`);
    if (!r.pass) {
      if (!r.textOk) md.push('- Missing required text fragment(s)');
      if (r.hasConsoleErrors) md.push('- Console/Page errors present');
    }
    md.push('');
  }
  fs.writeFileSync(path.join(REPORTS_DIR,'routes_console.md'), md.join('\n'), 'utf-8');
  process.exit(summary.failed ? 5 : 0);
}

run();
