'use client'

import { useEffect, useState } from 'react'

export function DeviceMining() {
  const [deviceInfo, setDeviceInfo] = useState({
    platform: 'Определяется...',
    cores: 'Определяется...',
    memory: 'Определяется...',
    browser: 'Определяется...',
    earnings: 'Рассчитывается...'
  })

  useEffect(() => {
    // Определяем характеристики устройства
    const platform = navigator.platform || 'Unknown'
    const cores = navigator.hardwareConcurrency || 4
    const memory = (navigator as any).deviceMemory || 4
    const userAgent = navigator.userAgent
    
    let browser = 'Unknown'
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'

    // Рассчитываем потенциальный доход
    const base = (cores * 0.1 + memory * 0.05) * 30
    const earnings = `~${base.toFixed(2)} PLEX/месяц`

    setDeviceInfo({
      platform,
      cores: cores.toString(),
      memory: `${memory} GB`,
      browser,
      earnings
    })
  }, [])

  return (
    <section className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🖥️ Аренда мощностей устройства</h2>
          <p className="text-xl text-text-secondary">
            Пассивный доход от аренды вычислительных мощностей вашего устройства
          </p>
        </div>

        {/* Как это работает */}
        <div className="genesis-card mb-8">
          <h3 className="text-2xl font-bold mb-4">💻 Как это работает</h3>
          <p className="text-lg mb-6">
            Ваше устройство участвует в распределенных вычислениях, а вы получаете 
            <strong className="text-accent-gold"> доход от аренды мощностей твоего устройства</strong>. 
            Чем мощнее устройство — тем выше доход.
          </p>

          {/* Характеристики устройства */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-background-tertiary rounded-lg p-4 text-center">
              <div className="text-sm text-text-muted mb-1">Платформа</div>
              <div className="font-semibold text-accent-teal">{deviceInfo.platform}</div>
            </div>
            <div className="bg-background-tertiary rounded-lg p-4 text-center">
              <div className="text-sm text-text-muted mb-1">Ядра CPU</div>
              <div className="font-semibold text-accent-teal">{deviceInfo.cores}</div>
            </div>
            <div className="bg-background-tertiary rounded-lg p-4 text-center">
              <div className="text-sm text-text-muted mb-1">Память</div>
              <div className="font-semibold text-accent-teal">{deviceInfo.memory}</div>
            </div>
            <div className="bg-background-tertiary rounded-lg p-4 text-center">
              <div className="text-sm text-text-muted mb-1">Потенциальный доход</div>
              <div className="font-semibold text-accent-gold">{deviceInfo.earnings}</div>
            </div>
          </div>

          <ul className="space-y-2 text-lg">
            <li>• Доход от аренды мощностей твоего устройства</li>
            <li>• Автоматические выплаты каждые 24 часа</li>
            <li>• Никаких дополнительных программ или майнеров</li>
            <li>• Работает в фоне без нагрузки на систему</li>
            <li>• Выплаты в PLEX или USDT</li>
          </ul>
        </div>

        {/* Конфиденциальность */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-3">🔒 Конфиденциальность данных</h3>
          <p>
            <strong>Важно:</strong> Мы НЕ собираем и НЕ сохраняем ваши персональные данные. 
            Вся информация отображается только для вас в реальном времени и не передается на наши серверы.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <span className="bg-green-500/20 px-3 py-1 rounded-full text-sm">✅ Данные не сохраняются</span>
            <span className="bg-green-500/20 px-3 py-1 rounded-full text-sm">✅ Полная приватность</span>
            <span className="bg-green-500/20 px-3 py-1 rounded-full text-sm">✅ Локальная обработка</span>
          </div>
        </div>
      </div>
    </section>
  )
}
