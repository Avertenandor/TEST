import { emit } from '../../app/pubsub.js';
import { CONFIG } from '../../app/config.js';
import { RpcClient, ERC20_TRANSFER_TOPIC, addrTopic, toHex } from '../../app/rpc.js';

export default {
    async mount(root, config) {
        console.log('[AUTH] Монтирование модуля auth');
        
        const response = await fetch('/public/modules/auth/template.html');
        const template = await response.text();
        root.innerHTML = template;
        
        this.initAuth(root);
        
        console.log('[AUTH] Модуль auth успешно смонтирован');
        
        return () => {
            console.log('[AUTH] Размонтирование модуля auth');
            this.cleanup(root);
        };
    },
    
    initAuth(root) {
        const loginForm = root.querySelector('[data-form="login"]');
        const registerForm = root.querySelector('[data-form="register"]');
        const switchToRegister = root.querySelector('[data-action="switch-to-register"]');
        const switchToLogin = root.querySelector('[data-action="switch-to-login"]');
        const forgotPassword = root.querySelector('[data-action="forgot-password"]');
        const connectWallet = root.querySelector('[data-action="connect-wallet"]');
        const googleAuth = root.querySelector('[data-action="google-auth"]');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(loginForm);
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(registerForm);
            });
        }
        
        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm('register');
            });
        }
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm('login');
            });
        }
        
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
        
        if (connectWallet) {
            connectWallet.addEventListener('click', () => {
                this.handleConnectWallet();
            });
        }

        // Кнопка проверки onchain-оплаты, если присутствует
        const checkBtn = root.querySelector('[data-action="check-plex-payment"]');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.checkAuthorizationPayment(root, checkBtn));
        }
        
        if (googleAuth) {
            googleAuth.addEventListener('click', () => {
                this.handleGoogleAuth();
            });
        }
        
        // Слушаем события от других модулей
        this.listenToEvents();
    },
    
    switchForm(type) {
        const loginForm = document.querySelector('[data-auth-form="login"]');
        const registerForm = document.querySelector('[data-auth-form="register"]');
        
        if (type === 'register') {
            loginForm.classList.add('genesis-auth-form-hidden');
            registerForm.classList.remove('genesis-auth-form-hidden');
        } else {
            registerForm.classList.add('genesis-auth-form-hidden');
            loginForm.classList.remove('genesis-auth-form-hidden');
        }
    },
    
    handleLogin(form) {
        const email = form.querySelector('#login-email').value;
        const password = form.querySelector('#login-password').value;
        const remember = form.querySelector('input[type="checkbox"]').checked;
        
        console.log('[AUTH] Попытка входа:', { email, remember });
        
        emit('auth:login', { email, password, remember });
        
        // Показываем уведомление
        emit('notification:show', {
            type: 'info',
            title: 'Вход в систему',
            message: 'Выполняется вход в аккаунт...'
        });
    },
    
    handleRegister(form) {
        const email = form.querySelector('#register-email').value;
        const username = form.querySelector('#register-username').value;
        const password = form.querySelector('#register-password').value;
        const passwordConfirm = form.querySelector('#register-password-confirm').value;
        const terms = form.querySelector('input[type="checkbox"]').checked;
        
        if (password !== passwordConfirm) {
            emit('notification:show', {
                type: 'error',
                title: 'Ошибка',
                message: 'Пароли не совпадают'
            });
            return;
        }
        
        if (!terms) {
            emit('notification:show', {
                type: 'error',
                title: 'Ошибка',
                message: 'Необходимо согласиться с условиями использования'
            });
            return;
        }
        
        console.log('[AUTH] Попытка регистрации:', { email, username });
        
        emit('auth:register', { email, username, password, terms });
        
        emit('notification:show', {
            type: 'info',
            title: 'Регистрация',
            message: 'Создание аккаунта...'
        });
    },
    
    handleForgotPassword() {
        emit('auth:forgot-password', {});
        
        emit('modal:show', {
            title: 'Восстановление пароля',
            content: 'Введите email для восстановления пароля...'
        });
    },
    
    handleConnectWallet() {
        emit('wallet:connect', { source: 'auth' });
        
        emit('notification:show', {
            type: 'info',
            title: 'Подключение кошелька',
            message: 'Запрос на подключение кошелька...'
        });
    },

    async getUserAddress() {
        if (!window.ethereum) throw new Error('Нет провайдера кошелька');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || !accounts.length) throw new Error('Кошелек не подключен');
        return accounts[0];
    },

    async checkAuthorizationPayment(root, btnEl) {
        try {
            if (this._checking) return;
            this._checking = true;
            if (btnEl) { btnEl.disabled = true; btnEl.style.opacity = '.7'; }
            const user = await this.getUserAddress();
            const rpc = new RpcClient(CONFIG.network.rpc);
            const start = await rpc.blockNumber();
            const fromBlock = Math.max(0, start - 20);
            const untilBlock = start + 10; // ждём ещё 10 блоков вперёд

            const amount = BigInt(CONFIG.token.authAmount) * (BigInt(10) ** BigInt(CONFIG.token.decimals));
            const topics = [
                ERC20_TRANSFER_TOPIC,
                addrTopic(user),
                addrTopic(CONFIG.addresses.auth)
            ];

            let match = null;
            let head = start;
            while (head <= untilBlock && !match) {
                const logs = await rpc.getLogs({
                    fromBlock: toHex(fromBlock),
                    toBlock: 'latest',
                    address: CONFIG.addresses.plexToken,
                    topics
                });
                match = logs.find(l => {
                    try { return BigInt(l.data) >= amount; } catch { return false; }
                });
                if (match) break;
                // ждём новый блок
                await new Promise(r => setTimeout(r, 3000));
                head = await rpc.blockNumber();
            }

            if (!match) {
                emit('notification:show', {
                    type: 'warning',
                    title: 'Платеж не найден',
                    message: 'За последние 20 блоков и в течение ожидания ещё 10 блоков перевод не найден.'
                });
                return;
            }

            const tx = match.transactionHash;
            // Сохраняем локально авторизацию
            localStorage.setItem('genesis_user_address', user);
            localStorage.setItem('genesis_platform_access', JSON.stringify({ hasAccess: true, lastAuthTx: tx, lastCheck: Date.now() }));

            // Показываем пользователю
            const out = root.querySelector('[data-auth-tx]');
            if (out) {
                out.innerHTML = `Оплата найдена: <code>${tx}</code>`;
            }

            emit('notification:show', {
                type: 'success',
                title: 'Платеж найден',
                message: 'Доступ к платформе активирован.'
            });

            // Сообщаем системе
            document.dispatchEvent(new CustomEvent('auth:success', { detail: { address: user, tx } }));
        } catch (e) {
            emit('notification:show', {
                type: 'error',
                title: 'Ошибка проверки',
                message: e.message || 'Не удалось проверить платеж'
            });
        } finally {
            this._checking = false;
            if (btnEl) { btnEl.disabled = false; btnEl.style.opacity = ''; }
        }
    },
    
    handleGoogleAuth() {
        emit('auth:google', {});
        
        emit('notification:show', {
            type: 'info',
            title: 'Google авторизация',
            message: 'Перенаправление на Google...'
        });
    },
    
    listenToEvents() {
        // Слушаем события авторизации
        document.addEventListener('auth:success', (e) => {
            emit('notification:show', {
                type: 'success',
                title: 'Успех',
                message: 'Авторизация прошла успешно!'
            });
        });
        
        document.addEventListener('auth:error', (e) => {
            emit('notification:show', {
                type: 'error',
                title: 'Ошибка',
                message: e.detail.message || 'Ошибка авторизации'
            });
        });
    },
    
    cleanup(root) {
        root.innerHTML = '';
    }
};