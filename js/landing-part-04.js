        // MCP-MARKER:FUNCTION:LOGOUT_FROM_INDEX - Выход с главной страницы
        // Функция выхода для главной страницы (очистка сохраненных данных)
        window.logoutFromIndex = function() {
            if (confirm('Вы уверены, что хотите выйти?')) {
                localStorage.removeItem('genesis_user_address');
                localStorage.removeItem('genesis_auth_status');
                localStorage.removeItem('genesis_user_email');
                localStorage.removeItem('genesis_user_nickname');
                console.log('👋 Выход выполнен, данные очищены');
                checkCabinetAccess(); // Обновляем интерфейс
                
                // Показываем уведомление
                if (window.GenesisApp && window.GenesisApp.showNotification) {
                    window.GenesisApp.showNotification('Выход выполнен', 'Данные авторизации очищены', 'info');
                }
            }
        };
        
        // Проверяем доступ при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                checkCabinetAccess();
            }, 1000);
        });
        
        // Проверяем доступ при изменении localStorage (если пользователь авторизовался в другой вкладке)
        window.addEventListener('storage', function(e) {
            if (e.key === 'genesis_user_address') {
                checkCabinetAccess();
            }
        });
        
        // Горячие клавиши для навигации
        document.addEventListener('keydown', function(e) {
            // Ctrl + Enter для быстрого входа в кабинет
            if (e.ctrlKey && e.key === 'Enter') {
                const quickAccess = document.getElementById('quick-cabinet-access');
                if (quickAccess && quickAccess.classList.contains('show')) {
                    window.location.href = 'app.html';
                }
            }
        });

// ===== Script Block 6 =====
(function landingBootstrap(){
            function revealLanding(){
                if (window._landingReadyDone) return;
                window._landingReadyDone = true;
                try {
                    const appEl = document.getElementById('genesis-app');
                    if (appEl) appEl.classList.remove('hidden-initially');
                    const loading = document.getElementById('genesis-loading');
                    if (loading){
                        loading.style.opacity = '0';
                        setTimeout(() => { loading.style.display = 'none'; }, 300);
                    }
                    const statusEl = document.getElementById('loading-status');
                    if (statusEl) statusEl.textContent = 'Готово';
                } catch {}
            }

            function maybeReveal(){
                if (window._landingReadyDone) return;
                if (document.readyState !== 'loading'){
                    revealLanding();
                }
            }

            // Когда библиотеки готовы — тоже раскрываем
            document.addEventListener('librariesReady', () => revealLanding(), { once: true });

            if (document.readyState === 'loading'){
                document.addEventListener('DOMContentLoaded', () => maybeReveal(), { once: true });
            } else {
                maybeReveal();
            }

            // Fallback на случай задержек
            setTimeout(maybeReveal, 1500);
        })();

