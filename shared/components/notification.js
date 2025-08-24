// shared/components/notification.js
// Система уведомлений для GENESIS

export class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.init();
    }
    
    init() {
        // Create or get container
        this.container = document.getElementById('global-notifications');
        
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'global-notifications';
            this.container.className = 'genesis-notifications';
            document.body.appendChild(this.container);
        }
        
        this.addStyles();
        
        // Subscribe to global events if eventBus exists
        if (window.eventBus) {
            window.eventBus.on('notification:show', (data) => {
                this.show(data.message, data.type, data.duration);
            });
        }
    }
    
    show(message, type = 'info', duration = 5000) {
        const id = Date.now().toString();
        
        const notification = document.createElement('div');
        notification.className = `genesis-notification genesis-notification-${type}`;
        notification.dataset.id = id;
        
        const icon = this.getIcon(type);
        const title = this.getTitle(type);
        
        notification.innerHTML = `
            <div class="genesis-notification-icon">${icon}</div>
            <div class="genesis-notification-content">
                <div class="genesis-notification-title">${title}</div>
                <div class="genesis-notification-message">${message}</div>
            </div>
            <button class="genesis-notification-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
            <div class="genesis-notification-progress">
                <div class="genesis-notification-progress-bar" style="animation-duration: ${duration}ms"></div>
            </div>
        `;
        
        // Add click handler for close button
        const closeBtn = notification.querySelector('.genesis-notification-close');
        closeBtn.addEventListener('click', () => {
            this.remove(id);
        });
        
        // Store notification
        this.notifications.set(id, {
            element: notification,
            timeout: null
        });
        
        // Add to container
        this.container.appendChild(notification);
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('genesis-notification-show');
        });
        
        // Auto-remove after duration
        if (duration > 0) {
            const timeout = setTimeout(() => {
                this.remove(id);
            }, duration);
            
            this.notifications.get(id).timeout = timeout;
        }
        
        return id;
    }
    
    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        // Clear timeout if exists
        if (notification.timeout) {
            clearTimeout(notification.timeout);
        }
        
        // Animate out
        notification.element.classList.remove('genesis-notification-show');
        
        // Remove after animation
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.delete(id);
        }, 300);
    }
    
    clear() {
        this.notifications.forEach((_, id) => {
            this.remove(id);
        });
    }
    
    getIcon(type) {
        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2"/>
                <line x1="12" y1="9" x2="12" y2="13" stroke-width="2" stroke-linecap="round"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <line x1="12" y1="16" x2="12" y2="12" stroke-width="2" stroke-linecap="round"/>
                <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2" stroke-linecap="round"/>
            </svg>`
        };
        return icons[type] || icons.info;
    }
    
    getTitle(type) {
        const titles = {
            success: 'Успешно',
            error: 'Ошибка',
            warning: 'Внимание',
            info: 'Информация'
        };
        return titles[type] || titles.info;
    }
    
    addStyles() {
        // Check if styles already added
        if (document.getElementById('genesis-notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'genesis-notification-styles';
        style.textContent = `
            .genesis-notifications {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10001;
                pointer-events: none;
            }
            
            .genesis-notification {
                background: #1a1a2e;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                margin-bottom: 12px;
                min-width: 320px;
                max-width: 420px;
                position: relative;
                display: flex;
                align-items: flex-start;
                padding: 16px;
                pointer-events: auto;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
                overflow: hidden;
            }
            
            .genesis-notification-show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .genesis-notification-icon {
                flex-shrink: 0;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
            }
            
            .genesis-notification-success .genesis-notification-icon {
                background: rgba(34, 197, 94, 0.2);
                color: #22c55e;
            }
            
            .genesis-notification-error .genesis-notification-icon {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
            }
            
            .genesis-notification-warning .genesis-notification-icon {
                background: rgba(245, 158, 11, 0.2);
                color: #f59e0b;
            }
            
            .genesis-notification-info .genesis-notification-icon {
                background: rgba(59, 130, 246, 0.2);
                color: #3b82f6;
            }
            
            .genesis-notification-content {
                flex: 1;
                margin-right: 12px;
            }
            
            .genesis-notification-title {
                font-size: 0.875rem;
                font-weight: 600;
                color: #fff;
                margin-bottom: 4px;
            }
            
            .genesis-notification-message {
                font-size: 0.875rem;
                color: #9ca3af;
                line-height: 1.4;
            }
            
            .genesis-notification-close {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 24px;
                height: 24px;
                border: none;
                background: transparent;
                color: #6b7280;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .genesis-notification-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }
            
            .genesis-notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.1);
                overflow: hidden;
            }
            
            .genesis-notification-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #ff6b35 0%, #f03e3e 100%);
                animation: progress linear forwards;
            }
            
            @keyframes progress {
                from {
                    width: 100%;
                }
                to {
                    width: 0%;
                }
            }
            
            @media (max-width: 480px) {
                .genesis-notifications {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                }
                
                .genesis-notification {
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Create singleton instance
const notificationSystem = new NotificationSystem();

// Export functions for easy use
export function showNotification(message, type = 'info', duration = 5000) {
    return notificationSystem.show(message, type, duration);
}

export function removeNotification(id) {
    notificationSystem.remove(id);
}

export function clearNotifications() {
    notificationSystem.clear();
}

// Export the class and instance
export { NotificationSystem };
export default notificationSystem;
