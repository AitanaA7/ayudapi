/**
 * AyudAPI · Cliente del Buscador Nacional de Profesionales de la Salud
 * (REFEPS / SISA, acceso público, sin cuenta).
 *
 * Estrategia: el portal expone un formulario Drupal server-side
 * (`#consulta-profesionales-form`) que responde HTML. El flujo es:
 * 1. GET a la página para obtener un `form_build_id` vigente.
 * 2. POST urlencoded con `searchBy=dni`, el DNI y `op=Consultar`.
 * 3. Parseo del HTML: tabla `#resultados-lista` o alerta
 *    "No se encuentran resultados", más el JSON embebido en
 *    `Drupal.settings.refepsProfesionales.allItems` con el detalle
 *    (profesiones, matrículas, estado de habilitación).
 *
 * No se usa navegador headless: `fetch` nativo + `cheerio` alcanzan
 * porque no hay JS obligatorio ni captcha, y mantienen la imagen
 * liviana para Fly.io (máquinas de 256 MB).
 */

import { load } from "cheerio";

const BASE_URL = process.env.REFEPS_BASE_URL ?? "https://www.argentina.gob.ar";
const RUTA_BUSCADOR =
  process.env.REFEPS_RUTA ?? "/salud/buscador-nacional-de-profesionales-de-la-salud";
const FORM_ID = "argobar_consulta_refeps_profesionales";
const FUENTE = "REFEPS · Buscador Nacional de Profesionales de la Salud";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 AyudApiSisaScraper/0.2 (+https://www.argentina.gob.ar/salud)";

const TIMEOUT_GET_MS = numeroEnv("REFEPS_TIMEOUT_GET_MS", 15000);
const TIMEOUT_POST_MS = numeroEnv("REFEPS_TIMEOUT_POST_MS", 25000);
const INTENTOS_MAX = numeroEnv("REFEPS_INTENTOS_MAX", 3);
const ESPERA_BASE_MS = numeroEnv("REFEPS_ESPERA_BASE_MS", 800);

const MARCADOR_ITEMS = "refepsProfesionales.allItems =";
const TEXTO_SIN_RESULTADOS = "no se encuentran resultados";

/** Alias de jurisdicciones para comparar contra lo que informa el portal. */
const ALIAS_JURISDICCION = new Map([
  ["CABA", "CIUDAD DE BUENOS AIRES"],
  ["CAPITAL FEDERAL", "CIUDAD DE BUENOS AIRES"],
  ["CIUDAD AUTONOMA DE BUENOS AIRES", "CIUDAD DE BUENOS AIRES"],
  ["TIERRA DEL FUEGO", "TIERRA DEL FUEGO ANTARTIDA E ISLAS DEL ATLANTICO SUR"],
]);

function numeroEnv(nombre, defecto) {
  // Lectura de configuración propia por nombre: `nombre` siempre proviene
  // de constantes internas, nunca de entrada del usuario ni del portal.
  // eslint-disable-next-line security/detect-object-injection
  const valor = Number.parseInt(process.env[nombre] ?? "", 10);
  return Number.isFinite(valor) && valor > 0 ? valor : defecto;
}

/** Error operativo contra el portal (distinto de "no encontrado"). */
export class RefepsError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "RefepsError";
    this.code = code;
  }
}

export const CODIGOS_REFEPS = {
  FORMULARIO: "REFEPS_FORMULARIO",
  HTTP: "REFEPS_HTTP",
  PARSEO: "REFEPS_PARSEO",
  RED: "REFEPS_RED",
  TIMEOUT: "REFEPS_TIMEOUT",
};

/** Normaliza texto para comparaciones (mayúsculas, sin tildes ni espacios extra). */
export function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizarDni(valor) {
  return String(valor ?? "").replace(/[\s.]/g, "");
}

export function normalizarMatricula(valor) {
  return String(valor ?? "").replace(/[\s.\-_/]/g, "").toUpperCase();
}

function canonJurisdiccion(valor) {
  const normalizada = normalizarTexto(valor);
  return ALIAS_JURISDICCION.get(normalizada) ?? normalizada;
}

/** `true` si la provincia informada por el portal coincide con el filtro. */
export function jurisdiccionCoincide(informada, filtro) {
  if (!filtro) {
    return true;
  }
  return canonJurisdiccion(informada) === canonJurisdiccion(filtro);
}

export function matriculaCoincide(informada, filtro) {
  if (!filtro) {
    return true;
  }
  return normalizarMatricula(informada) === normalizarMatricula(filtro);
}

