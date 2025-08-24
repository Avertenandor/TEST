// modules/platform-access/platform-access.state.js
// Управление состоянием доступа к платформе

export default class PlatformAccessState {
    constructor() {
        this.hasAccess = false;
        this.accessDays = 0;
        this.lastPaymentDate = null;
        this.expiresAt = null;
        this.paymentHistory = [];
        this.pendingTransaction = null;
    }
    
    /**
     * Установка состояния доступа
     * @param {boolean} hasAccess - Есть ли доступ
     * @param {number} days - Количество дней доступа
     * @param {Date} lastPayment - Дата последней оплаты
     */
    setAccess(hasAccess, days, lastPayment) {
        this.hasAccess = hasAccess;
        this.accessDays = days;
        this.lastPaymentDate = lastPayment;
        
        if (lastPayment) {
            this.expiresAt = new Date(lastPayment);
            this.expiresAt.setDate(this.expiresAt.getDate() + days);
        } else {
            this.expiresAt = null;
        }
        
        this.save();
    }
    
    /**
     * Добавление платежа в историю
     * @param {Object} payment - Данные платежа
     */
    addPaymentToHistory(payment) {
        this.paymentHistory.unshift({
            ...payment,
            timestamp: Date.now()
        });
        
        // Ограничиваем историю 50 записями
        if (this.paymentHistory.length > 50) {
            this.paymentHistory = this.paymentHistory.slice(0, 50);
        }
        
        this.save();
    }
    
    /**
     * Установка ожидающей транзакции
     * @param {string} txHash - Hash транзакции
     * @param {number} amount - Сумма в USDT
     */
    setPendingTransaction(txHash, amount) {
        this.pendingTransaction = {
            hash: txHash,
            amount: amount,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        this.save();
    }
    
    /**
     * Очистка ожидающей транзакции
     */
    clearPendingTransaction() {
        this.pendingTransaction = null;
        this.save();
    }
    
    /**
     * Проверка, истек ли доступ
     * @returns {boolean}
     */
    isAccessExpired() {
        if (!this.expiresAt) return true;
        
        const now = new Date();
        return now > this.expiresAt;
    }
    
    /**
     * Получение времени до истечения доступа
     * @returns {Object} {hours, minutes, seconds}
     */
    getTimeUntilExpiry() {
        if (!this.expiresAt) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }
        
        const now = new Date();
        const diff = this.expiresAt - now;
        
        if (diff <= 0) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return { hours, minutes, seconds };
    }
    
    /**
     * Сохранение состояния в localStorage
     */
    save() {
        const data = {
            hasAccess: this.hasAccess,
            accessDays: this.accessDays,
            lastPaymentDate: this.lastPaymentDate ? this.lastPaymentDate.toISOString() : null,
            expiresAt: this.expiresAt ? this.expiresAt.toISOString() : null,
            paymentHistory: this.paymentHistory,
            pendingTransaction: this.pendingTransaction,
            savedAt: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('genesis_platform_access', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save platform access state:', error);
        }
    }
    
    /**
     * Загрузка состояния из localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem('genesis_platform_access');
            
            if (saved) {
                const data = JSON.parse(saved);
                
                this.hasAccess = data.hasAccess || false;
                this.accessDays = data.accessDays || 0;
                this.lastPaymentDate = data.lastPaymentDate ? new Date(data.lastPaymentDate) : null;
                this.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
                this.paymentHistory = data.paymentHistory || [];
                this.pendingTransaction = data.pendingTransaction || null;
                
                // Проверяем актуальность данных
                if (this.isAccessExpired()) {
                    this.hasAccess = false;
                    this.accessDays = 0;
                    this.save();
                }
                
                console.log('✅ Platform access state loaded');
            }
        } catch (error) {
            console.error('Failed to load platform access state:', error);
            this.clear();
        }
    }
    
    /**
     * Очистка состояния
     */
    clear() {
        this.hasAccess = false;
        this.accessDays = 0;
        this.lastPaymentDate = null;
        this.expiresAt = null;
        this.paymentHistory = [];
        this.pendingTransaction = null;
        
        try {
            localStorage.removeItem('genesis_platform_access');
        } catch (error) {
            console.error('Failed to clear platform access state:', error);
        }
    }
    
    /**
     * Получение статистики по платежам
     * @returns {Object} Статистика
     */
    getPaymentStats() {
        if (this.paymentHistory.length === 0) {
            return {
                totalPayments: 0,
                totalAmount: 0,
                totalDays: 0,
                averagePayment: 0,
                lastPayment: null
            };
        }
        
        const totalPayments = this.paymentHistory.length;
        const totalAmount = this.paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalDays = this.paymentHistory.reduce((sum, p) => sum + (p.days || 0), 0);
        const averagePayment = totalAmount / totalPayments;
        const lastPayment = this.paymentHistory[0];
        
        return {
            totalPayments,
            totalAmount,
            totalDays,
            averagePayment,
            lastPayment
        };
    }
    
    /**
     * Экспорт состояния для отладки
     * @returns {Object} Текущее состояние
     */
    export() {
        return {
            hasAccess: this.hasAccess,
            accessDays: this.accessDays,
            lastPaymentDate: this.lastPaymentDate,
            expiresAt: this.expiresAt,
            isExpired: this.isAccessExpired(),
            timeUntilExpiry: this.getTimeUntilExpiry(),
            paymentHistory: this.paymentHistory,
            pendingTransaction: this.pendingTransaction,
            stats: this.getPaymentStats()
        };
    }
}
