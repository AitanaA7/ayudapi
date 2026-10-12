import type { PerfilMedicoRow } from "@/lib/supabase/database";

import { parseJsonBody } from "@/lib/api/http";
import { ipDeRequest, registrarActividadSesion } from "@/lib/auth/actividad-servidor";
import { isDevBypassActiveFor, motivoBloqueoDniDePrueba, verificacionPara } from "@/lib/auth/dev-bypass";
import {
  CODIGO_MEDICO_INVALIDO,
  invitacionMedicaHabilitada,
  verificarCodigoInvitacionMedico,
  type ModoInvitacion,
} from "@/lib/auth/invitacion";
import {
  getBearerToken,
  getRolesForUser,
  getSessionUser,
  jsonError,
  jsonOk,
} from "@/lib/auth/session";
import { verificarProfesionalSisa } from "@/lib/auth/sisa";
import {
  guardarPerfilMedico,
  mensajeConflictoDni,
  verificarDniGlobal,
  verificarUnicidadMedico,
} from "@/lib/auth/verificacion-medico";
import { createAdminServerClient } from "@/lib/supabase/server";
import {
  normalizarDni,
  normalizarJurisdiccionSisa,
} from "@/lib/validation/profile";
import {
  detalle400DesdeZod,
  medicoAltaInvitacionSchema,
  medicoAltaSchema,
  MENSAJE_SISA,
} from "@/lib/validation/schemas";

export const runtime = "nodejs";

interface PerfilMedicoUpdate {
  codigo_invitacion?: string;
  dni?: string;
  especialidad?: string;
  jurisdiccion?: string;
  telefono_contacto?: string;
}

interface UsuarioAutenticado {
  email: string | null;
  id: string;
}

async function autenticarMedico(
  req: Request,
): Promise<
  | { ok: true; usuario: UsuarioAutenticado }
  | { ok: false; response: Response }
> {
  const token = getBearerToken(req.headers.get("authorization"));
  if (!token) {
    return { ok: false, response: jsonError("Autenticación requerida.", 401) };
  }
  const user = await getSessionUser(token);
  if (!user) {
    return { ok: false, response: jsonError("Sesión inválida o expirada.", 401) };
  }
  const roles = await getRolesForUser(user.id);
  if (!roles.includes("medico")) {
    return { ok: false, response: jsonError("Solo el personal médico puede acceder a este recurso.", 403) };
  }
  return { ok: true, usuario: { email: user.email ?? null, id: user.id } };
}

export async function GET(req: Request) {
  const auth = await autenticarMedico(req);
  if (!auth.ok) {
    return auth.response;
  }
  const { usuario } = auth;

  const admin = createAdminServerClient();

  const { data: perfil, error } = await admin
    .from("perfiles_medico")
    .select("*")
    .eq("usuario_id", usuario.id)
    .maybeSingle();
  if (error) {
    return jsonError(error.message, 500, error.code);
  }
  if (!perfil) {
    return jsonError("Perfil de médico no encontrado.", 404);
  }

  return jsonOk({
    email: usuario.email,
    perfil: perfil as PerfilMedicoRow,
  });
}

/**
 * Completa los datos obligatorios del perfil médico (DNI + jurisdicción
 * oficial + especialidad + teléfono, todos obligatorios según SISA/REFEPS).
 * Patrón upsert robusto por `usuario_id` con verificación previa de unicidad
 * del DNI global (una cuenta por DNI): un valor ya registrado en otra cuenta
 * responde 409. Sin bypass, el DNI se contrasta contra el padrón SISA y el
 * desajuste bloquea con 403 ("Médico no registrado…"). En modo bypass de
 * desarrollo (email en `DEV_ADMIN_EMAILS`) se aceptan DNIs `TEST_DNIS` y se
 * autoasigna `estado_verificacion = "verificado"`.
 * Vía de invitación (opcional, `MEDICO_INVITE_CODE` configurado): código
 * válido → se omite SISA, se persiste `estado_verificacion = "pendiente"` y se
 * audita la excepción (`invite_modo`). Código inválido/ausente → 403
 * fail-closed. Sin secreto rige la vía estricta (verificación del DNI).
 */
