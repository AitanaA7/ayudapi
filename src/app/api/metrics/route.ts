import { createAdminServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/metrics
//
// Endpoint de scraping para Prometheus. A diferencia de un endpoint típico con
// prom-client, acá NO guardamos contadores en memoria: en Vercel (serverless)
// cada invocación puede caer en una instancia distinta, así que un contador en
// memoria mentiría. En cambio, en cada scrape consultamos el estado actual real
// en Supabase y lo exponemos como gauges. Prometheus se encarga de armar la
// serie temporal a partir de esas fotos periódicas.
//
// Protección: si se define METRICS_TOKEN en las variables de entorno, el
// scraper debe mandar `Authorization: Bearer <METRICS_TOKEN>` (ver
// prometheus.yml de referencia). Si no está definida, el endpoint queda
// abierto — solo expone conteos agregados, nunca datos de un paciente puntual.
// ─────────────────────────────────────────────────────────────────────────────

function unauthorized() {
  return new Response("unauthorized\n", {
    status: 401,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function isAuthorized(req: Request): boolean {
  const expected = process.env.METRICS_TOKEN;
  if (!expected) return true; // sin token configurado, el endpoint queda abierto

  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  return token === expected;
}

/** Cuenta filas de una tabla, opcionalmente filtradas por columna=valor. Devuelve 0 en error. */
async function countRows(
  admin: ReturnType<typeof createAdminServerClient>,
  table: string,
  filter?: { column: string; value: string | boolean },
): Promise<number> {
  let query = admin.from(table).select("*", { count: "exact", head: true });
  if (filter) {
    query = query.eq(filter.column, filter.value);
  }
  const { count, error } = await query;
  if (error) {
    console.error(`[/api/metrics] error contando ${table}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return unauthorized();
  }

  const admin = createAdminServerClient();

  const [
    incidentesTotal,
    incidentesResueltos,
    incidentesEnCursoResult,
    escaneosTotal,
    qrActivos,
    atencionesTotal,
    usuariosActivos,
    escaneosPublicos,
    escaneosMedicos,
  ] = await Promise.all([
    countRows(admin, "incidentes"),
    countRows(admin, "incidentes", { column: "estado", value: "resuelto" }),
    admin
      .from("incidentes")
      .select("*", { count: "exact", head: true })
      .in("estado", ["enviado", "en_curso"]),
    countRows(admin, "escaneos_qr"),
    countRows(admin, "tokens_qr", { column: "activo", value: true }),
    countRows(admin, "atenciones"),
    countRows(admin, "perfiles_paciente", { column: "qr_activo", value: true }),
    countRows(admin, "escaneos_qr", { column: "origen", value: "publico" }),
    countRows(admin, "escaneos_qr", { column: "origen", value: "medico" }),
  ]);

  if (incidentesEnCursoResult.error) {
    console.error(
      "[/api/metrics] error contando incidentes en curso:",
      incidentesEnCursoResult.error.message,
    );
  }
  const incidentesEnCurso = incidentesEnCursoResult.count ?? 0;

  const gauge = (name: string, help: string, value: number) =>
    [`# HELP ${name} ${help}`, `# TYPE ${name} gauge`, `${name} ${value}`].join("\n");

  const labeledGauge = (name: string, help: string, values: Array<[string, number]>) =>
    [
      `# HELP ${name} ${help}`,
      `# TYPE ${name} gauge`,
      ...values.map(([label, value]) => `${name}{origen="${label}"} ${value}`),
    ].join("\n");

  const body =
    [
      gauge("ayudapi_incidentes_total", "Total histórico de incidentes registrados", incidentesTotal),
      gauge("ayudapi_incidentes_resueltos", "Incidentes con estado resuelto", incidentesResueltos),
      gauge("ayudapi_incidentes_en_curso", "Incidentes actualmente en curso", incidentesEnCurso),
      gauge("ayudapi_escaneos_total", "Total histórico de escaneos QR", escaneosTotal),
      gauge("ayudapi_qr_activos", "Tokens QR actualmente activos", qrActivos),
      gauge("ayudapi_atenciones_total", "Total histórico de atenciones médicas", atencionesTotal),
      gauge("ayudapi_usuarios_activos", "Perfiles de paciente con QR activo", usuariosActivos),
      labeledGauge(
        "ayudapi_escaneos_por_origen",
        "Escaneos QR históricos según el origen del acceso",
        [
          ["publico", escaneosPublicos],
          ["medico", escaneosMedicos],
        ],
      ),
    ].join("\n\n") + "\n";

  return new Response(body, {
    headers: { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" },
  });
}
