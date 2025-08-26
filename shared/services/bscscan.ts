// shared/services/bscscan.ts
// Сервис для работы с BSCScan API

import { config } from '../config';
import { loadAxios } from '../../core/library-loader';

export interface BscScanResponse<T = any> {
    status: string;
    message: string;
    result: T;
}

export interface Transaction {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    isError: string;
    txreceipt_status: string;
    input: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    confirmations: string;
}

export interface TokenBalance {
    account: string;
    balance: string;
    symbol: string;
    decimals: string;
}

export interface TokenTransfer {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    from: string;
    contractAddress: string;
    to: string;
    value: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
    transactionIndex: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    cumulativeGasUsed: string;
    input: string;
    confirmations: string;
}

export class BscScanService {
    private apiUrl: string;
    private apiKeys: string[];
    private currentKeyIndex: number;
    private axios: any;
    private rateLimitDelay: number;
    private lastRequestTime: number;

    constructor() {
        this.apiUrl = 'https://api.bscscan.com/api';
        this.apiKeys = config.bscscanKeys;
        this.currentKeyIndex = 0;
        this.rateLimitDelay = 200; // 5 запросов в секунду
        this.lastRequestTime = 0;
    }

    /**
     * Инициализация сервиса
     */
    async init(): Promise<void> {
        try {
            this.axios = await loadAxios();
            console.log('✅ BSCScan service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize BSCScan service:', error);
            throw error;
        }
    }

    /**
     * Получить следующий API ключ с ротацией
     */
    private getNextApiKey(): string {
        const key = this.apiKeys[this.currentKeyIndex];
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
        return key;
    }

    /**
     * Задержка для соблюдения rate limit
     */
    private async rateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.rateLimitDelay) {
            await new Promise(resolve =>
                setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
            );
        }

        this.lastRequestTime = Date.now();
    }

    /**
     * Выполнить запрос к API
     */
    private async makeRequest<T>(params: Record<string, any>): Promise<BscScanResponse<T>> {
        await this.rateLimit();

        const apiKey = this.getNextApiKey();
        const requestParams = {
            ...params,
            apikey: apiKey
        };

        try {
            const response = await this.axios.get(this.apiUrl, {
                params: requestParams,
                timeout: 30000
            });

            if (response.data.status === '0' && response.data.message === 'NOTOK') {
                throw new Error(`BSCScan API error: ${response.data.result}`);
            }

            return response.data;
        } catch (error) {
            console.error('BSCScan API request failed:', error);
            throw error;
        }
    }

    /**
     * Получить баланс токена
     */
    async getTokenBalance(contractAddress: string, address: string): Promise<string> {
        const response = await this.makeRequest<{ balance: string }>({
            module: 'account',
            action: 'tokenbalance',
            contractaddress: contractAddress,
            address: address,
            tag: 'latest'
        });

        return response.result;
    }

    /**
     * Получить балансы всех токенов для адреса
     */
    async getTokenBalances(address: string): Promise<TokenBalance[]> {
        const response = await this.makeRequest<TokenBalance[]>({
            module: 'account',
            action: 'tokenbalance',
            address: address,
            tag: 'latest'
        });

        return response.result;
    }

    /**
     * Получить транзакции адреса
     */
    async getTransactions(address: string, startBlock: number = 0, endBlock: number = 99999999, page: number = 1, offset: number = 10): Promise<Transaction[]> {
        const response = await this.makeRequest<Transaction[]>({
            module: 'account',
            action: 'txlist',
            address: address,
            startblock: startBlock.toString(),
            endblock: endBlock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            sort: 'desc'
        });

        return response.result;
    }

    /**
     * Получить внутренние транзакции адреса
     */
    async getInternalTransactions(address: string, startBlock: number = 0, endBlock: number = 99999999, page: number = 1, offset: number = 10): Promise<Transaction[]> {
        const response = await this.makeRequest<Transaction[]>({
            module: 'account',
            action: 'txlistinternal',
            address: address,
            startblock: startBlock.toString(),
            endblock: endBlock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            sort: 'desc'
        });

        return response.result;
    }

    /**
     * Получить переводы токенов для адреса
     */
    async getTokenTransfers(address: string, contractAddress?: string, startBlock: number = 0, endBlock: number = 99999999, page: number = 1, offset: number = 10): Promise<TokenTransfer[]> {
        const params: Record<string, any> = {
            module: 'account',
            action: 'tokentx',
            address: address,
            startblock: startBlock.toString(),
            endblock: endBlock.toString(),
            page: page.toString(),
            offset: offset.toString(),
            sort: 'desc'
        };

        if (contractAddress) {
            params.contractaddress = contractAddress;
        }

        const response = await this.makeRequest<TokenTransfer[]>(params);
        return response.result;
    }

    /**
     * Получить информацию о транзакции
     */
    async getTransactionReceipt(txhash: string): Promise<any> {
        const response = await this.makeRequest<any>({
            module: 'proxy',
            action: 'eth_getTransactionReceipt',
            txhash: txhash
        });

        return response.result;
    }

    /**
     * Получить информацию о блоке
     */
    async getBlockByNumber(blockNumber: string): Promise<any> {
        const response = await this.makeRequest<any>({
            module: 'proxy',
            action: 'eth_getBlockByNumber',
            tag: blockNumber,
            boolean: 'false'
        });

        return response.result;
    }

    /**
     * Получить последний номер блока
     */
    async getLatestBlockNumber(): Promise<string> {
        const response = await this.makeRequest<string>({
            module: 'proxy',
            action: 'eth_blockNumber'
        });

        return response.result;
    }

    /**
     * Получить цену газа
     */
    async getGasPrice(): Promise<string> {
        const response = await this.makeRequest<string>({
            module: 'proxy',
            action: 'eth_gasPrice'
        });

        return response.result;
    }

    /**
     * Получить информацию о контракте
     */
    async getContractInfo(contractAddress: string): Promise<any> {
        const response = await this.makeRequest<any>({
            module: 'contract',
            action: 'getsourcecode',
            address: contractAddress
        });

        return response.result[0];
    }

    /**
     * Проверить статус транзакции
     */
    async checkTransactionStatus(txhash: string): Promise<boolean> {
        try {
            const receipt = await this.getTransactionReceipt(txhash);
            return receipt && receipt.status === '0x1';
        } catch (error) {
            console.error('Failed to check transaction status:', error);
            return false;
        }
    }

    /**
     * Получить статистику использования API ключей
     */
    getApiKeyStats(): {
        totalKeys: number;
        currentKeyIndex: number;
        currentKey: string;
    } {
        return {
            totalKeys: this.apiKeys.length,
            currentKeyIndex: this.currentKeyIndex,
            currentKey: this.apiKeys[this.currentKeyIndex]
        };
    }

    /**
     * Установить задержку между запросами
     */
    setRateLimitDelay(delay: number): void {
        this.rateLimitDelay = delay;
    }
}

// Создаем глобальный экземпляр сервиса
export const bscScanService = new BscScanService();
