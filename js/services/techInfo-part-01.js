
                this.updateElements();
            } catch (error) {
                this.techData.geolocation = `Ошибка: ${error.message}`;
                this.updateElements();
            }
        }

        // MCP-MARKER:METHOD:TECH_INFO:REFRESH - Обновление данных
        refreshData() {
            console.log('🔄 Обновление технических данных...');
            this.collectTechData();
            this.updateElements();
            
            // Показываем уведомление
            if (window.GenesisNotifications) {
                window.GenesisNotifications.show('✅ Технические данные обновлены', 'success');
            }
        }

        // MCP-MARKER:METHOD:TECH_INFO:EXPORT - Экспорт данных
        exportData() {
            const data = {
                timestamp: new Date().toISOString(),
                deviceInfo: this.techData,
                userAgent: navigator.userAgent,
                screenInfo: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth
                },
                windowInfo: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio
                }
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `genesis-tech-info-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            a.click();
            URL.revokeObjectURL(url);

            if (window.GenesisNotifications) {
                window.GenesisNotifications.show('📥 Данные экспортированы', 'success');
            }
        }

        getData() {
            return this.techData;
        }

        // Метод для обновления данных вручную (совместимость)
        refresh() {
            this.refreshData();
        }
    }

    window.GenesisTechInfo = new GenesisTechInfo();

    // Глобальные функции для совместимости
    window.updateTechInfo = function() {
        if (window.GenesisTechInfo) {
            window.GenesisTechInfo.refreshData();
        }
    };

    // Добавляем CSS анимацию для обновления
    const style = document.createElement('style');
    style.textContent = `
@keyframes techUpdate {
    0% { background-color: rgba(255, 107, 53, 0.1); }
    50% { background-color: rgba(255, 107, 53, 0.2); }
    100% { background-color: transparent; }
}

.tech-card-checkmark {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #00ff41;
    font-weight: bold;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
`;
    document.head.appendChild(style);
}

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GenesisTechInfo;
} 