export async function PUT(req: Request) {
  const auth = await autenticarMedico(req);
  if (!auth.ok) {
    return auth.response;
  }
  const { usuario } = auth;

  const parsed = await parseJsonBody<PerfilMedicoUpdate>(req);
  if (!parsed.ok) {
    return parsed.response;
  }

  const bypass = isDevBypassActiveFor(usuario.email);
  const crudo: Record<string, unknown> = { ...(parsed.data as Record<string, unknown>) };

  // Guard de los DNIs de prueba: `TEST_DNIS` exige email autorizado (403).
  const bloqueoDni = motivoBloqueoDniDePrueba(usuario.email, crudo.dni);
  if (bloqueoDni) {
    return jsonError(bloqueoDni, 403);
  }

  // Modo bypass: completar faltantes con valores de prueba para avanzar sin trabas.
  if (bypass) {
    if (typeof crudo.especialidad !== "string" || crudo.especialidad.trim().length < 3) {
      crudo.especialidad = "Medicina General";
    }
    const telCrudo = typeof crudo.telefono_contacto === "string" ? crudo.telefono_contacto : "";
    if (telCrudo.replace(/\D/g, "").length < 8) {
      crudo.telefono_contacto = "+54 11 0000-0000";
    }
    if (typeof crudo.jurisdiccion !== "string" || crudo.jurisdiccion.trim().length === 0) {
      crudo.jurisdiccion = "NACIONAL";
    }
  }

  // Vía de invitación: código presente + mecanismo habilitado
  // (`MEDICO_INVITE_CODE`). El esquema condicional (`medicoAltaInvitacionSchema`)
  // exige el resto con el mismo rigor (400 por campo) y el gate el código
  // (403 fail-closed). Sin secreto configurado se cae a la validación estricta.
  let inviteModo: ModoInvitacion | null = null;
  let especialidad: string;
  let telefono: string;
  let jurisdiccion: string | null;
  let dni: string | null;

  const codigoInvitacion =
    typeof crudo.codigo_invitacion === "string" ? crudo.codigo_invitacion.trim() : "";
  if (!bypass && codigoInvitacion.length > 0 && invitacionMedicaHabilitada()) {
    const invitacion = medicoAltaInvitacionSchema.safeParse({
      codigo_invitacion: crudo.codigo_invitacion,
      dni: crudo.dni,
      especialidad: crudo.especialidad,
      jurisdiccion: crudo.jurisdiccion,
      telefono_contacto: crudo.telefono_contacto,
    });
    if (!invitacion.success) {
      const { detalles, mensaje } = detalle400DesdeZod(invitacion.error);
      return jsonError(mensaje, 400, detalles);
    }
    const gate = verificarCodigoInvitacionMedico(invitacion.data.codigo_invitacion);
    if (!gate.ok) {
      return jsonError(
        gate.mensaje,
        gate.status,
        gate.code === CODIGO_MEDICO_INVALIDO
          ? [{ campo: "codigo_invitacion", mensaje: gate.mensaje }]
          : { code: gate.code },
      );
    }
    dni = normalizarDni(invitacion.data.dni);
    jurisdiccion = normalizarJurisdiccionSisa(invitacion.data.jurisdiccion);
    telefono = invitacion.data.telefono_contacto.trim();
    especialidad = invitacion.data.especialidad.trim();
    inviteModo = gate.modo;
  } else {
    // Validación estricta Zod: DNI + jurisdicción + especialidad + teléfono
    // obligatorios; el 400 detalla exactamente el campo en falta.
    const validacion = medicoAltaSchema.safeParse({
      dni: crudo.dni,
      especialidad: crudo.especialidad,
      jurisdiccion: crudo.jurisdiccion,
      telefono_contacto: crudo.telefono_contacto,
    });
    if (!validacion.success) {
      const { detalles, mensaje } = detalle400DesdeZod(validacion.error);
      return jsonError(mensaje, 400, detalles);
    }
    especialidad = validacion.data.especialidad.trim();
    telefono = validacion.data.telefono_contacto.trim();
    jurisdiccion = normalizarJurisdiccionSisa(validacion.data.jurisdiccion);
    dni = normalizarDni(validacion.data.dni);
  }

  const admin = createAdminServerClient();

  // Unicidad (DNI global) + padrón SISA + fila propia: todo en paralelo.
  // Vía de invitación: el padrón SISA se omite; el DNI global sí se exige
  // siempre (409).
  const [unicidad, dniGlobal, sisaRes, filaRes] = await Promise.all([
    dni
      ? verificarUnicidadMedico(admin, { dni, usuarioId: usuario.id })
      : Promise.resolve<{ conflicto: string | null; error?: { code?: string; message: string } }>({ conflicto: null }),
    dni
      ? verificarDniGlobal(admin, { dni, usuarioId: usuario.id })
      : Promise.resolve<{ conflicto: string | null; error?: { code?: string; message: string } }>({ conflicto: null }),
    bypass || inviteModo
      ? Promise.resolve({ ok: true as const })
      : verificarProfesionalSisa(admin, { dni }),
    admin
      .from("perfiles_medico")
      .select("id")
      .eq("usuario_id", usuario.id)
      .maybeSingle(),
  ]);
  if (unicidad.error) {
    return jsonError(unicidad.error.message ?? "No se pudo verificar el DNI. Reintentá.", 500, unicidad.error.code);
  }
  if (unicidad.conflicto) {
    return jsonError(unicidad.conflicto, 409);
  }
  if (dniGlobal.error) {
    return jsonError("No se pudo verificar el DNI. Reintentá.", 500, dniGlobal.error.code);
  }
  if (dniGlobal.conflicto) {
    return jsonError(dniGlobal.conflicto, 409);
  }
  if (!sisaRes.ok) {
    return jsonError(sisaRes.mensaje || MENSAJE_SISA, 403);
  }

  const { data: fila, error: filaError } = filaRes;
  if (filaError) {
    return jsonError(filaError.message, 500, filaError.code);
  }
  if (!fila) {
    return jsonError("Perfil de médico no encontrado. Reintentá el alta.", 404);
  }

  const verificacion = verificacionPara(usuario.email);
  const { error } = await guardarPerfilMedico(admin, usuario.id, {
    dni,
    especialidad,
    estadoVerificacion: verificacion,
    // Vía de invitación: marca la excepción; vía estricta: la limpia
    // (regularización, opera ya sin excepción).
    inviteModo: inviteModo ?? null,
    jurisdiccion,
    telefonoContacto: telefono,
  }, true);
  if (error) {
    // Carrera de concurrencia contra la verificación previa: mismo 409 amigable.
    if (error.code === "23505") {
      return jsonError(mensajeConflictoDni(), 409);
    }
    return jsonError(error.message, 500, error.code);
  }

  // La vía de invitación queda registrada como excepción en la auditoría
  // (best-effort, no bloquea la respuesta).
  if (inviteModo) {
    await registrarActividadSesion(admin, {
      accion: "registro",
      detalles: { canal: "medico-me", invite_modo: inviteModo, rol: "medico" },
      direccionIp: ipDeRequest(req),
      email: usuario.email,
      usuarioId: usuario.id,
    });
  }

  return jsonOk({
    bypass,
    ...(inviteModo ? { invitacion: true as const } : {}),
    message: inviteModo
      ? "Perfil guardado como pendiente de verificación."
      : "Perfil de médico actualizado correctamente.",
    verificacion,
  });
}