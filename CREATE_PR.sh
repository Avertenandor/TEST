#!/bin/bash
# Скрипт для создания Pull Request

echo "🚀 Создание Pull Request..."
echo ""

gh pr create \
  --title "feat(ui): unify entrypoint, dark theme, stepper, wallet validation, trust badges, manual chart, pwa, rpc-thrift" \
  --body-file PR_DESCRIPTION.md \
  --base main \
  --head claude/ui-ux-prod-refactor-011CUY5Fg1TGj5z5joQhF9dG

echo ""
echo "✅ Pull Request создан!"
