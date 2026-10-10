import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Vínculo inviolable entre el DNI validado por SISA y la cuenta (`auth.uid`).
 *
 * Amenaza que cierra: validar el DNI propio en `elegir-rol` y luego alterar
 * la petición final para persistir el DNI de otra persona (válido en el
 * padrón y aún no registrado). Como la validación y la persistencia ocurren
 * en requests distintos, el backend ancla el primer DNI validado con éxito
 * en la tabla server-only `sisa_dni_validados` y exige coincidencia exacta
 * antes de crear/actualizar cualquier perfil médico.
 *
 * Reglas:
 * - Sin vínculo previo: el primer SISA-ok lo establece (y se permite).
 * - Con vínculo: solo el mismo DNI avanza; otro DNI → 403 aunque pase SISA.
 * - La vía de invitación NO establece vínculo (DNI no contrastado).
 * - Si la tabla aún no existe (migración pendiente): se degrada a "sin
 *   vínculo" con advertencia (el contraste SISA en vivo + unicidad 409
 *   siguen rigiendo). El fallo al registrar el vínculo se loguea sin
 *   bloquear (la validación en vivo ya decidió).
 */

export const MENSAJE_DNI_VINCULO =
  "El DNI enviado no coincide con el DNI validado en el padrón SISA para tu cuenta. Volvé a validar tu identidad o contactá a soporte.";

export type FuenteValidacionDni = "bypass" | "invitacion" | "sisa";

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

/** DNI validado previamente para el usuario, o `null` si no hay vínculo. */
export async function obtenerDniValidado(
  admin: SupabaseClient,
  usuarioId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("sisa_dni_validados")
    .select("dni")
    .eq("usuario_id", usuarioId)
    .maybeSingle();
  if (error) {
    if (esErrorRelacionInexistente(error.code, error.message)) {
      console.warn("[sisa-vinculo] Tabla sisa_dni_validados ausente: sin vínculo (aplica migración).");
      return null;
    }
    console.error("[sisa-vinculo] No se pudo leer el vínculo de DNI:", error.message);
    return null;
  }
  const dni = (data as { dni?: unknown } | null)?.dni;
  return typeof dni === "string" && dni.length > 0 ? dni : null;
}

/** Ancla el DNI validado a la cuenta (idempotente por `usuario_id`). */
export async function registrarDniValidado(
  admin: SupabaseClient,
  usuarioId: string,
  dni: string,
  fuente: FuenteValidacionDni,
): Promise<void> {
  const { error } = await admin.from("sisa_dni_validados").upsert(
    { dni, fuente, usuario_id: usuarioId },
    { onConflict: "usuario_id" },
  );
  if (error) {
    if (esErrorRelacionInexistente(error.code, error.message)) {
      console.warn("[sisa-vinculo] Tabla sisa_dni_validados ausente: vínculo no registrado (aplica migración).");
      return;
    }
    console.error("[sisa-vinculo] No se pudo registrar el vínculo de DNI:", error.message);
  }
}

/**
 * Exige que el DNI a persistir coincida con el validado por SISA para la
 * cuenta. Sin vínculo previo se permite (la validación en vivo que acaba de
 * pasar lo establece justo después).
 */
export async function exigirDniVinculado(
  admin: SupabaseClient,
  usuarioId: string,
  dni: string | null,
): Promise<{ mensaje?: undefined; ok: true } | { mensaje: string; ok: false }> {
  if (!dni) {
    return { mensaje: MENSAJE_DNI_VINCULO, ok: false };
  }
  const previo = await obtenerDniValidado(admin, usuarioId);
  if (!previo || previo === dni) {
    return { ok: true };
  }
  console.warn(`[sisa-vinculo] DNI alterado para ${usuarioId}: vinculado ${previo}, recibido ${dni}.`);
  return { mensaje: MENSAJE_DNI_VINCULO, ok: false };
}
