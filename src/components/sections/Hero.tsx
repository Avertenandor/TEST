'use client'

export function Hero() {
  return (
    <section className="genesis-section pt-24">
      <div className="genesis-container">
        <div className="text-center max-w-5xl mx-auto">
          {/* Главный заголовок */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-accent-teal to-accent-gold bg-clip-text text-transparent">
                GENESIS 1.1
              </span>
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-text-secondary mb-4">
              Блокчейн платформа нового поколения
            </p>
          </div>

          {/* Описание из старых версий */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">
              💰 <span className="text-accent-teal">Пассивный</span> и{' '}
              <span className="text-accent-gold">активный доход</span>{' '}
              <br />в криптовалюте
            </h2>
            <p className="text-xl leading-relaxed text-text-secondary max-w-4xl mx-auto">
              🚀 Зарабатывайте деньги в интернете! Пассивный доход от аренды мощностей, депозитов, 
              партнерской программы 3 уровня. Активный доход от MEV-ботов с доходностью десятки процентов в сутки. 
              PLEX ONE Token.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap justify-center gap-6">
            <button className="genesis-btn genesis-btn-primary text-lg px-8 py-4">
              🚀 Начать зарабатывать
            </button>
            <button className="genesis-btn genesis-btn-secondary text-lg px-8 py-4">
              📚 Узнать больше
            </button>
          </div>

          {/* Ключевые цифры */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-teal mb-2">$25+</div>
              <div className="text-text-muted">Минимальный депозит</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-gold mb-2">24ч</div>
              <div className="text-text-muted">Автовыплаты</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-teal mb-2">3</div>
              <div className="text-text-muted">Уровня партнерки</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-gold mb-2">5%</div>
              <div className="text-text-muted">С каждого уровня</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
