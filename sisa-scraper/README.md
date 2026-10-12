# sisa-scraper

Microservicio Node/Express + Puppeteer que expone la verificación de credenciales
contra el padrón **SISA / REFEPS**. El frontend (`src/lib/auth/sisa.ts`, vía
`SCRAPER_URL`) lo llama como fuente primaria, con fallback al padrón local.

## Endpoints

- `GET /health` → `{ "status": "ok" }`
- `POST /verificar-sisa` → body `{ "dni": "...", "matricula": "...", "jurisdiccion": "..." }`
  - `{ "ok": true }` si la credencial figura y está vigente.
  - `{ "ok": false, "mensaje": "..." }` si no figura o si hubo un problema.

> **Aviso:** la lógica de selectores contra la UI real de SISA/REFEPS está
> **pendiente de reescritura** (ver *Estado*). Hasta entonces `POST /verificar-sisa`
> devuelve `ok:false`.

## Archivos

| Archivo | Descripción |
| --- | --- |
| `index.js` | Servidor Express + scraping con Puppeteer. |
| `package.json` / `package-lock.json` | Dependencias (`puppeteer` fijado a `25.13.0`). |
| `Dockerfile` | Base `ghcr.io/puppeteer/puppeteer:25.13.0` (Chrome incluido). |
| `fly.toml` | Config de despliegue en Fly.io. |
| `.dockerignore` | Exclusiones de build. |

## Estado

Verificado:
- `npm ci` reproducible (lockfile presente) y build Docker OK.
- `GET /health` OK.
- Mensaje del servidor: `[sisa-scraper] Servidor escuchando en puerto 8080`.

Diferido (conocido):
- **Selectores de REFEPS.** SISA es una SPA **GWT** que tarda ~5 s en renderizar
  el menú. El código actual asume un formulario `matrícula + DNI` que no existe:
  la UI real tiene un botón **Buscar** y un modal de login. Además usa `page.$`
  (que **no espera**) en lugar de `waitForSelector`. Por eso el POST devuelve
  `ok:false`. Hay que reescribir toda la sección de selectores/interacción de
  `consultarSisaWeb` en `index.js`.
- La `jurisdiccion` que llega en el body no se usa (REFEPS público no la expone).

---

## 1. Requisitos

- Node ≥ 20 (para pruebas locales nativas) **o** Docker.
- Fly.io CLI (`flyctl`): `fly version`.

## 2. Probar localmente con Docker

```powershell
cd sisa-scraper
docker build -t sisa-scraper-test .
docker run --rm -d --name sisa-test -p 8080:8080 sisa-scraper-test

# Health
curl.exe -s http://localhost:8080/health

# Verificación (usar un archivo o Invoke-RestMethod para evitar el bug de
# comillas de PowerShell al pasar JSON a curl.exe)
$body = @{ dni = "27496155"; matricula = "137503"; jurisdiccion = "NACIONAL" } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri http://localhost:8080/verificar-sisa -Method Post -ContentType "application/json" -Body $body

docker rm -f sisa-test
```

## 3. Desplegar en Fly.io

```powershell
cd sisa-scraper

# 1) Autenticarse
fly auth login

# 2) El nombre de app en fly.toml debe ser único globalmente. Si está tomado,
#    cambialo en fly.toml (app = "tu-nombre-unico") o deja que fly lo genere:
fly apps create ayudapi-sisa-scraper   # opcional: crea la app primero

# 3) Desplegar (construye la imagen y la sube)
fly deploy

# 4) Ver estado y datos de la app
fly status
fly apps list
```

La URL pública queda como:

```
https://<app>.fly.dev
```

con `<app>` = el valor de `app` en `fly.toml` (por defecto `ayudapi-sisa-scraper`).

> El healthcheck de Fly pega a `GET /health`. La primera petición puede tardar
> porque Fly enciende la máquina (`auto_stop_machines = "stop"` + `min_machines_running = 0`).

## 4. Configurar la URL en el frontend

En `.env.local` (proyecto Next, raíz del repo):

```env
SCRAPER_URL=https://ayudapi-sisa-scraper.fly.dev/verificar-sisa
# Opcional: desactivar el scraping y forzar el padrón local
# SISA_SCRAPE=false
```

En **Vercel** (Project → Settings → Environment Variables) agregar las mismas
variables y redeployar. `runtime = "nodejs"` en las rutas que consultan SISA.

## 5. Verificar el despliegue

```powershell
# Health del servicio en la nube
curl.exe -s https://ayudapi-sisa-scraper.fly.dev/health

# Logs en vivo
fly logs

# Verificación end-to-end contra el servicio
$body = @{ dni = "27496155"; matricula = "137503"; jurisdiccion = "NACIONAL" } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri https://ayudapi-sisa-scraper.fly.dev/verificar-sisa -Method Post -ContentType "application/json" -Body $body
```

> Mientras los selectores estén pendientes, `ok` será `false`. Cuando se reescriba
> `consultarSisaWeb`, repetir esta prueba end-to-end.
