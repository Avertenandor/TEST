// shared/components/terminal/bootstrap.js
// Универсальный bootstrap терминала: глобальные перехватчики + ленивое подключение UI

(function initTerminalBootstrap(){
  if (window.__terminalBootstrapLoaded) return; window.__terminalBootstrapLoaded = true;

  // 1) Глобальные перехватчики (если ещё не установлены)
  if (!window.__terminalInterceptorsInstalled) {
    try { window.__terminalInterceptorsInstalled = true; } catch {}
    window.__terminalBuffer = window.__terminalBuffer || [];
    const levels = ['trace','debug','log','info','warn','error'];
    const orig = {}; levels.forEach(l => orig[l] = console[l]);
    levels.forEach(level => { console[level] = function(...args){ try{orig[level].apply(console,args);}catch{} try{
      const msg = args.map(a=>{ try{return typeof a==='string'?a:JSON.stringify(a);}catch{return String(a);} }).join(' ');
      const entry = { ts: Date.now(), level, source:'console', message: msg };
      window.__terminalBuffer.push(entry);
      window.CabinetTerminal?.logFromInterceptor?.(entry);
    }catch{} }; });
    window.addEventListener('error', function(e){ try{
      const isRes = e.target && (e.target.tagName==='IMG'||e.target.tagName==='SCRIPT'||e.target.tagName==='LINK');
      const entry = isRes ? { ts:Date.now(), level:'error', source:'resource', message:`Resource load error: <${e.target.tagName.toLowerCase()}> ${e.target.src||e.target.href||''}`}
                          : { ts:Date.now(), level:'error', source:'onerror', message:e.message||'Unhandled error', details:{filename:e.filename,lineno:e.lineno,colno:e.colno} };
      window.__terminalBuffer.push(entry); window.CabinetTerminal?.logFromInterceptor?.(entry);
    }catch{} }, true);
    window.addEventListener('unhandledrejection', function(e){ try{
      const r = e.reason; const m = (r&&(r.message||r.toString&&r.toString()))||'Unhandled promise rejection';
      const entry = { ts:Date.now(), level:'error', source:'unhandledrejection', message:String(m) };
      window.__terminalBuffer.push(entry); window.CabinetTerminal?.logFromInterceptor?.(entry);
    }catch{} });
    const ofetch = window.fetch?.bind(window);
    if (ofetch){ window.fetch = async function(input, init){ const st=performance.now(); let url=''; try{url=typeof input==='string'?input:(input?.url||'');}catch{} const method=(init&&init.method)||'GET';
      try{ const resp = await ofetch(input, init); const dur=Math.round(performance.now()-st); const entry={ts:Date.now(),level:(resp.ok?'log':'warn'),source:'fetch',message:`${method} ${url} -> ${resp.status} (${dur}ms)`}; window.__terminalBuffer.push(entry); window.CabinetTerminal?.logFromInterceptor?.(entry); return resp; }
      catch(err){ const dur=Math.round(performance.now()-st); const entry={ts:Date.now(),level:'error',source:'fetch',message:`${method} ${url} -> network error (${dur}ms): ${err?.message||err}`}; window.__terminalBuffer.push(entry); window.CabinetTerminal?.logFromInterceptor?.(entry); throw err; }
    }; }
    const XHR = window.XMLHttpRequest; if (XHR){ const open=XHR.prototype.open, send=XHR.prototype.send; XHR.prototype.open=function(method,url){ this.__terminal={method,url,start:0}; return open.apply(this,arguments); }; XHR.prototype.send=function(body){ if(this.__terminal) this.__terminal.start=performance.now(); this.addEventListener('loadend',()=>{ try{ const t=this.__terminal||{method:'GET',url:''}; const dur=t.start?Math.round(performance.now()-t.start):0; const entry={ts:Date.now(), level:(this.status>=400?'warn':'log'), source:'xhr', message:`${t.method} ${t.url} -> ${this.status} (${dur}ms)`}; window.__terminalBuffer.push(entry); window.CabinetTerminal?.logFromInterceptor?.(entry); }catch{} }); return send.apply(this,arguments); } };
    window.addEventListener('submit',(e)=>{ try{ const f=e.target; const prevented=e.defaultPrevented; const entry={ts:Date.now(),level:prevented?'warn':'info',source:'form',message:`form submit${prevented?' (prevented)':''}: ${f?.name||f?.id||f?.action||''}`}; window.__terminalBuffer.push(entry); window.CabinetTerminal?.logFromInterceptor?.(entry); }catch{} }, true);
    window.addEventListener('invalid',(e)=>{ try{ const el=e.target; const entry={ts:Date.now(),level:'warn',source:'form',message:`invalid field: ${el?.name||el?.id||el?.tagName}`}; window.__terminalBuffer.push(entry); window.CabinetTerminal?.logFromInterceptor?.(entry); }catch{} }, true);
  }

  // 2) Публичный API с ленивой инициализацией UI
  const ensureStyles = () => {
    const need = './modules/terminal/terminal.styles.css';
    if (!document.querySelector(`link[href*="terminal.styles.css"]`)){
      const l=document.createElement('link'); 
      l.rel='stylesheet'; 
      l.href=need; 
      // КРИТИЧНО: Не блокируем инициализацию если CSS не загрузился
      l.onerror = () => { console.warn('Terminal styles not found, continuing without them'); };
      // КРИТИЧНО: Загружаем CSS асинхронно
      l.media = 'print';
      l.onload = () => { l.media = 'all'; };
      document.head.appendChild(l);
    }
  };
  const ensureTemplate = async () => {
    if (document.getElementById('cabinet-genesis-terminal')) return;
    try{
      // Таймаут для загрузки (5 секунд)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const resp = await fetch('./modules/terminal/terminal.template.html', { 
        cache:'no-store', 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const html = await resp.text();
      const wrap = document.createElement('div'); wrap.innerHTML = html;
      document.body.appendChild(wrap.firstElementChild);
    }catch(e){ 
      if (e.name === 'AbortError') {
        console.warn('Terminal template load timeout (5s), continuing without terminal UI');
      } else {
        console.warn('Terminal template load failed, continuing without terminal UI:', e);
      }
      // Не блокируем работу сайта если терминал не загрузился
    }
  };
  const ensureScript = () => new Promise((res, rej)=>{
    if (window.CabinetTerminal) return res();
    const s = document.createElement('script'); s.src = './modules/terminal/terminal.module.js'; s.onload=()=>res(); s.onerror=()=>rej(new Error('terminal.module.js failed')); document.head.appendChild(s);
  });
  async function ensureUI(){ 
    try{ 
      ensureStyles(); 
      // Не блокируем основную загрузку страницы
      Promise.all([
        ensureTemplate().catch(e => console.warn('Template load error:', e)),
        ensureScript().catch(e => console.warn('Script load error:', e))
      ]).then(() => {
        if (window.CabinetTerminal && !window.CabinetTerminal.state?.isInitialized){ 
          window.CabinetTerminal.init(); 
        }
      }).catch(e => console.warn('Terminal init error (non-blocking):', e));
    } catch(e){ 
      console.warn('Terminal UI init failed (non-blocking):', e); 
    } 
  }

  // Минимальный API до загрузки UI
  window.GenesisTerminal = window.GenesisTerminal || {
    show: () => ensureUI(),
    hide: () => { const c=document.getElementById('cabinet-genesis-terminal'); if (c) c.style.display='none'; },
    toggle: async () => { await ensureUI(); const c=document.getElementById('cabinet-genesis-terminal'); if (c) c.style.display = (c.style.display==='none'?'':'none'); },
    clear: (...a) => { if (window.CabinetTerminal) window.CabinetTerminal.clear(); },
    copyAll: (...a) => { if (window.CabinetTerminal) window.CabinetTerminal.copyAll(); },
    exportLogs: (...a) => { if (window.CabinetTerminal) window.CabinetTerminal.exportLogs(); },
    minimize: (...a) => { if (window.CabinetTerminal) window.CabinetTerminal.minimize(); },
    toggleFullscreen: (...a) => { if (window.CabinetTerminal) window.CabinetTerminal.toggleFullscreen(); },
    toggleStats: (...a) => { if (window.CabinetTerminal) window.CabinetTerminal.toggleStats(); },
    toggleTheme: (...a) => { if (window.CabinetTerminal) window.CabinetTerminal.toggleTheme(); },
    search: (q) => { if (window.CabinetTerminal) window.CabinetTerminal.search(q); },
    toggleFilter: (k) => { if (window.CabinetTerminal) window.CabinetTerminal.toggleFilter(k); }
  };

  // 3) Автоинициализация UI после готовности DOM (не блокирующая)
  // КРИТИЧНО: На лендинге НЕ инициализируем терминал - он не нужен
  const initTerminalDelayed = () => {
    // КРИТИЧНО: На лендинге пропускаем инициализацию терминала
    if (window.GENESIS_LANDING) {
      console.log('🌐 Лендинг: терминал не требуется - пропускаем автоинициализацию');
      return;
    }
    
    setTimeout(() => {
      try {
        ensureUI(); 
        startLandingStatsSync();
      } catch(e) {
        console.warn('Delayed terminal init error (non-blocking):', e);
      }
    }, 5000); // Увеличено с 100мс до 5 секунд - терминал загружается после основной страницы
  };
  
  // КРИТИЧНО: На лендинге НЕ запускаем автоинициализацию
  if (!window.GENESIS_LANDING) {
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', initTerminalDelayed);
    } else {
      initTerminalDelayed();
    }
  }

})();

// Синхронизация статистики лендинга с модульным терминалом (не мешает, если DOM-элементов нет)
function startLandingStatsSync(){
  try {
    const update = () => {
      const t = window.CabinetTerminal;
      if (!t) return;
      const msgEl = document.getElementById('messageCount');
      if (msgEl) msgEl.textContent = String(t.stats?.messageCount ?? t.messages?.length ?? 0);
      const upEl = document.getElementById('uptime');
      if (upEl && typeof t.getSessionTime === 'function') upEl.textContent = t.getSessionTime();
      const memEl = document.getElementById('memoryUsage');
      if (memEl && performance && 'memory' in performance) {
        const m = performance.memory; memEl.textContent = `${Math.round(m.usedJSHeapSize/1024/1024)}MB`;
      }
    };
    setInterval(update, 1000);
  } catch {}
}
