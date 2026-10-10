import type { SupabaseClient } from "@supabase/supabase-js";

import type { RolUsuario } from "@/lib/supabase/database";

import { parseJsonBody } from "@/lib/api/http";
import { ipDeRequest, registrarActividadSesion } from "@/lib/auth/actividad-servidor";
import {
  isDevBypassActiveFor,
  VERIFICACION_VERIFICADO,
} from "@/lib/auth/dev-bypass";
import {
  CODIGO_INSTITUCION_INVALIDO,
  verificarCodigoInvitacionInstitucion,
  verificarCuitInstitucion,
} from "@/lib/auth/institucion";
import {
  CODIGO_MEDICO_INVALIDO,
  invitacionMedicaHabilitada,
  verificarCodigoInvitacionMedico,
  type ModoInvitacion,
} from "@/lib/auth/invitacion";
import { confirmarYProvisionar } from "@/lib/auth/registro";
import { jsonError, jsonOk } from "@/lib/auth/session";
import { verificarProfesionalSisa, type ProfesionalSisa } from "@/lib/auth/sisa";
import {
  verificarDniGlobal,
} from "@/lib/auth/verificacion-medico";
import { createAdminServerClient, createAnonServerClient } from "@/lib/supabase/server";
import { esEmailValido, esTelefonoValido } from "@/lib/validation/profile";
import {
  detalle400DesdeZod,
  dniSchema,
  institucionAltaSchema,
  medicoAltaInvitacionSchema,
  medicoAltaSchema,
  MENSAJE_CUIT_DUPLICADO,
  MENSAJE_DNI_DUPLICADO,
  MENSAJE_DNI_MEDICO_DUPLICADO,
  normalizarInstitucionCruda,
} from "@/lib/validation/schemas";

export const runtime = "nodejs";

const MIN_PASSWORD_LENGTH = 8;
const ROLES_REGISTRABLES: RolUsuario[] = ["paciente", "medico", "institucion"];
/** Usuario inexistente: ningún `usuario_id` real coincide, el DNI debe estar libre. */
const SIN_USUARIO = "00000000-0000-0000-0000-000000000000";

interface RegisterRequest {
  alias?: string;
  codigo_invitacion?: string;
  cuit?: string;
  direccion?: string;
  dni?: string;
  documentacion?: unknown;
  email: string;
  email_contacto?: string;
  especialidad?: string;
  nombre?: string;
  nombre_completo?: string;
  password: string;
  rol?: RolUsuario;
  telefono?: string;
  telefono_contacto?: string;
}

async function dniOcupado(admin: SupabaseClient, dni: string): Promise<boolean> {
  const { conflicto } = await verificarDniGlobal(admin, { dni, usuarioId: SIN_USUARIO });
  return conflicto !== null;
}

/**
 * Alta de cuenta por email y contraseña con estándar SISA/REFEPS.
 *
 * - Paciente: DNI obligatorio (Zod estricto 7-8 dígitos) y único en todo el
 *   sistema (409 si ya existe). Formato inválido → 400 con el campo detallado.
 * - Médico (DNI-only): DNI + teléfono + especialidad, todos obligatorios
 *   (400 por campo). El DNI se contrasta contra el padrón SISA vía
 *   microservicio: sin profesional habilitado se bloquea con 403 ("Médico no
 *   registrado…"). DNI ya registrado → 409 (unicidad global).
 * - Médico por invitación (opcional, `MEDICO_INVITE_CODE` configurado):
 *   código válido → alta con `estado_verificacion = "pendiente"` (sin
 *   contraste SISA). Código ausente/inválido → 403 fail-closed.
 * - Institución: nombre + CUIT (11 dígitos con checksum AFIP) +
 *   documentación (≥1 referencia) + `codigo_invitacion` obligatorio contra
 *   `INSTITUCION_INVITE_CODE` (403 si falta o no coincide). CUIT duplicado →
 *   409. Mismo patrón Zod estricto que médico/paciente.
 * - El usuario queda habilitado de inmediato y la respuesta incluye la sesión.
 */
