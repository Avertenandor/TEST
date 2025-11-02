// Lightweight JSON-RPC client for QuikNode integration
export class RpcClient {
  private endpoints: string[]
  private nextId = 1
  private timeoutMs = 12000
  private _idx = 0 // текущий успешный endpoint

  constructor(endpoints: string | string[]) {
    this.endpoints = Array.isArray(endpoints) ? endpoints : [endpoints]
  }

  async call(method: string, params: any[] = []): Promise<any> {
    let lastErr: Error | null = null
    
    // начинаем с последнего успешного endpoint'а
    for (let i = 0; i < this.endpoints.length; i++) {
      const pos = (this._idx + i) % this.endpoints.length
      const url = this.endpoints[pos]
      
      try {
        const ctrl = new AbortController()
        const timer = setTimeout(() => ctrl.abort(), this.timeoutMs)
        
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            jsonrpc: '2.0', 
            id: this.nextId++, 
            method, 
            params 
          }),
          signal: ctrl.signal
        })
        
        clearTimeout(timer)
        const json = await res.json()
        
        if (json.error) {
          throw new Error(json.error.message || 'RPC Error')
        }
        
        // Запоминаем удачный endpoint
        this._idx = pos
        return json.result
      } catch (e) {
        lastErr = e as Error
        // небольшой джиттер
        await new Promise(r => setTimeout(r, 50))
        continue
      }
    }
    
    throw lastErr || new Error('All RPC endpoints failed')
  }

  async blockNumber(): Promise<number> {
    const hex = await this.call('eth_blockNumber')
    return parseInt(hex, 16)
  }

  async getLogs(filter: any): Promise<any[]> {
    return await this.call('eth_getLogs', [filter])
  }
}

export function toHex(value: number | bigint): string {
  return '0x' + BigInt(value).toString(16)
}

export const ERC20_TRANSFER_TOPIC = 
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

export function addrTopic(address: string): string {
  return '0x000000000000000000000000' + 
    String(address).replace(/^0x/i, '').toLowerCase()
}

// Конфигурация из старых версий
export const CONFIG = {
  network: {
    chainId: 56,
    rpc: [
      "https://old-patient-butterfly.bsc.quiknode.pro/033086e8e5a0217bb0b15a808dd70bc4e3e025af",
      "https://bsc-dataseed.binance.org/"
    ]
  },
  addresses: {
    auth: "0x399B22170B0AC7BB20bdC86772BfF478f201fFCD",
    plexToken: "0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1"
  },
  token: {
    symbol: "PLEX",
    decimals: 9,
    authAmount: "1"
  }
}
