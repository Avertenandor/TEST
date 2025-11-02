'use client'

export function Multipliers() {
  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">📈 Активный доход от множителей</h2>
          <p className="text-xl text-text-secondary">
            Увеличивайте свой доход в разы с помощью активных стратегий
          </p>
        </div>

        {/* Множители */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="genesis-card text-center border-l-4 border-l-green-500">
            <h4 className="text-xl font-bold mb-2">Множитель x2</h4>
            <div className="text-5xl font-bold text-accent-teal mb-4">x2</div>
            <p className="mb-4">Удвойте свой доход от базовых стратегий</p>
            <ul className="text-left space-y-1 text-sm">
              <li>✓ Доступен с первого депозита</li>
              <li>✓ Применяется к пассивному доходу</li>
              <li>✓ Стабильная доходность</li>
            </ul>
          </div>
          
          <div className="genesis-card text-center border-l-4 border-l-orange-500">
            <h4 className="text-xl font-bold mb-2">Множитель x5</h4>
            <div className="text-5xl font-bold text-accent-gold mb-4">x5</div>
            <p className="mb-4">Пятикратное увеличение для опытных</p>
            <ul className="text-left space-y-1 text-sm">
              <li>✓ Требует опыт на платформе</li>
              <li>✓ Комбинируется с активными стратегиями</li>
              <li>✓ Высокая доходность</li>
            </ul>
          </div>
          
          <div className="genesis-card text-center border-l-4 border-l-red-500">
            <h4 className="text-xl font-bold mb-2">Множитель x10</h4>
            <div className="text-5xl font-bold text-red-400 mb-4">x10</div>
            <p className="mb-4">Максимальный для профессионалов</p>
            <ul className="text-left space-y-1 text-sm">
              <li>✓ Эксклюзивный доступ</li>
              <li>✓ Максимальная доходность</li>
              <li>✓ Индивидуальные условия</li>
            </ul>
          </div>
        </div>

        {/* Как работают - точная формулировка */}
        <div className="bg-gradient-to-r from-accent-teal/10 to-accent-gold/10 border border-accent-teal/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">⚡ Активный доход от множителей</h3>
          <p className="text-lg mb-4">
            Доход от множителей — это активный доход, который начисляется <strong className="text-accent-gold">по завершении периода</strong>. 
            Множители применяются к базовой доходности и значительно увеличивают общую прибыль.
          </p>
          <p className="text-lg">
            Все выплаты происходят <strong className="text-accent-teal">автоматически каждые 24 часа в USDT и PLEX</strong> токенах.
          </p>
        </div>
      </div>
    </section>
  )
}
