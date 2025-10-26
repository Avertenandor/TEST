    showNotification(message, type = 'info') {
        if (this.context && this.context.eventBus) {
            this.context.eventBus.emit('notification:show', { message, type });
        }
    }
    
    showLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.remove('hidden');
    }
    
    hideLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.add('hidden');
    }
    
    destroy() {
        console.log('🧹 Destroying Device Module...');
        
        // Остановка мониторинга
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Отписка от событий
        this.subscriptions.forEach(unsub => {
            if (typeof unsub === 'function') unsub();
        });
        
        // Удаление стилей
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) link.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Очистка состояния
        if (this.state) this.state.clear();
        
        console.log('✅ Device Module destroyed');
    }
}
