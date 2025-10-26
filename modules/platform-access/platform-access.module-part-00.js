// modules/platform-access/platform-access.module.js
// Модуль доступа к платформе GENESIS - ежедневная оплата $1 USDT

import PlatformAccessAPI from './platform-access.api.js';
import PlatformAccessState from './platform-access.state.js';
import QRGenerator from '../../shared/services/qr-generator.js';

export default class PlatformAccessModule {
    constructor() {
        this.name = 'platform-access';
        this.version = '1.0.0';
        this.dependencies = ['auth'];
        
        this.state = null;
        this.api = null;
        this.container = null;
        this.context = null;
        this.subscriptions = [];
        this.checkInterval = null;
    }
    
    async init(context) {
        console.log('💎 Initializing Platform Access Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // 1. Инициализация состояния
            this.state = new PlatformAccessState();
            this.state.load();
            
            // 2. Инициализация API
            const config = context.config || window.store.get('config');
            this.api = new PlatformAccessAPI(config);
            
            // 3. Загрузка шаблона
            await this.loadTemplate();
            
            // 4. Загрузка стилей
            await this.loadStyles();
            
            // 5. Инициализация обработчиков событий
            this.initEventHandlers();
            
            // 6. Подписка на глобальные события
            this.subscribeToEvents();
            
            // 7. Проверка текущего доступа
            await this.checkCurrentAccess();
            
            // 8. Запуск периодической проверки
            this.startAccessMonitoring();
            
            console.log('✅ Platform Access Module initialized successfully');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Platform Access Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        try {
            const response = await fetch('/modules/platform-access/platform-access.template.html');
            if (response.ok) {
                const html = await response.text();
                if (this.container) {
                    this.container.innerHTML = html;
                }
            } else {
                throw new Error('Failed to load template');
            }
        } catch (error) {
            console.error('Failed to load platform-access template:', error);
            // Используем fallback шаблон
            if (this.container) {
                this.container.innerHTML = this.getFallbackTemplate();
            }
        }
    }
    
    async loadStyles() {
        // Проверяем, не загружены ли уже стили
        const existingLink = document.querySelector(`link[data-module="${this.name}"]`);
        if (existingLink) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/platform-access/platform-access.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    initEventHandlers() {
        // Кнопка оплаты доступа
        const payButton = this.container?.querySelector('#pay-access-button');
        if (payButton) {
            payButton.addEventListener('click', this.handlePayAccess.bind(this));
        }
        
        // Выбор количества дней
        const daysSelector = this.container?.querySelector('#access-days-selector');
        if (daysSelector) {
            daysSelector.addEventListener('change', this.updatePaymentAmount.bind(this));
        }
        
        // Кнопка копирования адреса для оплаты
        const copyBtn = this.container?.querySelector('.copy-payment-address');
        if (copyBtn) {
            copyBtn.addEventListener('click', this.copyPaymentAddress.bind(this));
        }
        
        // Проверка транзакции
        const checkTxBtn = this.container?.querySelector('#check-transaction-button');
        if (checkTxBtn) {
            checkTxBtn.addEventListener('click', this.checkTransaction.bind(this));
        }
    }
    
    async checkCurrentAccess() {
        const userAddress = this.context.store?.get('user.address');
        
        if (!userAddress) {
            console.log('❌ No user address found');
            this.updateAccessStatus(false, 0);
            return;
        }
        
        try {
            // Проверяем доступ через BSC API
            const accessInfo = await this.api.checkPlatformAccess(userAddress);
            
            if (accessInfo.hasAccess) {
                const daysRemaining = this.calculateDaysRemaining(accessInfo.lastPayment);
                this.updateAccessStatus(true, daysRemaining);
                
                // Обновляем глобальное состояние
                if (this.context.store) {
                    this.context.store.set('user.platformAccess', true);
                    this.context.store.set('user.accessDays', daysRemaining);
                }
                
                // Сохраняем в локальное состояние
                this.state.setAccess(true, daysRemaining, accessInfo.lastPayment);
                
            } else {
                this.updateAccessStatus(false, 0);
                
                if (this.context.store) {
                    this.context.store.set('user.platformAccess', false);
                    this.context.store.set('user.accessDays', 0);
                }
                
                this.state.setAccess(false, 0, null);
            }
            
        } catch (error) {
            console.error('Error checking platform access:', error);
            this.updateAccessStatus(false, 0);
        }
    }
    
    calculateDaysRemaining(lastPaymentDate) {
        if (!lastPaymentDate) return 0;
        
        const lastPayment = new Date(lastPaymentDate);
        const now = new Date();
        const diffTime = Math.abs(now - lastPayment);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Каждая оплата дает 1 день доступа
        const remainingDays = Math.max(0, 1 - diffDays);
        return remainingDays;
    }
    
    updateAccessStatus(hasAccess, daysRemaining) {
        if (!this.container) return;
        
        const statusEl = this.container.querySelector('.access-status');
        const daysEl = this.container.querySelector('.access-days');
        const paymentSection = this.container.querySelector('.payment-section');
        const activeSection = this.container.querySelector('.active-access-section');
        
        if (hasAccess && daysRemaining > 0) {
            // Есть активный доступ
            if (statusEl) {
                statusEl.innerHTML = `<span class="status-active">✅ Доступ активен</span>`;
            }
            if (daysEl) {
                daysEl.innerHTML = `<span class="days-count">${daysRemaining}</span> ${this.getDaysWord(daysRemaining)} осталось`;
            }
            if (paymentSection) {
                paymentSection.style.display = 'none';
            }
            if (activeSection) {
                activeSection.style.display = 'block';
            }
            
            // Показываем кнопку продления если осталось мало дней
            if (daysRemaining <= 3) {
                this.showRenewalReminder(daysRemaining);
            }
            
        } else {
            // Нет доступа или истек
            if (statusEl) {
                statusEl.innerHTML = `<span class="status-inactive">❌ Доступ неактивен</span>`;
            }
            if (daysEl) {
                daysEl.innerHTML = `<span class="days-expired">Необходима оплата</span>`;
            }
            if (paymentSection) {
                paymentSection.style.display = 'block';
            }
            if (activeSection) {
                activeSection.style.display = 'none';
            }
            
            // Показываем предупреждение
            this.showAccessRequired();
        }
    }
    
    getDaysWord(days) {
        if (days === 1) return 'день';
        if (days >= 2 && days <= 4) return 'дня';
        return 'дней';
    }
    
    showRenewalReminder(daysRemaining) {
        const reminderEl = this.container?.querySelector('.renewal-reminder');
        if (reminderEl) {
            reminderEl.style.display = 'block';
            reminderEl.innerHTML = `
                <div class="reminder-content">
                    <p>⚠️ Внимание! У вас осталось ${daysRemaining} ${this.getDaysWord(daysRemaining)} доступа.</p>
                    <button class="btn btn-warning" onclick="this.showPaymentSection()">
                        Продлить доступ
                    </button>
                </div>
            `;
        }
    }
    
    showAccessRequired() {
        const warningEl = this.container?.querySelector('.access-warning');
        if (warningEl) {
            warningEl.style.display = 'block';
            warningEl.innerHTML = `
                <div class="warning-content">
                    <h3>⚠️ Требуется оплата доступа</h3>
                    <p>Для использования платформы необходимо оплатить ежедневный доступ ($1 USDT в день).</p>
                    <p>Оплата дает доступ ко всем функциям платформы на 24 часа.</p>
                </div>
            `;
        }
    }
    
    async handlePayAccess() {
        const daysSelector = this.container?.querySelector('#access-days-selector');
        const days = daysSelector ? parseInt(daysSelector.value) : 1;
        const amount = days; // $1 за день
        
        // Показываем инструкцию по оплате
        this.showPaymentInstructions(amount);
        
        // Генерируем QR код для оплаты с реальным генератором
        await this.generatePaymentQR(amount);
        
        // Начинаем мониторинг транзакции
        this.startTransactionMonitoring();
    }
    
    showPaymentInstructions(amount) {
        const instructionsEl = this.container?.querySelector('.payment-instructions');
        if (instructionsEl) {
            const config = this.context.config || window.store.get('config');
            const systemAddress = config.systemAddress || '0x...';
            
            instructionsEl.style.display = 'block';
            instructionsEl.innerHTML = `
                <div class="instructions-content">
                    <h4>📋 Инструкция по оплате:</h4>
                    <ol>
                        <li>Отправьте <strong>${amount} USDT</strong> на адрес системы</li>
                        <li>Адрес для оплаты: <code>${systemAddress}</code></li>
                        <li>Дождитесь подтверждения транзакции (1-2 минуты)</li>
                        <li>Доступ будет активирован автоматически</li>
                    </ol>
                    
                    <div class="payment-qr" id="payment-qr-code"></div>
                    
                    <div class="transaction-input">
                        <label>Hash транзакции (необязательно):</label>
                        <input type="text" id="tx-hash-input" placeholder="0x..." />
                        <button id="check-transaction-button" class="btn btn-secondary">
                            Проверить транзакцию
                        </button>
                    </div>
                </div>
            `;
            
            // Переинициализируем обработчики для новых элементов
            this.initEventHandlers();
        }
    }
    
    async generatePaymentQR(amount) {
        const qrContainer = this.container?.querySelector('#payment-qr-code');
        if (!qrContainer) return;
        
        const config = this.context.config || window.store.get('config');
        const accessAddress = config.addresses?.access || config.systemAddress || '0x28915a33562b58500cf8b5b682C89A3396B8Af76';
        
        try {
            // Показываем загрузку
            qrContainer.innerHTML = '<div class="qr-loading">Генерация QR кода...</div>';
            
            // Генерируем QR для оплаты доступа к платформе
            await QRGenerator.generatePaymentQR(qrContainer, accessAddress, amount, 'USDT');
            
            console.log('✅ QR код для оплаты доступа сгенерирован');
            
            // Добавляем дополнительную информацию
            const qrInfo = qrContainer.querySelector('.qr-payment-info');
            if (qrInfo) {
                const additionalInfo = document.createElement('div');
                additionalInfo.className = 'platform-access-info';
                additionalInfo.innerHTML = `
                    <div class="access-period">
                        <strong>Период доступа:</strong> ${amount} ${amount === 1 ? 'день' : amount <= 4 ? 'дня' : 'дней'}
                    </div>
                    <div class="access-note">
                        💡 После оплаты доступ активируется автоматически
                    </div>
                `;
                qrInfo.appendChild(additionalInfo);
            }
            
        } catch (error) {
            console.error('Ошибка генерации QR кода:', error);
            // QRGenerator уже показывает fallback, но добавим дополнительную информацию
            const fallback = qrContainer.querySelector('.qr-fallback');
            if (fallback) {
                fallback.innerHTML += `
                    <div class="access-fallback-info">
                        <p>Оплата за ${amount} ${amount === 1 ? 'день' : amount <= 4 ? 'дня' : 'дней'} доступа</p>
                    </div>
                `;
            }
        }
    }
    
    async checkTransaction() {
        const txInput = this.container?.querySelector('#tx-hash-input');
        if (!txInput) return;
        
        const txHash = txInput.value.trim();
        if (!txHash) {
            this.showError('Введите hash транзакции');
            return;
        }
        
        try {
            // Проверяем транзакцию через API
            const isValid = await this.api.verifyPaymentTransaction(txHash);
            
            if (isValid) {
                this.showSuccess('Оплата подтверждена! Доступ активирован.');
                await this.checkCurrentAccess();
            } else {
                this.showError('Транзакция не найдена или недействительна');
            }
        } catch (error) {
            console.error('Error checking transaction:', error);
            this.showError('Ошибка проверки транзакции');
        }
    }
    
    startTransactionMonitoring() {
        // Начинаем автоматическую проверку новых транзакций
        const userAddress = this.context.store?.get('user.address');
        if (!userAddress) return;
        
        let checkCount = 0;
        const maxChecks = 60; // Проверяем 10 минут
        
        const checkInterval = setInterval(async () => {
            checkCount++;
            
            try {
                const accessInfo = await this.api.checkPlatformAccess(userAddress);
                
                if (accessInfo.hasAccess) {
                    clearInterval(checkInterval);
                    this.showSuccess('Оплата получена! Доступ активирован.');
                    await this.checkCurrentAccess();
                }
                
                if (checkCount >= maxChecks) {
                    clearInterval(checkInterval);
                    console.log('Transaction monitoring timeout');
                }
            } catch (error) {
                console.error('Error monitoring transaction:', error);
            }
        }, 10000); // Проверяем каждые 10 секунд
    }
    
    startAccessMonitoring() {
        // Периодическая проверка состояния доступа
        this.checkInterval = setInterval(() => {
            this.checkCurrentAccess();
        }, 60000); // Проверяем каждую минуту
    }
    
    updatePaymentAmount() {
        const daysSelector = this.container?.querySelector('#access-days-selector');
        const amountEl = this.container?.querySelector('.payment-amount');
        
        if (daysSelector && amountEl) {
            const days = parseInt(daysSelector.value);
            const amount = days; // $1 за день
            amountEl.textContent = `${amount} USDT`;
        }
    }
    
    copyPaymentAddress() {
        const config = this.context.config || window.store.get('config');
        const systemAddress = config.systemAddress || '0x...';
        
        navigator.clipboard.writeText(systemAddress).then(() => {
            this.showSuccess('Адрес скопирован!');
        }).catch(() => {
            this.showError('Не удалось скопировать адрес');
        });
    }
    
    subscribeToEvents() {
        if (this.context.eventBus) {
            // Подписка на события авторизации
            this.subscriptions.push(
                this.context.eventBus.on('user:authenticated', async () => {
                    await this.checkCurrentAccess();
                })
            );
            
