#!/bin/sh
set -e

# Подставляем env-переменные из окружения пода в config.js
envsubst '${VITE_API} ${VITE_TELEGRAM_BOT}' \
  < /usr/share/nginx/html/config.js.template \
  > /usr/share/nginx/html/config.js

exec nginx -g "daemon off;"
