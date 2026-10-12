/**
 * Bypass de desarrollo / superusuario para testing local del alta médica.
 *
 * Activación (todo opcional, sin efecto si no se configura):
 * - `DEV_ADMIN_EMAILS`: lista separada por comas, punto y coma o espacios con
 *   los emails de desarrolladores (comparación case-insensitive).
 * - `TEST_DNIS`: lista de DNIs reservados para testing (comas, punto y coma o
 *   espacios). Un DNI listado solo puede registrarse desde un email en
 *   `DEV_ADMIN_EMAILS`; para el resto responde 403.
 * - `DEV_ALLOW_BYPASS_IN_PROD`: solo si vale `"true"` el bypass puede correr
 *   con `NODE_ENV=production`. Por defecto el bypass SOLO corre fuera de
 *   producción para evitar aperturas accidentales.
 *
 * Efecto cuando está activo para el email autenticado:
 * - Se omiten las restricciones duras de verificación externa (hoy: contraste
 *   contra el padrón SISA/REFEPS).
 * - Se autoasigna `estado_verificacion = "verificado"` para desbloquear el
 *   testeo de subida de estudios e historial médico completo.
 *
 * Seguridad: el bypass NUNCA desactiva la autenticación (Bearer requerido) ni
 * el control de unicidad en base de datos (409 ante colisiones reales).
 */

import { normalizarDni } from "@/lib/validation/profile";

export const VERIFICACION_VERIFICADO = "verificado";
export const VERIFICACION_PENDIENTE = "pendiente";

const BYPASS_ENV_ENABLED = "DEV_ALLOW_BYPASS_IN_PROD";

/** Código de error para el intento de usar un DNI de prueba sin permiso. */
export const CODIGO_BYPASS_REQUERIDO = "BYPASS_REQUERIDO";

export function getDevAdminEmails(): string[] {
  const raw = process.env.DEV_ADMIN_EMAILS ?? "";
  return raw
    .split(/[,;\s]+/)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function isDevAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  const normalizado = email.trim().toLowerCase();
  return getDevAdminEmails().includes(normalizado);
}

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

function isBypassAllowedInProd(): boolean {
  return (process.env.DEV_ALLOW_BYPASS_IN_PROD ?? "").trim().toLowerCase() === "true";
}

/** DNIs reservados para testing (`TEST_DNIS`). */
export function getTestDnis(): string[] {
  const raw = process.env.TEST_DNIS ?? "";
  return raw
    .split(/[,;\s]+/)
    .map((dni) => normalizarDni(dni))
    .filter((dni): dni is string => Boolean(dni));
}

/** `true` si el DNI pertenece a la allowlist de testing. */
export function isTestDni(dni: unknown): boolean {
  const normalizado = normalizarDni(dni);
  if (!normalizado) {
    return false;
  }
  return getTestDnis().includes(normalizado);
}

/**
 * `true` solo si el email está en `DEV_ADMIN_EMAILS` y el entorno lo permite.
 * En producción exige además `DEV_ALLOW_BYPASS_IN_PROD=true`.
 */
export function isDevBypassActiveFor(email: string | null | undefined): boolean {
  if (!isDevAdminEmail(email)) {
    return false;
  }
  if (isProd() && !isBypassAllowedInProd()) {
    return false;
  }
  return true;
}

/**
 * Guard centralizado del bypass. Devuelve el mensaje de bloqueo (para
 * responder 403) si `dni` está en `TEST_DNIS` y `email` no tiene bypass activo;
 * `null` si está permitido. Falla cerrado: sin email o sin `DEV_ADMIN_EMAILS`
 * configurado, todo `TEST_DNIS` se bloquea.
 */
export function motivoBloqueoDniDePrueba(
  email: string | null | undefined,
  dni: unknown,
): string | null {
  if (!isTestDni(dni)) {
    return null;
  }
  if (isDevBypassActiveFor(email)) {
    return null;
  }
  return "El DNI ingresado solo está habilitado para cuentas de desarrollo autorizadas (DEV_ADMIN_EMAILS). Si sos profesional, ingresá tu DNI real.";
}

/** Estado de verificación a persistir/retornar según bypass. */
export function verificacionPara(email: string | null | undefined): string {
  return isDevBypassActiveFor(email) ? VERIFICACION_VERIFICADO : VERIFICACION_PENDIENTE;
}

export { BYPASS_ENV_ENABLED };
