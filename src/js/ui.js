/**
 * GENESIS 1.1 - UI Utilities
 * Функции для работы с UI: stepper, loading states, toasts
 */

// ===== TOASTS =====

let toastContainer = null;

/**
 * Показать toast уведомление
 * @param {string} message - сообщение
 * @param {string} type - тип: 'success', 'error', 'info', 'warn'
 * @param {number} duration - длительность в мс (по умолчанию 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    `;
    toastContainer.setAttribute('role', 'alert');
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.style.cssText = `
    padding: 16px 20px;
    background: var(--surface-elevated);
    border: 1px solid;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    color: var(--text-0);
    font-size: var(--font-size-sm);
    animation: slideIn 0.3s ease-out;
  `;

  // Цвета по типу
  const colors = {
    success: 'var(--success)',
    error: 'var(--error)',
    info: 'var(--info)',
    warn: 'var(--warn)'
  };
  toast.style.borderColor = colors[type] || colors.info;

  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Автоудаление
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      toast.remove();
      if (toastContainer.children.length === 0) {
        toastContainer.remove();
        toastContainer = null;
      }
    }, 300);
  }, duration);
}

// Добавить анимации в head если их нет
if (!document.getElementById('toast-animations')) {
  const style = document.createElement('style');
  style.id = 'toast-animations';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// ===== STEPPER =====

let currentStep = 1;
const stepStates = new Map();

/**
 * Инициализировать stepper
 * @param {string} stepperId - ID элемента stepper (по умолчанию 'auth-steps')
 */
export function initStepper(stepperId = 'auth-steps') {
  const stepper = document.getElementById(stepperId);
  if (!stepper) {
    console.error(`Stepper element #${stepperId} not found`);
    return;
  }

  const steps = stepper.querySelectorAll('.step');
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    step.dataset.step = stepNumber;
    stepStates.set(stepNumber, 'idle');
  });

  // Активировать первый шаг
  setActiveStep(1);
}

/**
 * Установить активный шаг
 * @param {number} stepNumber - номер шага
 */
export function setActiveStep(stepNumber) {
  const steps = document.querySelectorAll('.step');

  steps.forEach((step) => {
    const num = parseInt(step.dataset.step);
    if (num === stepNumber) {
      step.classList.add('is-active');
      step.classList.remove('is-complete', 'is-error');
      currentStep = stepNumber;
    } else if (num < stepNumber) {
      step.classList.remove('is-active', 'is-error');
      step.classList.add('is-complete');
    } else {
      step.classList.remove('is-active', 'is-complete', 'is-error');
    }
  });
}

/**
 * Установить состояние шага
 * @param {number} stepNumber - номер шага
 * @param {string} state - состояние: 'idle', 'in-progress', 'success', 'error'
 */
export function setStepState(stepNumber, state) {
  const step = document.querySelector(`.step[data-step="${stepNumber}"]`);
  if (!step) {
    console.error(`Step ${stepNumber} not found`);
    return;
  }

  stepStates.set(stepNumber, state);

  // Удалить предыдущие классы состояний
  step.classList.remove('is-error', 'is-success');

  switch (state) {
    case 'error':
      step.classList.add('is-error');
      break;
    case 'success':
      step.classList.add('is-success');
      break;
    case 'in-progress':
      // Можно добавить спиннер или анимацию
      break;
    case 'idle':
    default:
      // Ничего не делаем
      break;
  }
}

/**
 * Перейти к следующему шагу
 */
export function nextStep() {
  const nextStepNumber = currentStep + 1;
  const nextStepEl = document.querySelector(`.step[data-step="${nextStepNumber}"]`);

  if (nextStepEl) {
    setActiveStep(nextStepNumber);
  }
}

/**
 * Вернуться к предыдущему шагу
 */
export function prevStep() {
  const prevStepNumber = currentStep - 1;

  if (prevStepNumber >= 1) {
    setActiveStep(prevStepNumber);
  }
}

// ===== LOADING STATES =====

/**
 * Установить состояние loading для элемента (обычно кнопки)
 * @param {HTMLElement} element - элемент
 * @param {boolean} isLoading - true для включения loading
 */
export function setLoading(element, isLoading) {
  if (!element) return;

  if (isLoading) {
    element.classList.add('is-loading');
    element.disabled = true;
  } else {
    element.classList.remove('is-loading');
    element.disabled = false;
  }
}

/**
 * Показать скелетон вместо элемента
 * @param {HTMLElement} element - элемент
 */
export function showSkeleton(element) {
  if (!element) return;
  element.classList.add('skeleton');
  element.setAttribute('aria-busy', 'true');
}

/**
 * Скрыть скелетон
 * @param {HTMLElement} element - элемент
 */
export function hideSkeleton(element) {
  if (!element) return;
  element.classList.remove('skeleton');
  element.setAttribute('aria-busy', 'false');
}

// ===== UTILITY FUNCTIONS =====

/**
 * Toggle элемент
 * @param {HTMLElement} element - элемент
 * @param {boolean} show - показать (true) или скрыть (false)
 */
export function toggle(element, show) {
  if (!element) return;

  if (show === undefined) {
    element.classList.toggle('hidden');
  } else {
    element.classList.toggle('hidden', !show);
  }
}

/**
 * Disable/Enable элемент
 * @param {HTMLElement} element - элемент
 * @param {boolean} disabled - true для disable
 */
export function setDisabled(element, disabled) {
  if (!element) return;

  element.disabled = disabled;
  element.setAttribute('aria-disabled', String(disabled));
}

/**
 * Показать/скрыть группу элементов
 * @param {string} selector - селектор
 * @param {boolean} show - показать или скрыть
 */
export function toggleGroup(selector, show) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => toggle(el, show));
}

/**
 * Создать элемент из HTML строки
 * @param {string} html - HTML строка
 * @returns {HTMLElement} - созданный элемент
 */
export function createElementFromHTML(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

/**
 * Добавить event listener с автоматической отпиской
 * @param {HTMLElement} element - элемент
 * @param {string} event - событие
 * @param {Function} handler - обработчик
 * @param {object} options - опции
 * @returns {Function} - функция для отписки
 */
export function on(element, event, handler, options = {}) {
  if (!element || !event || !handler) return () => {};

  element.addEventListener(event, handler, options);

  return () => {
    element.removeEventListener(event, handler, options);
  };
}

// ===== ЭКСПОРТ ВСПОМОГАТЕЛЬНЫХ ФУНКЦИЙ =====

export default {
  showToast,
  initStepper,
  setActiveStep,
  setStepState,
  nextStep,
  prevStep,
  setLoading,
  showSkeleton,
  hideSkeleton,
  toggle,
  setDisabled,
  toggleGroup,
  createElementFromHTML,
  on
};
