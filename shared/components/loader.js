// shared/components/loader.js
// Универсальный загрузчик для GENESIS

export class Loader {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            type: options.type || 'spinner', // spinner, dots, bars, pulse
            size: options.size || 'medium', // small, medium, large
            color: options.color || '#ff6b35',
            text: options.text || '',
            overlay: options.overlay || false,
            className: options.className || ''
        };
        
        this.element = null;
        this.isActive = false;
    }
    
    render() {
        const loader = document.createElement('div');
        loader.className = `genesis-loader genesis-loader-${this.options.type} genesis-loader-${this.options.size} ${this.options.className}`;
        
        if (this.options.overlay) {
            loader.classList.add('genesis-loader-overlay');
        }
        
        const loaderContent = this.getLoaderContent();
        
        loader.innerHTML = `
            <div class="genesis-loader-content">
                ${loaderContent}
                ${this.options.text ? `<div class="genesis-loader-text">${this.options.text}</div>` : ''}
            </div>
        `;
        
        this.element = loader;
        this.addStyles();
        
        return loader;
    }
    
    getLoaderContent() {
        switch (this.options.type) {
            case 'spinner':
                return `<div class="genesis-loader-spinner" style="border-top-color: ${this.options.color}"></div>`;
                
            case 'dots':
                return `
                    <div class="genesis-loader-dots">
                        <div class="genesis-loader-dot" style="background: ${this.options.color}"></div>
                        <div class="genesis-loader-dot" style="background: ${this.options.color}"></div>
                        <div class="genesis-loader-dot" style="background: ${this.options.color}"></div>
                    </div>
                `;
                
            case 'bars':
                return `
                    <div class="genesis-loader-bars">
                        <div class="genesis-loader-bar" style="background: ${this.options.color}"></div>
                        <div class="genesis-loader-bar" style="background: ${this.options.color}"></div>
                        <div class="genesis-loader-bar" style="background: ${this.options.color}"></div>
                        <div class="genesis-loader-bar" style="background: ${this.options.color}"></div>
                        <div class="genesis-loader-bar" style="background: ${this.options.color}"></div>
                    </div>
                `;
                
            case 'pulse':
                return `
                    <div class="genesis-loader-pulse">
                        <div class="genesis-loader-pulse-ring" style="border-color: ${this.options.color}"></div>
                        <div class="genesis-loader-pulse-ring" style="border-color: ${this.options.color}"></div>
                        <div class="genesis-loader-pulse-ring" style="border-color: ${this.options.color}"></div>
                    </div>
                `;
                
            default:
                return `<div class="genesis-loader-spinner" style="border-top-color: ${this.options.color}"></div>`;
        }
    }
    
    show() {
        if (this.isActive) return;
        
        if (!this.element) {
            this.render();
        }
        
        if (this.container) {
            if (typeof this.container === 'string') {
                this.container = document.querySelector(this.container);
            }
            
            if (this.container) {
                this.container.appendChild(this.element);
            }
        } else {
            document.body.appendChild(this.element);
        }
        
        // Trigger animation
        requestAnimationFrame(() => {
            this.element.classList.add('genesis-loader-active');
        });
        
        this.isActive = true;
    }
    
    hide() {
        if (!this.isActive || !this.element) return;
        
        this.element.classList.remove('genesis-loader-active');
        
        // Wait for animation
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }, 300);
        
        this.isActive = false;
    }
    
    setText(text) {
        const textEl = this.element?.querySelector('.genesis-loader-text');
        if (textEl) {
            textEl.textContent = text;
        } else if (this.element && text) {
            const newTextEl = document.createElement('div');
            newTextEl.className = 'genesis-loader-text';
            newTextEl.textContent = text;
            this.element.querySelector('.genesis-loader-content').appendChild(newTextEl);
        }
        this.options.text = text;
    }
    
    destroy() {
        this.hide();
        this.element = null;
    }
    
    addStyles() {
        // Check if styles already added
        if (document.getElementById('genesis-loader-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'genesis-loader-styles';
        style.textContent = `
            .genesis-loader {
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .genesis-loader-active {
                opacity: 1;
            }
            
            .genesis-loader-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(3px);
                z-index: 9999;
            }
            
            .genesis-loader-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
            }
            
            .genesis-loader-text {
                color: #fff;
                font-size: 1rem;
                font-weight: 500;
                text-align: center;
            }
            
            /* Spinner */
            .genesis-loader-spinner {
                border: 3px solid rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            .genesis-loader-small .genesis-loader-spinner {
                width: 24px;
                height: 24px;
            }
            
            .genesis-loader-medium .genesis-loader-spinner {
                width: 40px;
                height: 40px;
            }
            
            .genesis-loader-large .genesis-loader-spinner {
                width: 60px;
                height: 60px;
                border-width: 4px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Dots */
            .genesis-loader-dots {
                display: flex;
                gap: 8px;
            }
            
            .genesis-loader-dot {
                border-radius: 50%;
                animation: dot-bounce 1.4s ease-in-out infinite;
            }
            
            .genesis-loader-small .genesis-loader-dot {
                width: 8px;
                height: 8px;
            }
            
            .genesis-loader-medium .genesis-loader-dot {
                width: 12px;
                height: 12px;
            }
            
            .genesis-loader-large .genesis-loader-dot {
                width: 16px;
                height: 16px;
            }
            
            .genesis-loader-dot:nth-child(1) {
                animation-delay: -0.32s;
            }
            
            .genesis-loader-dot:nth-child(2) {
                animation-delay: -0.16s;
            }
            
            @keyframes dot-bounce {
                0%, 80%, 100% {
                    transform: scale(0);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            /* Bars */
            .genesis-loader-bars {
                display: flex;
                gap: 4px;
                align-items: center;
            }
            
            .genesis-loader-bar {
                animation: bar-wave 1.2s ease-in-out infinite;
            }
            
            .genesis-loader-small .genesis-loader-bar {
                width: 3px;
                height: 20px;
            }
            
            .genesis-loader-medium .genesis-loader-bar {
                width: 4px;
                height: 30px;
            }
            
            .genesis-loader-large .genesis-loader-bar {
                width: 5px;
                height: 40px;
            }
            
            .genesis-loader-bar:nth-child(1) {
                animation-delay: -0.4s;
            }
            
            .genesis-loader-bar:nth-child(2) {
                animation-delay: -0.3s;
            }
            
            .genesis-loader-bar:nth-child(3) {
                animation-delay: -0.2s;
            }
            
            .genesis-loader-bar:nth-child(4) {
                animation-delay: -0.1s;
            }
            
            @keyframes bar-wave {
                0%, 40%, 100% {
                    transform: scaleY(0.4);
                    opacity: 0.5;
                }
                20% {
                    transform: scaleY(1);
                    opacity: 1;
                }
            }
            
            /* Pulse */
            .genesis-loader-pulse {
                position: relative;
            }
            
            .genesis-loader-small .genesis-loader-pulse {
                width: 30px;
                height: 30px;
            }
            
            .genesis-loader-medium .genesis-loader-pulse {
                width: 50px;
                height: 50px;
            }
            
            .genesis-loader-large .genesis-loader-pulse {
                width: 70px;
                height: 70px;
            }
            
            .genesis-loader-pulse-ring {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 2px solid;
                border-radius: 50%;
                animation: pulse-ring 1.5s ease-in-out infinite;
            }
            
            .genesis-loader-pulse-ring:nth-child(2) {
                animation-delay: -0.5s;
            }
            
            .genesis-loader-pulse-ring:nth-child(3) {
                animation-delay: -1s;
            }
            
            @keyframes pulse-ring {
                0% {
                    transform: scale(0.5);
                    opacity: 1;
                }
                100% {
                    transform: scale(1.2);
                    opacity: 0;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Global loader instance
let globalLoader = null;

export function showGlobalLoader(text = 'Загрузка...', type = 'spinner') {
    if (!globalLoader) {
        globalLoader = new Loader(document.body, {
            type: type,
            size: 'large',
            text: text,
            overlay: true
        });
    }
    globalLoader.show();
}

export function hideGlobalLoader() {
    if (globalLoader) {
        globalLoader.hide();
    }
}

export function setGlobalLoaderText(text) {
    if (globalLoader) {
        globalLoader.setText(text);
    }
}

// Export default
export default Loader;
