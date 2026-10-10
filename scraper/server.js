/**
 * AyudAPI · Microservicio de scraping SISA.
 *
 * Servicio HTTP independiente (despliegue en Fly.io) que expone la consulta
 * del padrón SISA/REFEPS por DNI al backend principal de Next.js.
 *
 * Autenticación: todo `/api/*` exige el secreto compartido
 * `SISA_SERVICE_SECRET`, enviado como `Authorization: Bearer <secreto>`
 * (o cabecera `x-sisa-service-secret`). La comparación es en tiempo
 * constante para no filtrar el secreto por timing.
 *
 * Variables de entorno:
 * - PORT (Fly la inyecta; por defecto 8080)
 * - SISA_SERVICE_SECRET (obligatorio en producción)
 * - REFEPS_BASE_URL / REFEPS_RUTA (por defecto el buscador público)
 * - REFEPS_TIMEOUT_GET_MS / REFEPS_TIMEOUT_POST_MS (timeouts por intento)
 * - REFEPS_INTENTOS_MAX / REFEPS_ESPERA_BASE_MS (reintentos con backoff)
 */

import express from "express";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { CODIGOS_REFEPS, RefepsError, consultarProfesionalPorDni } from "./lib/refeps.js";

const PORT = Number.parseInt(process.env.PORT ?? "8080", 10);
const SERVICE_SECRET = process.env.SISA_SERVICE_SECRET ?? "";
const DNI_PATTERN = /^[0-9]{7,8}$/;

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

/**
 * Extrae el token presentado por el cliente, ya sea vía
 * `Authorization: Bearer ...` o cabecera `x-sisa-service-secret`.
 */
function extraerToken(req) {
  const auth = req.get("authorization") ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice("bearer ".length).trim();
  }
  return (req.get("x-sisa-service-secret") ?? "").trim();
}

/** Comparación en tiempo constante entre el token y el secreto. */
function tokenValido(presentado) {
  if (!SERVICE_SECRET || !presentado) {
    return false;
  }
  const a = Buffer.from(presentado, "utf8");
  const b = Buffer.from(SERVICE_SECRET, "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

/** Middleware de autenticación para las rutas `/api/*`. */
function exigirSecreto(req, res, next) {
  if (!SERVICE_SECRET) {
    res.status(503).json({
      error: "Servicio no configurado: falta SISA_SERVICE_SECRET.",
      ok: false,
    });
    return;
  }
  if (!tokenValido(extraerToken(req))) {
    res.status(401).json({ error: "No autorizado.", ok: false });
    return;
  }
  next();
}

/**
 * Consulta el padrón público SISA/REFEPS para un DNI normalizado (7-8
 * dígitos), con filtros opcionales de matrícula y jurisdicción.
 * Delega en `lib/refeps.js` (timeouts + reintentos con backoff).
 */
async function consultarPadronSisa(dni, filtros = {}) {
  return consultarProfesionalPorDni(dni, filtros);
}

/** Traduce un error operativo del portal a estado HTTP. */
function estadoParaError(error) {
  if (error instanceof RefepsError && error.code === CODIGOS_REFEPS.TIMEOUT) {
    return 504;
  }
  return 502;
}

app.get("/", (req, res) => {
  res.json({
    endpoints: ["GET /health", "POST /api/sisa/consulta"],
    ok: true,
    service: "ayudapi-sisa-scraper",
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "ayudapi-sisa-scraper",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/sisa/consulta", exigirSecreto, async (req, res, next) => {
  try {
    const dni = String(req.body?.dni ?? "").replace(/[\s.]/g, "");
    if (!DNI_PATTERN.test(dni)) {
      res.status(400).json({
        error: "DNI inválido: se esperan 7 u 8 dígitos.",
        ok: false,
      });
      return;
    }
    const matricula = String(req.body?.matricula ?? "").slice(0, 40).trim();
    const jurisdiccion = String(req.body?.jurisdiccion ?? "").slice(0, 80).trim();
    const resultado = await consultarPadronSisa(dni, { jurisdiccion, matricula });
    res.json(resultado);
  } catch (error) {
    if (error instanceof RefepsError) {
      res.status(estadoParaError(error)).json({
        code: error.code,
        error: "No se pudo consultar el padrón en este momento. Reintentá.",
        ok: false,
      });
      return;
    }
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada.", ok: false });
});

// Express registra el middleware de errores por aridad (4 parámetros).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  console.error("[scraper] error no controlado:", err);
  res.status(500).json({ error: "Error interno del servicio.", ok: false });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[scraper] escuchando en 0.0.0.0:${PORT}`);
    if (!SERVICE_SECRET) {
      console.warn("[scraper] SISA_SERVICE_SECRET no configurado: /api/* responde 503.");
    }
  });
}

export default app;
