// shared/ui/button.ts
// Переиспользуемый компонент кнопки

export interface ButtonProps {
    text: string;
    type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    onClick?: (event: MouseEvent) => void;
    href?: string;
    target?: string;
    className?: string;
}

export class Button {
    private element: HTMLElement | null = null;
    private props: ButtonProps;

    constructor(props: ButtonProps) {
        this.props = {
            type: 'primary',
            size: 'medium',
            disabled: false,
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

        const { text, type, size, disabled, href, target, className } = this.props;
        
        const baseClass = 'ui-button';
        const typeClass = `ui-button--${type}`;
        const sizeClass = `ui-button--${size}`;
        const disabledClass = disabled ? 'ui-button--disabled' : '';
        const customClass = className || '';

        const classes = [baseClass, typeClass, sizeClass, disabledClass, customClass]
            .filter(Boolean)
            .join(' ');

        if (href) {
            this.element.innerHTML = `
                <a href="${href}" 
                   class="${classes}" 
                   ${target ? `target="${target}"` : ''}
                   ${disabled ? 'aria-disabled="true"' : ''}>
                    ${text}
                </a>
            `;
        } else {
            this.element.innerHTML = `
                <button class="${classes}" 
                        ${disabled ? 'disabled' : ''}>
                    ${text}
                </button>
            `;
        }
    }

    private bindEvents(): void {
        if (!this.element || this.props.disabled) return;

        const button = this.element.querySelector('button, a');
        if (button && this.props.onClick) {
            button.addEventListener('click', this.props.onClick);
        }
    }

    updateProps(newProps: Partial<ButtonProps>): void {
        this.props = { ...this.props, ...newProps };
        if (this.element) {
            this.render();
            this.bindEvents();
        }
    }
}

// Функция для создания кнопки
export function createButton(props: ButtonProps): Button {
    return new Button(props);
}

// Функция для рендера кнопки в контейнер
export function renderButton(container: HTMLElement, props: ButtonProps): Button {
    const button = new Button(props);
    button.mount(container);
    return button;
}