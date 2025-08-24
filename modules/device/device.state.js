// modules/device/device.state.js
// Управление состоянием модуля устройства

export default class DeviceState {
    constructor() {
        this.deviceInfo = {
            browser: {},
            screen: {},
            memory: {},
            battery: null,
            connection: {},
            gpu: 'N/A',
            deviceType: 'Unknown',
            os: 'Unknown',
            browserName: 'Unknown',
            pwa: {
                standalone: false,
                installed: false,
                installable: false,
                notificationPermission: 'default'
            }
        };
        
        this.pwaPrompt = null;
        this.performanceData = null;
        this.storageInfo = null;
    }
    
    setDeviceInfo(info) {
        this.deviceInfo = { ...this.deviceInfo, ...info };
        this.save();
    }
    
    getDeviceInfo() {
        return this.deviceInfo;
    }
    
    setPWAPrompt(prompt) {
        this.pwaPrompt = prompt;
    }
    
    getPWAPrompt() {
        return this.pwaPrompt;
    }
    
    setPWAInstalled(installed) {
        this.deviceInfo.pwa.installed = installed;
        this.save();
    }
    
    setPerformanceData(data) {
        this.performanceData = data;
        this.save();
    }
    
    getPerformanceData() {
        return this.performanceData;
    }
    
    setStorageInfo(info) {
        this.storageInfo = info;
        this.save();
    }
    
    getStorageInfo() {
        return this.storageInfo;
    }
    
    save() {
        try {
            // Сохраняем только базовую информацию, не промпты
            const dataToSave = {
                deviceInfo: this.deviceInfo,
                performanceData: this.performanceData,
                storageInfo: this.storageInfo
            };
            
            localStorage.setItem('genesis_device_state', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Failed to save device state:', error);
        }
    }
    
    load() {
        try {
            const saved = localStorage.getItem('genesis_device_state');
            if (saved) {
                const data = JSON.parse(saved);
                
                if (data.deviceInfo) {
                    this.deviceInfo = data.deviceInfo;
                }
                if (data.performanceData) {
                    this.performanceData = data.performanceData;
                }
                if (data.storageInfo) {
                    this.storageInfo = data.storageInfo;
                }
            }
        } catch (error) {
            console.warn('Failed to load device state:', error);
        }
    }
    
    clear() {
        this.deviceInfo = {
            browser: {},
            screen: {},
            memory: {},
            battery: null,
            connection: {},
            gpu: 'N/A',
            deviceType: 'Unknown',
            os: 'Unknown',
            browserName: 'Unknown',
            pwa: {
                standalone: false,
                installed: false,
                installable: false,
                notificationPermission: 'default'
            }
        };
        
        this.pwaPrompt = null;
        this.performanceData = null;
        this.storageInfo = null;
        
        localStorage.removeItem('genesis_device_state');
    }
}
