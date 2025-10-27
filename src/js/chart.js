/**
 * GENESIS 1.1 - Chart Module
 * Простой SVG-спарклайн для графика цены
 * Без автоматических обновлений - только ручное обновление
 */

import { showToast } from './ui.js';

/**
 * Создать SVG sparkline график
 * @param {HTMLElement} container - контейнер для графика
 * @returns {object} - объект с методами для работы с графиком
 */
export function initChart(container) {
  if (!container) {
    console.error('Chart container is required');
    return null;
  }

  const state = {
    data: [],
    width: container.offsetWidth || 600,
    height: container.offsetHeight || 260,
    svg: null
  };

  /**
   * Создать SVG элемент
   */
  function createSVG() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${state.width} ${state.height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.cssText = 'display: block; width: 100%; height: 100%;';

    // Фон
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'var(--bg-1)');
    svg.appendChild(rect);

    container.innerHTML = '';
    container.appendChild(svg);
    state.svg = svg;
  }

  /**
   * Установить данные и отрисовать график
   * @param {Array<{time: number, value: number}>} data - массив точек
   */
  function setData(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      showPlaceholder('Нет данных для отображения');
      return;
    }

    state.data = data;
    render();
  }

  /**
   * Показать placeholder
   * @param {string} message - сообщение
   */
  function showPlaceholder(message) {
    if (!state.svg) {
      createSVG();
    }

    // Очистить всё кроме фона
    while (state.svg.children.length > 1) {
      state.svg.removeChild(state.svg.lastChild);
    }

    // Добавить текст
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '50%');
    text.setAttribute('y', '50%');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', 'var(--text-muted)');
    text.setAttribute('font-size', '16');
    text.textContent = message;
    state.svg.appendChild(text);
  }

  /**
   * Отрисовать график
   */
  function render() {
    if (!state.data || state.data.length === 0) {
      showPlaceholder('Нет данных');
      return;
    }

    if (!state.svg) {
      createSVG();
    }

    // Очистить всё кроме фона
    while (state.svg.children.length > 1) {
      state.svg.removeChild(state.svg.lastChild);
    }

    const values = state.data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const padding = 20;
    const width = state.width - padding * 2;
    const height = state.height - padding * 2;

    // Построить path для линии
    const points = state.data.map((d, i) => {
      const x = padding + (i / (state.data.length - 1)) * width;
      const y = padding + height - ((d.value - min) / range) * height;
      return `${x},${y}`;
    });

    const pathData = `M ${points.join(' L ')}`;

    // Создать gradient для заливки
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'chart-gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', 'stop-color: var(--accent); stop-opacity: 0.4');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('style', 'stop-color: var(--accent); stop-opacity: 0');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    state.svg.appendChild(defs);

    // Создать область заливки
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const areaData = `${pathData} L ${padding + width},${padding + height} L ${padding},${padding + height} Z`;
    areaPath.setAttribute('d', areaData);
    areaPath.setAttribute('fill', 'url(#chart-gradient)');
    state.svg.appendChild(areaPath);

    // Создать линию
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', pathData);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', 'var(--accent)');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    state.svg.appendChild(line);

    // Добавить точки на концах
    const firstPoint = state.data[0];
    const lastPoint = state.data[state.data.length - 1];

    [
      { x: padding, y: padding + height - ((firstPoint.value - min) / range) * height },
      { x: padding + width, y: padding + height - ((lastPoint.value - min) / range) * height }
    ].forEach(({ x, y }) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', 'var(--accent)');
      state.svg.appendChild(circle);
    });

    // Добавить подписи min/max
    const textMin = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textMin.setAttribute('x', padding);
    textMin.setAttribute('y', padding + height + 15);
    textMin.setAttribute('fill', 'var(--text-muted)');
    textMin.setAttribute('font-size', '12');
    textMin.textContent = `$${min.toFixed(4)}`;
    state.svg.appendChild(textMin);

    const textMax = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textMax.setAttribute('x', padding + width);
    textMax.setAttribute('y', padding - 5);
    textMax.setAttribute('fill', 'var(--text-muted)');
    textMax.setAttribute('font-size', '12');
    textMax.setAttribute('text-anchor', 'end');
    textMax.textContent = `$${max.toFixed(4)}`;
    state.svg.appendChild(textMax);
  }

  /**
   * Обновить размеры при resize
   */
  function resize() {
    state.width = container.offsetWidth || 600;
    state.height = container.offsetHeight || 260;

    if (state.svg) {
      state.svg.setAttribute('viewBox', `0 0 ${state.width} ${state.height}`);
      render();
    }
  }

  // Инициализация
  createSVG();
  showPlaceholder('График готов к загрузке данных');

  return {
    setData,
    resize,
    clear: () => showPlaceholder('График очищен')
  };
}

/**
 * Генерация мок-данных для демонстрации
 * @param {number} points - количество точек
 * @returns {Array} - массив данных
 */
export function generateMockData(points = 50) {
  const now = Date.now();
  const data = [];
  let value = 1.0;

  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.5) * 0.05;
    value = Math.max(0.5, Math.min(2.0, value)); // Ограничиваем диапазон

    data.push({
      time: now - (points - i) * 3600000, // Каждый час назад
      value
    });
  }

  return data;
}

export default {
  initChart,
  generateMockData
};
