#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/buhariy
REPO_URL=https://github.com/KomilovDev96/buxariyTech.git

test -f "$APP_DIR/.env.production" || {
  echo "Missing $APP_DIR/.env.production; refusing to deploy" >&2
  exit 1
}

if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
git fetch --depth=1 origin main
git reset --hard origin/main

export COMPOSE_PARALLEL_LIMIT="${COMPOSE_PARALLEL_LIMIT:-1}"
docker compose --env-file .env.production -f docker-compose.prod.yml build --pull api admin web
docker compose --env-file .env.production -f docker-compose.prod.yml up -d postgres minio
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm api npm run db:migrate
docker compose --env-file .env.production -f docker-compose.prod.yml up -d api admin web caddy
docker image prune -f
