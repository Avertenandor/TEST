'use client'

export function Roadmap() {
  const roadmapItems = [
    {
      quarter: 'Q1 2025',
      title: 'Запуск платформы',
      description: 'Запуск лендинга, ончейн-авторизация, базовые депозитные программы',
      status: 'completed'
    },
    {
      quarter: 'Q2 2025', 
      title: 'Расширение функций',
      description: 'MEV-боты, множители дохода, техническая информация устройств',
      status: 'in-progress'
    },
    {
      quarter: 'Q3 2025',
      title: 'Интеграции',
      description: 'Мобильные приложения, дополнительные блокчейны, API для партнеров',
      status: 'planned'
    },
    {
      quarter: 'Q4 2025',
      title: 'Масштабирование',
      description: 'Новые рынки, институциональные клиенты, расширенная экосистема',
      status: 'planned'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-l-green-500'
      case 'in-progress': return 'border-l-yellow-500'
      case 'planned': return 'border-l-blue-500'
      default: return 'border-l-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '✅ Завершено'
      case 'in-progress': return '🔄 В процессе'
      case 'planned': return '📋 Запланировано'
      default: return '❓ Неизвестно'
    }
  }

  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🗺️ Дорожная карта</h2>
          <p className="text-xl text-text-secondary">
            Планы развития платформы GENESIS 1.1
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roadmapItems.map((item, index) => (
            <div key={index} className={`genesis-card border-l-4 ${getStatusColor(item.status)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold text-accent-teal">{item.quarter}</div>
                <div className="text-sm">{getStatusText(item.status)}</div>
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-text-secondary leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Долгосрочное видение */}
        <div className="mt-12 bg-gradient-to-r from-accent-teal/10 to-accent-gold/10 border border-accent-teal/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">🚀 Долгосрочное видение</h3>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            GENESIS 1.1 стремится стать ведущей платформой для пассивного и активного дохода в криптовалюте, 
            предоставляя пользователям максимальные возможности для заработка через инновационные технологии блокчейн.
          </p>
        </div>
      </div>
    </section>
  )
}
