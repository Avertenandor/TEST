import json
from pathlib import Path
from typing import Dict, Any, Optional

MONOLITH_JSON = Path('reports/monolith_extracted.json')
MODULAR_JSON = Path('reports/modular_extracted.json')
MAP_JSON = Path('content_map.json')
DIFF_JSON = Path('reports/diff_summary.json')
DIFF_MD = Path('reports/diff_report.md')


def load_json(p: Path) -> Optional[Dict[str, Any]]:
    if not p.exists():
        return None
    return json.loads(p.read_text(encoding='utf-8'))


def compare() -> None:
    monolith: Dict[str, Any] = load_json(MONOLITH_JSON) or {}
    modular: Dict[str, Any] = load_json(MODULAR_JSON) or {}
    content_map: Dict[str, Any] = load_json(MAP_JSON) or {}

    modular_sections: Dict[str, Any] = modular.get('sections', {})

    diff: Dict[str, Dict[str, Any]] = { 'sections': {}, 'summary': {} }

    for section, rules in content_map.get('sections', {}).items():
        sec_diff: Dict[str, Any] = {}
        # presence in monolith (bool) if available
        sec_diff['in_monolith'] = monolith.get(section)
        # keywords coverage
        modular_entry: Dict[str, Any] = modular_sections.get(section, {})
        found: set[str] = set(modular_entry.get('found', []))
        required: set[str] = set(rules.get('required_keywords', []))
        sec_diff['found_required'] = sorted(found & required)
        sec_diff['missing_required'] = sorted(list(required - found))
        sec_diff['coverage_pct'] = round((len(sec_diff['found_required']) / max(1, len(required))) * 100, 1) if required else 100.0
        # counts rules
        if 'min_plan_count' in rules:
            sec_diff['plans_ok'] = modular.get('plan_count_distinct', 0) >= rules['min_plan_count']
        if 'min_bonus_categories' in rules:
            sec_diff['bonus_core_present'] = 'БОНУСНАЯ 1000' in found
        sec_diff['optional'] = rules.get('optional', False)
        diff['sections'][section] = sec_diff

    diff['summary']['plan_count_distinct'] = modular.get('plan_count_distinct')
    diff['summary']['mcp_marker_count'] = modular.get('mcp_marker_count')
    diff['summary']['headings_count'] = len(modular.get('headings', []))
    diff['summary']['headings_sample'] = modular.get('headings', [])[:10]

    DIFF_JSON.parent.mkdir(exist_ok=True, parents=True)
    DIFF_JSON.write_text(json.dumps(diff, ensure_ascii=False, indent=2), encoding='utf-8')

    # Markdown report
    lines: list[str] = ["# Отчет сопоставления модульной и монолитной версий", "", "## Итоговая сводка", f"- Уникальных планов: {diff['summary'].get('plan_count_distinct')}", f"- MCP маркеров (обнаружено): {diff['summary'].get('mcp_marker_count')}", f"- Заголовков страниц: {diff['summary'].get('headings_count')}", ""]
    for s, d in diff['sections'].items():
        lines.append(f"## {s}")
        lines.append(f"- В монолите: {d.get('in_monolith')}")
        lines.append(f"- Найдено обязательных: {len(d.get('found_required', []))}")
        lines.append(f"- Покрытие: {d.get('coverage_pct')}%")
        if d.get('missing_required'):
            lines.append(f"- Отсутствуют: {', '.join(d['missing_required'])}")
        if 'plans_ok' in d:
            lines.append(f"- Планы охвачены: {d['plans_ok']}")
        if 'bonus_core_present' in d:
            lines.append(f"- Ключевой бонус присутствует: {d['bonus_core_present']}")
        lines.append(f"- Опциональный: {d.get('optional')}")
        lines.append("")
    DIFF_MD.write_text('\n'.join(lines), encoding='utf-8')
    print('Diff generated ->', DIFF_JSON, DIFF_MD)

    # Определяем успешность (все не-опциональные без пропусков)
    failures: list[str] = [s for s, d in diff['sections'].items() if not d.get('optional') and d.get('missing_required')]
    if failures:
        # Сигнализируем кодом возврата
        import sys
        print('FAILED SECTIONS:', ', '.join(failures))
        sys.exit(2)

if __name__ == '__main__':
    compare()
