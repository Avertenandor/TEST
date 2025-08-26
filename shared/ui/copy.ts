// shared/ui/copy.ts
// Компонент для копирования текста в буфер обмена

export interface CopyProps {
    text: string;
    label?: string;
    successMessage?: string;
    errorMessage?: string;
    className?: string;
}

export class Copy {
    private element: HTMLElement | null = null;
    private props: CopyProps;

    constructor(props: CopyProps) {
        this.props = {
            label: 'Копировать',
            successMessage: 'Скопировано!',
            errorMessage: 'Ошибка копирования',
            ...props
        };
    }

    mount(el: HTMLElement): void {
        this.element = el;
        this.render();
        this.bindEvents();
    }

    unmount(): void {
        if (this.element) {
            this.element.innerHTML = '';
            this.element = null;
        }
    }

    private render(): void {
        if (!this.element) return;

        const { text, label, className } = this.props;
        
        const baseClass = 'ui-copy';
        const customClass = className || '';

        this.element.innerHTML = `
            <div class="${baseClass} ${customClass}">
                <span class="ui-copy__text">${text}</span>
                <button class="ui-copy__button" data-text="${text}">
                    ${label}
                </button>
            </div>
        `;
    }

    private bindEvents(): void {
        if (!this.element) return;

        const button = this.element.querySelector('.ui-copy__button');
        if (button) {
            button.addEventListener('click', this.handleCopy.bind(this));
        }
    }

    private async handleCopy(event: Event): Promise<void> {
        event.preventDefault();
        
        const button = event.target as HTMLButtonElement;
        const text = button.dataset.text || this.props.text;
        
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess();
        } catch (error) {
            console.error('Copy failed:', error);
            this.showError();
        }
    }

    private showSuccess(): void {
        if (!this.element) return;

        const button = this.element.querySelector('.ui-copy__button') as HTMLButtonElement;
        if (button) {
            const originalText = button.textContent;
            button.textContent = this.props.successMessage;
            button.classList.add('ui-copy__button--success');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('ui-copy__button--success');
            }, 2000);
        }
    }

    private showError(): void {
        if (!this.element) return;

        const button = this.element.querySelector('.ui-copy__button') as HTMLButtonElement;
        if (button) {
            const originalText = button.textContent;
            button.textContent = this.props.errorMessage;
            button.classList.add('ui-copy__button--error');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('ui-copy__button--error');
            }, 2000);
        }
    }

    updateProps(newProps: Partial<CopyProps>): void {
        this.props = { ...this.props, ...newProps };
        if (this.element) {
            this.render();
            this.bindEvents();
        }
    }
}

// Функция для создания компонента копирования
export function createCopy(props: CopyProps): Copy {
    return new Copy(props);
}

// Функция для рендера компонента копирования в контейнер
export function renderCopy(container: HTMLElement, props: CopyProps): Copy {
    const copy = new Copy(props);
    copy.mount(container);
    return copy;
}