FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY prisma prisma
RUN npm ci
COPY apps apps
COPY packages packages
RUN npm run db:generate && npm run build --workspace=@buhariy/contracts && npm run build --workspace=@buhariy/api
ARG VITE_API_URL
ARG VITE_WEB_URL
ENV VITE_API_URL=$VITE_API_URL VITE_WEB_URL=$VITE_WEB_URL
RUN npm run build --workspace=@buhariy/admin

FROM build AS api
ENV NODE_ENV=production API_HOST=0.0.0.0 API_PORT=4100
USER node
EXPOSE 4100
CMD ["node", "apps/api/dist/main.js"]

FROM nginx:stable-alpine AS admin
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
COPY docker/admin.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

FROM build AS web-build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_MEDIA_URL
ARG API_INTERNAL_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_MEDIA_URL=$NEXT_PUBLIC_MEDIA_URL API_INTERNAL_URL=$API_INTERNAL_URL
RUN npm run build --workspace=@buhariy/web
FROM web-build AS web
RUN chown -R node:node /app/apps/web/.next
ENV NODE_ENV=production
USER node
EXPOSE 3100
CMD ["npm", "run", "start", "--workspace=@buhariy/web"]
