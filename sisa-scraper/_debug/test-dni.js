const puppeteer = require("puppeteer");
const fs = require("fs");

const OUT = "/app/artifacts";
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

const DNIS = process.argv.slice(2);
if (!DNIS.length) DNIS.push("27496155");

async function clickTexto(page, aguja, { exacto = false, preferir = null } = {}) {
  const caja = await page.evaluate((aguja, exacto, preferir) => {
    const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const norm = (el) => (el.innerText || "").replace(/\s+/g, " ").trim();
    const sel = preferir || "h1,h2,h3,h4,a,div,span,td,li,button,label";
    const nodos = Array.from(document.querySelectorAll(sel));
    const matches = nodos.filter(visible).filter((el) => { const t = norm(el); return exacto ? t === aguja : t.toLowerCase().includes(aguja.toLowerCase()); });
    if (!matches.length) return null;
    matches.sort((a, b) => norm(a).length - norm(b).length);
    const el = matches[0];
    el.scrollIntoView({ block: "center" });
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, aguja, exacto, preferir);
  if (!caja) return false;
  await page.mouse.move(caja.x, caja.y);
  await page.mouse.down(); await sleep(70); await page.mouse.up();
  return true;
}

function parsear(texto, dni) {
  const strings = [];
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(texto)) !== null) strings.push(m[1]);
  const idx = strings.findIndex((s) => s.replace(/\D/g, "") === dni && s.length <= 9);
  if (idx < 0) return { idx, strings };
  return { idx, tipoDoc: strings[idx - 1], nombre: strings[idx + 1], strings };
}

(async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    headless: true,
    defaultViewport: { width: 1400, height: 1000 },
  });

  for (const dni of DNIS) {
    const page = await browser.newPage();
    await page.setDefaultTimeout(60000);
    let capturado = null;
    page.on("response", async (res) => {
      try {
        if (!/\/sisa\/sisa\/service\/list/.test(res.url())) return;
        const pd = res.request().postData() || "";
        if (!/getPage/.test(pd)) return;
        capturado = await res.text();
      } catch {}
    });

    await page.goto("https://sisa.msal.gov.ar/sisa/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector('::-p-xpath(//*[contains(., "Buscador de Establecimientos")])', { timeout: 45000 }).catch(() => {});
    await sleep(1500);
    await clickTexto(page, "Buscador de Establecimientos y Profesionales", { exacto: true });
    await sleep(6000);
    await clickTexto(page, "REFEPS Red Federal de Registros de Profesionales de la Salud");
    await sleep(4000);
    await clickTexto(page, "Documento", { exacto: true });
    await sleep(1000);
    const input = await page.$('input[placeholder*="documento"]') || await page.$("input.gwt-TextBox.util_w400") || await page.$("input.gwt-TextBox");
    await input.click({ clickCount: 3 });
    await input.type(dni, { delay: 60 });
    await sleep(500);
    await clickTexto(page, "Buscar", { exacto: true, preferir: "div.boton_general, div.boton, button" });

    const inicio = Date.now();
    while (Date.now() - inicio < 30000 && !capturado) await sleep(250);
    await sleep(500);

    log(`\n########## DNI ${dni} ##########`);
    log("capturado:", capturado ? `${capturado.length} bytes` : "NULL");
    if (capturado) {
      const strings = [];
      const re = /"((?:[^"\\]|\\.)*)"/g; let m;
      while ((m = re.exec(capturado)) !== null) strings.push(m[1]);
      log("strings:", JSON.stringify(strings));
      log("parse:", JSON.stringify(parsear(capturado, dni)));
    }
    fs.writeFileSync(`${OUT}/test-${dni}.json`, JSON.stringify({ dni, capturado, bodyText: await page.evaluate(() => (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 2000)) }, null, 2));
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
