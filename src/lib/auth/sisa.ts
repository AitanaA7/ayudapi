import { normalizarDni } from "@/lib/validation/profile";
import { MENSAJE_SISA } from "@/lib/validation/schemas";

/**
 * Verificación de profesionales contra el padrón SISA/REFEPS a través del
 * microservicio independiente de scraping (desplegado en Fly.io).
 *
 * La validación usa exclusivamente el DNI: `POST` JSON `{ dni }` hacia
 * `${SISA_SCRAPE_API_URL}/api/sisa/consulta` con
 * `Authorization: Bearer <SISA_SERVICE_SECRET>`. Ya no se envían ni se
 * exigen matrícula o jurisdicción para esta verificación.
 *
 * Regla de oro: falla cerrado. Solo `encontrado: true` con profesional
 * habilitado (`habilitadoParaEjercer: true`) permite el flujo; cualquier
 * otro caso (no encontrado, error de red, timeout, mala configuración)
 * bloquea con el mensaje oficial. El bypass de desarrollo
 * (`DEV_ADMIN_EMAILS`) lo gobiernan los callers, nunca este módulo.
 */

export type ResultadoSisa =
  | { mensaje: string; ok: false }
  | { ok: true };

const MENSAJE_REINTENTO = "No se pudo verificar la matrícula con el padrón. Reintentá.";

function timeoutMs(): number {
  const valor = Number.parseInt(process.env.SISA_SCRAPE_TIMEOUT_MS ?? "", 10);
  return Number.isFinite(valor) && valor > 0 ? valor : 30000;
}

function urlConsulta(): string | null {
  const base = (process.env.SISA_SCRAPE_API_URL ?? "").trim().replace(/\/+$/, "");
  return base ? `${base}/api/sisa/consulta` : null;
}

/** `true` solo si el microservicio halló al profesional y está habilitado. */
function esProfesionalHabilitado(data: unknown): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const respuesta = data as { encontrado?: unknown; profesional?: unknown };
  if (respuesta.encontrado !== true) {
    return false;
  }
  const profesional = respuesta.profesional;
  if (typeof profesional !== "object" || profesional === null) {
    return false;
  }
  return (profesional as { habilitadoParaEjercer?: unknown }).habilitadoParaEjercer === true;
}

/**
 * Verifica el DNI contra el padrón vía microservicio. Falla cerrado: sin
 * profesional habilitado devuelve `ok: false` con mensaje de bloqueo.
 */
export async function verificarProfesionalSisa(raw: { dni: unknown }): Promise<ResultadoSisa> {
  const dni = normalizarDni(raw.dni);
  if (!dni) {
    return { mensaje: MENSAJE_SISA, ok: false };
  }

  const url = urlConsulta();
  const secreto = process.env.SISA_SERVICE_SECRET ?? "";
  if (!url || !secreto) {
    console.warn(
      "[sisa] Microservicio no configurado (SISA_SCRAPE_API_URL/SISA_SERVICE_SECRET): bloqueo fail-closed.",
    );
    return { mensaje: MENSAJE_SISA, ok: false };
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      body: JSON.stringify({ dni }),
      headers: {
        Authorization: `Bearer ${secreto}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(timeoutMs()),
    });
  } catch (error) {
    console.error("[sisa] No se pudo contactar al microservicio SISA:", error);
    return { mensaje: MENSAJE_REINTENTO, ok: false };
  }

  if (!respuesta.ok) {
    console.warn(`[sisa] Microservicio SISA respondió HTTP ${respuesta.status}: bloqueo fail-closed.`);
    return { mensaje: MENSAJE_SISA, ok: false };
  }

  let data: unknown;
  try {
    data = await respuesta.json();
  } catch (error) {
    console.error("[sisa] Respuesta no-JSON del microservicio SISA:", error);
    return { mensaje: MENSAJE_REINTENTO, ok: false };
  }

  return esProfesionalHabilitado(data) ? { ok: true } : { mensaje: MENSAJE_SISA, ok: false };
}
