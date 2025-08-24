/**
 * GENESIS 1.1 - Исправление модального окна депозитов
 * Проблема: Кнопка "Создать депозит" не открывает модальное окно
 * Решение: Добавляем обработчики и проверки для корректной работы
 */

// Дождемся полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Применяем исправление для модальных окон депозитов...');
    
    // Глобальная функция для открытия модального окна депозита
    window.openDepositModal = function(planId) {
        console.log('🚀 openDepositModal вызвана для плана:', planId);
        
        // Проверяем наличие всех необходимых объектов
        if (window.GenesisCabinet && window.GenesisCabinet.showPurchaseModal) {
            console.log('✅ GenesisCabinet найден, открываем модальное окно');
            window.GenesisCabinet.showPurchaseModal(planId);
        } else if (window.GenesisCabinet && window.GenesisCabinet.showDepositModal) {
            console.log('✅ GenesisCabinet найден, открываем модальное окно через showDepositModal');
            window.GenesisCabinet.showDepositModal(planId);
        } else if (window.CabinetApp && window.CabinetApp.showCreateDepositModal) {
            console.log('✅ CabinetApp найден, открываем модальное окно');
            window.CabinetApp.showCreateDepositModal();
        } else {
            console.error('❌ Ни один из сервисов модальных окон не найден');
            
            // Fallback - показываем базовое модальное окно
            showFallbackDepositModal(planId);
        }
    };
    
    // Fallback модальное окно
    function showFallbackDepositModal(planId) {
        console.log('⚠️ Используем fallback модальное окно');
        
        const modal = document.getElementById('create-deposit-modal');
        const content = document.getElementById('deposit-modal-content');
        
        if (!modal || !content) {
            alert('❌ Модальное окно не найдено. Пожалуйста, обновите страницу и попробуйте снова.');
            return;
        }
        
        // Находим план
        const plan = window.GENESIS_CONFIG && window.GENESIS_CONFIG.depositPlans 
            ? window.GENESIS_CONFIG.depositPlans.find(p => p.id === planId)
            : null;
            
        if (!plan) {
            alert('❌ План депозита не найден');
            return;
        }
        
        // Генерируем контент
        content.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">💰 Создание депозита: ${plan.name}</h3>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
                    <h4 style="color: var(--secondary-color); margin-bottom: 1rem;">📊 Детали плана</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: left;">
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Инвестиция:</div>
                            <div style="color: var(--text-primary); font-weight: 600;">$${plan.usdtAmount}</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Доходность:</div>
                            <div style="color: var(--success-color); font-weight: 600;">${plan.percentage}%</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Срок:</div>
                            <div style="color: var(--warning-color); font-weight: 600;">${plan.days} дней</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Валюты:</div>
                            <div style="color: var(--secondary-color); font-weight: 600;">${plan.currencies.join(', ')}</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
                    <h4 style="color: var(--secondary-color); margin-bottom: 1rem;">📱 QR-код для оплаты</h4>
                    <div style="background: white; padding: 1rem; border-radius: 8px; display: inline-block; margin-bottom: 1rem;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.GENESIS_CONFIG.addresses.system)}" alt="QR код" />
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">Отсканируйте QR-код в мобильном кошельке</p>
                </div>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
                    <h4 style="color: var(--warning-color); margin-bottom: 1rem;">📋 Адрес для оплаты</h4>
                    <div style="font-family: monospace; font-size: 0.85rem; color: var(--text-primary); background: var(--bg-secondary); padding: 1rem; border-radius: 6px; word-break: break-all; margin-bottom: 1rem;">
                        ${window.GENESIS_CONFIG.addresses.system}
                    </div>
                    <button onclick="navigator.clipboard.writeText('${window.GENESIS_CONFIG.addresses.system}').then(() => alert('✅ Адрес скопирован!'))" class="btn-secondary" style="width: 100%;">
                        📋 Копировать адрес
                    </button>
                </div>
                
                <div style="background: rgba(255, 107, 53, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--primary-color);">
                    <h5 style="color: var(--primary-color); margin-bottom: 0.5rem;">ℹ️ Информация</h5>
                    <ul style="text-align: left; color: var(--text-secondary); font-size: 0.9rem; margin: 0; padding-left: 1.5rem;">
                        <li>Сумма к оплате: $${plan.usdtAmount} USDT</li>
                        <li>Сеть: BSC (BEP-20)</li>
                        <li>Депозит активируется автоматически</li>
                        <li>Время подтверждения: 1-5 минут</li>
                    </ul>
                </div>
                
                <div style="margin-top: 1.5rem;">
                    <button onclick="document.getElementById('create-deposit-modal').classList.add('hidden')" class="btn-outline" style="width: 100%;">
                        ✕ Закрыть
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }
    
    // Функция для перехвата кликов на кнопках депозитов
    function interceptDepositButtons() {
        // Используем делегирование событий для динамически создаваемых кнопок
        document.addEventListener('click', function(e) {
            const button = e.target.closest('button');
            if (!button) return;
            
            const onclick = button.getAttribute('onclick');
            if (!onclick) return;
            
            // Проверяем, является ли это кнопкой создания депозита
            if (onclick.includes('startDepositProcess') || 
                onclick.includes('showCreateDepositModal') || 
                onclick.includes('showPurchaseModal') ||
                onclick.includes('showDepositModal')) {
                
                e.preventDefault();
                e.stopPropagation();
                
                // Извлекаем ID плана из onclick атрибута
                const planIdMatch = onclick.match(/['"]([^'"]+)['"]/);
                const planId = planIdMatch ? planIdMatch[1] : null;
                
                console.log('🎯 Перехвачен клик на кнопке депозита, план:', planId);
                
                // Открываем модальное окно
                window.openDepositModal(planId);
            }
        });
        
        console.log('✅ Перехватчик кнопок депозитов установлен');
    }
    
    // Устанавливаем перехватчик
    interceptDepositButtons();
    
    // Дополнительная проверка через 2 секунды
    setTimeout(function() {
        console.log('🔍 Проверка доступности сервисов...');
        console.log('- GenesisCabinet:', !!window.GenesisCabinet);
        console.log('- CabinetApp:', !!window.CabinetApp);
        console.log('- CabinetDepositService:', !!window.CabinetDepositService);
        console.log('- GENESIS_CONFIG:', !!window.GENESIS_CONFIG);
        
        // Если сервисы не загружены, пытаемся их инициализировать
        if (!window.GenesisCabinet && window.currentUser) {
            console.log('⚠️ GenesisCabinet не найден, пытаемся инициализировать...');
            if (window.GenesisCabinet && window.GenesisCabinet.init) {
                window.GenesisCabinet.init(window.currentUser);
                console.log('✅ GenesisCabinet инициализирован');
            }
        }
    }, 2000);
    
    console.log('✅ Исправление для модальных окон депозитов применено');
});

