'use client'

export function Testimonials() {
  const testimonials = [
    {
      text: "Получаю автоматические выплаты каждые 24 часа — отлично для пассивного дохода. Платформа действительно работает!",
      author: "Алексей",
      role: "Инвестор"
    },
    {
      text: "MEV-боты приносят несколько десятков процентов в сутки. Все транзакции видны, полная прозрачность.",
      author: "Марина", 
      role: "Активный трейдер"
    },
    {
      text: "Партнерская программа 3 уровня по 5% работает отлично. Привел друзей и получаю дополнительный доход.",
      author: "Иван",
      role: "Партнер"
    },
    {
      text: "Подключил кошелёк, выбрал план депозита от $25 и начал получать проценты. Все как обещали.",
      author: "Екатерина",
      role: "Новый пользователь"
    }
  ]

  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">💬 Отзывы пользователей</h2>
          <p className="text-xl text-text-secondary">
            Что говорят наши пользователи о платформе
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="genesis-card">
              <div className="mb-4">
                <div className="text-4xl text-accent-teal mb-2">"</div>
                <p className="text-lg leading-relaxed text-text-secondary italic">
                  {testimonial.text}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-accent-teal to-accent-gold rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.author[0]}
                </div>
                <div>
                  <div className="font-bold">{testimonial.author}</div>
                  <div className="text-text-muted text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Статистика */}
        <div className="mt-12 bg-gradient-to-r from-accent-teal/10 to-accent-gold/10 border border-accent-teal/20 rounded-xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-accent-teal mb-2">1000+</div>
              <div className="text-text-muted">Активных пользователей</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-gold mb-2">$50K+</div>
              <div className="text-text-muted">Выплачено пользователям</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-teal mb-2">99.9%</div>
              <div className="text-text-muted">Время работы</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-gold mb-2">24/7</div>
              <div className="text-text-muted">Поддержка</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
