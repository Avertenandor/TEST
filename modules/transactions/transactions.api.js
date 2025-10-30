// modules/transactions/transactions.api.js
// MCP-MARKER:MODULE:TRANSACTIONS:API - API для работы с транзакциями через BSCScan

export default class TransactionsAPI {
    constructor(config) {
        this.config = config;
        this.bscApiKey = config.api?.bscScanKey || '';
        this.baseUrl = 'https://api.etherscan.io/v2/api?chainid=56';
        
        // Контракты токенов
        this.contracts = {
            USDT: config.contracts?.USDT || '0x55d398326f99059fF775485246999027B3197955',
            PLEX: config.contracts?.PLEX_ONE || '0x3a9c659Fe09C67dE2eC5e37ea66b6e15Bb5a2617'
        };
        
        // Системные адреса
        this.systemAddress = config.systemAddress || '0x476566104Ff0071b726fa988c96C396417bC0E12';
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:GET_DEPOSITS - Получение депозитных транзакций
    async getDepositTransactions(userAddress) {
        try {
            const deposits = [];
            
            // Получаем транзакции USDT
            const usdtTx = await this.getTokenTransactions(
                this.contracts.USDT,
                userAddress,
                'out' // Исходящие от пользователя
            );
            
            // Получаем транзакции PLEX
            const plexTx = await this.getTokenTransactions(
                this.contracts.PLEX,
                userAddress,
                'out'
            );
            
            // Фильтруем только депозиты (на системный адрес)
            const allTx = [...usdtTx, ...plexTx];
            
            for (const tx of allTx) {
                if (tx.to.toLowerCase() === this.systemAddress.toLowerCase()) {
                    deposits.push({
                        id: tx.hash,
                        type: 'deposit',
                        hash: tx.hash,
                        from: tx.from,
                        to: tx.to,
                        amount: this.formatAmount(tx.value, tx.tokenDecimal),
                        token: tx.tokenSymbol,
                        timestamp: parseInt(tx.timeStamp) * 1000,
                        blockNumber: tx.blockNumber,
                        status: 'confirmed',
                        gasUsed: tx.gasUsed,
                        gasPrice: tx.gasPrice,
                        contractAddress: tx.contractAddress
                    });
                }
            }
            
            // Сортируем по времени (новые первые)
            deposits.sort((a, b) => b.timestamp - a.timestamp);
            
            return deposits;
            
        } catch (error) {
            console.error('[TransactionsAPI] Ошибка получения депозитов:', error);
            return [];
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:GET_WITHDRAWALS - Получение транзакций выводов
    async getWithdrawalTransactions(userAddress) {
        try {
            const withdrawals = [];
            
            // Получаем входящие транзакции от системы
            const usdtTx = await this.getTokenTransactions(
                this.contracts.USDT,
                userAddress,
                'in' // Входящие к пользователю
            );
            
            const plexTx = await this.getTokenTransactions(
                this.contracts.PLEX,
                userAddress,
                'in'
            );
            
            const allTx = [...usdtTx, ...plexTx];
            
            // Фильтруем только выводы (от системного адреса)
            for (const tx of allTx) {
                if (tx.from.toLowerCase() === this.systemAddress.toLowerCase()) {
                    withdrawals.push({
                        id: tx.hash,
                        type: 'withdrawal',
                        hash: tx.hash,
                        from: tx.from,
                        to: tx.to,
                        amount: this.formatAmount(tx.value, tx.tokenDecimal),
                        token: tx.tokenSymbol,
                        timestamp: parseInt(tx.timeStamp) * 1000,
                        blockNumber: tx.blockNumber,
                        status: 'completed',
                        gasUsed: tx.gasUsed,
                        gasPrice: tx.gasPrice,
                        contractAddress: tx.contractAddress
                    });
                }
            }
            
            withdrawals.sort((a, b) => b.timestamp - a.timestamp);
            
            return withdrawals;
            
        } catch (error) {
            console.error('[TransactionsAPI] Ошибка получения выводов:', error);
            return [];
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:GET_PLATFORM_PAYMENTS - Получение платежей за платформу
    async getPlatformPayments(userAddress) {
        try {
            const payments = [];
            
            // Получаем транзакции USDT на $1
            const usdtTx = await this.getTokenTransactions(
                this.contracts.USDT,
                userAddress,
                'out'
            );
            
            // Фильтруем платежи на $1 (ежедневная оплата)
            for (const tx of usdtTx) {
                if (tx.to.toLowerCase() === this.systemAddress.toLowerCase()) {
                    const amount = this.formatAmount(tx.value, tx.tokenDecimal);
                    
                    // Проверяем, что это платеж за доступ ($1)
                    if (amount >= 0.9 && amount <= 1.1) { // Допускаем небольшую погрешность
                        payments.push({
                            id: tx.hash,
                            type: 'platform',
                            hash: tx.hash,
                            from: tx.from,
                            to: tx.to,
                            amount: amount,
                            token: tx.tokenSymbol,
                            timestamp: parseInt(tx.timeStamp) * 1000,
                            blockNumber: tx.blockNumber,
                            status: 'confirmed',
                            description: 'Ежедневная оплата доступа',
                            gasUsed: tx.gasUsed,
                            gasPrice: tx.gasPrice
                        });
                    }
                }
            }
            
            payments.sort((a, b) => b.timestamp - a.timestamp);
            
            return payments;
            
        } catch (error) {
            console.error('[TransactionsAPI] Ошибка получения платежей за платформу:', error);
            return [];
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:GET_TOKEN_TX - Получение токен-транзакций
    async getTokenTransactions(contractAddress, address, direction = 'both') {
        try {
            const params = new URLSearchParams({
                module: 'account',
                action: 'tokentx',
                contractaddress: contractAddress,
                address: address,
                startblock: 0,
                endblock: 99999999,
                page: 1,
                offset: 100, // Максимум 100 за раз
                sort: 'desc',
                apikey: this.bscApiKey
            });
            
            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();
            
            if (data.status === '1' && data.result) {
                let transactions = data.result;
                
                // Фильтруем по направлению
                if (direction === 'in') {
                    transactions = transactions.filter(tx => 
                        tx.to.toLowerCase() === address.toLowerCase()
                    );
                } else if (direction === 'out') {
                    transactions = transactions.filter(tx => 
                        tx.from.toLowerCase() === address.toLowerCase()
                    );
                }
                
                return transactions;
            }
            
            return [];
            
        } catch (error) {
            console.error('[TransactionsAPI] Ошибка получения транзакций токенов:', error);
            return [];
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:GET_BNB_TX - Получение BNB транзакций
    async getBNBTransactions(address) {
        try {
            const params = new URLSearchParams({
                module: 'account',
                action: 'txlist',
                address: address,
                startblock: 0,
                endblock: 99999999,
                page: 1,
                offset: 100,
                sort: 'desc',
                apikey: this.bscApiKey
            });
            
            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();
            
            if (data.status === '1' && data.result) {
                return data.result.map(tx => ({
                    id: tx.hash,
                    type: 'bnb',
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    amount: this.formatAmount(tx.value, 18), // BNB имеет 18 decimals
                    token: 'BNB',
                    timestamp: parseInt(tx.timeStamp) * 1000,
                    blockNumber: tx.blockNumber,
                    status: tx.isError === '0' ? 'success' : 'failed',
                    gasUsed: tx.gasUsed,
                    gasPrice: tx.gasPrice
                }));
            }
            
            return [];
            
        } catch (error) {
            console.error('[TransactionsAPI] Ошибка получения BNB транзакций:', error);
            return [];
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:CHECK_TX_STATUS - Проверка статуса транзакции
    async checkTransactionStatus(hash) {
        try {
            const params = new URLSearchParams({
                module: 'transaction',
                action: 'gettxreceiptstatus',
                txhash: hash,
                apikey: this.bscApiKey
            });
            
            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();
            
            if (data.status === '1' && data.result) {
                return data.result.status === '1' ? 'success' : 'failed';
            }
            
            return 'unknown';
            
        } catch (error) {
            console.error('[TransactionsAPI] Ошибка проверки статуса транзакции:', error);
            return 'unknown';
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:GET_BLOCK_NUMBER - Получение текущего блока
    async getCurrentBlockNumber() {
        try {
            const params = new URLSearchParams({
                module: 'proxy',
                action: 'eth_blockNumber',
                apikey: this.bscApiKey
            });
            
            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();
            
            if (data.result) {
                return parseInt(data.result, 16); // Конвертируем из hex
            }
            
            return 0;
            
        } catch (error) {
            console.error('[TransactionsAPI] Ошибка получения номера блока:', error);
            return 0;
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:FORMAT_AMOUNT - Форматирование суммы
    formatAmount(value, decimals = 18) {
        const divisor = Math.pow(10, parseInt(decimals));
        return parseFloat(value) / divisor;
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:VALIDATE_ADDRESS - Валидация адреса
    validateAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:GET_GAS_PRICE - Получение текущей цены газа
    async getGasPrice() {
        try {
            const params = new URLSearchParams({
                module: 'proxy',
                action: 'eth_gasPrice',
                apikey: this.bscApiKey
            });
            
            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();
            
            if (data.result) {
                return parseInt(data.result, 16); // Конвертируем из hex
            }
            
            return 5000000000; // Default 5 Gwei
            
        } catch (error) {
            console.error('[TransactionsAPI] Ошибка получения цены газа:', error);
            return 5000000000;
        }
    }
}
