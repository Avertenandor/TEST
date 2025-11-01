import { CONFIG } from '../../app/config.js';

export default {
  async mount(root) {
    const id = CONFIG.coin?.coingeckoId || 'bitcoin';
    root.innerHTML = await this.template(id);
    this.loadWidget();
    this.loadData(id, CONFIG.coin?.currency || 'usd');
    return () => { root.innerHTML = ''; };
  },

  async template(id) {
    return `
      <section class="coin-section" role="region" aria-label="О монете PLEX ONE">
        <div class="genesis-container">
          <h2 class="coin-title">🪙 О монете PLEX ONE</h2>
          
          <!-- Базовая информация -->
          <div class="coin-info">
            <p class="coin-desc">PLEX ONE — чистая, понятная монета, проверенная всеми сервисами: в ней нет двойного дна.</p>
            <div class="coin-details">
              <div class="detail-card">
                <strong>Контракт:</strong>
                <code>0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1</code>
              </div>
              <div class="detail-card">
                <strong>Сеть:</strong> BSC (Binance Smart Chain)
              </div>
              <div class="detail-card">
                <strong>Decimals:</strong> 9
              </div>
            </div>
          </div>

          <!-- Утилитарность -->
          <div class="utility-info">
            <h3>🔑 Утилити-токен и авторизация</h3>
            <p>Ценность PLEX ONE в том, что это утилити-токен. Чтобы узнать, как на полном пассиве можно зарабатывать довольно интересные деньги, нужно пройти авторизацию — отдать одну монету PLEX ONE.</p>
          </div>

          <!-- Где купить -->
          <div class="buy-info">
            <h3>💰 Где купить PLEX ONE</h3>
            <div class="buy-options">
              <a href="https://pancakeswap.finance/swap?outputCurrency=0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1" class="buy-btn" target="_blank">PancakeSwap</a>
              <a href="https://www.dextools.io/app/bsc/pair-explorer/0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1" class="buy-btn" target="_blank">DexTools</a>
            </div>
          </div>

          <!-- Статистика -->
          <div class="coin-stats">
            <div class="coin-card"><div class="label">Цена</div><div class="value" data-coin-price>—</div></div>
            <div class="coin-card"><div class="label">Рыночная капитализация</div><div class="value" data-coin-mcap>—</div></div>
            <div class="coin-card"><div class="label">24ч объём</div><div class="value" data-coin-vol>—</div></div>
            <div class="coin-card"><div class="label">Изменение 24ч</div><div class="value" data-coin-chg>—</div></div>
          </div>
          
          <!-- График -->
          <div class="coin-chart">
            <coingecko-coin-price-chart-widget coin-id="${id}" currency="usd" height="300" locale="ru"></coingecko-coin-price-chart-widget>
          </div>
        </div>
      </section>
    `;
  },

  loadWidget() {
    if (document.querySelector('script[src*="widgets.coingecko.com"]')) return;
    const s = document.createElement('script');
    s.src = 'https://widgets.coingecko.com/coingecko-coin-price-chart-widget.js';
    s.async = true; document.head.appendChild(s);
  },

  async loadData(id, vs) {
    try {
      const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
      const res = await fetch(url, { cache: 'no-cache' });
      const data = await res.json();
      const md = data.market_data || {};
      const fmt = (n, d=2) => (n==null? '—' : new Intl.NumberFormat('ru-RU',{maximumFractionDigits:d}).format(n));

      const bySel = (sel) => document.querySelector(sel);
      bySel('[data-coin-name]').textContent = data.name || id;
      bySel('[data-coin-price]').textContent = `$${fmt(md.current_price?.[vs], 6)}`;
      bySel('[data-coin-mcap]').textContent = `$${fmt(md.market_cap?.[vs], 0)}`;
      bySel('[data-coin-vol]').textContent = `$${fmt(md.total_volume?.[vs], 0)}`;
      const chg = md.price_change_percentage_24h;
      bySel('[data-coin-chg]').textContent = (chg==null? '—' : `${chg.toFixed(2)}%`);
      bySel('[data-coin-chg]').style.color = chg>0? '#4caf50' : (chg<0? '#f44336' : 'inherit');
      bySel('[data-coin-supply]').textContent = fmt(md.circulating_supply, 0);
    } catch (e) {
      console.warn('[COIN] Failed to load data:', e);
    }
  }
};


