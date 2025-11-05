'use client'

import { useState } from 'react'
import { RpcClient, ERC20_TRANSFER_TOPIC, addrTopic, toHex, CONFIG } from '@/lib/rpc'

export function Auth() {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState('')
  const [userAddress, setUserAddress] = useState('')

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setResult('❌ Установите MetaMask или другой Web3 кошелек')
        return
      }
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[]
      
      if (accounts && accounts.length > 0) {
        setUserAddress(accounts[0])
        setResult(`✅ Кошелек подключен: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
      }
    } catch (e) {
      setResult('❌ Ошибка подключения кошелька')
    }
  }

  const checkPayment = async () => {
    if (checking) return
    if (!userAddress) {
      setResult('❌ Сначала подключите кошелек')
      return
    }

    setChecking(true)
    try {
      setResult('🔍 Проверяем платеж...')
      
      const rpc = new RpcClient(CONFIG.network.rpc)
      const start = await rpc.blockNumber()
      const fromBlock = Math.max(0, start - 20)
      const untilBlock = start + 10

      const amount = BigInt(CONFIG.token.authAmount) * (BigInt(10) ** BigInt(CONFIG.token.decimals))
      const topics = [
        ERC20_TRANSFER_TOPIC,
        addrTopic(userAddress),
        addrTopic(CONFIG.addresses.auth)
      ]

      let match: { transactionHash: string } | null = null
      let head = start

      while (head <= untilBlock && !match) {
        const logs = await rpc.getLogs({
          fromBlock: toHex(fromBlock),
          toBlock: 'latest',
          address: CONFIG.addresses.plexToken,
          topics
        })
        
        const foundLog = logs.find((l: unknown) => {
          const log = l as { data: string }
          try { 
            return BigInt(log.data) >= amount 
          } catch { 
            return false 
          }
        })
        
        if (foundLog) {
          match = foundLog as { transactionHash: string }
        }
        
        if (match) break
        
        // ждём новый блок
        await new Promise(r => setTimeout(r, 3000))
        head = await rpc.blockNumber()
        setResult(`🔍 Ждем блок ${head}/${untilBlock}...`)
      }

      if (!match) {
        setResult('⚠️ Платеж не найден за последние 20 блоков и в течение ожидания ещё 10 блоков')
        return
      }

      const tx = match.transactionHash
      
      // Сохраняем авторизацию
      localStorage.setItem('genesis_user_address', userAddress)
      localStorage.setItem('genesis_platform_access', JSON.stringify({ 
        hasAccess: true, 
        lastAuthTx: tx, 
        lastCheck: Date.now() 
      }))

      setResult(`✅ Платеж найден! TX: ${tx.slice(0, 10)}... Доступ активирован!`)
      
    } catch (e) {
      setResult(`❌ Ошибка: ${(e as Error).message}`)
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
          <button 
            className="genesis-btn genesis-btn-secondary"
            onClick={connectWallet}
          >
            🔗 Подключить кошелек
          </button>
          <button 
            className="genesis-btn genesis-btn-primary"
            onClick={checkPayment}
            disabled={checking || !userAddress}
          >
            {checking ? '🔍 Проверяем...' : '✅ Проверить оплату 1 PLEX'}
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