/** Extrae el `form_build_id` vigente del formulario de profesionales. */
export function extraerFormBuildId(html) {
  const $ = load(html);
  const id = $("#consulta-profesionales-form input[name='form_build_id']").attr("value") ?? "";
  return id.trim();
}

/** `true` si la página de resultados informa que no hubo coincidencias. */
export function detectarSinResultados(html) {
  const $ = load(html);
  const texto = $("#resultados-consulta").text() ?? "";
  return normalizarTexto(texto).toLowerCase().includes(TEXTO_SIN_RESULTADOS);
}

/**
 * Extrae el arreglo `allItems` embebido como literal JS en el HTML.
 * Usa escaneo de corchetes balanceados (tolera llaves/strings anidados).
 */
export function extraerAllItems(html) {
  const inicio = html.indexOf(MARCADOR_ITEMS);
  if (inicio === -1) {
    return [];
  }
  const desdeCorchete = html.indexOf("[", inicio + MARCADOR_ITEMS.length);
  if (desdeCorchete === -1) {
    return [];
  }
  let profundidad = 0;
  let enString = false;
  let escape = false;
  for (let i = desdeCorchete; i < html.length; i += 1) {
    const ch = html.charAt(i);
    if (enString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        enString = false;
      }
      continue;
    }
    if (ch === '"') {
      enString = true;
    } else if (ch === "[") {
      profundidad += 1;
    } else if (ch === "]") {
      profundidad -= 1;
      if (profundidad === 0) {
        const crudo = html.slice(desdeCorchete, i + 1);
        const parsed = JSON.parse(crudo);
        return Array.isArray(parsed) ? parsed : [];
      }
    }
  }
  return [];
}

function textoLimpio(valor) {
  const s = String(valor ?? "").replace(/\s+/g, " ").trim();
  return s === "" || s === "-" ? null : s;
}

/** Mapea una matrícula cruda del portal a un objeto estable y claro. */
export function mapearMatricula(cruda) {
  const estado = textoLimpio(cruda?.situacionMatricula);
  const habilitada = normalizarTexto(estado) === "HABILITADO";
  const sancion = textoLimpio(cruda?.tipoSancion) ?? textoLimpio(cruda?.motivoSancion);
  return {
    emisor: textoLimpio(cruda?.origenEmite),
    estado,
    habilitada,
    matricula: textoLimpio(cruda?.matricula),
    provincia: textoLimpio(cruda?.provinciaMatricula),
    sancion,
  };
}

/** Mapea un profesional crudo del portal al contrato del microservicio. */
export function mapearProfesional(crudo) {
  const profesionesRaw = Array.isArray(crudo?.profesiones) ? crudo.profesiones : [];
  const profesiones = profesionesRaw.map((p) => {
    const matriculasRaw = Array.isArray(p?.matriculas) ? p.matriculas : [];
    return {
      especialidad: textoLimpio(p?.refepsEspecialidad),
      matriculas: matriculasRaw.map(mapearMatricula),
      profesion: textoLimpio(p?.profesionReferencia),
    };
  });
  const algunaHabilitada = profesiones.some((p) => p.matriculas.some((m) => m.habilitada));
  return {
    activo: textoLimpio(crudo?.activo),
    apellido: textoLimpio(crudo?.apellido),
    cuil: textoLimpio(crudo?.cuil),
    dni: normalizarDni(crudo?.nroDoc),
    habilitadoParaEjercer: algunaHabilitada,
    nombre: textoLimpio(crudo?.nombre),
    profesiones,
  };
}

function esReintentable(error) {
  // Los errores de programación nunca se reintentan.
  if (
    error instanceof ReferenceError ||
    error instanceof SyntaxError ||
    error instanceof RangeError
  ) {
    return false;
  }
  if (error?.name === "TimeoutError" || error?.name === "AbortError") {
    return true;
  }
  if (error instanceof RefepsError) {
    return error.code === CODIGOS_REFEPS.TIMEOUT || error.code === CODIGOS_REFEPS.RED;
  }
  return error instanceof TypeError;
}

function esperaConBackoff(intento) {
  const base = ESPERA_BASE_MS * 2 ** (intento - 1);
  const jitter = Math.floor(Math.random() * 250);
  return new Promise((resolve) => {
    setTimeout(resolve, base + jitter);
  });
}

