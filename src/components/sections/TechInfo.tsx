'use client'

import { useEffect, useState } from 'react'

export function TechInfo() {
  const [techData, setTechData] = useState({
    platform: 'Определяется...',
    cores: 'Определяется...',
    memory: 'Определяется...',
    browser: 'Определяется...',
    connection: 'Проверяется...',
    ip: 'Определяется...',
    isp: 'Определяется...',
    location: 'Определяется...'
  })

  useEffect(() => {
    // Определяем характеристики устройства
    const platform = navigator.platform || 'Unknown'
    const cores = navigator.hardwareConcurrency || 4
    const memory = (navigator as unknown as Record<string, unknown>).deviceMemory as number || 4
    const userAgent = navigator.userAgent
    
    let browser = 'Unknown'
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'

    const connection = (navigator as unknown as Record<string, unknown>).connection as Record<string, unknown> | undefined
    const effectiveType = connection?.effectiveType as string || 'Unknown'

    setTechData({
      platform,
      cores: cores.toString(),
      memory: `${memory} GB`,
      browser,
      connection: effectiveType,
      ip: 'Определяется...',
      isp: 'Определяется...',
      location: 'Определяется...'
    })
  }, [])

  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🖥️ Техническая информация</h2>
          <p className="text-xl text-text-secondary">
            Подробные данные о вашем устройстве, сети и безопасности
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Устройство */}
          <div className="genesis-card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              📱 Ваше устройство
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Платформа:</span>
                <span className="font-semibold text-accent-teal">{techData.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Ядра процессора:</span>
                <span className="font-semibold text-accent-teal">{techData.cores}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Память:</span>
                <span className="font-semibold text-accent-teal">{techData.memory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Браузер:</span>
                <span className="font-semibold text-accent-teal">{techData.browser}</span>
              </div>
            </div>
          </div>

          {/* Сеть */}
          <div className="genesis-card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🌐 Сетевое соединение
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Тип соединения:</span>
                <span className="font-semibold text-accent-teal">{techData.connection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">IP адрес:</span>
                <span className="font-semibold text-accent-teal">{techData.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Провайдер:</span>
                <span className="font-semibold text-accent-teal">{techData.isp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Геолокация:</span>
                <span className="font-semibold text-accent-teal">{techData.location}</span>
              </div>
            </div>
          </div>

          {/* Потенциальный доход */}
          <div className="genesis-card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              💰 Потенциальный доход
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-muted">От аренды мощностей:</span>
                <span className="font-semibold text-accent-gold">Рассчитывается...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Статус устройства:</span>
                <span className="font-semibold text-green-400">Готово к работе</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Рекомендуемый план:</span>
                <span className="font-semibold text-accent-teal">Базовый ($25+)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Конфиденциальность - точная формулировка из старых версий */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">🔒 Конфиденциальность данных</h3>
          <p className="text-lg mb-4">
            <strong>Важно:</strong> Мы НЕ собираем и НЕ сохраняем ваши персональные данные. 
            Вся информация о вашем устройстве и соединении отображается только для вас в реальном времени 
            и не передается на наши серверы. Ваша приватность — наш приоритет.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-green-500/20 px-4 py-2 rounded-full">✅ Данные не сохраняются</span>
            <span className="bg-green-500/20 px-4 py-2 rounded-full">✅ Полная приватность</span>
            <span className="bg-green-500/20 px-4 py-2 rounded-full">✅ Локальная обработка</span>
          </div>
        </div>
      </div>
    </section>
  )
}
