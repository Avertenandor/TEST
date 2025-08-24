// shared/services/api/bsc-api.js
// BSCScan API integration service for GENESIS platform

import { bscScheduler } from '../request-scheduler.js';

// MCP-MARKER:SERVICE:BSC_API_UPDATED - Обновлен для использования RequestScheduler

export class BSCApi {
    constructor(config) {
        this.apiUrl = config.bscscan.apiUrl;
        this.apiKeys = config.bscscan.apiKeys;
        this.keyRotation = config.bscscan.keyRotation || false;
        this.currentKeyIndex = 0;
        this.rateLimit = config.bscscan.rateLimit || 5;
        this.retryAttempts = config.bscscan.retryAttempts || 3;
        this.lastCallTime = 0;
        this.addresses = config.addresses;
        this.usdt = config.usdt;
        this.plex = config.plex;
        
        // Create array of API keys for rotation
        this.keyArray = Object.values(this.apiKeys);
        this.keyMap = Object.entries(this.apiKeys);
    }

    // Get next API key with rotation
    getApiKey(forceNext = false) {
        if (!this.keyRotation && !forceNext) {
            return this.apiKeys.PRIMARY || this.keyArray[0];
        }
        
        if (forceNext) {
            this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keyArray.length;
        }
        
        const currentKey = this.keyArray[this.currentKeyIndex];
        const keyName = this.keyMap[this.currentKeyIndex][0];
        
        console.log(`🔑 Using API key: ${keyName} (${this.currentKeyIndex + 1}/${this.keyArray.length})`);
        return currentKey;
    }

    // Ensure rate limiting
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCallTime;
        const minInterval = 1000 / this.rateLimit; // Convert to ms per request

