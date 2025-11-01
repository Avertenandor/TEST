import { emit } from '../../app/pubsub.js';

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