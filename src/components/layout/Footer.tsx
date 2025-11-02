'use client'

export function Footer() {
  const socialLinks = [
    { href: 'https://t.me/genesis_one_io', icon: '📱', label: 'Telegram' },
    { href: '#', icon: '🐦', label: 'Twitter' },
    { href: '#', icon: '💬', label: 'Discord' },
    { href: '#', icon: '🐙', label: 'GitHub' }
  ]

  const footerLinks = [
    { href: '#', label: 'О нас' },
    { href: '#', label: 'Команда' },
    { href: '#', label: 'Карьера' },
    { href: '#', label: 'Документация' },
    { href: '#', label: 'Статус системы' },
    { href: '#', label: 'Условия использования' },
    { href: '#', label: 'Политика конфиденциальности' },
    { href: '#', label: 'Поддержка' }
  ]

  return (
    <footer className="bg-background-secondary border-t border-border-primary">
      <div className="genesis-container py-12">
        {/* Главная секция */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Логотип и описание */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-accent-teal">
                GENESIS <span className="text-accent-gold">1.1</span>
              </span>
            </div>
            <p className="text-text-secondary mb-4 max-w-md">
              Профессиональная платформа для пассивного и активного дохода в криптовалюте 
              с интеграцией PLEX ONE Token на Binance Smart Chain.
            </p>
            
            {/* Социальные сети */}
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-background-tertiary rounded-lg flex items-center justify-center hover:bg-accent-teal/20 transition-colors"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Быстрые ссылки */}
          <div>
            <h4 className="font-bold mb-4">Быстрые ссылки</h4>
            <ul className="space-y-2">
              {footerLinks.slice(0, 4).map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-text-secondary hover:text-text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Правовая информация */}
          <div>
            <h4 className="font-bold mb-4">Правовая информация</h4>
            <ul className="space-y-2">
              {footerLinks.slice(4).map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-text-secondary hover:text-text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Нижняя секция */}
        <div className="border-t border-border-primary pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-text-muted text-sm">
              © 2025 GENESIS 1.1. Все права защищены.
            </p>
            <p className="text-text-muted text-sm mt-4 md:mt-0">
              Автоматические выплаты в USDT и PLEX токенах каждые 24 часа
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
