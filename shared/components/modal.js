// shared/components/modal.js
// Универсальный компонент модального окна для GENESIS

export class Modal {
    constructor(options = {}) {
        this.options = {
            title: options.title || '',
            content: options.content || '',
            closeOnOverlay: options.closeOnOverlay !== false,
            closeOnEscape: options.closeOnEscape !== false,
            className: options.className || '',
            showCloseButton: options.showCloseButton !== false,
            width: options.width || '500px',
            onOpen: options.onOpen || null,
            onClose: options.onClose || null,
            buttons: options.buttons || []
        };
        
        this.element = null;
        this.isOpen = false;
        this.boundEscapeHandler = this.handleEscape.bind(this);
    }
    
    render() {
        const modal = document.createElement('div');
        modal.className = `genesis-modal ${this.options.className}`;
        modal.innerHTML = `
            <div class="genesis-modal-overlay"></div>
            <div class="genesis-modal-container" style="max-width: ${this.options.width}">
                <div class="genesis-modal-content">
                    ${this.options.showCloseButton ? `
                        <button class="genesis-modal-close" aria-label="Close modal">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    ` : ''}
                    
                    ${this.options.title ? `
                        <div class="genesis-modal-header">
                            <h2 class="genesis-modal-title">${this.options.title}</h2>
                        </div>
                    ` : ''}
                    
                    <div class="genesis-modal-body">
                        ${this.options.content}
                    </div>
                    
                    ${this.options.buttons.length > 0 ? `
                        <div class="genesis-modal-footer">
                            ${this.options.buttons.map(btn => `
                                <button 
                                    class="genesis-modal-btn ${btn.className || ''}" 
                                    data-action="${btn.action || ''}"
                                    ${btn.disabled ? 'disabled' : ''}
                                >
                                    ${btn.text}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        this.element = modal;
        this.attachEvents();
        this.addStyles();
        
        return modal;
    }
    
    attachEvents() {
        if (!this.element) return;
        
        // Close button
        if (this.options.showCloseButton) {
            const closeBtn = this.element.querySelector('.genesis-modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
        }
        
        // Overlay click
        if (this.options.closeOnOverlay) {
            const overlay = this.element.querySelector('.genesis-modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => this.close());
            }
        }
        
        // Button actions
        const buttons = this.element.querySelectorAll('.genesis-modal-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const buttonConfig = this.options.buttons.find(b => b.action === action);
                
                if (buttonConfig && buttonConfig.handler) {
                    buttonConfig.handler(this);
                }
            });
        });
    }
    
    handleEscape(e) {
        if (e.key === 'Escape' && this.isOpen && this.options.closeOnEscape) {
            this.close();
        }
    }
    
    open() {
        if (this.isOpen) return;
        
        if (!this.element) {
            this.render();
        }
        
        document.body.appendChild(this.element);
        
        // Add escape handler
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', this.boundEscapeHandler);
        }
        
        // Trigger animation
        requestAnimationFrame(() => {
            this.element.classList.add('genesis-modal-open');
        });
        
        this.isOpen = true;
        
        // Callback
        if (this.options.onOpen) {
            this.options.onOpen(this);
        }
        
        // Emit event
        if (window.eventBus) {
            window.eventBus.emit('modal:opened', { modal: this });
        }
    }
    
    close() {
        if (!this.isOpen || !this.element) return;
        
        this.element.classList.remove('genesis-modal-open');
        
        // Remove escape handler
        document.removeEventListener('keydown', this.boundEscapeHandler);
        
        // Wait for animation
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }, 300);
        
        this.isOpen = false;
        
        // Callback
        if (this.options.onClose) {
            this.options.onClose(this);
        }
        
        // Emit event
        if (window.eventBus) {
            window.eventBus.emit('modal:closed', { modal: this });
        }
    }
    
    setContent(content) {
        const body = this.element?.querySelector('.genesis-modal-body');
        if (body) {
            body.innerHTML = content;
        }
        this.options.content = content;
    }
    
    setTitle(title) {
        const header = this.element?.querySelector('.genesis-modal-title');
        if (header) {
            header.textContent = title;
        }
        this.options.title = title;
    }
    
    destroy() {
        this.close();
        this.element = null;
    }
    
    addStyles() {
        // Check if styles already added
        if (document.getElementById('genesis-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'genesis-modal-styles';
        style.textContent = `
            .genesis-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .genesis-modal-open {
                opacity: 1;
            }
            
            .genesis-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(5px);
            }
            
            .genesis-modal-container {
                position: relative;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .genesis-modal-open .genesis-modal-container {
                transform: scale(1);
            }
            
            .genesis-modal-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(255, 107, 53, 0.3);
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                position: relative;
                overflow: hidden;
            }
            
            .genesis-modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                z-index: 1;
            }
            
            .genesis-modal-close:hover {
                background: rgba(255, 107, 53, 0.3);
                transform: rotate(90deg);
            }
            
            .genesis-modal-close svg {
                color: #fff;
            }
            
            .genesis-modal-header {
                padding: 25px 30px 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .genesis-modal-title {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 600;
                color: #fff;
                font-family: 'Orbitron', monospace;
            }
            
            .genesis-modal-body {
                padding: 25px 30px;
                color: #b0b0b0;
                line-height: 1.6;
            }
            
            .genesis-modal-footer {
                padding: 20px 30px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            .genesis-modal-btn {
                padding: 10px 24px;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.95rem;
            }
            
            .genesis-modal-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .genesis-modal-btn.primary {
                background: linear-gradient(135deg, #ff6b35 0%, #f03e3e 100%);
                color: white;
            }
            
            .genesis-modal-btn.primary:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 107, 53, 0.3);
            }
            
            .genesis-modal-btn.secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .genesis-modal-btn.secondary:hover:not(:disabled) {
                background: rgba(255, 255, 255, 0.15);
            }
            
            @media (max-width: 768px) {
                .genesis-modal-container {
                    width: 95%;
                    max-width: none;
                }
                
                .genesis-modal-header,
                .genesis-modal-body,
                .genesis-modal-footer {
                    padding: 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Export as default
export default Modal;
