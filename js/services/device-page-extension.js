/**
 * GENESIS 1.1 - Расширение функционала страницы "Мое устройство"
 * MCP-MARKER:MODULE:DEVICE_PAGE_EXTENSION - Расширение страницы устройства
 * MCP-MARKER:FILE:DEVICE_PAGE_EXTENSION_JS - Дополнительный функционал
 */

// MCP-MARKER:METHOD:EXTEND_DEVICE_PAGE - Расширение страницы устройства
window.extendDevicePage = function() {
    console.log('🔧 Расширение страницы "Мое устройство"');
    
    // Находим контейнер страницы
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;
    
    // Проверяем, что мы на странице "Мое устройство"
    const currentPage = window.CabinetApp?.state?.currentPage;
    if (currentPage !== 'my-device') return;
    
    // Добавляем секцию с кнопкой установки PWA
    const pwaSection = document.createElement('div');
    pwaSection.className = 'genesis-info-card genesis-panel-glass';
    pwaSection.innerHTML = `
        <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">
            📱 Установка приложения
        </h3>
        
        <div class="info-item">
            <span class="info-label">Статус PWA:</span>
            <span class="info-value" id="pwa-status">Проверка...</span>
        </div>
        
        <div class="info-item">
            <span class="info-label">Service Worker:</span>
            <span class="info-value" id="sw-status">Проверка...</span>
        </div>
        
        <div class="info-item">
            <span class="info-label">Режим отображения:</span>
            <span class="info-value" id="display-mode">Браузер</span>
        </div>
        
        <div class="info-item">
            <span class="info-label">Поддержка установки:</span>
            <span class="info-value" id="install-support">Проверка...</span>
        </div>
        
        <div style="margin-top: 2rem; text-align: center;">
            <button id="install-app-button" class="btn btn-secondary" style="padding: 1rem 2rem; font-size: 1.1rem;">
                📱 Установить приложение
            </button>
            
            <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                Установите GENESIS 1.1 как приложение для быстрого доступа
            </p>
        </div>
    `;
    
    // Находим место для вставки (после информации о сети)
    const infoGrid = pageContent.querySelector('.genesis-info-grid');
    if (infoGrid) {
        infoGrid.appendChild(pwaSection);
    } else {
        // Если не нашли сетку, добавляем в конец
        pageContent.appendChild(pwaSection);
    }
    
    // Обновляем статусы
    updatePWAStatus();
    
    // Добавляем обработчик кнопки
    const installButton = document.getElementById('install-app-button');
    if (installButton) {
        installButton.addEventListener('click', () => {
            if (window.PWAInstallManager) {
                window.PWAInstallManager.installApp();
            } else {
                showInstallInstructions();
            }
        });
    }
};

// MCP-MARKER:METHOD:UPDATE_PWA_STATUS - Обновление статуса PWA
function updatePWAStatus() {
    // Статус PWA
    const pwaStatus = document.getElementById('pwa-status');
    if (pwaStatus) {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            pwaStatus.textContent = '✅ Установлено';
            pwaStatus.style.color = 'var(--success-color)';
        } else {
            pwaStatus.textContent = '❌ Не установлено';
            pwaStatus.style.color = 'var(--error-color)';
        }
    }
    
    // Статус Service Worker
    const swStatus = document.getElementById('sw-status');
    if (swStatus) {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(() => {
                swStatus.textContent = '✅ Активен';
                swStatus.style.color = 'var(--success-color)';
            }).catch(() => {
                swStatus.textContent = '❌ Не активен';
                swStatus.style.color = 'var(--error-color)';
            });
        } else {
            swStatus.textContent = '❌ Не поддерживается';
            swStatus.style.color = 'var(--error-color)';
        }
    }
    
    // Режим отображения
    const displayMode = document.getElementById('display-mode');
    if (displayMode) {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            displayMode.textContent = 'Приложение';
        } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
            displayMode.textContent = 'Полноэкранный';
        } else {
            displayMode.textContent = 'Браузер';
        }
    }
    
    // Поддержка установки
    const installSupport = document.getElementById('install-support');
    if (installSupport) {
        if (window.PWAInstallManager && window.PWAInstallManager.state.installSupported) {
            installSupport.textContent = '✅ Поддерживается';
            installSupport.style.color = 'var(--success-color)';
        } else if (window.PWAInstallManager && window.PWAInstallManager.state.platform === 'ios') {
            installSupport.textContent = '⚠️ Ручная установка';
            installSupport.style.color = 'var(--warning-color)';
        } else {
            installSupport.textContent = '❌ Не поддерживается';
            installSupport.style.color = 'var(--error-color)';
        }
    }
    
    // Обновляем кнопку
    const installButton = document.getElementById('install-app-button');
    if (installButton) {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            installButton.textContent = '✅ Приложение установлено';
            installButton.disabled = true;
            installButton.style.opacity = '0.6';
        } else if (!window.PWAInstallManager || !window.PWAInstallManager.state.installSupported) {
            installButton.textContent = '📖 Инструкция по установке';
        }
    }
}

