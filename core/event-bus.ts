// core/event-bus.ts
// Event Bus для коммуникации между модулями

export interface EventData {
    [key: string]: any;
}

export interface EventHistoryEntry {
    timestamp: number;
    event: string;
    data: EventData;
    source?: string;
}

export type EventHandler = (data: EventData) => void;
export type WildcardHandler = (event: string, data: EventData) => void;
export type AnyHandler = EventHandler | WildcardHandler;

export class EventBus {
    private events: Map<string, Set<EventHandler>>;
    private history: EventHistoryEntry[];
    private maxHistorySize: number;
    private debug: boolean;
    private wildcardHandlers: Set<WildcardHandler>;

    constructor() {
        this.events = new Map();
        this.history = [];
        this.maxHistorySize = 100;
        this.debug = false;
        this.wildcardHandlers = new Set();
    }

    /**
     * Подписаться на событие
     */
    on(event: '*', handler: WildcardHandler): () => void;
    on(event: string, handler: EventHandler): () => void;
    on(event: string, handler: AnyHandler): () => void {
        if (typeof handler !== 'function') {
            throw new Error('Event handler must be a function');
        }

        // Обработка wildcard подписок
        if (event === '*') {
            this.wildcardHandlers.add(handler as unknown as WildcardHandler);

            if (this.debug) {
                console.log(`[EventBus] Wildcard handler registered`);
            }

            return () => this.wildcardHandlers.delete(handler as unknown as WildcardHandler);
        }

        // Обычная подписка на событие
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }

        this.events.get(event)!.add(handler as EventHandler);

        if (this.debug) {
            console.log(`[EventBus] Handler registered for: ${event}`);
        }

