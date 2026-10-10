# AyudAPI · sisa-scraper — imagen optimizada para Fly.io.
# Build en una etapa de dependencias y runtime mínimo con usuario no-root.
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund

FROM node:20-slim AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN useradd --create-home --shell /usr/sbin/nologin appuser
COPY --from=deps /app/node_modules ./node_modules
COPY package.json server.js ./
# OBLIGATORIO: `server.js` importa `./lib/refeps.js`. Sin esta línea el
# contenedor crashea al arrancar con MODULE_NOT_FOUND (la app local funciona
# porque `lib/` sí existe en el checkout).
COPY lib ./lib
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
CMD ["node", "server.js"]
