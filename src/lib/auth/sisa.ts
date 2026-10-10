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

export interface ProfesionalSisa {
  apellido: string | null;
  nombre: string | null;
}

export type ResultadoSisa =
  | { mensaje: string; ok: false }
  | { ok: true; profesional: ProfesionalSisa | null };

const MENSAJE_REINTENTO = "No se pudo verificar el DNI con el padrón. Reintentá.";

function timeoutMs(): number {
  const valor = Number.parseInt(process.env.SISA_SCRAPE_TIMEOUT_MS ?? "", 10);
  return Number.isFinite(valor) && valor > 0 ? valor : 30000;
}

function urlConsulta(): string | null {
  const base = (process.env.SISA_SCRAPE_API_URL ?? "").trim().replace(/\/+$/, "");
  return base ? `${base}/api/sisa/consulta` : null;
}

function textoOpcional(valor: unknown): string | null {
  if (typeof valor !== "string") {
    return null;
  }
  const limpio = valor.replace(/\s+/g, " ").trim();
  return limpio.length > 0 ? limpio : null;
}

/**
 * Extrae el profesional habilitado de la respuesta (`null` si no hay
 * coincidencia habilitada). Los callers persisten nombre/apellido en el
 * perfil para no pedirlos manualmente.
 */
function extraerProfesionalHabilitado(data: unknown): ProfesionalSisa | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const respuesta = data as { encontrado?: unknown; profesional?: unknown };
  if (respuesta.encontrado !== true) {
    return null;
  }
  const profesional = respuesta.profesional;
  if (typeof profesional !== "object" || profesional === null) {
    return null;
  }
  const ficha = profesional as { apellido?: unknown; habilitadoParaEjercer?: unknown; nombre?: unknown };
  if (ficha.habilitadoParaEjercer !== true) {
    return null;
  }
  return {
    apellido: textoOpcional(ficha.apellido),
    nombre: textoOpcional(ficha.nombre),
  };
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

  const profesional = extraerProfesionalHabilitado(data);
  return profesional ? { ok: true, profesional } : { mensaje: MENSAJE_SISA, ok: false };
}
