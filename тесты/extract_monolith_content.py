import re
import json
from pathlib import Path

MONOLITH_PATH = Path('../archive/backups/cabinet-backup.html')
OUTPUT_JSON = Path('reports/monolith_extracted.json')

SECTION_PATTERNS = {
    'portfolio': re.compile(r'<h2 class="page-title">.*?Портфель.*?</h2>', re.IGNORECASE),
    'bonuses': re.compile(r'Бонусная программа GENESIS', re.IGNORECASE),
    'multipliers': re.compile(r'Множители доходности', re.IGNORECASE),
    'gifts': re.compile(r'Подарочн', re.IGNORECASE),
    'referrals': re.compile(r'Реферальная программа', re.IGNORECASE),
    'settings': re.compile(r'Настройки', re.IGNORECASE),
    'rank': re.compile(r'Ранговая система', re.IGNORECASE),
    'experience': re.compile(r'Стаж.*в системе', re.IGNORECASE),
}

def extract():
    if not MONOLITH_PATH.exists():
        raise SystemExit(f'Monolith file not found: {MONOLITH_PATH}')
    text = MONOLITH_PATH.read_text(encoding='utf-8', errors='ignore')
    data = {}
    for name, pattern in SECTION_PATTERNS.items():
        data[name] = bool(pattern.search(text))
    OUTPUT_JSON.parent.mkdir(exist_ok=True, parents=True)
    OUTPUT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Monolith sections presence saved ->', OUTPUT_JSON)

if __name__ == '__main__':
    extract()
