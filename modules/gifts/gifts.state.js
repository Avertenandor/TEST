// modules/gifts/gifts.state.js
// Управление состоянием модуля подарков

export default class GiftsState {
    constructor() {
        this.gifts = [];
        this.claimedGifts = [];
        this.dailyGiftStatus = null;
        this.totalClaimed = 0;
    }
    
    // Загрузить состояние из localStorage
    load() {
        try {
            const savedState = localStorage.getItem('genesis_gifts_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                Object.assign(this, state);
            }
            
            // Загружаем список полученных подарков
            const claimedGifts = localStorage.getItem('genesis_claimed_gifts');
            if (claimedGifts) {
                this.claimedGifts = JSON.parse(claimedGifts);
            }
            
        } catch (error) {
            console.error('Error loading gifts state:', error);
        }
    }
    
    // Сохранить состояние
    save() {
        try {
            const state = {
                gifts: this.gifts,
                claimedGifts: this.claimedGifts,
                dailyGiftStatus: this.dailyGiftStatus,
                totalClaimed: this.totalClaimed
            };
            
            localStorage.setItem('genesis_gifts_state', JSON.stringify(state));
            localStorage.setItem('genesis_claimed_gifts', JSON.stringify(this.claimedGifts));
            
        } catch (error) {
            console.error('Error saving gifts state:', error);
        }
    }
    
    // Установить список подарков
    setGifts(gifts) {
        this.gifts = gifts;
        this.save();
    }
    
    // Добавить полученный подарок
    addClaimedGift(gift) {
        if (!this.claimedGifts.find(g => g.id === gift.id)) {
            this.claimedGifts.push(gift);
            this.totalClaimed++;
            this.save();
        }
    }
    
    // Отметить подарок как полученный
    markGiftClaimed(giftId) {
        const gift = this.gifts.find(g => g.id === giftId);
        if (gift) {
            gift.claimed = true;
            
            if (!this.claimedGifts.includes(giftId)) {
                this.claimedGifts.push(giftId);
            }
            
            this.save();
        }
    }
    
    // Обновить статус ежедневного подарка
    updateDailyGiftStatus(status) {
        this.dailyGiftStatus = status;
        this.save();
    }
    
    // Получить подарок по ID
    getGiftById(giftId) {
        return this.gifts.find(g => g.id === giftId);
    }
    
    // Получить количество доступных подарков
    getAvailableGiftsCount() {
        return this.gifts.filter(g => g.available && !g.claimed).length;
    }
    
    // Получить количество полученных подарков
    getClaimedGiftsCount() {
        return this.claimedGifts.length;
    }
    
    // Получить прогресс по всем подаркам
    getOverallProgress() {
        if (this.gifts.length === 0) return 0;
        
        const claimedCount = this.gifts.filter(g => g.claimed).length;
        return Math.round((claimedCount / this.gifts.length) * 100);
    }
    
    // Очистить состояние
    clear() {
        this.gifts = [];
        this.claimedGifts = [];
        this.dailyGiftStatus = null;
        this.totalClaimed = 0;
        
        localStorage.removeItem('genesis_gifts_state');
        localStorage.removeItem('genesis_claimed_gifts');
        localStorage.removeItem('genesis_daily_gift_last_claim');
        localStorage.removeItem('genesis_daily_gift_streak');
    }
}
