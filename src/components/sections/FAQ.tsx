'use client'

import { useState } from 'react'

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const faqItems = [
    {
      question: 'Как начать зарабатывать на платформе GENESIS 1.1?',
      answer: `Для начала заработка на платформе GENESIS 1.1 выполните следующие шаги:
      1. Зарегистрируйтесь на платформе через кошелек MetaMask или email
      2. Пополните баланс в USDT (BEP-20) или купите PLEX ONE токены  
      3. Выберите подходящий план депозита (от $25 до $2500)
      4. Активируйте план и начните получать автоматические выплаты
      
      Минимальная сумма для начала составляет всего $25.`
    },
    {
      question: 'Какие источники дохода доступны на платформе?',
      answer: `На платформе GENESIS 1.1 доступны следующие источники дохода:
      
      Пассивный доход: аренда мощностей устройства, депозиты, партнерская программа 3 уровня
      Активный доход: множители, доход от волатильности PLEX ONE токена, MEV-боты
      Дополнительный доход: программа лояльности, бонусная программа
      
      Каждый источник имеет свои особенности и уровень доходности.`
    },
    {
      question: 'Безопасна ли платформа? +',
      answer: `Да, платформа обеспечивает высокий уровень безопасности:
      
      Блокчейн технологии: все операции на Binance Smart Chain
      Прозрачность: все транзакции видны в блокчейне  
      Безопасность средств: средства поступают напрямую на ваш кошелек
      Аудит безопасности: регулярные проверки смарт-контрактов
      Множители: по завершении периода
      
      Все выплаты происходят в USDT или PLEX ONE токенах на ваш кошелек.`
    },
    {
      question: 'Как работает партнерская программа?',
      answer: `3-уровневая партнерская программа:
      
      1 уровень: 5% от вложений и дохода рефералов первого уровня
      2 уровень: 5% от вложений и дохода рефералов второго уровня  
      3 уровень: 5% от вложений и дохода рефералов третьего уровня
      
      Выплаты происходят автоматически каждые 24 часа в USDT или PLEX токенах.`
    },
    {
      question: 'Какая доходность MEV-ботов?',
      answer: `MEV-боты обеспечивают высокую доходность:
      
      Доходность: несколько десятков процентов в сутки минимум
      Стоимость аренды: 5 PLEX за $1 депозита в день
      Частота сделок: каждые 6–8 секунд
      Прозрачность: все транзакции видны
      Выплаты: деньги капают сразу на твой кошелёк`
    },
    {
      question: 'Какие минимальные суммы депозитов?',
      answer: `Доступные планы депозитов:
      
      Базовый депозит: от $25
      Стандартный депозит: $100 - $1000  
      Премиум депозит: до $2500
      Авторизация: 1 PLEX токен
      
      Все депозиты с автоматическими выплатами каждые 24 часа.`
    }
  ]

  return (
    <section id="faq" className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">❓ Часто задаваемые вопросы</h2>
          <p className="text-xl text-text-secondary">
            Все, что нужно знать о GENESIS 1.1
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="genesis-card">
              <button
                className="w-full text-left flex items-center justify-between p-4 hover:bg-background-tertiary/50 rounded-lg transition-colors"
                onClick={() => toggleItem(index)}
              >
                <span className="text-lg font-semibold">{item.question}</span>
                <span className={`text-2xl transition-transform ${openItems.includes(index) ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              
              {openItems.includes(index) && (
                <div className="px-4 pb-4">
                  <div className="pt-4 border-t border-border-primary">
                    <div className="prose prose-invert max-w-none">
                      {item.answer.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 text-text-secondary">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