export async function POST(req: Request) {
  const parsed = await parseJsonBody<RegisterRequest>(req);
  if (!parsed.ok) {
    return parsed.response;
  }
  const input = parsed.data;

  const email = input.email?.trim() ?? "";
  if (!esEmailValido(email)) {
    return jsonError("Ingresá un email válido.", 400);
  }
  if (!input.password || input.password.length < MIN_PASSWORD_LENGTH) {
    return jsonError(
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      400,
    );
  }

  const rol = input.rol ?? "paciente";
  if (!ROLES_REGISTRABLES.includes(rol)) {
    return jsonError("No podés registrarte con el rol seleccionado.", 400);
  }

  const admin = createAdminServerClient();

  // ── Validación estricta por rol (Zod) ──────────────────────────────────
  let dniNormalizado: string | undefined;
  let telefonoNormalizado: string | undefined;
  let especialidadNormalizada: string | undefined;
  let verificacionMedica = "pendiente";
  /** Nombre/apellido autocompletados desde el padrón SISA (vía estricta). */
  let profesionalSisa: ProfesionalSisa | null = null;
  /** Modo de la vía de invitación médica, si se usó. */
  let inviteMedicoModo: ModoInvitacion | null = null;

  if (rol === "medico") {
    const esBypass = isDevBypassActiveFor(email);
    // Vía de invitación: código presente + mecanismo habilitado
    // (`MEDICO_INVITE_CODE`). El código se exige (403 fail-closed) y suple
    // al padrón SISA; el perfil nace `pendiente`.
    const codigoCrudo = input.codigo_invitacion?.trim() ?? "";
    const porInvitacion = !esBypass && codigoCrudo.length > 0 && invitacionMedicaHabilitada();
    if (porInvitacion) {
      const validacion = medicoAltaInvitacionSchema.safeParse({
        codigo_invitacion: input.codigo_invitacion,
        dni: input.dni,
        especialidad: input.especialidad,
        telefono_contacto: input.telefono_contacto,
      });
      if (!validacion.success) {
        const { detalles, mensaje } = detalle400DesdeZod(validacion.error);
        return jsonError(mensaje, 400, detalles);
      }
      const invitacion = verificarCodigoInvitacionMedico(validacion.data.codigo_invitacion);
      if (!invitacion.ok) {
        return jsonError(
          invitacion.mensaje,
          invitacion.status,
          invitacion.code === CODIGO_MEDICO_INVALIDO
            ? [{ campo: "codigo_invitacion", mensaje: invitacion.mensaje }]
            : { code: invitacion.code },
        );
      }
      dniNormalizado = validacion.data.dni.trim();
      // Sin contraste SISA: solo la unicidad global del DNI (409).
      const dniRes = await verificarDniGlobal(admin, { dni: dniNormalizado, usuarioId: SIN_USUARIO });
      if (dniRes.conflicto) {
        return jsonError(MENSAJE_DNI_MEDICO_DUPLICADO, 409);
      }
      telefonoNormalizado = validacion.data.telefono_contacto.trim();
      especialidadNormalizada = validacion.data.especialidad.trim();
      verificacionMedica = "pendiente";
      inviteMedicoModo = invitacion.modo;
    } else {
      // Un código presente con mecanismo deshabilitado (o inválido que no
      // pasó la vía anterior) se rechaza de forma cerrada.
      if (!esBypass && codigoCrudo.length > 0) {
        const gate = verificarCodigoInvitacionMedico(codigoCrudo);
        if (!gate.ok) {
          return jsonError(
            gate.mensaje,
            gate.status,
            gate.code === CODIGO_MEDICO_INVALIDO
              ? [{ campo: "codigo_invitacion", mensaje: gate.mensaje }]
              : { code: gate.code },
          );
        }
        return jsonError("El registro por invitación no está habilitado.", 403);
      }
      const validacion = medicoAltaSchema.safeParse({
        dni: input.dni,
        especialidad: input.especialidad,
        telefono_contacto: input.telefono_contacto,
      });
      if (!validacion.success) {
        const { detalles, mensaje } = detalle400DesdeZod(validacion.error);
        return jsonError(mensaje, 400, detalles);
      }
      dniNormalizado = validacion.data.dni.trim();
      telefonoNormalizado = validacion.data.telefono_contacto.trim();
      especialidadNormalizada = validacion.data.especialidad.trim();

      // Unicidad global del DNI (409) y padrón SISA por DNI (403):
      // consultas independientes en paralelo.
      const [dniRes, sisaRes] = await Promise.all([
        verificarDniGlobal(admin, { dni: dniNormalizado, usuarioId: SIN_USUARIO }),
        esBypass
          ? Promise.resolve({ ok: true as const })
          : verificarProfesionalSisa({ dni: dniNormalizado }),
      ]);
      if (dniRes.conflicto) {
        return jsonError(MENSAJE_DNI_MEDICO_DUPLICADO, 409);
      }
      if (!sisaRes.ok) {
        return jsonError(sisaRes.mensaje, 403);
      }
      // Autocompletado SISA: nombre/apellido del padrón al perfil.
      profesionalSisa = "profesional" in sisaRes ? sisaRes.profesional : null;
      // SISA ok ⇒ profesional habilitado: nace verificado (sin banner).
      verificacionMedica = VERIFICACION_VERIFICADO;
    }
  }

  if (rol === "paciente") {
    const validacion = dniSchema.safeParse(input.dni);
    if (!validacion.success) {
      const { detalles, mensaje } = detalle400DesdeZod(validacion.error);
      return jsonError(mensaje, 400, detalles);
    }
    dniNormalizado = validacion.data.trim();
    if (await dniOcupado(admin, dniNormalizado)) {
      return jsonError(MENSAJE_DNI_DUPLICADO, 409);
    }
    if (input.telefono_contacto !== undefined && input.telefono_contacto !== null) {
      const tel = String(input.telefono_contacto).trim();
      if (tel.length > 0) {
        if (!esTelefonoValido(tel)) {
          return jsonError(
            "Datos inválidos. telefono_contacto: El teléfono de contacto es obligatorio y debe contener entre 8 y 15 dígitos.",
            400,
            [{ campo: "telefono_contacto", mensaje: "El teléfono debe contener entre 8 y 15 dígitos." }],
          );
        }
        telefonoNormalizado = tel;
      }
    }
  }

  // ── Institución: mismo patrón Zod estricto que médico/paciente ──────────
  // Gate de seguridad ANTES de crear la cuenta (no dejar usuarios huérfanos):
  // 1) esquema (400 por campo), 2) invitación (403), 3) CUIT único (409).
  let institucionNormalizada: {
    cuit: string;
    direccion?: string;
    documentacion: Array<{ referencia: string }>;
    email_contacto?: string;
    inviteModo: "codigo" | "dev-sin-codigo";
    nombre: string;
    telefono?: string;
  } | null = null;

  if (rol === "institucion") {
    const validacion = institucionAltaSchema.safeParse(
      normalizarInstitucionCruda({
        codigo_invitacion: input.codigo_invitacion,
        cuit: input.cuit,
        direccion: input.direccion,
        documentacion: input.documentacion,
        email_contacto: input.email_contacto,
        nombre: input.nombre,
        telefono: input.telefono ?? input.telefono_contacto,
      }),
    );
    if (!validacion.success) {
      const { detalles, mensaje } = detalle400DesdeZod(validacion.error);
      return jsonError(mensaje, 400, detalles);
    }
    const invitacion = verificarCodigoInvitacionInstitucion(
      validacion.data.codigo_invitacion,
    );
    if (!invitacion.ok) {
      return jsonError(
        invitacion.mensaje,
        invitacion.status,
        invitacion.code === CODIGO_INSTITUCION_INVALIDO
          ? [{ campo: "codigo_invitacion", mensaje: invitacion.mensaje }]
          : { code: invitacion.code },
      );
    }
    const cuitRes = await verificarCuitInstitucion(admin, validacion.data.cuit, SIN_USUARIO);
    if (cuitRes.error) {
      return jsonError("No se pudo verificar el CUIT. Reintentá.", 500, cuitRes.error.code);
    }
    if (cuitRes.conflicto) {
      return jsonError(cuitRes.conflicto ?? MENSAJE_CUIT_DUPLICADO, 409);
    }
    institucionNormalizada = {
      cuit: validacion.data.cuit,
      direccion: validacion.data.direccion,
      documentacion: validacion.data.documentacion,
      email_contacto: validacion.data.email_contacto,
      inviteModo: invitacion.modo,
      nombre: validacion.data.nombre.trim(),
      telefono: validacion.data.telefono,
    };
  }

  // `crear_perfil_inicial` solo lee claves conocidas por rol: para institución
  // se persisten los valores NORMALIZADOS (Zod), no el crudo del formulario.
  // `invite_modo` marca la excepción médica por invitación para el RPC.
  const datos: Record<string, unknown> = {
    alias: input.alias,
    apellido: profesionalSisa?.apellido ?? undefined,
    cuit: institucionNormalizada?.cuit ?? input.cuit,
    direccion: institucionNormalizada?.direccion,
    dni: dniNormalizado,
    documentacion: institucionNormalizada?.documentacion ?? input.documentacion,
    email,
    email_contacto: institucionNormalizada?.email_contacto,
    especialidad: especialidadNormalizada ?? input.especialidad,
    estado_verificacion: rol === "medico" ? verificacionMedica : undefined,
    invite_modo: inviteMedicoModo ?? undefined,
    nombre: profesionalSisa?.nombre ?? input.nombre,
    nombre_completo: input.nombre_completo,
    telefono: institucionNormalizada?.telefono,
    telefono_contacto:
      telefonoNormalizado ?? institucionNormalizada?.telefono ?? input.telefono_contacto,
  };

  // 1. Se crea la cuenta ya confirmada. Sin confirmar por email, el usuario
  // quedaría atrapado dependiendo de un SMTP que puede no estar disponible.
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: input.password,
    user_metadata: {
      app_datos: datos,
      app_rol: rol,
    },
  });
  if (authError) {
    if (authError.code === "email_exists") {
      return jsonError("Ya existe una cuenta con ese email. Iniciá sesión.", 409);
    }
    if (authError.status === 422 || authError.code === "weak_password") {
      return jsonError(
        "No se pudo crear la cuenta: revisá el email y la contraseña.",
        400,
      );
    }
    return jsonError(authError.message, authError.status ?? 400);
  }
  if (!authData.user) {
    return jsonError("No se pudo crear la cuenta. Reintentá.", 400);
  }
  const userId = authData.user.id;

  // 2. Alta definitiva del perfil (roles_usuario / perfiles_*).
  try {
    await confirmarYProvisionar(admin, {
      email,
      emailVerificado: true,
      id: userId,
      appDatos: datos,
      appRol: rol,
    });
  } catch (err) {
    // El perfil pendiente se auto-provisiona en el siguiente acceso
    // (/api/auth/rol). No se bloquea el ingreso por un fallo transitorio.
    console.error("[register] No se pudo provisionar el perfil:", err);
  }

  // Aviso de actividad: cuenta recién creada (best-effort, no bloquea).
  // Para institución/médico por invitación se audita el modo (`codigo` vs
  // bypass dev) como registro de la excepción.
  await registrarActividadSesion(admin, {
    accion: "registro",
    detalles: {
      canal: "register-email",
      ...(institucionNormalizada ? { invite_modo: institucionNormalizada.inviteModo } : {}),
      ...(inviteMedicoModo ? { invite_modo: inviteMedicoModo } : {}),
      rol,
    },
    direccionIp: ipDeRequest(req),
    email,
    usuarioId: userId,
  });

  // 3. Sesión completa para que el usuario quede logueado en el acto.
  const { data: signInData, error: signInError } =
    await createAnonServerClient().auth.signInWithPassword({
      email,
      password: input.password,
    });
  if (signInError) {
    console.error("[register] Cuenta creada pero no se pudo autenticar:", signInError.message);
    return jsonOk(
      {
        message: "Tu cuenta se creó correctamente. Ahora iniciá sesión.",
        requiere_login: true,
        rol,
        session: { access_token: null, refresh_token: null },
        user: { email, id: userId },
      },
      201,
    );
  }

  return jsonOk(
    {
      message: "Tu cuenta fue creada correctamente.",
      rol,
      requiere_verificacion: false,
      session: {
        access_token: signInData.session?.access_token ?? null,
        refresh_token: signInData.session?.refresh_token ?? null,
      },
      user: {
        email,
        id: userId,
      },
    },
    201,
  );
}
