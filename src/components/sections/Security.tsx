'use client'

export function Security() {
  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🛡️ Безопасность и аудит</h2>
          <p className="text-xl text-text-secondary">
            Корпоративный уровень безопасности для защиты ваших средств
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="genesis-card text-center">
            <div className="text-3xl mb-3">🔗</div>
            <h4 className="font-bold mb-2">On-chain авторизация</h4>
            <p className="text-sm text-text-secondary">
              Доступ выдаётся по факту транзакции в сети BSC
            </p>
          </div>
          
          <div className="genesis-card text-center">
            <div className="text-3xl mb-3">🔐</div>
            <h4 className="font-bold mb-2">Кэш без секретов</h4>
            <p className="text-sm text-text-secondary">
              Без приватных ключей на фронтенде, только публичные данные
            </p>
          </div>
          
          <div className="genesis-card text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h4 className="font-bold mb-2">Резервные RPC</h4>
            <p className="text-sm text-text-secondary">
              Фейловер RPC и таймауты для устойчивости
            </p>
          </div>
          
          <div className="genesis-card text-center">
            <div className="text-3xl mb-3">🛡️</div>
            <h4 className="font-bold mb-2">Защита UI</h4>
            <p className="text-sm text-text-secondary">
              CSP, проверка источников, минимизация сторонних скриптов
            </p>
          </div>
        </div>

        {/* Гарантии безопасности */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">🔒 Гарантии безопасности</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-3 text-accent-teal">Блокчейн технологии:</h4>
              <ul className="space-y-2 text-text-secondary">
                <li>✓ Все операции на Binance Smart Chain</li>
                <li>✓ Полная прозрачность транзакций</li>
                <li>✓ Децентрализованное хранение</li>
                <li>✓ Смарт-контракты с аудитом</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-accent-gold">Защита средств:</h4>
              <ul className="space-y-2 text-text-secondary">
                <li>✓ Средства поступают напрямую на ваш кошелек</li>
                <li>✓ Никаких промежуточных хранилищ</li>
                <li>✓ Регулярные проверки безопасности</li>
                <li>✓ Мониторинг аномальной активности</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
