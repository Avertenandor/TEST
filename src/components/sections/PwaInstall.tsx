'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice
    
    if (choiceResult.outcome === 'accepted') {
      console.log('PWA установлено')
    }
    
    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">📱 Установите GENESIS 1.1 как приложение</h2>
          <p className="text-xl text-text-secondary mb-8">
            Получите быстрый доступ к платформе прямо с вашего устройства
          </p>

          {/* Преимущества PWA */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="genesis-card text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h4 className="font-bold mb-2">Быстрый запуск</h4>
              <p className="text-sm text-text-secondary">Мгновенный доступ с рабочего стола</p>
            </div>
            <div className="genesis-card text-center">
              <div className="text-3xl mb-3">📱</div>
              <h4 className="font-bold mb-2">Нативный опыт</h4>
              <p className="text-sm text-text-secondary">Работает как обычное приложение</p>
            </div>
            <div className="genesis-card text-center">
              <div className="text-3xl mb-3">🔔</div>
              <h4 className="font-bold mb-2">Push-уведомления</h4>
              <p className="text-sm text-text-secondary">Получайте уведомления о выплатах</p>
            </div>
            <div className="genesis-card text-center">
              <div className="text-3xl mb-3">💾</div>
              <h4 className="font-bold mb-2">Офлайн-доступ</h4>
              <p className="text-sm text-text-secondary">Работает даже без интернета</p>
            </div>
          </div>

          {/* Кнопка установки */}
          {showInstallButton && (
            <button 
              onClick={handleInstall}
              className="genesis-btn genesis-btn-primary text-lg px-8 py-4"
            >
              📲 Установить приложение
            </button>
          )}
          
          {!showInstallButton && (
            <p className="text-text-muted">
              Приложение уже установлено или недоступно для установки в данном браузере
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
