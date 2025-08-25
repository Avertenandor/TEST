"""
Конфигурация тестов GENESIS Website
"""
from typing import TypedDict

# Базовые настройки
DEFAULT_URL = "https://crypto-processing.net/"
LOCAL_URL = "http://127.0.0.1:5500/index.html"
DEFAULT_TIMEOUT = 25000
DEFAULT_HEADLESS = True

# Пороги для performance тестов
PERFORMANCE_THRESHOLDS = {
    "load_time_max": 5000,  # мс
    "first_byte_max": 1500,  # мс
    "total_resources_max": 100,
    "page_size_max": 2 * 1024 * 1024,  # 2MB
}

class AccessibilityRequirements(TypedDict):
    min_score: int
    require_alt_tags: bool
    require_form_labels: bool
    require_heading_structure: bool

class SEORequirements(TypedDict):
    min_score: int
    title_min_length: int
    title_max_length: int
    require_meta_description: bool
    h1_count: int

# Пороги для accessibility
ACCESSIBILITY_REQUIREMENTS: AccessibilityRequirements = {
    "min_score": 70,
    "require_alt_tags": True,
    "require_form_labels": True,
    "require_heading_structure": True,
}

# SEO требования
SEO_REQUIREMENTS: SEORequirements = {
    "min_score": 70,
    "title_min_length": 30,
    "title_max_length": 60,
    "require_meta_description": True,
    "h1_count": 1,
}

# Ожидаемые элементы DOM
EXPECTED_ELEMENTS = {
    "sections": [
        "#genesis-header",
        "#genesis-app", 
        "#qr-section",
        "#how-it-works-section"
    ],
    "buttons": [
        "button[onclick*='app.html']",
        ".genesis-btn-large"
    ],
    "qr_elements": [
        "#genesis-qr-code",
        "button[onclick*='refreshQRCode']"
    ]
}

# JavaScript API проверки
JS_API_CHECKS = {
    "terminal": [
        "window.GenesisTerminal",
        "window.GenesisTerminal.show",
        "window.GenesisTerminal.hide",
        "window.GenesisTerminal.clear"
    ],
    "bootstrap": [
        "window.__terminalBootstrapLoaded",
        "window.__terminalBuffer"
    ],
    "qr": [
        "generateQRCode", 
        "refreshQRCode",
        "copyAddress"
    ],
    "config": [
        "AUTH_CONFIG",
        "AUTH_CONFIG.address",
        "AUTH_CONFIG.network"
    ]
}

# Консольные ошибки для мониторинга
CRITICAL_CONSOLE_ERRORS = [
    "uncaught",
    "reference", 
    "syntax",
    "type",
    "network"
]

# Network запросы
NETWORK_CHECKS = {
    "allowed_404": [
        "/favicon.ico",
        "/robots.txt",
        "/apple-touch-icon"
    ],
    "critical_resources": [
        "/css/",
        "/js/",
        "/shared/"
    ]
}
