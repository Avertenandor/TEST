'use client'

export function Referral() {
  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🤝 Партнерская программа</h2>
          <p className="text-xl text-text-secondary">
            3-уровневая партнерская программа с доходом 5% от вложений и дохода партнеров
          </p>
        </div>

        {/* 3 уровня по 5% */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="genesis-card text-center border-l-4 border-l-green-500">
            <h4 className="text-xl font-bold mb-2">1 уровень</h4>
            <div className="text-5xl font-bold text-accent-teal mb-4">5%</div>
            <p>от вложений и дохода рефералов первого уровня</p>
          </div>
          
          <div className="genesis-card text-center border-l-4 border-l-orange-500">
            <h4 className="text-xl font-bold mb-2">2 уровень</h4>
            <div className="text-5xl font-bold text-accent-gold mb-4">5%</div>
            <p>от вложений и дохода рефералов второго уровня</p>
          </div>
          
          <div className="genesis-card text-center border-l-4 border-l-blue-500">
            <h4 className="text-xl font-bold mb-2">3 уровень</h4>
            <div className="text-5xl font-bold text-blue-400 mb-4">5%</div>
            <p>от вложений и дохода рефералов третьего уровня</p>
          </div>
        </div>

        {/* Как работает */}
        <div className="bg-gradient-to-r from-accent-teal/10 to-accent-gold/10 border border-accent-teal/20 rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">💰 Как работает партнерская программа</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-3">Что вы получаете:</h4>
              <ul className="space-y-2">
                <li>✓ 5% от вложений партнеров на всех уровнях</li>
                <li>✓ 5% от дохода партнеров на всех уровнях</li>
                <li>✓ Автоматические выплаты каждые 24 часа</li>
                <li>✓ Выплаты в USDT или PLEX токенах</li>
                <li>✓ Полная прозрачность всех операций</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-3">Преимущества:</h4>
              <ul className="space-y-2">
                <li>✓ Партнерская программа 3 уровня (5% от вложений и дохода)</li>
                <li>✓ Приглашайте друзей и получайте % с их депозитов</li>
                <li>✓ Дополнительный % с доходов ваших рефералов</li>
                <li>✓ Без ограничений по количеству партнеров</li>
                <li>✓ Пожизненные выплаты</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
