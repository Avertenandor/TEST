import re
import json
from pathlib import Path
from collections import Counter
from typing import Dict, List

ROOT = Path('..').resolve()
SERVICES_DIR = ROOT / 'js' / 'services'

MODULAR_FILES: List[Path] = []
for pattern in ['cabinet*.js', '*.js']:
    MODULAR_FILES.extend(SERVICES_DIR.glob(pattern))
MODULAR_FILES.append(ROOT / 'cabinet.html')

OUTPUT_JSON = Path('reports/modular_extracted.json')

# Базовые ключевые слова (каноничные формы)
KEYWORDS: Dict[str, List[str]] = {
    'dashboard': ['Инвестиционный портфель', 'Активные депозиты', 'Создать депозит'],
    'portfolio': ['Инвестиционный портфель', 'Планы депозитов', 'STARTER', 'ULTIMATE', 'Инвестировано', 'Доход в день'],
    'bonuses': ['Бонусная программа', 'БОНУСНАЯ 1000', 'Множители доходности', 'Активные множители'],
    'multipliers': ['Множители доходности', 'Эффект множителей', 'Активные множители', 'Бустер x2'],
    'gifts': ['Подарочная система', 'Приветственный бонус', 'Первый депозит', 'Предстоящие подарки'],
    'referrals': ['Реферальная программа', 'Ваша реферальная ссылка', 'Всего рефералов'],
    'settings': ['Настройки', 'Тема оформления', 'Профиль пользователя'],
    'rank': ['Ранговая система', 'Ранговая лестница', 'Бронза', 'Бронзовый'],
    'experience': ['Стаж в системе', 'Дней в системе', 'Достижения']
}

# Регулярки для вариативных форм (морфология – упрощённо)
VARIANT_PATTERNS: Dict[str, re.Pattern[str]] = {
    'Первый депозит': re.compile(r'Перв(ый|ого) депозит', re.IGNORECASE),
    'Инвестировано': re.compile(r'Инвестирован[оа]', re.IGNORECASE),
    'Доход в день': re.compile(r'Доход.*день', re.IGNORECASE),
    'Активные множители': re.compile(r'Активн(ые|ых) множител', re.IGNORECASE),
    'Ранговая лестница': re.compile(r'Ранговая лестниц', re.IGNORECASE),
    'Дней в системе': re.compile(r'Дн(ей|я) в системе', re.IGNORECASE),
}

PLAN_NAME_PATTERN = re.compile(r'\b(STARTER|BASIC|STANDARD|ADVANCED|PROFESSIONAL|EXPERT|MASTER|PREMIUM|GOLD|PLATINUM|DIAMOND|ELITE|ULTIMATE)\b')
MCP_MARKER_PATTERN = re.compile(r'MCP-MARKER:[^\s"\']+')

def normalize(text: str) -> str:
    return text.lower()

def extract() -> None:
    aggregated: Dict[str, Dict[str, List[str]]] = {k: { 'found': [], 'missing': [], 'raw_hits': [] } for k in KEYWORDS}
    plan_counter: Counter[str] = Counter()
    mcp_markers: set[str] = set()
    headings: set[str] = set()

    for f in MODULAR_FILES:
        if not f.exists():
            continue
        txt: str = f.read_text(encoding='utf-8', errors='ignore')
        low: str = txt.lower()

        # Заголовки h2.page-title
        for m in re.finditer(r'<h2[^>]*class="[^"]*page-title[^"]*"[^>]*>(.*?)</h2>', txt, re.IGNORECASE|re.DOTALL):
            headings.add(re.sub(r'\s+', ' ', m.group(1)).strip())

        # Планы
        for m in PLAN_NAME_PATTERN.finditer(txt):
            plan_counter[m.group(1)] += 1

        # MCP маркеры
        for m in MCP_MARKER_PATTERN.finditer(txt):
            mcp_markers.add(m.group(0))

        # Ключевые слова (точное вхождение, регистронезависимо)
        for section, words in KEYWORDS.items():
            for w in words:
                if w.lower() in low and w not in aggregated[section]['found']:
                    aggregated[section]['found'].append(w)

        # Вариативные формы
        for canonical, pattern in VARIANT_PATTERNS.items():
            if canonical not in aggregated['gifts']['found'] and pattern.search(txt):
                # canonical принадлежит той секции где определено ключевое слово
                for section, words in KEYWORDS.items():
                    if canonical in words and canonical not in aggregated[section]['found']:
                        aggregated[section]['found'].append(canonical)

    # Missing
    for section, words in KEYWORDS.items():
        for w in words:
            if w not in aggregated[section]['found']:
                aggregated[section]['missing'].append(w)

    result: Dict[str, object] = {
        'sections': aggregated,
        'plans_detected': sorted(list(plan_counter.keys())),
        'plan_count_distinct': len(plan_counter.keys()),
        'mcp_marker_count': len(mcp_markers),
        'mcp_markers_sample': sorted(list(mcp_markers))[:30],
        'headings': sorted(list(headings))
    }

    OUTPUT_JSON.parent.mkdir(exist_ok=True, parents=True)
    OUTPUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Modular content extracted ->', OUTPUT_JSON)

if __name__ == '__main__':
    extract()