function codigoHttpReintentable(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

async function obtenerFormulario(fetcher) {
  let respuesta;
  try {
    respuesta = await fetcher(`${BASE_URL}${RUTA_BUSCADOR}`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(TIMEOUT_GET_MS),
    });
  } catch (error) {
    if (error?.name === "TimeoutError") {
      throw new RefepsError("Tiempo agotado al cargar el buscador REFEPS.", CODIGOS_REFEPS.TIMEOUT);
    }
    throw new RefepsError(`Falla de red al cargar el buscador: ${error.message}`, CODIGOS_REFEPS.RED);
  }
  if (!respuesta.ok) {
    throw new RefepsError(
      `El buscador respondió HTTP ${respuesta.status}.`,
      codigoHttpReintentable(respuesta.status) ? CODIGOS_REFEPS.RED : CODIGOS_REFEPS.HTTP,
    );
  }
  const html = await respuesta.text();
  const formBuildId = extraerFormBuildId(html);
  if (!formBuildId) {
    throw new RefepsError("No se pudo obtener el formulario de consulta.", CODIGOS_REFEPS.FORMULARIO);
  }
  return formBuildId;
}

async function enviarConsulta(fetcher, formBuildId, criterio) {
  const cuerpo = new URLSearchParams({
    apellidonombre: "",
    dni: criterio.dni,
    form_build_id: formBuildId,
    form_id: FORM_ID,
    matricula: "",
    op: "Consultar",
    searchBy: "dni",
    tarro_de_miel: "",
  });
  let respuesta;
  try {
    respuesta = await fetcher(`${BASE_URL}${RUTA_BUSCADOR}`, {
      body: cuerpo,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: `${BASE_URL}${RUTA_BUSCADOR}`,
        "User-Agent": UA,
      },
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_POST_MS),
    });
  } catch (error) {
    if (error?.name === "TimeoutError") {
      throw new RefepsError("Tiempo agotado al consultar el padrón.", CODIGOS_REFEPS.TIMEOUT);
    }
    throw new RefepsError(`Falla de red al consultar el padrón: ${error.message}`, CODIGOS_REFEPS.RED);
  }
  if (!respuesta.ok) {
    throw new RefepsError(
      `El padrón respondió HTTP ${respuesta.status}.`,
      codigoHttpReintentable(respuesta.status) ? CODIGOS_REFEPS.RED : CODIGOS_REFEPS.HTTP,
    );
  }
  return respuesta.text();
}

/**
 * Consulta el padrón público por DNI, con reintentos y timeouts.
 *
 * @param {string} dni DNI ya validado (7-8 dígitos).
 * @param {{matricula?: string, jurisdiccion?: string, fetcher?: typeof fetch}} opciones
 * Filtros opcionales: si se proveen y no coinciden, `encontrado` es `false`.
 */
export async function consultarProfesionalPorDni(dni, opciones = {}) {
  const { fetcher = globalThis.fetch, jurisdiccion = "", matricula = "" } = opciones;
  let ultimoError = null;
  for (let intento = 1; intento <= INTENTOS_MAX; intento += 1) {
    try {
      const formBuildId = await obtenerFormulario(fetcher);
      const html = await enviarConsulta(fetcher, formBuildId, { dni });
      if (detectarSinResultados(html)) {
        return {
          dni,
          encontrado: false,
          fuente: FUENTE,
          motivo: "no_registrado",
          ok: true,
          profesional: null,
          totalResultados: 0,
        };
      }
      let crudos;
      try {
        crudos = extraerAllItems(html);
      } catch {
        throw new RefepsError("No se pudo interpretar la respuesta del padrón.", CODIGOS_REFEPS.PARSEO);
      }
      const delDni = crudos.filter((c) => normalizarDni(c?.nroDoc) === dni);
      if (delDni.length === 0) {
        return {
          dni,
          encontrado: false,
          fuente: FUENTE,
          motivo: "no_registrado",
          ok: true,
          profesional: null,
          totalResultados: 0,
        };
      }
      const candidatos = delDni.map(mapearProfesional).filter((p) => {
        const okMatricula = (p.profesiones ?? []).some((prof) =>
          (prof.matriculas ?? []).some(
            (m) => matriculaCoincide(m.matricula, matricula) && jurisdiccionCoincide(m.provincia, jurisdiccion),
          ),
        );
        return okMatricula;
      });
      if (candidatos.length === 0) {
        return {
          dni,
          encontrado: false,
          fuente: FUENTE,
          motivo: "filtros_sin_coincidencia",
          ok: true,
          profesional: null,
          totalResultados: delDni.length,
        };
      }
      const [profesional] = candidatos;
      return {
        dni,
        encontrado: true,
        fuente: FUENTE,
        motivo: null,
        ok: true,
        profesional,
        totalResultados: delDni.length,
      };
    } catch (error) {
      ultimoError = error;
      const hayMasIntentos = intento < INTENTOS_MAX;
      if (!hayMasIntentos || !esReintentable(error)) {
        throw error;
      }
      await esperaConBackoff(intento);
    }
  }
  throw ultimoError;
}