// Экспортируем функцию для глобального использования
window.fixDepositModal = function() {
    console.log('🔧 Ручной вызов исправления модальных окон...');
    
    // Проверяем все кнопки на странице
    const buttons = document.querySelectorAll('button');
    let fixedCount = 0;
    
    buttons.forEach(button => {
        const text = button.textContent.trim();
        if (text.includes('Создать депозит') || text.includes('💰')) {
            const onclick = button.getAttribute('onclick');
            if (!onclick || onclick === 'void(0)') {
                // Находим ближайший элемент с информацией о плане
                const card = button.closest('.stats-card, .plan-option-card, [id^="plan-card-"]');
                let planId = 'starter'; // По умолчанию
                
                if (card) {
                    const idMatch = card.id && card.id.match(/plan-card-(.+)/);
                    if (idMatch) {
                        planId = idMatch[1];
                    }
                }
                
                button.setAttribute('onclick', `window.openDepositModal('${planId}')`);
                button.style.cursor = 'pointer';
                fixedCount++;
                console.log(`✅ Исправлена кнопка для плана: ${planId}`);
            }
        }
    });
    
    console.log(`🎯 Исправлено кнопок: ${fixedCount}`);
    
    return fixedCount;
};

console.log('💊 Fix Deposit Modal loaded. Используйте window.fixDepositModal() для ручного исправления кнопок.');
