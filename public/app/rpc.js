// Lightweight JSON-RPC client (HTTP only). No external deps.
export class RpcClient {
  constructor(endpoints) {
    this.endpoints = Array.isArray(endpoints) ? endpoints : [endpoints];
    this.nextId = 1;
    this.timeoutMs = 12000;
  }

  async call(method, params = []) {
    let lastErr;
    for (const url of this.endpoints) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: this.nextId++, method, params }),
          signal: ctrl.signal
        });
        clearTimeout(timer);
        const json = await res.json();
        if (json.error) throw new Error(json.error.message || 'RPC Error');
        return json.result;
      } catch (e) {
        lastErr = e;
        continue;
      }
    }
    throw lastErr || new Error('All RPC endpoints failed');
  }

  async blockNumber() {
    const hex = await this.call('eth_blockNumber');
    return parseInt(hex, 16);
  }

  async getLogs(filter) {
    return await this.call('eth_getLogs', [filter]);
  }
}

export function toHex(value) {
  return '0x' + BigInt(value).toString(16);
}

export const ERC20_TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export function addrTopic(address) {
  return (
    '0x000000000000000000000000' + String(address).replace(/^0x/i, '').toLowerCase()
  );
}

