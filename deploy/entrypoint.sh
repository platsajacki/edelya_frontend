#!/bin/sh
set -e

# Подставляем env-переменные из окружения пода в config.js
envsubst '${VITE_API} ${VITE_TELEGRAM_BOT}' \
  < /usr/share/nginx/html/config.js.template \
  > /usr/share/nginx/html/config.js

VITE_SITE_URL="${VITE_SITE_URL:-https://edelya.corpdi.com}"
VITE_SITE_URL="${VITE_SITE_URL%/}"
export VITE_SITE_URL

envsubst '${VITE_SITE_URL}' \
  < /usr/share/nginx/html/index.html \
  > /usr/share/nginx/html/index.html.tmp
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

exec nginx -g "daemon off;"
