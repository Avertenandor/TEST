'use client'

export function Partners() {
  const partners = [
    { name: 'Binance Smart Chain', logo: '🔗', description: 'Основная блокчейн сеть' },
    { name: 'PancakeSwap', logo: '🥞', description: 'DEX для торговли PLEX' },
    { name: 'MetaMask', logo: '🦊', description: 'Поддерживаемый кошелек' },
    { name: 'Trust Wallet', logo: '💙', description: 'Мобильный кошелек' }
  ]

  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🤝 Партнёры и интеграции</h2>
          <p className="text-xl text-text-secondary">
            Надежные партнеры экосистемы GENESIS 1.1
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <div key={index} className="genesis-card text-center group hover:border-accent-teal/50 transition-all duration-300">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {partner.logo}
              </div>
              <h3 className="font-bold mb-2">{partner.name}</h3>
              <p className="text-text-secondary text-sm">{partner.description}</p>
            </div>
          ))}
        </div>

        {/* Экосистема */}
        <div className="mt-12 bg-gradient-to-r from-accent-teal/10 to-accent-gold/10 border border-accent-teal/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">🌐 Экосистема из 15+ инструментов</h3>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            Это один из <strong>15 сайтов</strong> и других инструментов криптовалютной экосистемы, 
            которая базируется на монете <strong>PLEX ONE</strong>. Интеграция с Binance Smart Chain 
            обеспечивает бесшовную работу всех компонентов.
          </p>
        </div>
      </div>
    </section>
  )
}
