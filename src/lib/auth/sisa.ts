import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizarDni } from "@/lib/validation/profile";
import { MENSAJE_SISA } from "@/lib/validation/schemas";

/**
 * Verificación formal de profesionales contra el padrón SISA/REFEPS.
 *
 * La identidad se resuelve EXCLUSIVAMENTE por DNI: no se usa ni matrícula ni
 * jurisdicción. Fuentes del padrón (en orden):
 * 1. Microservicio de scraping SISA/REFEPS (`SCRAPER_URL`, Fly.io).
 * 2. Tabla `public.padron_profesionales` (entorno real / producción).
 * 3. Variable `SISA_PADRON_JSON`: array JSON `[{dni}]` para seed local o CI.
 *
 * Regla de oro: falla cerrado. Si el DNI no figura en ninguna fuente
 * disponible, el alta se bloquea con el mensaje oficial "Médico no registrado
 * o datos inválidos en el sistema".
 */

export interface CredencialProfesional {
  dni: string;
}

interface FilaPadron {
  dni: string;
}

/** URL del microservicio de scraping SISA/REFEPS (Fly.io). */
const SCRAPER_URL =
  process.env.SCRAPER_URL?.trim() || "http://localhost:8080/verificar-sisa";

/** Timeout de la consulta al microservicio (ms). */
const SCRAPER_TIMEOUT_MS = 90_000;

/** Interruptor de emergencia: `SISA_SCRAPE=false` desactiva el scraper. */
const SISA_SCRAPE_HABILITADO = process.env.SISA_SCRAPE?.trim() !== "false";

function esErrorRelacionInexistente(code: string | undefined, message: string): boolean {
  if (code === "PGRST204" || code === "42703" || code === "42P01") {
    return true;
  }
  const m = (message ?? "").toLowerCase();
  return (
    m.includes("could not find") ||
    m.includes("does not exist") ||
    m.includes("no existe") ||
    m.includes("schema cache")
  );
}

function normalizarCredencial(raw: { dni: unknown }): CredencialProfesional | null {
  const dni = normalizarDni(raw.dni);
  if (!dni) {
    return null;
  }
  return { dni };
}

/** Padrón embebido vía `SISA_PADRON_JSON` (seed local/CI). */
export function getPadronDesdeEnv(): FilaPadron[] {
  const raw = process.env.SISA_PADRON_JSON ?? "";
  if (!raw.trim()) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const filas: FilaPadron[] = [];
    for (const item of parsed) {
      if (item === null || typeof item !== "object") {
        continue;
      }
      const cred = normalizarCredencial(item as { dni: unknown });
      if (cred) {
        filas.push(cred);
      }
    }
    return filas;
  } catch {
    return [];
  }
}

function coincideEnMemoria(padron: FilaPadron[], cred: CredencialProfesional): boolean {
  return padron.some((fila) => fila.dni === cred.dni);
}

async function coincideEnTabla(
  admin: SupabaseClient,
  cred: CredencialProfesional,
): Promise<{ chequeado: boolean; coincide: boolean }> {
  const { data, error } = await admin
    .from("padron_profesionales")
    .select("id")
    .eq("dni", cred.dni)
    .maybeSingle();
  if (error) {
    if (esErrorRelacionInexistente(error.code, error.message)) {
      return { chequeado: false, coincide: false };
    }
    throw error;
  }
  return { chequeado: true, coincide: Boolean(data) };
}

/**
 * Consulta al microservicio de scraping SISA/REFEPS (Fly.io).
 * Retorna `true` si el DNI figura en el padrón; `false` si no. Errores de
 * red/timeout/HTTP se propagan para forzar el fallback local.
 */
async function consultarSisaMicroservicio(
  cred: CredencialProfesional,
): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, SCRAPER_TIMEOUT_MS);

  try {
    const res = await fetch(SCRAPER_URL, {
      body: JSON.stringify({ dni: cred.dni }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Scraper SISA respondió ${res.status}`);
    }

    const payload = (await res.json().catch(() => null)) as
      | { mensaje?: string; ok: boolean }
      | null;

    return payload?.ok === true;
  } finally {
    clearTimeout(timeout);
  }
}

export type ResultadoSisa =
  | { mensaje: string; ok: false }
  | { nombre?: string | null; ok: true };

/**
 * Verifica el DNI contra el padrón. Falla cerrado: sin coincidencia devuelve
 * `ok: false` con el mensaje oficial de bloqueo.
 */
export async function verificarProfesionalSisa(
  admin: SupabaseClient,
  raw: { dni: unknown },
): Promise<ResultadoSisa> {
  const cred = normalizarCredencial(raw);
  if (!cred) {
    return { mensaje: MENSAJE_SISA, ok: false };
  }

  // 1. Fuente primaria: microservicio de scraping SISA (Fly.io). Ante rechazo
  //    explícito o error de red/timeout se cae al padrón local.
  if (SISA_SCRAPE_HABILITADO) {
    try {
      const coincideEnSisa = await consultarSisaMicroservicio(cred);
      if (coincideEnSisa) {
        return { ok: true };
      }
    } catch (error) {
      console.warn(
        "[sisa] Microservicio no disponible, se usa el padrón local:",
        error,
      );
    }
  }

  // 2. Fallback local: tabla `padron_profesionales` + `SISA_PADRON_JSON`.
  let tablaChequeada = false;
  try {
    const enTabla = await coincideEnTabla(admin, cred);
    tablaChequeada = enTabla.chequeado;
    if (enTabla.chequeado && enTabla.coincide) {
      return { ok: true };
    }
    if (enTabla.chequeado && !enTabla.coincide) {
      // La tabla es la fuente oficial: si existe y no coincide, se bloquea
      // sin mirar el seed de entorno.
      return { mensaje: MENSAJE_SISA, ok: false };
    }
  } catch (error) {
    console.error("[sisa] No se pudo consultar el padrón:", error);
    return {
      mensaje: "No se pudo verificar el DNI con el padrón. Reintentá.",
      ok: false,
    };
  }

  // Sin tabla (migración pendiente): el seed `SISA_PADRON_JSON` es la fuente.
  const padronEnv = getPadronDesdeEnv();
  if (padronEnv.length > 0) {
    return coincideEnMemoria(padronEnv, cred)
      ? { ok: true }
      : { mensaje: MENSAJE_SISA, ok: false };
  }

  // Sin ninguna fuente de padrón configurada: bloqueo terminante. En local
  // esto obliga a usar el bypass autorizado (`DEV_ADMIN_EMAILS` + `TEST_DNIS`)
  // o a sembrar el padrón; en producción impide altas con datos no
  // contrastados. Nunca se deja pasar un DNI sin verificar.
  if (!tablaChequeada) {
    console.warn(
      "[sisa] Sin padrón configurado (ni tabla ni SISA_PADRON_JSON): bloqueo fail-closed.",
    );
  }
  return { mensaje: MENSAJE_SISA, ok: false };
}
