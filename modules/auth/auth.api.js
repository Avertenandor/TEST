// modules/auth/auth.api.js
// API для работы с авторизацией через BSCScan

class AuthAPI {
    constructor(config) {
        this.config = config;
        this.bscApiKey = config?.bscscan?.apiKeys?.PRIMARY || config?.api?.bscScanKey || '';
        this.plexContract = config?.plex?.address || config?.contracts?.PLEX_ONE || '';
        this.systemAddress = config?.addresses?.system || config?.systemAddress || '';
        this.baseUrl = config?.bscscan?.apiUrl || 'https://api.bscscan.com/api';
    }
    
    /**
     * Проверка авторизации пользователя
     * Проверяет, отправлял ли пользователь 1 PLEX на системный адрес
     * @param {string} userAddress - BSC адрес пользователя
     * @returns {Promise<boolean>} - true если пользователь авторизован
     */
    async checkAuthorization(userAddress) {
        console.log('🔍 Checking authorization for:', userAddress);
        
        // Для тестового режима всегда возвращаем true для определенных адресов
        if (this.isTestMode()) {
            const testAddresses = [
                '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD8e',
                '0x1234567890abcdef1234567890abcdef12345678',
                '0x1234567890123456789012345678901234567890'
            ];
            
            if (testAddresses.some(addr => addr.toLowerCase() === userAddress.toLowerCase())) {
                console.log('✅ Test mode: Authorization granted for test address');
                return true;
            }
        }
        
        try {
            // Получаем историю транзакций токенов для пользователя
            const tokenTxResponse = await this.getTokenTransactions(userAddress);
            
            if (!tokenTxResponse.result || tokenTxResponse.result.length === 0) {
                console.log('ℹ️ No token transactions found');
                return false;
            }
            
            // Ищем платеж авторизации (1 PLEX от пользователя к системному адресу)
            const authPayment = tokenTxResponse.result.find(tx => {
                const isFromUser = tx.from.toLowerCase() === userAddress.toLowerCase();
                const isToSystem = tx.to.toLowerCase() === this.systemAddress.toLowerCase();
                const isOnePlex = tx.value === '1000000000000000000'; // 1 PLEX = 10^18 wei
                
                return isFromUser && isToSystem && isOnePlex;
            });
            
            if (authPayment) {
                console.log('✅ Authorization payment found:', authPayment.hash);
                return true;
            }
            
            console.log('❌ No authorization payment found');
            return false;
            
        } catch (error) {
            console.error('Error checking authorization:', error);
            
            // В случае ошибки API в тестовом режиме разрешаем доступ
            if (this.isTestMode()) {
                console.log('⚠️ API error in test mode, granting access');
                return true;
            }
            
            throw error;
        }
    }
    
    /**
     * Получение транзакций токенов для адреса
     * @param {string} address - BSC адрес
     * @returns {Promise<Object>} - Ответ от BSCScan API
     */
    async getTokenTransactions(address) {
        const params = new URLSearchParams({
            module: 'account',
            action: 'tokentx',
            contractaddress: this.plexContract,
            address: address,
            startblock: 0,
            endblock: 999999999,
            sort: 'desc',
            apikey: this.bscApiKey
        });
        
        const url = `${this.baseUrl}?${params.toString()}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Проверка на ошибки API
            if (data.status === '0' && data.message !== 'No transactions found') {
                throw new Error(`BSCScan API error: ${data.message || 'Unknown error'}`);
            }
            
            return data;
            
        } catch (error) {
            console.error('Error fetching token transactions:', error);
            throw error;
        }
    }
    
    /**
     * Проверка, работает ли API в тестовом режиме
     * @returns {boolean}
     */
    isTestMode() {
        // Проверяем различные индикаторы тестового режима
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
        const isDevMode = this.config?.environment === 'development';
        const hasTestKey = this.bscApiKey === 'test' || this.bscApiKey === '';
        
        return isLocalhost || isDevMode || hasTestKey;
    }
}

export default AuthAPI;
