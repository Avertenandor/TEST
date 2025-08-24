/**
 * MCP-MARKER:COMPONENT:GENESIS_TERMINAL_WEB_COMPONENT - Веб-компонент терминала с Shadow DOM
 */
(function(){
  class GenesisTerminalElement extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      // Хосту добавим класс, чтобы внешние стили могли применяться
      this.classList.add('genesis-terminal');
  this._drag = { active: false, sx: 0, sy: 0, x: 0, y: 0 };
  this._resize = { active: false, sx: 0, sy: 0, w: 0, h: 0 };
  this._focusTrapHandler = this._onKeydownTrap.bind(this);
    }

    connectedCallback() {
      // Рендер базового шаблона
      this._render();
      // Монтаж существующего API внутрь шэдоу
      this._mountTerminal();
  // Восстановление позиции
  this._restorePosition();
  // Настройка перетаскивания
  this._enableDrag();
  // Восстановление размера
  this._restoreSize();
  // Настройка изменения размера
  this._enableResize();
  // Фокус‑трап для полноэкранного режима
  window.addEventListener('keydown', this._focusTrapHandler, true);
    }

    _render() {
      const style = document.createElement('style');
      style.textContent = `
        :host { position: fixed; right: 16px; bottom: 64px; width: 560px; max-width: 96vw; z-index: 1200; }
        .wrap { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
        .terminal-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--border-color); }
        .terminal-title { font-weight: 700; color: var(--primary-color); font-family: 'Rajdhani', 'Segoe UI', sans-serif; }
  .terminal-controls { display: flex; gap: 8px; align-items: center; }
  .terminal-search { display: flex; align-items: center; gap: 6px; margin-left: 12px; }
  .terminal-search input { background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 8px; padding: 6px 8px; min-width: 140px; }
  .chips { display: flex; gap: 6px; flex-wrap: wrap; margin: 6px 12px 8px; }
  .chip { font-size: 12px; padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 999px; cursor: pointer; user-select: none; background: var(--bg-tertiary); color: var(--text-secondary); }
  .chip.active { background: var(--primary-10, rgba(255,102,0,.12)); color: var(--primary-color); border-color: var(--primary-color); }
        .terminal-controls button { background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 8px; padding: 6px 8px; cursor: pointer; }
        .terminal-body { max-height: 320px; overflow: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  .terminal-body.virtual { position: relative; }
  .virtual-spacer { height: 0; }
  .virtual-viewport { position: absolute; left: 0; right: 0; top: 0; will-change: transform; }
  .terminal-message { display: flex; gap: 8px; padding: 6px 12px; box-sizing: border-box; min-height: 22px; }
  .terminal-message .msg-meta { color: var(--text-secondary); min-width: 90px; display: inline-flex; gap: 6px; }
        .terminal-input-container { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-top: 1px solid var(--border-color); }
        .terminal-input { flex: 1; background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 8px; }
        .terminal-prompt { color: var(--secondary-color); font-weight: 600; }
        .resize-grip { position: absolute; right: 4px; bottom: 4px; width: 14px; height: 14px; cursor: nwse-resize; opacity: .7; }
        .resize-grip::before { content: ''; position: absolute; right: 2px; bottom: 2px; width: 10px; height: 10px; border-right: 2px solid var(--border-color); border-bottom: 2px solid var(--border-color); }
  .terminal-status { font-size: 12px; color: var(--text-secondary); padding: 6px 12px; border-top: 1px dashed var(--border-color); background: var(--bg-tertiary); }

  /* Dock modes */
  :host(.mode-dock-bottom) { left: 0 !important; right: 0 !important; bottom: 0 !important; top: auto !important; width: 100vw !important; max-width: 100vw !important; }
  :host(.mode-dock-bottom) .terminal-body { max-height: calc(40vh); }
  :host(.mode-dock-bottom) .resize-grip { display: none; }

  :host(.mode-dock-right) { right: 0 !important; top: 0 !important; bottom: 0 !important; left: auto !important; width: 420px !important; max-width: 420px !important; height: 100vh !important; }
  :host(.mode-dock-right) .terminal-body { max-height: calc(100vh - 140px); }
  :host(.mode-dock-right) .resize-grip { display: none; }
      `;
      const wrap = document.createElement('div');
      wrap.className = 'wrap';
      wrap.innerHTML = `
        <div class="terminal-header" role="toolbar" aria-label="Управление терминалом">
          <div class="terminal-title" aria-hidden="true">GENESIS Terminal</div>
          <div class="terminal-controls">
            <span id="terminal-error-badge" class="badge" aria-label="Ошибки" title="Количество ошибок" style="display:none;min-width:20px;height:20px;line-height:20px;text-align:center;border-radius:999px;background:#8b0000;color:#fff;font-size:12px;">0</span>
            <button id="terminal-btn-minimize" title="Свернуть" aria-label="Свернуть терминал">_</button>
            <button id="terminal-btn-fullscreen" title="Полноэкранный режим" aria-label="Полноэкранный режим">⬜</button>
            <button id="terminal-btn-stats" title="Статистика" aria-label="Показать статистику">📊</button>
            <button id="terminal-btn-dock" title="Режим докинга" aria-label="Переключить режим докинга">🧷</button>
            <button id="terminal-btn-copy" title="Копировать логи" aria-label="Копировать логи">📋</button>
            <button id="terminal-btn-clear" title="Очистить" aria-label="Очистить логи">🗑️</button>
            <button id="terminal-btn-export" title="Экспорт" aria-label="Экспорт логов">💾</button>
            <div class="terminal-search" role="search">
              <input id="terminal-search" type="search" placeholder="Поиск (Ctrl+F)" aria-label="Поиск по логам" />
            </div>
          </div>
        </div>
        <div class="chips" id="terminal-chips" aria-label="Быстрые фильтры">
          <div class="chip" data-type="info">info</div>
          <div class="chip" data-type="success">success</div>
          <div class="chip" data-type="warning">warning</div>
          <div class="chip" data-type="error">error</div>
          <div class="chip" data-type="debug">debug</div>
          <div class="chip" data-type="system">system</div>
          <div class="chip" data-type="api">api</div>
          <div class="chip" data-type="transaction">transaction</div>
          <div class="chip" data-type="security">security</div>
          <div class="chip" data-type="critical">critical</div>
        </div>
        <div id="terminal-stats" class="terminal-stats" style="display:none"></div>
        <div id="genesis-terminal-body" class="terminal-body" role="log" aria-live="polite" aria-relevant="additions"></div>
        <div class="terminal-input-container">
          <span class="terminal-prompt" aria-hidden="true">GENESIS ></span>
          <input id="terminalInput" class="terminal-input" placeholder="Введите команду (help для справки)" aria-label="Строка ввода команды терминала" />
        </div>
  <div class="resize-grip" aria-hidden="true"></div>
  <div id="terminal-status" class="terminal-status" aria-live="polite"></div>
      `;
      this._shadow.innerHTML = '';
      this._shadow.append(style, wrap);
    }

    _mountTerminal() {
      const mountWhenReady = () => {
        if (!window.GenesisTerminal || typeof window.GenesisTerminal.mount !== 'function') {
          requestAnimationFrame(mountWhenReady);
          return;
        }
        try {
          window.GenesisTerminal.mount(this._shadow);
          if (!window.GenesisTerminal.state?.isInitialized) {
            window.GenesisTerminal.init();
          }
            // Привязка поиска
            const search = this._shadow.getElementById('terminal-search');
            if (search) {
              const saved = sessionStorage.getItem('genesis-terminal-search');
              if (saved) search.value = saved;
              search.addEventListener('input', () => window.GenesisTerminal.setSearchQuery(search.value));
            }
            // Привязка чипсов фильтров
            const chips = this._shadow.getElementById('terminal-chips');
            if (chips) {
              const sync = () => {
                chips.querySelectorAll('.chip').forEach(ch => {
                  const t = ch.getAttribute('data-type');
                  if (t) ch.classList.toggle('active', !!window.GenesisTerminal.config.filters[t]);
                });
              };
              chips.addEventListener('click', (e) => {
                const target = e.target.closest('.chip');
                if (!target) return;
                const t = target.getAttribute('data-type');
                if (!t) return;
                window.GenesisTerminal.toggleFilter(t);
                sync();
              });
              sync();
            }
        } catch(e) {
          console.error('GenesisTerminal mount failed:', e);
        }
      };
      mountWhenReady();
    }

    _enableDrag() {
      const header = this._shadow.querySelector('.terminal-header');
      if (!header) return;
      const onDown = (e) => {
        this._drag.active = true;
        this._drag.sx = e.clientX;
        this._drag.sy = e.clientY;
        const rect = this.getBoundingClientRect();
        this._drag.x = rect.left;
        this._drag.y = rect.top;
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp, { once: true });
      };
      const onMove = (e) => {
        if (!this._drag.active) return;
        const dx = e.clientX - this._drag.sx;
        const dy = e.clientY - this._drag.sy;
        const nx = Math.max(0, Math.min(window.innerWidth - this.offsetWidth, this._drag.x + dx));
        const ny = Math.max(0, Math.min(window.innerHeight - this.offsetHeight, this._drag.y + dy));
        this.style.left = nx + 'px';
        this.style.top = ny + 'px';
        this.style.right = 'auto';
        this.style.bottom = 'auto';
      };
      const onUp = () => {
        this._drag.active = false;
        document.removeEventListener('mousemove', onMove);
        this._savePosition();
      };
      header.addEventListener('mousedown', onDown);
    }

    _savePosition() {
      try {
        const rect = this.getBoundingClientRect();
        const pos = { x: rect.left, y: rect.top };
        localStorage.setItem('genesis-terminal-pos', JSON.stringify(pos));
      } catch {}
    }

    _restorePosition() {
      try {
        const raw = localStorage.getItem('genesis-terminal-pos');
        if (!raw) return;
        const pos = JSON.parse(raw);
        if (typeof pos.x === 'number' && typeof pos.y === 'number') {
          this.style.left = pos.x + 'px';
          this.style.top = pos.y + 'px';
          this.style.right = 'auto';
          this.style.bottom = 'auto';
        }
      } catch {}
    }

    _enableResize() {
      const grip = this._shadow.querySelector('.resize-grip');
      if (!grip) return;
      const onDown = (e) => {
        e.preventDefault();
        this._resize.active = true;
        this._resize.sx = e.clientX;
        this._resize.sy = e.clientY;
        this._resize.w = this.offsetWidth;
        this._resize.h = this.offsetHeight;
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp, { once: true });
      };
      const onMove = (e) => {
        if (!this._resize.active) return;
        const dw = e.clientX - this._resize.sx;
        const dh = e.clientY - this._resize.sy;
        const nw = Math.max(360, this._resize.w + dw);
        const nh = Math.max(220, this._resize.h + dh);
        this.style.width = nw + 'px';
        // Высоту меняем за счёт тела (wrap содержит контент), поэтому меняем высоту тела
        const body = this._shadow.getElementById('genesis-terminal-body');
        if (body) body.style.maxHeight = Math.max(160, nh - 120) + 'px';
      };
      const onUp = () => {
        this._resize.active = false;
        document.removeEventListener('mousemove', onMove);
        this._saveSize();
      };
      grip.addEventListener('mousedown', onDown);
    }

    _saveSize() {
      try {
        const w = this.offsetWidth;
        const body = this._shadow.getElementById('genesis-terminal-body');
        const h = body ? parseInt(getComputedStyle(body).maxHeight || '0', 10) + 120 : null;
        const size = { w, h };
        localStorage.setItem('genesis-terminal-size', JSON.stringify(size));
      } catch {}
    }

    _restoreSize() {
      try {
        const raw = localStorage.getItem('genesis-terminal-size');
        if (!raw) return;
        const size = JSON.parse(raw);
        if (size?.w) this.style.width = size.w + 'px';
        if (size?.h) {
          const body = this._shadow.getElementById('genesis-terminal-body');
          if (body) body.style.maxHeight = Math.max(160, size.h - 120) + 'px';
        }
      } catch {}
    }

    _getFocusable() {
      return Array.from(this._shadow.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
    }

    _onKeydownTrap(e) {
      try {
        if (!window.GenesisTerminal?.state?.isFullscreen) return;
        if (e.key !== 'Tab') return;
        // Трапим фокус внутри шэдоу, когда терминал в фуллскрине
        const focusables = this._getFocusable();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = this._shadow.activeElement || document.activeElement;
        if (e.shiftKey) {
          if (active === first || !this.contains(active)) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (active === last || !this.contains(active)) {
            first.focus();
            e.preventDefault();
          }
        }
      } catch {}
    }
  }

  if (!customElements.get('genesis-terminal')) {
    customElements.define('genesis-terminal', GenesisTerminalElement);
  }
})();
