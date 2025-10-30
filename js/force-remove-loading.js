// КРИТИЧНО: Принудительное удаление экрана загрузки если он блокирует
(function() {
    'use strict';
    
    // Функция принудительного удаления loading screen
    function forceRemoveLoading() {
        const loading = document.getElementById('genesis-loading');
        if (loading) {
            // Сразу отключаем pointer-events
            loading.style.pointerEvents = 'none';
            loading.style.opacity = '0';
            loading.style.display = 'none';
            loading.classList.add('hidden');
            
            // Удаляем через небольшую задержку
            setTimeout(() => {
                if (loading.parentNode) {
                    loading.remove();
                }
            }, 100);
        }
    }
    
    // Запускаем через 2 секунды после загрузки (fallback)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(forceRemoveLoading, 2000);
        });
    } else {
        setTimeout(forceRemoveLoading, 2000);
    }
    
    // Также запускаем через 5 секунд на всякий случай
    setTimeout(forceRemoveLoading, 5000);
    
    // Если событие 'librariesReady' не произошло - удаляем через 3 секунды
    window.addEventListener('librariesReady', forceRemoveLoading, { once: true });
    
    // Экстренное удаление если пользователь пытается взаимодействовать
    ['click', 'contextmenu', 'mousedown', 'touchstart'].forEach(eventType => {
        document.addEventListener(eventType, function emergencyRemove(e) {
            const loading = document.getElementById('genesis-loading');
            if (loading && loading.style.opacity !== '0' && loading.style.display !== 'none') {
                console.warn('⚠️ Emergency: removing blocking loading screen');
                forceRemoveLoading();
                // Удаляем обработчик после первого срабатывания
                document.removeEventListener(eventType, emergencyRemove);
            }
        }, { once: true, passive: true });
    });
})();

