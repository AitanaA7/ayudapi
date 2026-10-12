# Imagen oficial de Puppeteer: trae Node 24 y el Chrome que corresponde
# EXACTAMENTE a esta versión de Puppeteer (25.13.0), la misma fijada en
# package.json. Alinear tag de imagen <-> dependencia evita el error
# "Could not find Chrome (ver. X)".
FROM ghcr.io/puppeteer/puppeteer:25.13.0

# La imagen ya incluye Chrome instalado en la caché de pptruser: impedimos
# que `npm ci` descargue un segundo Chrome y le indicamos dónde encontrarlo.
# NODE_ENV=production para dependencias mínimas; PORT para el binding.
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer \
    NODE_ENV=production \
    PORT=8080

# La imagen corre como el usuario no-root pptruser. Preparamos /app con su
# propiedad antes de bajar de privilegios.
USER root
RUN mkdir -p /app && chown -R pptruser:pptruser /app
USER pptruser

WORKDIR /app

# Instalación reproducible: primero manifiestos (mejor caché de capas).
COPY --chown=pptruser:pptruser package.json package-lock.json ./
RUN npm ci --omit=dev

# Código de la aplicación.
COPY --chown=pptruser:pptruser . .

EXPOSE 8080

CMD ["node", "index.js"]