        // Возвращаем функцию отписки
        return () => this.off(event, handler as EventHandler);
    }

    /**
     * Подписаться на событие один раз
     */
    once(event: string, handler: EventHandler): () => void {
        const wrappedHandler: EventHandler = (data) => {
            handler(data);
            this.off(event, wrappedHandler);
        };

        return this.on(event, wrappedHandler);
    }

    /**
     * Отписаться от события
     */
    off(event: string, handler: EventHandler | WildcardHandler): void {
        if (event === '*') {
            this.wildcardHandlers.delete(handler as unknown as WildcardHandler);
            return;
        }

        if (this.events.has(event)) {
            this.events.get(event)!.delete(handler as EventHandler);

            // Очищаем пустые наборы событий
            if (this.events.get(event)!.size === 0) {
                this.events.delete(event);
            }

            if (this.debug) {
                console.log(`[EventBus] Handler unregistered for: ${event}`);
            }
        }
    }

    /**
     * Отправить событие
     */
    emit(event: string, data: EventData = {}, source?: string): void {
        if (this.debug) {
            console.log(`[EventBus] Emit: ${event}`, data);
        }

        // Добавляем в историю
        this.addToHistory(event, data, source);

        // Уведомляем wildcard обработчики
        this.wildcardHandlers.forEach(handler => {
            try {
                handler(event, data);
            } catch (error) {
                console.error(`Error in wildcard handler for event ${event}:`, error);
            }
        });

        // Уведомляем обработчики конкретного события
        if (this.events.has(event)) {
            this.events.get(event)!.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in handler for event ${event}:`, error);
                }
            });
        }
    }

    /**
     * Отправить событие асинхронно
     */
    async emitAsync(event: string, data: EventData = {}, source?: string): Promise<void> {
        if (this.debug) {
            console.log(`[EventBus] Emit async: ${event}`, data);
        }

        // Добавляем в историю
        this.addToHistory(event, data, source);

        // Уведомляем wildcard обработчики
        const wildcardPromises = Array.from(this.wildcardHandlers).map(async handler => {
            try {
                await handler(event, data);
            } catch (error) {
                console.error(`Error in wildcard handler for event ${event}:`, error);
            }
        });

        // Уведомляем обработчики конкретного события
        const eventPromises: Promise<void>[] = [];
        if (this.events.has(event)) {
            this.events.get(event)!.forEach(handler => {
                const promise = (async () => {
                    try {
                        await handler(data);
                    } catch (error) {
                        console.error(`Error in handler for event ${event}:`, error);
                    }
                })();
                eventPromises.push(promise);
            });
        }

        // Ждем завершения всех обработчиков
        await Promise.all([...wildcardPromises, ...eventPromises]);
    }

    /**
     * Добавить запись в историю
     */
    private addToHistory(event: string, data: EventData, source?: string): void {
        const entry: EventHistoryEntry = {
            timestamp: Date.now(),
            event,
            data,
            source
        };

        this.history.push(entry);

        // Ограничиваем размер истории
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
        }
    }

    /**
     * Получить историю событий
     */
    getHistory(): EventHistoryEntry[] {
        return [...this.history];
    }

    /**
     * Получить историю событий по фильтру
     */
    getHistoryByEvent(event: string): EventHistoryEntry[] {
        return this.history.filter(entry => entry.event === event);
    }

    /**
     * Получить историю событий по времени
     */
    getHistoryByTimeRange(startTime: number, endTime: number): EventHistoryEntry[] {
        return this.history.filter(entry =>
            entry.timestamp >= startTime && entry.timestamp <= endTime
        );
    }

    /**
     * Очистить историю
     */
    clearHistory(): void {
        this.history = [];
    }

    /**
     * Получить список всех событий
     */
    getEvents(): string[] {
        return Array.from(this.events.keys());
    }

    /**
     * Получить количество обработчиков для события
     */
    getHandlerCount(event: string): number {
        if (event === '*') {
            return this.wildcardHandlers.size;
        }

        return this.events.has(event) ? this.events.get(event)!.size : 0;
    }

    /**
     * Проверить, есть ли обработчики для события
     */
    hasHandlers(event: string): boolean {
        if (event === '*') {
            return this.wildcardHandlers.size > 0;
        }

        return this.events.has(event) && this.events.get(event)!.size > 0;
    }

    /**
     * Удалить все обработчики для события (или все обработчики, если event не указан)
     */
    removeAllHandlers(event?: string): void {
        if (event) {
            if (event === '*') {
                this.wildcardHandlers.clear();
            } else {
                this.events.delete(event);
            }

            if (this.debug) {
                console.log(`[EventBus] All handlers removed for: ${event}`);
            }
        } else {
            this.events.clear();
            this.wildcardHandlers.clear();

            if (this.debug) {
                console.log(`[EventBus] All handlers removed`);
            }
        }
    }

    /**
     * Включить/выключить отладку
     */
    setDebug(enabled: boolean): void {
        this.debug = enabled;
    }

    /**
     * Получить статистику
     */
    getStats(): {
        totalEvents: number;
        totalHandlers: number;
        historySize: number;
        wildcardHandlers: number;
    } {
        let totalHandlers = 0;
        this.events.forEach(handlers => {
            totalHandlers += handlers.size;
        });

        return {
            totalEvents: this.events.size,
            totalHandlers,
            historySize: this.history.length,
            wildcardHandlers: this.wildcardHandlers.size
        };
    }

    /**
     * Создать подписку с автоматической отпиской при размонтировании
     */
    subscribeWithCleanup(event: string, handler: EventHandler, cleanupCallback: () => void): () => void {
        const unsubscribe = this.on(event, handler);

        return () => {
            unsubscribe();
            cleanupCallback();
        };
    }

    /**
     * Подписаться на несколько событий одновременно
     */
    onMultiple(events: string[], handler: EventHandler): () => void {
        const unsubscribes = events.map(event => this.on(event, handler));

        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    }

    /**
     * Отправить событие с задержкой
     */
    emitDelayed(event: string, data: EventData, delay: number, source?: string): void {
        setTimeout(() => {
            this.emit(event, data, source);
        }, delay);
    }

    /**
     * Отправить событие с повторением
     */
    emitRepeating(event: string, data: EventData, interval: number, source?: string): () => void {
        const intervalId = setInterval(() => {
            this.emit(event, data, source);
        }, interval);

        return () => clearInterval(intervalId);
    }
}

// Создаем глобальный экземпляр event bus
export const eventBus = new EventBus();
