'use client'

export function DepositsOverview() {
  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">💰 Пассивный и активный доход</h2>
          <p className="text-xl text-text-secondary max-w-4xl mx-auto">
            Пассивный доход для каждого и активный доход для каждого, иначе говоря — деньги в интернете. 
            Они тут есть, и заработать их несложно прямо на этом сайте.
          </p>
        </div>

        {/* Типы дохода */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Пассивный доход */}
          <div className="genesis-card border-l-4 border-l-green-500">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🏆</span>
              <h3 className="text-2xl font-bold">Пассивный доход</h3>
            </div>
            <p className="text-lg mb-4">
              Стабильная прибыль от проверенных стратегий! Аренда мощностей, депозиты, партнерская программа 3 уровня.
            </p>
            <ul className="space-y-2">
              <li>• Доход от аренды мощностей твоего устройства</li>
              <li>• Доход от депозитов</li>
              <li>• Доход от партнёрской программы 3 уровня — 5% от вложений и от дохода</li>
              <li>• Доход от программы лояльности</li>
              <li>• Доход от бонусной программы</li>
            </ul>
          </div>

          {/* Активный доход */}
          <div className="genesis-card border-l-4 border-l-orange-500">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚡</span>
              <h3 className="text-2xl font-bold">Активный доход</h3>
            </div>
            <p className="text-lg mb-4">
              Максимальная прибыль от активного участия! Множители, доход от волатильности PLEX ONE токена, 
              MEV-боты с доходностью десятки процентов в сутки.
            </p>
            <ul className="space-y-2">
              <li>• Доход от множителей</li>
              <li>• Доход от волатильности PLEX ONE токена</li>
              <li>• MEV-боты с доходностью десятки процентов в сутки</li>
              <li>• Арбитражные роботы для мгновенных сделок</li>
            </ul>
          </div>
        </div>

        {/* Депозитные планы */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-center mb-8">📋 Депозитные программы</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="genesis-card text-center">
              <h4 className="text-xl font-bold mb-2">Базовый депозит</h4>
              <div className="text-3xl font-bold text-accent-teal mb-4">от $25</div>
              <p>Депозитные программы от $25 до $2500 с автоматическими выплатами</p>
            </div>
            <div className="genesis-card text-center">
              <h4 className="text-xl font-bold mb-2">Стандартный</h4>
              <div className="text-3xl font-bold text-accent-teal mb-4">$100-$1000</div>
              <p>Оптимальная доходность с гибкими условиями</p>
            </div>
            <div className="genesis-card text-center border-2 border-accent-gold">
              <h4 className="text-xl font-bold mb-2">Премиум</h4>
              <div className="text-3xl font-bold text-accent-gold mb-4">до $2500</div>
              <p>Максимальная доходность и приоритетная поддержка</p>
            </div>
          </div>
        </div>

        {/* Автоматические выплаты */}
        <div className="bg-gradient-to-r from-accent-teal/10 to-accent-gold/10 border border-accent-teal/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">💰 Автоматические выплаты</h3>
          <p className="text-lg">
            Доход от депозитов с <strong className="text-accent-gold">автоматическими выплатами</strong> каждые 24 часа 
            в <strong className="text-accent-teal">USDT и PLEX</strong> токенах прямо на ваш кошелек.
          </p>
        </div>
      </div>
    </section>
  )
}
