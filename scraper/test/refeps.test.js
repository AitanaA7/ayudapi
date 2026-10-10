/**
 * Tests herméticos (sin red) del cliente REFEPS. Se ejecutan con:
 * `npm test` dentro de `scraper/` (usa el runner nativo `node:test`).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CODIGOS_REFEPS,
  RefepsError,
  consultarProfesionalPorDni,
  detectarSinResultados,
  extraerAllItems,
  extraerFormBuildId,
  jurisdiccionCoincide,
  mapearProfesional,
  matriculaCoincide,
  normalizarTexto,
} from "../lib/refeps.js";

const GET_FIXTURE = `<html><body>
<form id="site-search"><input type="hidden" name="form_build_id" value="form-OTRO" /></form>
<form id="consulta-profesionales-form" action="/x" method="post">
<input type="hidden" name="form_build_id" value="form-ABC123" />
<input type="hidden" name="form_id" value="argobar_consulta_refeps_profesionales" />
</form></body></html>`;

const ITEM_FIXTURE = {
  activo: "SI",
  apellido: "GARCIA",
  codigo: "541022775568",
  cuil: "27227755682",
  nroDoc: "22775568",
  nombre: "IVANA",
  profesiones: [
    {
      profesionReferencia: "Farmac\u00e9utico",
      refepsEspecialidad: null,
      matriculas: [
        {
          matricula: "4844",
          motivoSancion: null,
          origenEmite: "FARMACEUTICOS, Colegio de",
          provinciaMatricula: "C\u00f3rdoba",
          situacionMatricula: "Habilitado",
          tipoSancion: null,
        },
      ],
    },
    {
      profesionReferencia: "M\u00e9dico",
      refepsEspecialidad: "Cl\u00ednica",
      matriculas: [
        {
          matricula: "MP-99",
          motivoSancion: null,
          origenEmite: "Ministerio",
          provinciaMatricula: "Buenos Aires",
          situacionMatricula: "Inhabilitado",
          tipoSancion: "Suspensi\u00f3n",
        },
      ],
    },
  ],
};

function postFixture(items) {
  return `<html><body><div id="resultados-consulta"><div id="resultados-lista"></div></div>
<script>jQuery.extend(Drupal.settings, {});
Drupal.settings.refepsProfesionales = Drupal.settings.refepsProfesionales || {};
Drupal.settings.refepsProfesionales.allItems = ${JSON.stringify(items)};
</script></body></html>`;
}

const SIN_RESULTADOS = `<html><body><div id="resultados-consulta">
<div class="alert alert-info"><p>No se encuentran resultados para el DNI.</p></div>
</div></body></html>`;

function fetcherOk(postHtml = postFixture([ITEM_FIXTURE])) {
  return async (url, opts = {}) => ({
    ok: true,
    text: async () => (opts.method === "POST" ? postHtml : GET_FIXTURE),
  });
}

describe("normalizarTexto", () => {
  it("quita tildes, colapsa espacios y mayusculiza", () => {
    assert.equal(normalizarTexto("  C\u00f3rdoba  sur "), "CORDOBA SUR");
  });
});

describe("coincidencias de filtros", () => {
  it("jurisdicción ignora tildes y resuelve alias CABA", () => {
    assert.equal(jurisdiccionCoincide("C\u00f3rdoba", "cordoba"), true);
    assert.equal(jurisdiccionCoincide("Ciudad de Buenos Aires", "CABA"), true);
    assert.equal(jurisdiccionCoincide("C\u00f3rdoba", "Mendoza"), false);
    assert.equal(jurisdiccionCoincide("C\u00f3rdoba", ""), true);
  });
  it("matrícula ignora formato", () => {
    assert.equal(matriculaCoincide("MP-99", "mp99"), true);
    assert.equal(matriculaCoincide("4844", "4845"), false);
  });
});

describe("parseo del portal", () => {
  it("extrae el form_build_id del formulario correcto", () => {
    assert.equal(extraerFormBuildId(GET_FIXTURE), "form-ABC123");
    assert.equal(extraerFormBuildId("<html></html>"), "");
  });
  it("detecta la alerta de sin resultados", () => {
    assert.equal(detectarSinResultados(SIN_RESULTADOS), true);
    assert.equal(detectarSinResultados(postFixture([ITEM_FIXTURE])), false);
  });
  it("extrae allItems con escapes unicode y corchetes anidados", () => {
    const items = extraerAllItems(postFixture([ITEM_FIXTURE]));
    assert.equal(items.length, 1);
    assert.equal(items[0].apellido, "GARCIA");
    assert.equal(items[0].profesiones[0].profesionReferencia, "Farmac\u00e9utico");
  });
  it("devuelve arreglo vacío sin marcador", () => {
    assert.deepEqual(extraerAllItems("<html></html>"), []);
  });
});

describe("mapearProfesional", () => {
  it("marca habilitación y propaga sanción", () => {
    const p = mapearProfesional(ITEM_FIXTURE);
    assert.equal(p.dni, "22775568");
    assert.equal(p.habilitadoParaEjercer, true);
    assert.equal(p.profesiones[0].matriculas[0].habilitada, true);
    assert.equal(p.profesiones[1].matriculas[0].habilitada, false);
    assert.equal(p.profesiones[1].matriculas[0].sancion, "Suspensi\u00f3n");
    assert.equal(p.profesiones[1].especialidad, "Cl\u00ednica");
  });
});

describe("consultarProfesionalPorDni", () => {
  it("devuelve encontrado:true con el profesional", async () => {
    const r = await consultarProfesionalPorDni("22775568", { fetcher: fetcherOk() });
    assert.equal(r.ok, true);
    assert.equal(r.encontrado, true);
    assert.equal(r.profesional.nombre, "IVANA");
    assert.equal(r.profesional.habilitadoParaEjercer, true);
  });
  it("filtra por matrícula y jurisdicción", async () => {
    const ok = await consultarProfesionalPorDni("22775568", {
      fetcher: fetcherOk(),
      jurisdiccion: "C\u00f3rdoba",
      matricula: "4844",
    });
    assert.equal(ok.encontrado, true);
    const mal = await consultarProfesionalPorDni("22775568", {
      fetcher: fetcherOk(),
      matricula: "9999",
    });
    assert.equal(mal.encontrado, false);
    assert.equal(mal.motivo, "filtros_sin_coincidencia");
  });
  it("responde no_registrado sin resultados", async () => {
    const r = await consultarProfesionalPorDni("30000000", {
      fetcher: fetcherOk(SIN_RESULTADOS),
    });
    assert.equal(r.encontrado, false);
    assert.equal(r.motivo, "no_registrado");
  });
  it("reintenta ante fallos de red y luego resuelve", async () => {
    let llamadas = 0;
    const fetcher = async (url, opts = {}) => {
      llamadas += 1;
      if (llamadas <= 2) {
        throw new TypeError("fetch failed");
      }
      return {
        ok: true,
        text: async () => (opts.method === "POST" ? postFixture([ITEM_FIXTURE]) : GET_FIXTURE),
      };
    };
    const r = await consultarProfesionalPorDni("22775568", { fetcher });
    assert.equal(r.encontrado, true);
    assert.ok(llamadas > 2);
  });
  it("lanza RefepsError si el portal cae en todos los intentos", async () => {
    const fetcher = async () => ({ ok: false, status: 503, text: async () => "" });
    await assert.rejects(
      () => consultarProfesionalPorDni("22775568", { fetcher }),
      (e) => e instanceof RefepsError && e.code === CODIGOS_REFEPS.RED,
    );
  });
});