        if (timeSinceLastCall < minInterval) {
            await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastCall));
        }
        
        this.lastCallTime = Date.now();
    }

    // Error classification
    classifyError(data) {
        if (!data || data.status === '1') return null;
        
        const message = data.message || '';
        const result = data.result || '';
        
        // Classify error type
        if (message.includes('Invalid API Key')) {
            return { type: 'INVALID_API_KEY', message, result };
        } else if (message.includes('Max rate limit reached')) {
            return { type: 'RATE_LIMIT', message, result };
        } else if (message.includes('No transactions found') || message.includes('No records found')) {
            return { type: 'EMPTY_RESULT', message, result };
        } else if (message.includes('Invalid address format')) {
            return { type: 'INVALID_ADDRESS', message, result };
        } else if (message === 'NOTOK') {
            return { type: 'GENERAL_ERROR', message, result: result || 'Unknown error' };
        } else {
            return { type: 'UNKNOWN', message, result };
        }
    }

    // Make API request with retry logic using RequestScheduler
    async makeRequest(params, apiKey, retryCount = 0) {
        // Создаем ключ кэша для запроса
        const cacheKey = `${params.module}_${params.action}_${params.address || params.contractaddress}_${params.txhash || ''}`;
        
        // Функция запроса для scheduler
        const requestFn = async () => {
            const url = new URL(this.apiUrl);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
            url.searchParams.append('apikey', apiKey);
            
            console.log(`📡 BSCScan API request:`, params.action);
            
            const response = await fetch(url.toString());
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Successful response
            if (data.status === '1' && data.result) {
                console.log(`✅ BSCScan API success:`, params.action);
                return data.result;
            }
            
            // Handle errors
            const error = this.classifyError(data);
            
            if (error) {
                console.log(`❌ BSCScan API response [${error.type}]:`, {
                    message: error.message,
                    action: params.action
                });
                
                // Try next API key for rate limit errors or general errors
                if ((error.type === 'RATE_LIMIT' || error.type === 'GENERAL_ERROR') && retryCount < this.retryAttempts) {
                    const nextKey = this.getApiKey(true);
                    console.log(`🔄 Retrying with next API key (attempt ${retryCount + 1})`);
                    return await this.makeRequest(params, nextKey, retryCount + 1);
                }
                
                // Don't retry for certain error types
                if (error.type === 'INVALID_API_KEY' || error.type === 'INVALID_ADDRESS') {
                    const err = new Error(`${error.type}: ${error.message} - ${error.result}`);
                    err.code = error.type;
                    throw err;
                }
                
                // Return empty array for empty results - не ошибка!
                if (error.type === 'EMPTY_RESULT') {
                    console.log('✅ Empty result (not an error)');
                    return [];
                }
                
                // Throw error for retry
                const err = new Error(error.message || error.result);
                if (error.type === 'RATE_LIMIT') {
                    err.message = 'rate limit exceeded';
                }
                err.code = error.type;
                throw err;
            }
            
            return data.result || [];
        };
        
        // Используем RequestScheduler для выполнения запроса
        try {
            const result = await bscScheduler.schedule(requestFn, {
                cacheKey: cacheKey,
                cacheTTL: params.action === 'balance' ? 45000 : 300000 // 45s для балансов, 5м для транзакций
            });
            
            return result;
        } catch (error) {
            console.error('BSCScan API request failed after retries:', error);
            throw error;
        }
    }

    // Check if user has paid 1 PLEX for authorization
    async checkAuthorization(userAddress) {
        console.log('🔍 Checking authorization for:', userAddress);
        
        try {
            const transactions = await this.getTokenTransactions(
                this.plex.address,
                userAddress,
                this.addresses.system,
                this.getApiKey()
            );

            // Find authorization payment (1 PLEX)
            const authPayment = transactions.find(tx => {
                const amount = this.formatTokenAmount(tx.value, this.plex.decimals);
                return amount >= 1 && amount < 2; // Between 1 and 2 PLEX
            });

            if (authPayment) {
                console.log('✅ Authorization payment found:', authPayment.hash);
                return {
                    authorized: true,
                    transactionHash: authPayment.hash,
                    timestamp: parseInt(authPayment.timeStamp) * 1000,
                    amount: this.formatTokenAmount(authPayment.value, this.plex.decimals)
                };
            }

            console.log('❌ No authorization payment found');
            return { authorized: false };
            
        } catch (error) {
            console.error('Authorization check failed:', error);
            throw error;
        }
    }

    // Check platform access (daily $1 USDT payment)
    async checkPlatformAccess(userAddress) {
        console.log('🔍 Checking platform access for:', userAddress);
        
        try {
            const transactions = await this.getTokenTransactions(
                this.usdt.address,
                userAddress,
                this.addresses.access,
                this.getApiKey()
            );

            // Get today's start timestamp (00:00 UTC)
            const todayStart = new Date();
            todayStart.setUTCHours(0, 0, 0, 0);
            const todayTimestamp = todayStart.getTime() / 1000;

            // Find today's payment ($1 USDT)
            const todayPayment = transactions.find(tx => {
                const txTimestamp = parseInt(tx.timeStamp);
                const amount = this.formatTokenAmount(tx.value, this.usdt.decimals);
                
                return txTimestamp >= todayTimestamp && 
                       amount >= 0.99 && amount <= 1.01; // Allow small tolerance
            });

            if (todayPayment) {
                // Calculate days of access based on payment history
                const accessDays = this.calculateAccessDays(transactions);
                
                console.log('✅ Platform access active, days:', accessDays);
                return {
                    hasAccess: true,
                    lastPayment: {
                        hash: todayPayment.hash,
                        timestamp: parseInt(todayPayment.timeStamp) * 1000,
                        amount: this.formatTokenAmount(todayPayment.value, this.usdt.decimals)
                    },
                    accessDays: accessDays,
                    expiresAt: todayStart.getTime() + 86400000 // +24 hours
                };
            }

            console.log('❌ No platform access payment for today');
            return { 
                hasAccess: false,
                accessDays: 0
            };
            
        } catch (error) {
            console.error('Platform access check failed:', error);
            throw error;
        }
    }

    // Get user's deposits
    async getUserDeposits(userAddress) {
        console.log('🔍 Fetching user deposits for:', userAddress);
        
        try {
            // Check USDT deposits
            const usdtTransactions = await this.getTokenTransactions(
                this.usdt.address,
                userAddress,
                this.addresses.system,
                this.getApiKey()
            );

            // Check PLEX deposits
            const plexTransactions = await this.getTokenTransactions(
                this.plex.address,
                userAddress,
                this.addresses.system,
                this.getApiKey()
            );

            // Combine and process deposits
            const deposits = [];
            
            // Process USDT deposits
            usdtTransactions.forEach(tx => {
                const amount = this.formatTokenAmount(tx.value, this.usdt.decimals);
                const deposit = this.identifyDepositPlan(amount, 'USDT');
                
                if (deposit) {
                    deposits.push({
                        ...deposit,
                        transactionHash: tx.hash,
                        timestamp: parseInt(tx.timeStamp) * 1000,
                        currency: 'USDT',
                        amount: amount,
                        status: 'active'
                    });
                }
            });

            // Process PLEX deposits
            plexTransactions.forEach(tx => {
                const amount = this.formatTokenAmount(tx.value, this.plex.decimals);
                const deposit = this.identifyDepositPlan(amount, 'PLEX');
                
                if (deposit) {
                    deposits.push({
                        ...deposit,
                        transactionHash: tx.hash,
                        timestamp: parseInt(tx.timeStamp) * 1000,
                        currency: 'PLEX',
                        amount: amount,
                        status: 'active'
                    });
                }
            });

            // Sort by timestamp (newest first)
            deposits.sort((a, b) => b.timestamp - a.timestamp);

            console.log(`✅ Found ${deposits.length} deposits`);
            return deposits;
            
        } catch (error) {
            console.error('Failed to fetch deposits:', error);
            throw error;
        }
    }

    // Get token transactions with pagination
    async getTokenTransactions(contractAddress, fromAddress, toAddress, apiKey, page = 1) {
        const params = {
            module: 'account',
            action: 'tokentx',
            contractaddress: contractAddress,
            address: toAddress,
            page: page,
            offset: 100,
            sort: 'desc'
        };

        const transactions = await this.makeRequest(params, apiKey);
        
        // Filter transactions from specific address if provided
        if (fromAddress) {
            return transactions.filter(tx => 
                tx.from.toLowerCase() === fromAddress.toLowerCase()
            );
        }
        
        return transactions;
    }

    // Get native BNB balance
    async getBNBBalance(address) {
        const params = {
            module: 'account',
            action: 'balance',
            address: address,
            tag: 'latest'
        };

        const balance = await this.makeRequest(params, this.getApiKey());
        return this.formatTokenAmount(balance, 18); // BNB has 18 decimals
    }

    // Get token balance
    async getTokenBalance(address, contractAddress, decimals = 18) {
        const params = {
            module: 'account',
            action: 'tokenbalance',
            contractaddress: contractAddress,
            address: address,
            tag: 'latest'
        };

        try {
            const balance = await this.makeRequest(params, this.getApiKey());
            return this.formatTokenAmount(balance, decimals);
        } catch (error) {
            // Special handling for PLEX token in test mode
            if (contractAddress.toLowerCase() === this.plex.address.toLowerCase() && this.plex.testMode) {
                console.log('⚠️ PLEX token API failed, using fallback balance');
                return this.formatTokenAmount(this.plex.fallbackBalance, decimals);
            }
            throw error;
        }
    }

    // Format token amount based on decimals
    formatTokenAmount(value, decimals) {
        if (!value || value === '0') return 0;
        return parseFloat(value) / Math.pow(10, decimals);
    }

    // Calculate total access days from payment history
    calculateAccessDays(transactions) {
        const uniqueDays = new Set();
        
        transactions.forEach(tx => {
            const amount = this.formatTokenAmount(tx.value, this.usdt.decimals);
            if (amount >= 0.99 && amount <= 1.01) {
                const date = new Date(parseInt(tx.timeStamp) * 1000);
                const dayKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
                uniqueDays.add(dayKey);
            }
        });
        
        return uniqueDays.size;
    }

    // Identify deposit plan from amount
    identifyDepositPlan(amount, currency) {
        // Import deposit plans from config
        const config = window.store?.get('config');
        if (!config || !config.depositPlans) return null;
        
        const plans = config.depositPlans;
        
        for (const plan of plans) {
            if (currency === 'USDT') {
                // Check USDT amount with tolerance
                if (Math.abs(amount - plan.usdtAmount) < 0.1) {
                    return plan;
                }
            } else if (currency === 'PLEX') {
                // Check PLEX amount with tolerance
                const plexAmount = plan.plexAmount;
                if (Math.abs(amount - plexAmount) < 10) {
                    return plan;
                }
            }
        }
        
        return null;
    }

    // Monitor transaction for confirmation
    async waitForTransaction(txHash, confirmations = 3) {
        console.log(`⏳ Waiting for transaction ${txHash} to be confirmed...`);
        
        const maxAttempts = 60; // Wait max 5 minutes (5 sec intervals)
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                const params = {
                    module: 'transaction',
                    action: 'gettxreceiptstatus',
                    txhash: txHash
                };
                
                const result = await this.makeRequest(params, this.getApiKey());
                
                if (result.status === '1') {
                    console.log('✅ Transaction confirmed:', txHash);
                    return true;
                }
                
            } catch (error) {
                console.error('Error checking transaction:', error);
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        }
        
        console.log('⏱️ Transaction confirmation timeout');
        return false;
    }
}

// Export as default
export default BSCApi;
