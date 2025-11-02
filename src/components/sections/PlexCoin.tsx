'use client'

export function PlexCoin() {
  return (
    <section className="genesis-section" id="plex-coin">
      <div className="genesis-container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-6">🪙 О монете PLEX ONE</h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            PLEX ONE — чистая, понятная монета, проверенная всеми сервисами: в ней нет двойного дна.
          </p>
        </div>

        {/* Базовая информация */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="genesis-card">
            <h4 className="font-semibold mb-2">Контракт</h4>
            <code className="text-sm bg-background-tertiary px-2 py-1 rounded break-all">
              0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1
            </code>
          </div>
          <div className="genesis-card">
            <h4 className="font-semibold mb-2">Сеть</h4>
            <p>BSC (Binance Smart Chain)</p>
          </div>
          <div className="genesis-card">
            <h4 className="font-semibold mb-2">Decimals</h4>
            <p>9</p>
          </div>
        </div>

        {/* Утилитарность */}
        <div className="genesis-card mb-8">
          <h3 className="text-2xl font-bold mb-4">🔑 Утилити-токен и авторизация</h3>
          <p className="text-lg leading-relaxed">
            Ценность PLEX ONE в том, что это утилити-токен, то есть даже на этом сайте, 
            чтобы узнать, как тебе на полном пассиве (что, кстати, правда) можно зарабатывать 
            довольно интересные деньги, тебе нужно, как и всем, пройти авторизацию — 
            отдать одну монету PLEX ONE.
          </p>
        </div>

        {/* Где купить */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-6">💰 Где купить PLEX ONE</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://pancakeswap.finance/swap?outputCurrency=0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1"
              target="_blank"
              rel="noopener noreferrer"
              className="genesis-btn genesis-btn-primary"
            >
              🥞 PancakeSwap
            </a>
            <a 
              href="https://www.dextools.io/app/bsc/pair-explorer/0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1"
              target="_blank"
              rel="noopener noreferrer"
              className="genesis-btn genesis-btn-secondary"
            >
              📊 DexTools
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
