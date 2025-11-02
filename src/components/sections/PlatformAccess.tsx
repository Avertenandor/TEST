'use client'

export function PlatformAccess() {
  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">🚀 Быстрый доступ к платформе</h2>
          <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto">
            Отправьте 1 PLEX на системный адрес и получите мгновенный доступ ко всем возможностям платформы
          </p>

          {/* Системный адрес */}
          <div className="genesis-card max-w-2xl mx-auto mb-8">
            <h3 className="text-xl font-bold mb-4">🏛️ Системный адрес для авторизации</h3>
            <div className="bg-background-tertiary rounded-lg p-4 mb-4">
              <code className="text-accent-gold break-all">
                0x399B22170B0AC7BB20bdC86772BfF478f201fFCD
              </code>
            </div>
            <p className="text-text-secondary">
              Отправьте РОВНО 1 токен PLEX на этот адрес для получения доступа
            </p>
          </div>

          {/* Быстрые действия */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button className="genesis-btn genesis-btn-secondary">
              🔗 Подключить кошелёк
            </button>
            <button className="genesis-btn genesis-btn-primary">
              ✅ Проверить оплату 1 PLEX
            </button>
          </div>

          {/* Что получите */}
          <div className="bg-gradient-to-r from-accent-teal/10 to-accent-gold/10 border border-accent-teal/20 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6">💎 Что вы получите после авторизации</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-bold mb-2 text-accent-teal">💰 Доступ к доходам</h4>
                <ul className="space-y-1 text-sm text-text-secondary">
                  <li>• Пассивный доход от депозитов</li>
                  <li>• Аренда мощностей устройства</li>
                  <li>• Партнерская программа 3 уровня</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-accent-gold">⚡ Активные стратегии</h4>
                <ul className="space-y-1 text-sm text-text-secondary">
                  <li>• MEV-боты с высокой доходностью</li>
                  <li>• Множители дохода</li>
                  <li>• Торговля на волатильности</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-blue-400">🎁 Дополнительно</h4>
                <ul className="space-y-1 text-sm text-text-secondary">
                  <li>• Программа лояльности</li>
                  <li>• Бонусная программа</li>
                  <li>• Приоритетная поддержка</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
