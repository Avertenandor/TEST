'use client'

export function FinalCTA() {
  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="bg-gradient-to-r from-accent-teal/20 to-accent-gold/20 border-2 border-accent-teal/30 rounded-2xl p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Готовы начать зарабатывать?
          </h2>
          
          {/* Призыв из старых версий */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Стоит вернуться к сайту и начать зарабатывать</h3>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-4">
              Теперь вернёмся к сайту, на котором ты находишься — тут можно заработать, и много.
            </p>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              Если твой жизненный опыт говорит тебе, что стоит узнать больше, 
              проходи авторизацию и больших тебе выплат, наш будущий партнёр.
            </p>
          </div>

          {/* Ключевые преимущества */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-background-secondary/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent-teal mb-2">$25+</div>
              <div className="text-sm text-text-muted">Минимальный депозит</div>
            </div>
            <div className="bg-background-secondary/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent-gold mb-2">24ч</div>
              <div className="text-sm text-text-muted">Автовыплаты</div>
            </div>
            <div className="bg-background-secondary/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent-teal mb-2">5%</div>
              <div className="text-sm text-text-muted">Партнерская программа</div>
            </div>
          </div>

          {/* Основные кнопки */}
          <div className="flex flex-wrap justify-center gap-6">
            <button className="genesis-btn genesis-btn-primary text-lg px-8 py-4">
              🔗 Подключить кошелёк
            </button>
            <button className="genesis-btn genesis-btn-secondary text-lg px-8 py-4">
              ✅ Проверить оплату 1 PLEX
            </button>
          </div>

          <p className="text-text-muted mt-6">
            Подключение занимает пару минут • Автоматические выплаты каждые 24 часа
          </p>
        </div>
      </div>
    </section>
  )
}
