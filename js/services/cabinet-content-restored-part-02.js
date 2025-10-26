                                        <span style="font-size: 2.5rem;">${r.icon}</span>
                                        <div>
                                            <h4 style="color: ${r.color}; margin-bottom: 0.3rem;">
                                                Ранг ${r.rank}: ${r.name}
                                                ${isCurrent ? ' <span style="background: var(--primary-color); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; margin-left: 0.5rem;">ТЕКУЩИЙ</span>' : ''}
                                            </h4>
                                            <div style="display: grid; gap: 0.3rem; margin-top: 0.5rem;">
                                                <div style="color: var(--text-secondary); font-size: 0.85rem;">
                                                    📊 Оборот: <span style="color: var(--text-primary); font-weight: 600;">$${r.turnover.toLocaleString()}</span>
                                                </div>
                                                <div style="color: var(--text-secondary); font-size: 0.85rem;">
                                                    👥 Партнеров: <span style="color: var(--text-primary); font-weight: 600;">${r.partners}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style="text-align: right;">
                                        <div style="color: var(--text-secondary); font-size: 0.8rem;">Реф. бонус</div>
                                        <div style="color: var(--success-color); font-size: 1.2rem; font-weight: 700;">${r.bonus}</div>
                                        <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">Лимит</div>
                                        <div style="color: var(--warning-color); font-size: 0.9rem; font-weight: 600;">${r.limit}</div>
                                    </div>
                                </div>
                                
                                ${r.rank > 5 ? `
                                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                                        <div style="color: var(--gold-color); font-size: 0.85rem; font-weight: 600;">🎁 Специальные привилегии:</div>
                                        <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.3rem;">
                                            ${r.rank === 6 ? 'Персональный менеджер, приоритетные выплаты' : ''}
                                            ${r.rank === 7 ? 'VIP поддержка 24/7, эксклюзивные предложения' : ''}
                                            ${r.rank === 8 ? 'Участие в управлении платформой, спецпроекты' : ''}
                                            ${r.rank === 9 ? 'Доля от прибыли платформы, закрытые мероприятия' : ''}
                                            ${r.rank === 10 ? 'Пожизненный пассивный доход, статус совладельца' : ''}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET:HOW_IT_WORKS_CONTENT - Генерация контента страницы "Как это работает"
    getHowItWorksContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">❓ Как работает GENESIS</h2>
                <p class="page-subtitle">Подробное руководство по использованию платформы</p>
            </div>
            
            <!-- БЫСТРЫЙ СТАРТ -->
            <div class="stats-card" style="margin-bottom: 2rem; background: linear-gradient(135deg, var(--bg-secondary), rgba(255, 107, 53, 0.1));">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">🚀 Быстрый старт за 3 шага</h3>
                
                <div style="display: grid; gap: 1rem;">
                    <div style="display: flex; gap: 1.5rem; align-items: start;">
                        <div style="background: var(--primary-color); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">
                            1
                        </div>
                        <div>
                            <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Пополните доступ к платформе</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                Оплатите $1 USDT для получения доступа к функционалу платформы на 24 часа
                            </p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1.5rem; align-items: start;">
                        <div style="background: var(--primary-color); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">
                            2
                        </div>
                        <div>
                            <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Выберите депозитный план</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                Начните с плана STARTER за $25 и постепенно открывайте доступ к более выгодным планам
                            </p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1.5rem; align-items: start;">
                        <div style="background: var(--primary-color); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">
                            3
                        </div>
                        <div>
                            <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Получайте ежедневный доход</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                Выплаты начисляются каждый день автоматически на ваш BSC кошелек
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ПРИНЦИП РАБОТЫ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">⚙️ Принцип работы платформы</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <span style="font-size: 3rem;">🏦</span>
                        </div>
                        <h4 style="color: var(--text-primary); text-align: center; margin-bottom: 0.8rem;">Инвестиционный пул</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; text-align: center;">
                            Средства участников объединяются в единый пул для максимальной эффективности
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <span style="font-size: 3rem;">🤖</span>
                        </div>
                        <h4 style="color: var(--text-primary); text-align: center; margin-bottom: 0.8rem;">MEV-боты и арбитраж</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; text-align: center;">
                            Автоматические системы извлекают прибыль из неэффективностей рынка 24/7
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <span style="font-size: 3rem;">💸</span>
                        </div>
                        <h4 style="color: var(--text-primary); text-align: center; margin-bottom: 0.8rem;">Распределение прибыли</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; text-align: center;">
                            Ежедневные выплаты пропорционально вашим активным депозитам
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- ДЕПОЗИТНАЯ СИСТЕМА -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--warning-color); margin-bottom: 1.5rem;">💰 Депозитная система</h3>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                    <h4 style="color: var(--text-primary); margin-bottom: 1rem;">Последовательное открытие планов</h4>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
                        Система построена на принципе постепенного роста. Вы начинаете с минимального депозита и открываете доступ к более выгодным планам по мере развития.
                    </p>
                    
                    <div style="display: flex; align-items: center; gap: 1rem; overflow-x: auto; padding: 1rem 0;">
                        ${[1, 2, 3, 4, 5].map((n, i) => `
                            <div style="text-align: center; flex-shrink: 0;">
                                <div style="width: 60px; height: 60px; background: ${i === 0 ? 'var(--success-color)' : 'var(--bg-secondary)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem; font-weight: 700; color: ${i === 0 ? 'white' : 'var(--text-secondary)'};">
                                    ${n}
                                </div>
                                <div style="color: var(--text-secondary); font-size: 0.8rem;">План ${n}</div>
                            </div>
                            ${i < 4 ? '<div style="color: var(--text-secondary);">→</div>' : ''}
                        `).join('')}
                        <div style="color: var(--text-secondary); font-size: 1.5rem;">...</div>
                        <div style="text-align: center; flex-shrink: 0;">
                            <div style="width: 60px; height: 60px; background: var(--gold-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem; font-weight: 700; color: var(--bg-primary);">
                                13
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">План 13</div>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px;">
                        <h5 style="color: var(--primary-color); margin-bottom: 0.5rem;">📈 Рост доходности</h5>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">
                            Чем выше план, тем больше процент ежедневной прибыли: от 0.3% до 0.9%
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px;">
                        <h5 style="color: var(--success-color); margin-bottom: 0.5rem;">⏱️ Срок работы</h5>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">
                            Каждый депозит работает определенный срок: от 20 до 100 дней
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px;">
                        <h5 style="color: var(--warning-color); margin-bottom: 0.5rem;">💎 Валюта оплаты</h5>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">
                            Планы 1-10: только USDT<br>Планы 11-13: USDT или PLEX
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- БОНУСНАЯ СИСТЕМА -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--success-color); margin-bottom: 1.5rem;">🎁 Бонусы и множители</h3>
                
                <div style="display: grid; gap: 1rem;">
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.8rem;">⚡ Множители доходности</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            Активируйте временные множители от x2 до x10 для увеличения ежедневной прибыли. Множители можно купить за PLEX или получить в качестве бонуса.
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.8rem;">👥 Реферальные бонусы</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            Приглашайте партнеров и получайте от 5% до 50% от их депозитов в зависимости от вашего ранга. Дополнительные награды за активных партнеров.
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.8rem;">🏆 Достижения и награды</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            Выполняйте задания, повышайте ранг, увеличивайте стаж и получайте монеты GENESIS, которые можно обменять на ценные бонусы.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- FAQ -->
            <div class="stats-card">
                <h3 style="color: var(--accent-color); margin-bottom: 1.5rem;">❓ Часто задаваемые вопросы</h3>
                
                <div style="display: grid; gap: 1rem;">
                    ${[
                        {
                            q: 'Как начать зарабатывать?',
                            a: 'Пройдите авторизацию за 1 PLEX, пополните доступ к платформе за $1 USDT, затем создайте первый депозит от $25.'
                        },
                        {
                            q: 'Когда начисляются выплаты?',
                            a: 'Выплаты начисляются ежедневно в 00:00 UTC автоматически на ваш BSC кошелек.'
                        },
                        {
                            q: 'Можно ли вывести депозит досрочно?',
                            a: 'Нет, депозиты работают фиксированный срок. После окончания срока тело депозита возвращается автоматически.'
                        },
                        {
                            q: 'Сколько депозитов можно создать?',
                            a: 'Вы можете иметь по одному активному депозиту каждого плана. Всего доступно 13 планов.'
                        },
                        {
                            q: 'Что такое доступ к платформе?',
                            a: 'Это ежедневная плата $1 USDT за использование платформы. Без активного доступа создание депозитов невозможно.'
                        },
                        {
                            q: 'Где купить токен PLEX?',
                            a: 'PLEX можно купить на PancakeSwap, во внутреннем обменнике или получить в качестве бонусов.'
                        }
                    ].map((faq, index) => `
                        <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                            <h5 style="color: var(--text-primary); margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                                <span style="color: var(--primary-color);">Q:</span> ${faq.q}
                            </h5>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0; padding-left: 1.5rem;">
                                <span style="color: var(--success-color); font-weight: 600;">A:</span> ${faq.a}
                            </p>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 2rem; padding: 1.5rem; background: var(--bg-primary); border-radius: 12px; text-align: center;">
                    <h4 style="color: var(--primary-color); margin-bottom: 1rem;">🤝 Нужна помощь?</h4>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                        Наша служба поддержки готова ответить на любые вопросы
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="btn btn-primary" onclick="window.open('https://t.me/genesis_support', '_blank')">
                            💬 Telegram поддержка
                        </button>
                        <button class="btn btn-outline" onclick="window.CabinetApp.showEmailSupport()">
                            📧 Email поддержка
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
});

// MCP-MARKER:INIT:CABINET_CONTENT_RESTORED - Инициализация восстановленного генератора
console.log('📄 Cabinet Content Restored loaded - все недостающие методы добавлены');

// Проверяем наличие всех методов
const requiredMethods = [
    'getGiftsContent',
    'getMultipliersContent', 
    'getMiningRentContent',
    'getMyDeviceContent',
    'getPlexCoinContent',
    'getSettingsContent',
    'getExperienceContent',
    'getRankContent',
    'getHowItWorksContent'
];

const missingMethods = requiredMethods.filter(method => !window.CabinetContentGenerator[method]);

if (missingMethods.length === 0) {
    console.log('✅ Все методы генератора контента успешно восстановлены!');
} else {
    console.error('❌ Отсутствуют методы:', missingMethods);
}
