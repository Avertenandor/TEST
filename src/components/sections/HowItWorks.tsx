'use client'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Подключите кошелёк',
      description: 'MetaMask/Trust Wallet. Переключитесь на сеть BSC (Binance Smart Chain).'
    },
    {
      number: '02', 
      title: 'Пополните баланс',
      description: 'Пополните баланс в USDT (BEP-20) или купите PLEX ONE токены. Минимальная сумма депозита всего $25.'
    },
    {
      number: '03',
      title: 'Выберите план',
      description: 'Выберите подходящий план депозита (от $25 до $2500) и активируйте его.'
    },
    {
      number: '04',
      title: 'Получайте доход',
      description: 'Активируйте план и начните получать автоматические выплаты каждые 24 часа в USDT или PLEX токенах.'
    }
  ]

  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🎯 Как это работает</h2>
          <p className="text-xl text-text-secondary">
            Простой процесс начала заработка на платформе
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="genesis-card text-center group hover:border-accent-teal/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-accent-teal to-accent-gold rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-3 text-accent-teal">
                {step.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Дополнительная информация из старых версий */}
        <div className="bg-gradient-to-r from-accent-teal/10 to-accent-gold/10 border border-accent-teal/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">💡 Почему GENESIS 1.1</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <h4 className="font-bold mb-2 text-accent-teal">🔄 Автоматизация</h4>
              <p className="text-text-secondary">
                Все процессы автоматизированы — от выплат до реинвестирования прибыли
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-accent-gold">📊 Прозрачность</h4>
              <p className="text-text-secondary">
                Полная прозрачность операций через блокчейн BSC
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-blue-400">🚀 Масштабируемость</h4>
              <p className="text-text-secondary">
                Платформа растет вместе с вашими инвестициями
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
