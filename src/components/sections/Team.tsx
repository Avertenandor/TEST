'use client'

export function Team() {
  const teamMembers = [
    {
      name: 'Alex',
      role: 'Lead Developer',
      avatar: 'A',
      description: 'Ведущий разработчик блокчейн решений'
    },
    {
      name: 'Maria',
      role: 'Product Manager', 
      avatar: 'M',
      description: 'Управление продуктом и стратегия развития'
    },
    {
      name: 'Ivan',
      role: 'Blockchain Engineer',
      avatar: 'I', 
      description: 'Архитектор смарт-контрактов и DeFi протоколов'
    },
    {
      name: 'Sophia',
      role: 'Security Analyst',
      avatar: 'S',
      description: 'Аудит безопасности и анализ рисков'
    }
  ]

  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">👥 Наша команда</h2>
          <p className="text-xl text-text-secondary">
            Профессиональная команда разработчиков и специалистов
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {teamMembers.map((member, index) => (
            <div key={index} className="genesis-card text-center group hover:border-accent-teal/50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-accent-teal to-accent-gold rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                {member.avatar}
              </div>
              <h3 className="text-xl font-bold mb-2">{member.name}</h3>
              <div className="text-accent-teal font-semibold mb-3">{member.role}</div>
              <p className="text-text-secondary text-sm leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>

        {/* Информация о команде */}
        <div className="bg-gradient-to-r from-accent-teal/10 to-accent-gold/10 border border-accent-teal/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">🚀 GENESIS Team</h3>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            Мы, как команда разработчиков, создаём разные сайты и разные инструменты для того, 
            чтобы можно было зарабатывать на разнице цен, арбитраже и мгновенных сделках. 
            В основном мы работаем на блокчейне Binance Smart Chain.
          </p>
        </div>
      </div>
    </section>
  )
}
