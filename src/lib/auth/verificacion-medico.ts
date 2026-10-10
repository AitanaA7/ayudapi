import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Unicidad y persistencia del perfil médico (modelo DNI-only).
 *
 * La identidad del profesional es su DNI (único global, ver
 * `verificarDniGlobal`): `matricula` y `jurisdiccion` son legado opcional y
 * ya no se solicitan en el alta. Columnas extendidas (`jurisdiccion`, `dni`,
 * `estado_verificacion`, `invite_modo`) pueden no existir aún en la base (ver
 * migración al final de `supabase/schema.sql`). Todas las lecturas/escrituras
 * extendidas detectan "columna inexistente" (`PGRST204` / `42703`) y caen al
 * comportamiento base, para no romper producción antes de aplicar la
 * migración. `matricula` es nullable desde la migración DNI-only.
 */

export interface ValoresMedico {
  dni?: string | null;
  especialidad: string;
  estadoVerificacion?: string | null;
  /**
   * Marcador de excepción por invitación (`'codigo'`) o `null` para
   * limpiarlo. `undefined` = no tocar.
   */
  inviteModo?: string | null;
  /** Legado opcional: ya no se solicita en el alta. */
  jurisdiccion?: string | null;
  /** Legado opcional: ya no se solicita en el alta. */
  matricula?: string | null;
  telefonoContacto: string;
}

function esErrorColumnaInexistente(error: { code?: string; message: string } | null | undefined): boolean {
  if (!error) {
    return false;
  }
  if (error.code === "PGRST204" || error.code === "42703") {
    return true;
  }
  const mensaje = (error.message ?? "").toLowerCase();
  return (
    mensaje.includes("could not find") ||
    mensaje.includes("column") ||
    mensaje.includes("columna") ||
    mensaje.includes("does not exist")
  );
}

export function mensajeConflictoDni(): string {
  return "Ese DNI ya está registrado en otra cuenta de profesional. Verificá el número ingresado.";
}

export function mensajeConflictoDniGlobal(): string {
  return "Ese DNI ya está registrado en otra cuenta. Cada DNI puede tener una sola cuenta: verificá el número ingresado o iniciá sesión.";
}

/**
 * Unicidad global del DNI (una sola cuenta por DNI): lo busca en
 * `perfiles_medico` Y en `perfiles_paciente`, excluyendo al propio usuario.
 * Si la columna `dni` del paciente aún no se migró, ese chequeo se omite sin
 * romper (la unicidad médica igual se aplica); tras la migración es total.
 */
export async function verificarDniGlobal(
  admin: SupabaseClient,
  args: { dni: string; usuarioId: string },
): Promise<{ conflicto: string | null; error?: { code?: string; message: string } }> {
  const [enMedicos, enPacientes] = await Promise.all([
    existeEnOtraCuenta(admin, { dni: args.dni, usuarioId: args.usuarioId }),
    (async (): Promise<Ocupacion> => {
      const { data, error } = await admin
        .from("perfiles_paciente")
        .select("usuario_id")
        .eq("dni", args.dni)
        .neq("usuario_id", args.usuarioId)
        .maybeSingle();
      if (error) {
        if (esErrorColumnaInexistente({ code: error.code, message: error.message })) {
          return { ocupada: false };
        }
        return { error: { code: error.code, message: error.message }, ocupada: false };
      }
      return { ocupada: Boolean(data) };
    })(),
  ]);

  if (enMedicos.error) {
    return { conflicto: null, error: enMedicos.error };
  }
  if (enMedicos.ocupada) {
    return { conflicto: mensajeConflictoDniGlobal() };
  }
  if (enPacientes.error) {
    return { conflicto: null, error: enPacientes.error };
  }
  if (enPacientes.ocupada) {
    return { conflicto: mensajeConflictoDniGlobal() };
  }
  return { conflicto: null };
}

interface Ocupacion {
  error?: { code?: string; message: string };
  ocupada: boolean;
}

/**
 * Chequea si otra cuenta usa ya los filtros dados (hoy: DNI). Si la consulta
 * toca una columna extendida aún no migrada, se degrada a "libre".
 */
async function existeEnOtraCuenta(
  admin: SupabaseClient,
  filtros: { dni?: string; jurisdiccion?: string; matricula?: string; usuarioId: string },
): Promise<Ocupacion> {
  const usaExtendida = filtros.jurisdiccion !== undefined || filtros.dni !== undefined;
  let consulta = admin
    .from("perfiles_medico")
    .select("usuario_id")
    .neq("usuario_id", filtros.usuarioId);
  if (filtros.matricula !== undefined) {
    consulta = consulta.eq("matricula", filtros.matricula);
  }
  if (filtros.jurisdiccion !== undefined) {
    consulta = consulta.eq("jurisdiccion", filtros.jurisdiccion);
  }
  if (filtros.dni !== undefined) {
    consulta = consulta.eq("dni", filtros.dni);
  }
  const { data, error } = await consulta.maybeSingle();
  if (error) {
    if (usaExtendida && esErrorColumnaInexistente({ code: error.code, message: error.message })) {
      return { ocupada: false };
    }
    return { error: { code: error.code, message: error.message }, ocupada: false };
  }
  return { ocupada: Boolean(data) };
}

/**
 * Inserta o actualiza la fila del médico. Intenta persistir las columnas
 * extendidas y reintenta solo con las base si la migración aún no se aplicó.
 */
export async function guardarPerfilMedico(
  admin: SupabaseClient,
  usuarioId: string,
  valores: ValoresMedico,
  existente: boolean,
): Promise<{ error?: { code?: string; message: string } }> {
  const base = {
    especialidad: valores.especialidad,
    matricula:
      typeof valores.matricula === "string" && valores.matricula.trim().length > 0
        ? valores.matricula.trim().toUpperCase()
        : null,
    telefono_contacto: valores.telefonoContacto,
  };
  const extendida: Record<string, string | null> = {};
  if (valores.jurisdiccion !== undefined) {
    extendida.jurisdiccion = valores.jurisdiccion;
  }
  if (valores.dni !== undefined) {
    extendida.dni = valores.dni;
  }
  if (valores.estadoVerificacion !== undefined && valores.estadoVerificacion !== null) {
    extendida.estado_verificacion = valores.estadoVerificacion;
  }
  if (valores.inviteModo !== undefined) {
    extendida.invite_modo = valores.inviteModo;
  }
  const conExtendida = Object.keys(extendida).length > 0;

  if (existente) {
    if (conExtendida) {
      const { error } = await admin
        .from("perfiles_medico")
        .update({ ...base, ...extendida })
        .eq("usuario_id", usuarioId);
      if (!error) {
        return {};
      }
      if (!esErrorColumnaInexistente({ code: error.code, message: error.message })) {
        return { error: { code: error.code, message: error.message } };
      }
      // La migración aún no se aplicó: reintentar solo con columnas base.
    }
    const { error } = await admin.from("perfiles_medico").update(base).eq("usuario_id", usuarioId);
    return error ? { error: { code: error.code, message: error.message } } : {};
  }

  if (conExtendida) {
    const { error } = await admin
      .from("perfiles_medico")
      .insert({ ...base, ...extendida, usuario_id: usuarioId });
    if (!error) {
      return {};
    }
    if (!esErrorColumnaInexistente({ code: error.code, message: error.message })) {
      return { error: { code: error.code, message: error.message } };
    }
  }
  const { error } = await admin.from("perfiles_medico").insert({ ...base, usuario_id: usuarioId });
  return error ? { error: { code: error.code, message: error.message } } : {};
}
