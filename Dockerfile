# syntax=docker/dockerfile:1.7

# ---------- build ----------
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
ARG VITE_SITE_URL=http://localhost:8080
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build

# ---------- runtime ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
