const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

/** Home del portal SISA. */
const SISA_URL_PORTAL = "https://sisa.msal.gov.ar/sisa/";

/** Timeouts */
const SISA_TIMEOUT_NAVEGACION_MS = 60_000;
const SISA_TIMEOUT_MENU_MS = 45_000;
const SISA_TIMEOUT_RESULTADOS_MS = 45_000;
const SISA_POLL_INTERVAL_MS = 250;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizarDni(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor).replace(/\D/g, "");
}

function esDniValido(dni) {
  return /^\d{7,8}$/.test(normalizarDni(dni));
}

/**
 * Hace clic con el mouse real sobre el primer elemento visible cuyo texto
 * coincida. Necesario porque SISA es GWT y los click() sintéticos no disparan
 * los handlers.
 */
async function clickTexto(page, aguja, { exacto = false, preferir = null } = {}) {
  const caja = await page.evaluate(
    (aguja, exacto, preferir) => {
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const norm = (el) => (el.innerText || "").replace(/\s+/g, " ").trim();
      const selector = preferir || "h1,h2,h3,h4,a,div,span,td,li,button,label";
      const nodos = Array.from(document.querySelectorAll(selector));
      const matches = nodos
        .filter(visible)
        .filter((el) => {
          const t = norm(el);
          return exacto ? t === aguja : t.toLowerCase().includes(aguja.toLowerCase());
        });
      if (!matches.length) return null;
      matches.sort((a, b) => norm(a).length - norm(b).length);
      const el = matches[0];
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    aguja,
    exacto,
    preferir
  );

  if (!caja) return false;
  await page.mouse.move(caja.x, caja.y);
  await page.mouse.down();
  await sleep(70);
  await page.mouse.up();
  return true;
}

/** Extrae del payload GWT (//OK[...]) el registro del profesional consultado. */
function parsearRespuestaGwt(texto, dni) {
  const strings = [];
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(texto)) !== null) strings.push(m[1]);

  const idx = strings.findIndex((s) => s.replace(/\D/g, "") === dni && s.length <= 9);
  if (idx < 0) return null;

  const tipoDoc = (strings[idx - 1] || "").trim();
  const nombre = (strings[idx + 1] || "").trim();
  return { tipoDoc, nombre };
}

/** Fallback: busca el DNI en la grilla de resultados renderizada. */
async function existeEnDom(page, dni) {
  return page.evaluate((dni) => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const celdas = Array.from(document.querySelectorAll("table td")).filter(visible);
    return celdas.some((c) => (c.innerText || "").replace(/\D/g, "") === dni);
  }, dni);
}

/** Consulta REFEPS por DNI y devuelve si figura en el padrón. */
async function consultarSisaWeb(dni) {
  const dniNormalizado = normalizarDni(dni);

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      headless: true,
      defaultViewport: { width: 1400, height: 1000 },
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(SISA_TIMEOUT_NAVEGACION_MS);
    await page.setDefaultTimeout(SISA_TIMEOUT_RESULTADOS_MS);

    let respuestaGetPage = null;
    page.on("response", async (res) => {
      try {
        if (!/\/sisa\/sisa\/service\/list/.test(res.url())) return;
        const req = res.request();
        if (!/getPage/.test(req.postData() || "")) return;
        respuestaGetPage = await res.text();
      } catch {}
    });

    await page.goto(SISA_URL_PORTAL, { waitUntil: "domcontentloaded" });
    await page
      .waitForSelector('::-p-xpath(//*[contains(., "Buscador de Establecimientos")])', {
        timeout: SISA_TIMEOUT_MENU_MS,
      })
      .catch(() => {});
    await sleep(1500);

    await clickTexto(page, "Buscador de Establecimientos y Profesionales", { exacto: true });
    await sleep(6000);

    await clickTexto(page, "REFEPS Red Federal de Registros de Profesionales de la Salud");
    await sleep(4000);

    await clickTexto(page, "Documento", { exacto: true });
    await sleep(1000);

    const inputDni =
      (await page.$('input[placeholder*="documento"]')) ||
      (await page.$("input.gwt-TextBox.util_w400")) ||
      (await page.$("input.gwt-TextBox"));
    if (!inputDni) {
      return { coincide: false, mensaje: "No se pudo acceder al buscador de REFEPS en SISA." };
    }
    await inputDni.click({ clickCount: 3 });
    await inputDni.type(dniNormalizado, { delay: 60 });
    await sleep(500);

    const clickBuscar = await clickTexto(page, "Buscar", {
      exacto: true,
      preferir: "div.boton_general, div.boton, button",
    });
    if (!clickBuscar) {
      return { coincide: false, mensaje: "No se pudo ejecutar la búsqueda en SISA." };
    }

    // Esperar la respuesta del RPC (fuente principal; incluye el nombre).
    const inicio = Date.now();
    while (Date.now() - inicio < SISA_TIMEOUT_RESULTADOS_MS && !respuestaGetPage) {
      await sleep(SISA_POLL_INTERVAL_MS);
    }

    if (respuestaGetPage) {
      const registro = parsearRespuestaGwt(respuestaGetPage, dniNormalizado);
      if (registro) {
        return { coincide: true, nombre: registro.nombre, tipoDoc: registro.tipoDoc };
      }
      return {
        coincide: false,
        mensaje: "El DNI no figura en el padrón de profesionales (REFEPS) del SISA.",
      };
    }

    // Fallback: si no hubo RPC, revisar la grilla renderizada.
    if (await existeEnDom(page, dniNormalizado).catch(() => false)) {
      return { coincide: true };
    }

    return {
      coincide: false,
      mensaje: "El DNI no figura en el padrón de profesionales (REFEPS) del SISA.",
    };
  } catch {
    return {
      coincide: false,
      mensaje: "No se pudo consultar el padrón SISA/REFEPS en este momento. Intentá nuevamente más tarde.",
    };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/verificar-sisa", async (req, res) => {
  try {
    const { dni } = req.body || {};

    if (dni === undefined || dni === null || String(dni).trim() === "") {
      return res.status(400).json({ ok: false, mensaje: "El DNI es obligatorio." });
    }

    if (!esDniValido(dni)) {
      return res.status(400).json({ ok: false, mensaje: "El DNI no tiene un formato válido." });
    }

    const resultado = await consultarSisaWeb(dni);

    if (resultado.coincide === true) {
      return res.json({ ok: true, nombre: resultado.nombre || null, tipoDoc: resultado.tipoDoc || null });
    }

    return res.json({
      ok: false,
      mensaje: resultado.mensaje || "El DNI no figura en el padrón SISA/REFEPS.",
    });
  } catch (error) {
    console.error("[sisa-scraper] Error inesperado:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error interno al consultar el padrón SISA/REFEPS.",
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`[sisa-scraper] Servidor escuchando en puerto ${PORT}`);
});
