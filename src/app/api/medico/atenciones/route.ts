import { parseJsonBody } from "@/lib/api/http";
import {
  getBearerToken,
  getRolesForUser,
  getSessionUser,
  jsonError,
  jsonOk,
} from "@/lib/auth/session";
import { createAdminServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface AtencionRequest {
  derivacion?: string;
  diagnostico?: string;
  motivo?: string;
  slug?: string;
}

function texto(valor: unknown, max: number): string | null {
  if (typeof valor !== "string") {
    return null;
  }
  const limpio = valor.trim();
  return limpio.length > 0 ? limpio.slice(0, max) : null;
}

export async function POST(req: Request) {
  const token = getBearerToken(req.headers.get("authorization"));
  if (!token) {
    return jsonError("Autenticación requerida.", 401);
  }
  const user = await getSessionUser(token);
  if (!user) {
    return jsonError("Sesión inválida o expirada.", 401);
  }
  const roles = await getRolesForUser(user.id);
  if (!roles.includes("medico")) {
    return jsonError("Solo el personal médico puede registrar atenciones.", 403);
  }

  const parsed = await parseJsonBody<AtencionRequest>(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  const slug = texto(parsed.data.slug, 64);
  const motivo = texto(parsed.data.motivo, 300);
  if (!slug || !motivo) {
    return jsonError("El código del paciente y el motivo son obligatorios.", 400);
  }

  const admin = createAdminServerClient();

  const { data: medico, error: medicoError } = await admin
    .from("perfiles_medico")
    .select("id, institucion_id")
    .eq("usuario_id", user.id)
    .maybeSingle()
    .overrideTypes<{ id: string; institucion_id: string | null } | null>();

  if (medicoError) {
    return jsonError(medicoError.message, 500, medicoError.code);
  }
  if (!medico) {
    return jsonError("Perfil médico no encontrado.", 403);
  }

  const { data: tokenRow, error: tokenError } = await admin
    .from("tokens_qr")
    .select("paciente_id, activo")
    .eq("slug", slug)
    .maybeSingle()
    .overrideTypes<{ activo: boolean; paciente_id: string } | null>();

  if (tokenError) {
    return jsonError(tokenError.message, 500, tokenError.code);
  }
  if (!tokenRow) {
    return jsonError("Código QR no encontrado.", 404);
  }
  if (!tokenRow.activo) {
    return jsonError("Este código QR está inactivo o revocado.", 410);
  }

  const { data: perfil, error: perfilError } = await admin
    .from("perfiles_paciente")
    .select("id, qr_activo, med_access")
    .eq("id", tokenRow.paciente_id)
    .maybeSingle()
    .overrideTypes<{
      id: string;
      med_access: boolean;
      qr_activo: boolean;
    } | null>();

  if (perfilError) {
    return jsonError(perfilError.message, 500, perfilError.code);
  }
  if (!perfil) {
    return jsonError("Perfil de paciente no encontrado.", 404);
  }
  if (!perfil.qr_activo) {
    return jsonError("El QR del paciente está desactivado.", 410);
  }
  if (!perfil.med_access) {
    return jsonError(
      "El paciente no ha autorizado el acceso a sus datos médicos.",
      403,
    );
  }

  const { data: incidente, error: incidenteError } = await admin
    .from("incidentes")
    .select("id")
    .eq("paciente_id", perfil.id)
    .eq("estado", "en_curso")
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle()
    .overrideTypes<{ id: string } | null>();

  if (incidenteError) {
    return jsonError(incidenteError.message, 500, incidenteError.code);
  }

  const { data: atencion, error: atencionError } = await admin
    .from("atenciones")
    .insert({
      derivacion: texto(parsed.data.derivacion, 300),
      diagnostico: texto(parsed.data.diagnostico, 500),
      incidente_id: incidente?.id ?? null,
      institucion_id: medico.institucion_id,
      medico_id: medico.id,
      motivo,
      paciente_id: perfil.id,
    })
    .select("id")
    .maybeSingle()
    .overrideTypes<{ id: string } | null>();

  if (atencionError) {
    return jsonError(atencionError.message, 500, atencionError.code);
  }
  if (!atencion) {
    return jsonError("No se pudo registrar la atención.", 500);
  }

  let incidenteResueltoId: string | null = null;
  if (incidente) {
    const resueltoEn = new Date().toISOString();
    const { error: cierreError } = await admin
      .from("incidentes")
      .update({ estado: "resuelto", resuelto_en: resueltoEn })
      .eq("id", incidente.id)
      .eq("estado", "en_curso");

    if (cierreError) {
      return jsonError(
        "La atención quedó registrada, pero no se pudo cerrar el incidente.",
        500,
        { atencion_id: atencion.id, detalle: cierreError.message },
      );
    }
    incidenteResueltoId = incidente.id;
  }

  await admin.from("logs_auditoria").insert({
    accion: "registrar_atencion",
    detalles: {
      atencion_id: atencion.id,
      incidente_resuelto_id: incidenteResueltoId,
    },
    paciente_id: perfil.id,
    usuario_id: user.id,
  });

  return jsonOk({
    atencion_id: atencion.id,
    incidente_resuelto_id: incidenteResueltoId,
  });
}
