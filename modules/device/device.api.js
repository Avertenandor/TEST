// modules/device/device.api.js
// API для модуля устройства

export default class DeviceAPI {
    constructor(config) {
        this.config = config;
    }
    
    async runPerformanceTest() {
        const results = {
            cpuScore: 0,
            renderTime: 0,
            fps: 0,
            networkLatency: 0
        };
        
        try {
            // Тест CPU
            results.cpuScore = await this.testCPU();
            
            // Тест рендеринга
            results.renderTime = await this.testRender();
            
            // Тест FPS
            results.fps = await this.testFPS();
            
            // Тест сети
            results.networkLatency = await this.testNetwork();
            
        } catch (error) {
            console.error('Performance test error:', error);
        }
        
        return results;
    }
    
    async testCPU() {
        const start = performance.now();
        let result = 0;
        
        // Простой вычислительный тест
        for (let i = 0; i < 1000000; i++) {
            result += Math.sqrt(i) * Math.sin(i);
        }
        
        const end = performance.now();
        const time = end - start;
        
        // Преобразуем время в оценку (чем меньше время, тем выше оценка)
        const score = Math.round(10000 / time);
        
        return Math.min(100, score);
    }
    
    async testRender() {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        
        const start = performance.now();
        
        // Рисуем множество элементов
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = `hsl(${i * 3.6}, 50%, 50%)`;
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 50,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        const end = performance.now();
        
        return Math.round(end - start);
    }
    
    async testFPS() {
        return new Promise((resolve) => {
            let frames = 0;
            let startTime = performance.now();
            
            function countFrame() {
                frames++;
                
                const currentTime = performance.now();
                const elapsed = currentTime - startTime;
                
                if (elapsed >= 1000) {
                    // Прошла секунда
                    resolve(frames);
                } else {
                    requestAnimationFrame(countFrame);
                }
            }
            
            requestAnimationFrame(countFrame);
        });
    }
    
    async testNetwork() {
        const start = performance.now();
        
        try {
            // Пингуем небольшой файл
            await fetch('/manifest.json', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            const end = performance.now();
            return Math.round(end - start);
            
        } catch (error) {
            console.warn('Network test failed:', error);
            return -1;
        }
    }
    
    async checkServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                return {
                    registered: !!registration,
                    scope: registration ? registration.scope : null,
                    state: registration ? registration.active?.state : null
                };
            } catch (error) {
                console.error('Service Worker check failed:', error);
                return null;
            }
        }
        return null;
    }
    
    async getStorageEstimate() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                return {
                    usage: this.formatBytes(estimate.usage || 0),
                    quota: this.formatBytes(estimate.quota || 0),
                    percentage: Math.round((estimate.usage / estimate.quota) * 100)
                };
            } catch (error) {
                console.error('Storage estimate failed:', error);
                return null;
            }
        }
        return null;
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
