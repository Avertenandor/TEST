'use client'

export function MevDetailed() {
  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🤖 MEV-боты — детальное объяснение</h2>
          <p className="text-xl text-text-secondary">
            Арбитражные роботы с доходностью десятки процентов в сутки
          </p>
        </div>

        {/* Пример доходности из старых версий */}
        <div className="genesis-card mb-8">
          <h3 className="text-2xl font-bold mb-4">🤖 Пример доходности MEV-бота</h3>
          <p className="text-lg mb-4">
            Наш MEV-бот приносит <strong className="text-accent-gold">несколько десятков процентов в сутки минимум</strong>:
          </p>
          <ul className="space-y-2 text-lg">
            <li>— Сделка каждые 6–8 секунд</li>
            <li>— Все транзакции видны</li>
            <li>— Деньги капают сразу на твой кошелёк</li>
          </ul>
          <p className="mt-4 text-lg">
            Мы создаём разные роботы — они приносят деньги, а сами роботы арендуются за монету PLEX ONE.
          </p>
        </div>

        {/* Стоимость из старых версий */}
        <div className="bg-gradient-to-r from-accent-teal/10 to-accent-gold/10 border border-accent-teal/20 rounded-xl p-8 text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">💰 Стоимость аренды</h3>
          <div className="text-4xl font-bold text-accent-gold mb-2">5 PLEX</div>
          <p className="text-xl mb-4">за $1 депозита в день</p>
          <p className="text-lg text-accent-gold">
            Но при этом один доллар депозита в сутки стоит <strong>5 PLEX</strong>.
          </p>
        </div>

        {/* Преимущества */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="genesis-card text-center">
            <div className="text-3xl mb-3">💎</div>
            <h4 className="font-bold mb-2">Высокая доходность</h4>
            <p>Десятки процентов в сутки</p>
          </div>
          <div className="genesis-card text-center">
            <div className="text-3xl mb-3">👁️</div>
            <h4 className="font-bold mb-2">Прозрачность</h4>
            <p>Все транзакции видны</p>
          </div>
          <div className="genesis-card text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-bold mb-2">Мгновенность</h4>
            <p>Деньги капают сразу</p>
          </div>
          <div className="genesis-card text-center">
            <div className="text-3xl mb-3">🛡️</div>
            <h4 className="font-bold mb-2">Безопасность</h4>
            <p>Проверенные контракты</p>
          </div>
        </div>
      </div>
    </section>
  )
}
