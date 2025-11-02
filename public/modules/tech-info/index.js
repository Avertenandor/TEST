export default {
  async mount(root) {
    const r = await fetch('/public/modules/tech-info/template.html');
    root.innerHTML = await r.text();
    this.initTechInfo(root);
    return () => { root.innerHTML = ''; };
  },

  initTechInfo(root) {
    // Определяем характеристики устройства
    const platform = navigator.platform || 'Unknown';
    const userAgent = navigator.userAgent;
    const memory = navigator.deviceMemory || 'Unknown';
    const cores = navigator.hardwareConcurrency || 'Unknown';
    
    // Обновляем DOM
    this.updateElement(root, '#device-platform', platform);
    this.updateElement(root, '#device-cores', cores);
    this.updateElement(root, '#device-memory', `${memory} GB`);
    this.updateElement(root, '#device-browser', this.getBrowserName(userAgent));
    this.updateElement(root, '#device-connection', this.getConnectionType());
    
    // Рассчитываем потенциальный доход
    const earnings = this.calculateEarnings(cores, memory);
    this.updateElement(root, '#device-potential-earnings', earnings);
  },

  updateElement(root, selector, value) {
    const el = root.querySelector(selector);
    if (el) el.textContent = value;
  },

  getBrowserName(ua) {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  },

  getConnectionType() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return conn ? conn.effectiveType || 'Unknown' : 'Unknown';
  },

  calculateEarnings(cores, memory) {
    const c = parseInt(cores) || 4;
    const m = parseFloat(memory) || 4;
    const base = (c * 0.1 + m * 0.05) * 30; // примерная формула
    return `~${base.toFixed(2)} PLEX/месяц`;
  }
};
