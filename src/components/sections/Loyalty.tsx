'use client'

export function Loyalty() {
  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🎁 Программа лояльности и бонусная программа</h2>
          <p className="text-xl text-text-secondary">
            Дополнительные источники пассивного дохода согласно экосистеме GENESIS 1.1
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Программа лояльности */}
          <div className="genesis-card border-l-4 border-l-purple-500">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">👑</span>
              <h3 className="text-2xl font-bold">Доход от программы лояльности</h3>
            </div>
            <p className="text-lg mb-4">
              Стабильный пассивный доход за длительное участие в экосистеме платформы.
            </p>
            <ul className="space-y-2">
              <li>• Доход от программы лояльности</li>
              <li>• Автоматические выплаты каждые 24 часа</li>
              <li>• Выплаты в USDT и PLEX токенах</li>
              <li>• Увеличение дохода со временем</li>
            </ul>
          </div>
          
          {/* Бонусная программа */}
          <div className="genesis-card border-l-4 border-l-orange-500">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎯</span>
              <h3 className="text-2xl font-bold">Доход от бонусной программы</h3>
            </div>
            <p className="text-lg mb-4">
              Дополнительный пассивный доход от участия в бонусных программах платформы.
            </p>
            <ul className="space-y-2">
              <li>• Доход от бонусной программы</li>
              <li>• Автоматические выплаты каждые 24 часа</li>
              <li>• Выплаты в USDT и PLEX токенах</li>
              <li>• Комбинируется с другими источниками</li>
            </ul>
          </div>
        </div>

        {/* Автоматические выплаты */}
        <div className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border border-purple-500/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">💰 Автоматические выплаты</h3>
          <p className="text-lg">
            Все выплаты от программы лояльности и бонусной программы происходят{' '}
            <strong className="text-accent-gold">автоматически каждые 24 часа в USDT и PLEX</strong>{' '}
            токенах прямо на ваш кошелек.
          </p>
        </div>
      </div>
    </section>
  )
}
