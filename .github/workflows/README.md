# Workflows

Этот проект использует встроенный GitHub Pages workflow для автоматического деплоя.

## Настройка в GitHub:

1. Зайдите в Settings → Pages
2. Source: выберите "GitHub Actions"
3. GitHub автоматически будет деплоить из папки `dist/`

## Ручной деплой:

Просто запустите:
```bash
npm run build
```

Файлы будут в папке `dist/` и готовы к деплою.

