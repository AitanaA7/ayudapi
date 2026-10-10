/**
 * Bypass de desarrollo / superusuario para testing local del alta médica.
 *
 * Activación (todo opcional, sin efecto si no se configura):
 * - `DEV_ADMIN_EMAILS`: lista separada por comas, punto y coma o espacios con
 *   los emails de desarrolladores (comparación case-insensitive).
 * - `DEV_ALLOW_BYPASS_IN_PROD`: solo si vale `"true"` el bypass puede correr
 *   con `NODE_ENV=production`. Por defecto el bypass SOLO corre fuera de
 *   producción para evitar aperturas accidentales.
 *
 * Efecto cuando está activo para el email autenticado:
 * - Se omite la verificación externa del padrón SISA/REFEPS por DNI.
 * - Se autoasigna `estado_verificacion = "verificado"` para desbloquear el
 *   testeo de subida de estudios e historial médico completo.
 *
 * Seguridad: el bypass NUNCA desactiva la autenticación (Bearer requerido) ni
 * el control de unicidad en base de datos (409 ante colisiones reales).
 */

export const VERIFICACION_VERIFICADO = "verificado";
export const VERIFICACION_PENDIENTE = "pendiente";

const BYPASS_ENV_ENABLED = "DEV_ALLOW_BYPASS_IN_PROD";

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

/** Estado de verificación a persistir/retornar según bypass. */
export function verificacionPara(email: string | null | undefined): string {
  return isDevBypassActiveFor(email) ? VERIFICACION_VERIFICADO : VERIFICACION_PENDIENTE;
}

export { BYPASS_ENV_ENABLED };