// MCP-MARKER:METHOD:SHOW_INSTALL_INSTRUCTIONS - Показать инструкции по установке
function showInstallInstructions() {
    let instructions = '';
    const platform = detectPlatform();
    
    switch (platform) {
        case 'ios':
            instructions = `
                <h3>📱 Установка на iOS</h3>
                <ol style="text-align: left; line-height: 2;">
                    <li>Откройте сайт в браузере Safari</li>
                    <li>Нажмите кнопку "Поделиться" <span style="font-size: 1.2em;">⎘</span> внизу экрана</li>
                    <li>Прокрутите вниз и выберите "На экран «Домой»" <span style="font-size: 1.2em;">⊕</span></li>
                    <li>Нажмите "Добавить" в правом верхнем углу</li>
                </ol>
                <p style="margin-top: 1rem;">После установки вы сможете запускать GENESIS 1.1 как обычное приложение!</p>
            `;
            break;
        case 'android':
            instructions = `
                <h3>📱 Установка на Android</h3>
                <ol style="text-align: left; line-height: 2;">
                    <li>Откройте меню браузера (три точки) <span style="font-size: 1.2em;">⋮</span></li>
                    <li>Выберите "Добавить на главный экран" или "Установить приложение"</li>
                    <li>Подтвердите установку, нажав "Добавить" или "Установить"</li>
                </ol>
                <p style="margin-top: 1rem;">Приложение появится на вашем главном экране!</p>
            `;
            break;
        case 'windows':
        case 'macos':
        case 'linux':
            instructions = `
                <h3>💻 Установка на компьютер</h3>
                <p>В современных браузерах (Chrome, Edge, Opera):</p>
                <ol style="text-align: left; line-height: 2;">
                    <li>Найдите иконку установки в адресной строке <span style="font-size: 1.2em;">⊕</span></li>
                    <li>Или откройте меню браузера и выберите "Установить GENESIS 1.1"</li>
                    <li>Подтвердите установку в появившемся окне</li>
                </ol>
                <p style="margin-top: 1rem;">Приложение будет доступно через меню "Пуск" или Launchpad!</p>
            `;
            break;
        default:
            instructions = `
                <h3>📱 Установка приложения</h3>
                <p>Используйте меню вашего браузера для добавления сайта на главный экран или установки как приложения.</p>
                <p>В большинстве современных браузеров эта опция находится в главном меню.</p>
            `;
    }
    
    // Показываем инструкции
    if (window.CabinetApp && window.CabinetApp.showNotification) {
        // Создаем модальное окно с инструкциями
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.zIndex = '2000';
        modal.innerHTML = `
            <div class="modal-container" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Установка GENESIS 1.1</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-content">
                    ${instructions}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Показываем модальное окно
        setTimeout(() => {
            modal.classList.remove('hidden');
        }, 10);
    }
}

// MCP-MARKER:METHOD:DETECT_PLATFORM - Определение платформы
function detectPlatform() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/android/i.test(ua)) {
        return 'android';
    } else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
        return 'ios';
    } else if (/Mac/i.test(ua)) {
        return 'macos';
    } else if (/Win/i.test(ua)) {
        return 'windows';
    } else if (/Linux/i.test(ua)) {
        return 'linux';
    }
    
    return 'unknown';
}

// MCP-MARKER:METHOD:OBSERVE_PAGE_CHANGES - Наблюдение за изменениями страницы
function observePageChanges() {
    // Создаем наблюдатель за изменениями DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Проверяем, изменилось ли содержимое страницы
            if (mutation.type === 'childList' && mutation.target.id === 'page-content') {
                // Проверяем, загружена ли страница "Мое устройство"
                const deviceInfoCard = document.querySelector('.genesis-info-card');
                const hasInstallButton = document.getElementById('install-app-button');
                
                if (deviceInfoCard && !hasInstallButton) {
                    // Добавляем функционал PWA
                    extendDevicePage();
                }
            }
        });
    });
    
    // Начинаем наблюдение за изменениями
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
        observer.observe(pageContent, {
            childList: true,
            subtree: true
        });
    }
}

// MCP-MARKER:INITIALIZATION:AUTO_INIT - Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Инициализация расширения страницы устройства');
    
    // Начинаем наблюдение за изменениями страницы
    observePageChanges();
    
    // Если страница уже загружена, добавляем функционал
    setTimeout(() => {
        extendDevicePage();
    }, 1000);
});

// Экспорт функций
window.DevicePageExtension = {
    extend: extendDevicePage,
    updateStatus: updatePWAStatus,
    showInstructions: showInstallInstructions
};

console.log('📱 Device Page Extension загружен');
