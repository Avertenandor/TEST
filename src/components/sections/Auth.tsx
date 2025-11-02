'use client'

import { useState } from 'react'

export function Auth() {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState('')

  const checkPayment = async () => {
    if (checking) return
    setChecking(true)
    try {
      // Здесь будет логика проверки 1 PLEX
      setResult('Проверка платежа...')
      // TODO: Интеграция с QuikNode RPC
    } catch (e) {
      setResult('Ошибка проверки')
    } finally {
      setChecking(false)
    }
  }

  return (
    <section id="genesis-auth-section" className="genesis-section">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🔐 Авторизация</h2>
          <p className="text-xl text-accent-gold">Доступ за 1 PLEX токен</p>
        </div>

        {/* Инструкция */}
        <div className="genesis-card mb-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">📋 Инструкция по авторизации</h3>
          <ol className="space-y-4 text-lg">
            <li className="flex items-start gap-3">
              <span className="bg-accent-teal text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              <span>Отправьте РОВНО 1 токен PLEX на указанный адрес</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-accent-teal text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
              <span>Используйте только BSC сеть (Binance Smart Chain)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-accent-teal text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
              <div>
                <span>Адрес для авторизации:</span>
                <br />
                <code className="bg-background-tertiary px-2 py-1 rounded text-accent-gold break-all">
                  0x399B22170B0AC7BB20bdC86772BfF478f201fFCD
                </code>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-accent-teal text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
              <span>После отправки токена нажмите 'Проверить оплату 1 PLEX'</span>
            </li>
          </ol>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button className="genesis-btn genesis-btn-secondary">
            🔗 Подключить кошелек
          </button>
          <button 
            className="genesis-btn genesis-btn-primary"
            onClick={checkPayment}
            disabled={checking}
          >
            ✅ Проверить оплату 1 PLEX
          </button>
        </div>

        {/* Результат проверки */}
        {result && (
          <div className="text-center">
            <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-md mx-auto">
              {result}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
