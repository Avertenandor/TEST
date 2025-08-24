#!/usr/bin/env python3
"""
Анализ дубликатов CSS в cabinet.html
Находит повторяющиеся селекторы и правила
"""

import re
from collections import defaultdict

def find_css_duplicates():
    with open('cabinet.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Извлекаем все CSS из style тегов
    style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
    
    if not style_blocks:
        print("CSS блоки не найдены")
        return
    
    css_content = '\n'.join(style_blocks)
    
    # Находим все CSS правила
    css_rules = re.findall(r'([^{}]+)\s*\{([^{}]*)\}', css_content)
    
    selector_count = defaultdict(list)
    property_combinations = defaultdict(list)
    
    for i, (selector, properties) in enumerate(css_rules):
        selector = selector.strip()
        properties = properties.strip()
        
        if selector and properties:
            selector_count[selector].append((i, properties))
            
            # Нормализуем свойства для поиска дубликатов
            props_normalized = ';'.join(sorted([p.strip() for p in properties.split(';') if p.strip()]))
            if props_normalized:
                property_combinations[props_normalized].append((i, selector))
    
    print("=== ДУБЛИКАТЫ СЕЛЕКТОРОВ ===")
    duplicates_found = False
    for selector, occurrences in selector_count.items():
        if len(occurrences) > 1:
            duplicates_found = True
            print(f"\nСелектор '{selector}' встречается {len(occurrences)} раз:")
            for i, props in occurrences:
                print(f"  {i+1}: {props[:100]}...")
    
    if not duplicates_found:
        print("Дубликаты селекторов не найдены")
    
    print("\n=== ОДИНАКОВЫЕ НАБОРЫ СВОЙСТВ ===")
    similar_found = False
    for props, selectors in property_combinations.items():
        if len(selectors) > 1 and len(props) > 20:  # Только значимые наборы свойств
            similar_found = True
            print(f"\nОдинаковые свойства в {len(selectors)} селекторах:")
            print(f"  Свойства: {props[:150]}...")
            for i, selector in selectors:
                print(f"  Селектор {i+1}: {selector}")
    
    if not similar_found:
        print("Одинаковые наборы свойств не найдены")
    
    # Поиск утилитарных классов
    print("\n=== УТИЛИТАРНЫЕ КЛАССЫ ===")
    utility_patterns = [
        r'\.text-center\s*\{[^}]*\}',
        r'\.text-left\s*\{[^}]*\}',
        r'\.text-right\s*\{[^}]*\}',
        r'\.flex\s*\{[^}]*\}',
        r'\.flex-center\s*\{[^}]*\}',
        r'\.flex-gap[^{]*\{[^}]*\}',
        r'\.gap-[^{]*\{[^}]*\}',
        r'\.mb-[^{]*\{[^}]*\}',
        r'\.mt-[^{]*\{[^}]*\}',
        r'\.p-[^{]*\{[^}]*\}',
        r'\.m-[^{]*\{[^}]*\}',
    ]
    
    for pattern in utility_patterns:
        matches = re.findall(pattern, css_content)
        if len(matches) > 1:
            print(f"Найдено {len(matches)} определений для паттерна: {pattern}")
            for match in matches:
                print(f"  {match[:100]}...")

if __name__ == '__main__':
    find_css_duplicates()
