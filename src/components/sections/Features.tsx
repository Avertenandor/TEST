'use client'

export function Features() {
  const features = [
    {
      icon: '💎',
      title: 'PLEX ONE Token',
      description: 'Нативный токен платформы с растущей стоимостью и множественными источниками дохода'
    },
    {
      icon: '🏆',
      title: 'Пассивный доход',
      description: 'Стабильная прибыль от проверенных стратегий без активного участия'
    },
    {
      icon: '⚡',
      title: 'Активный доход',
      description: 'Максимальная прибыль от активного участия и торговых стратегий'
    },
    {
      icon: '🤝',
      title: 'Партнерская программа',
      description: '3-уровневая система с выплатами 5% от вложений и дохода партнеров'
    },
    {
      icon: '🔒',
      title: 'Безопасность',
      description: 'Все операции через блокчейн BSC с полной прозрачностью транзакций'
    },
    {
      icon: '📱',
      title: 'Простота использования',
      description: 'Интуитивный интерфейс и автоматические выплаты каждые 24 часа'
    }
  ]

  return (
    <section className="genesis-section" aria-label="Возможности платформы">
      <div className="genesis-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">✨ Возможности платформы</h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            GENESIS 1.1 предоставляет комплексную экосистему для получения пассивного и активного дохода 
            в криптовалюте с использованием современных технологий блокчейн.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="genesis-card group hover:border-accent-teal/50 transition-all duration-300"
            >
              <div className="text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-accent-teal">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Дополнительная информация */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-accent-teal/10 to-accent-gold/10 border border-accent-teal/20 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">🚀 Интеграция с Binance Smart Chain</h3>
            <p className="text-lg text-text-secondary">
              Платформа работает на базе Binance Smart Chain, обеспечивая быстрые транзакции, 
              низкие комиссии и полную совместимость с популярными кошельками.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
