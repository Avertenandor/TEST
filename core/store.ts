// core/store.ts
// Глобальное хранилище состояния для GENESIS

export interface StoreState {
    user?: any;
    auth?: any;
    deposits?: any;
    portfolio?: any;
    transactions?: any;
    analytics?: any;
    settings?: any;
    [key: string]: any;
}

export interface StoreHistoryEntry {
    timestamp: number;
    action: 'set' | 'delete' | 'update';
    path: string;
    newValue?: any;
    oldValue?: any;
}

export interface StoreSubscriber {
    (path: string, newValue: any, oldValue: any): void;
}

export class Store {
    private state: StoreState;
    private subscribers: Map<string, Set<StoreSubscriber>>;
    private history: StoreHistoryEntry[];
    private maxHistorySize: number;
    private debug: boolean;

    constructor(initialState: StoreState = {}) {
        this.state = this.deepClone(initialState);
        this.subscribers = new Map();
        this.history = [];
        this.maxHistorySize = 50;
        this.debug = false;
    }

    /**
     * Получить значение из store по пути
     */
    get<T = any>(path?: string, defaultValue?: T): T {
        if (!path) return this.state as T;

        const keys = path.split('.');
        let value: any = this.state;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue as T;
            }
        }

        return value as T;
    }

    /**
     * Установить значение в store по пути
     */
    set<T = any>(path: string, value: T): void {
        const keys = path.split('.');
        const lastKey = keys.pop()!;

        // Навигация к родительскому объекту, создание пути при необходимости
        let target: any = this.state;
        for (const key of keys) {
            if (!(key in target) || typeof target[key] !== 'object') {
                target[key] = {};
            }
            target = target[key];
        }

        // Сохраняем старое значение для истории
        const oldValue = target[lastKey];

        // Устанавливаем новое значение
        target[lastKey] = value;

        // Добавляем в историю
        this.addToHistory('set', path, value, oldValue);

        // Уведомляем подписчиков
        this.notify(path, value, oldValue);

        if (this.debug) {
            console.log(`[Store] Set ${path}:`, value);
        }
    }

    /**
     * Обновить несколько значений одновременно
     */
    update(updates: Record<string, any>): void {
        Object.entries(updates).forEach(([path, value]) => {
            this.set(path, value);
        });
    }

    /**
     * Удалить значение из store
     */
    delete(path: string): void {
        const keys = path.split('.');
        const lastKey = keys.pop()!;

        let target: any = this.state;
        for (const key of keys) {
            if (!(key in target)) return;
            target = target[key];
        }

        const oldValue = target[lastKey];
        delete target[lastKey];

        // Добавляем в историю
        this.addToHistory('delete', path, undefined, oldValue);

        // Уведомляем подписчиков
        this.notify(path, undefined, oldValue);

        if (this.debug) {
            console.log(`[Store] Delete ${path}`);
        }
    }

    /**
     * Подписаться на изменения
     */
    subscribe(path: string, callback: StoreSubscriber): () => void {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }

        this.subscribers.get(path)!.add(callback);

        // Возвращаем функцию отписки
        return () => {
            const pathSubscribers = this.subscribers.get(path);
            if (pathSubscribers) {
                pathSubscribers.delete(callback);
                if (pathSubscribers.size === 0) {
                    this.subscribers.delete(path);
                }
            }
        };
    }

    /**
     * Отписаться от изменений
     */
    unsubscribe(path: string, callback: StoreSubscriber): void {
        const pathSubscribers = this.subscribers.get(path);
        if (pathSubscribers) {
            pathSubscribers.delete(callback);
            if (pathSubscribers.size === 0) {
                this.subscribers.delete(path);
            }
        }
    }

    /**
     * Уведомить подписчиков об изменении
     */
    private notify(path: string, newValue: any, oldValue: any): void {
        // Уведомляем подписчиков конкретного пути
        const pathSubscribers = this.subscribers.get(path);
        if (pathSubscribers) {
            pathSubscribers.forEach(callback => {
                try {
                    callback(path, newValue, oldValue);
                } catch (error) {
                    console.error(`Error in store subscriber for ${path}:`, error);
                }
            });
        }

        // Уведомляем подписчиков родительских путей
        const pathParts = path.split('.');
        while (pathParts.length > 1) {
            pathParts.pop();
            const parentPath = pathParts.join('.');
            const parentSubscribers = this.subscribers.get(parentPath);
            if (parentSubscribers) {
                parentSubscribers.forEach(callback => {
                    try {
                        callback(path, newValue, oldValue);
                    } catch (error) {
                        console.error(`Error in store subscriber for ${parentPath}:`, error);
                    }
                });
            }
        }
    }

    /**
     * Добавить запись в историю
     */
    private addToHistory(action: 'set' | 'delete' | 'update', path: string, newValue?: any, oldValue?: any): void {
        const entry: StoreHistoryEntry = {
            timestamp: Date.now(),
            action,
            path,
            newValue,
            oldValue
        };

        this.history.push(entry);

        // Ограничиваем размер истории
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
        }
    }

    /**
     * Получить историю изменений
     */
    getHistory(): StoreHistoryEntry[] {
        return [...this.history];
    }

    /**
     * Очистить историю
     */
    clearHistory(): void {
        this.history = [];
    }

    /**
     * Получить полное состояние
     */
    getState(): StoreState {
        return this.deepClone(this.state);
    }

    /**
     * Установить полное состояние
     */
    setState(newState: StoreState): void {
        const oldState = this.state;
        this.state = this.deepClone(newState);

        // Уведомляем всех подписчиков
        this.subscribers.forEach((subscribers, path) => {
            const oldValue = this.getNestedValue(oldState, path);
            const newValue = this.getNestedValue(this.state, path);

            if (oldValue !== newValue) {
                subscribers.forEach(callback => {
                    try {
                        callback(path, newValue, oldValue);
                    } catch (error) {
                        console.error(`Error in store subscriber for ${path}:`, error);
                    }
                });
            }
        });
    }

    /**
     * Глубокое клонирование объекта
     */
    private deepClone<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime()) as T;
        }

        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item)) as T;
        }

        if (typeof obj === 'object') {
            const cloned: any = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }

        return obj;
    }

    /**
     * Получить вложенное значение по пути
     */
    private getNestedValue(obj: any, path: string): any {
        const keys = path.split('.');
        let value = obj;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }

        return value;
    }

    /**
     * Включить/выключить отладку
     */
    setDebug(enabled: boolean): void {
        this.debug = enabled;
    }

    /**
     * Сбросить store к начальному состоянию
     */
    reset(): void {
        this.state = {};
        this.history = [];
        this.subscribers.clear();
    }

    /**
     * Получить статистику store
     */
    getStats(): {
        subscribersCount: number;
        historySize: number;
        stateSize: number;
    } {
        let totalSubscribers = 0;
        this.subscribers.forEach(subscribers => {
            totalSubscribers += subscribers.size;
        });

        return {
            subscribersCount: totalSubscribers,
            historySize: this.history.length,
            stateSize: Object.keys(this.state).length
        };
    }
}

// Создаем глобальный экземпляр store
export const store = new Store();
