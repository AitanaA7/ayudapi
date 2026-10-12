const puppeteer = require("puppeteer");
const fs = require("fs");

const OUT = "/app/artifacts";
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);
const DNI = "27496155";

(async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    headless: true,
    defaultViewport: { width: 1400, height: 1000 },
  });
  const page = await browser.newPage();
  await page.setDefaultTimeout(60000);

  page.on("request", (req) => {
    const rt = req.resourceType();
    if (rt === "xhr" || rt === "fetch") log(`[REQ] ${req.method()} ${req.url()}`);
  });
  page.on("response", async (res) => {
    try {
      const req = res.request();
      const rt = req.resourceType();
      if (rt !== "xhr" && rt !== "fetch") return;
      let body = ""; try { body = await res.text(); } catch {}
      log(`[RES] ${res.status()} ${req.method()} ${req.url()}`);
      if (req.postData()) log(`   POST: ${req.postData().slice(0, 1200)}`);
      if (body) log(`   BODY: ${body.slice(0, 3000)}`);
    } catch {}
  });

  async function clickText(needle, { exact = false, prefer = null } = {}) {
    const box = await page.evaluate((needle, exact, prefer) => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const norm = (e) => (e.innerText || "").replace(/\s+/g, " ").trim();
      const sel = prefer || "h1,h2,h3,h4,a,div,span,td,li,button,label";
      const all = Array.from(document.querySelectorAll(sel));
      const m = all.filter(vis).filter((e) => (exact ? norm(e) === needle : norm(e).toLowerCase().includes(needle.toLowerCase())));
      if (!m.length) return null;
      m.sort((a, b) => norm(a).length - norm(b).length);
      const el = m[0];
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, label: norm(el).slice(0, 60), cls: (el.className || "").toString().slice(0, 50) };
    }, needle, exact, prefer);
    if (!box) { log(`   [!] no match "${needle}" (prefer=${prefer})`); return null; }
    log(`   >> click "${box.label}" [${box.cls}] @(${Math.round(box.x)},${Math.round(box.y)})`);
    await page.mouse.move(box.x, box.y);
    await page.mouse.down(); await sleep(70); await page.mouse.up();
    return box;
  }

  async function dump(label) {
    const data = await page.evaluate(() => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const radios = Array.from(document.querySelectorAll("input[type=radio]")).filter(vis).map((e) => ({ id: e.id, checked: e.checked, ctx: (e.closest("label,div") ? (e.closest("label,div").innerText || "") : "").replace(/\s+/g, " ").trim().slice(0, 40) }));
      const tables = Array.from(document.querySelectorAll("table")).filter(vis).map((t) => Array.from(t.querySelectorAll("tr")).map((tr) => Array.from(tr.querySelectorAll("th,td")).map((c) => (c.innerText || "").replace(/\s+/g, " ").trim())).filter((r2) => r2.some((x) => x)));
      return { url: location.href, radios, tables, bodyText: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 4000) };
    });
    fs.writeFileSync(`${OUT}/${label}.json`, JSON.stringify(data, null, 2));
    try { fs.writeFileSync(`${OUT}/${label}.html`, await page.content()); } catch {}
    try { await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: true }); } catch {}
    log(`\n===== ${label} url=${data.url} =====`);
    log("radios:", JSON.stringify(data.radios));
    log("tables:", JSON.stringify(data.tables));
    log("body:", data.bodyText.slice(0, 1500));
  }

  await page.goto("https://sisa.msal.gov.ar/sisa/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector('::-p-xpath(//*[contains(., "Buscador de Establecimientos")])', { timeout: 45000 }).catch(() => {});
  await sleep(1500);

  log("STEP open-buscador");
  await clickText("Buscador de Establecimientos y Profesionales", { exact: true });
  await sleep(6000);

  log("STEP refeps-tab");
  await clickText("REFEPS Red Federal de Registros de Profesionales de la Salud");
  await sleep(4000);

  log("STEP ensure-documento");
  await clickText("Documento", { exact: true });
  await sleep(1200);

  log("STEP type-dni");
  const input = await page.$('input[placeholder*="documento"]') || await page.$('input.gwt-TextBox.util_w400') || await page.$('input.gwt-TextBox');
  if (input) { await input.click({ clickCount: 3 }); await input.type(DNI, { delay: 60 }); }
  await sleep(500);
  log("   input value:", input ? await page.evaluate((el) => el.value, input) : "(none)");
  await dump("e1-before");

  log("STEP buscar-button");
  const b1 = await clickText("Buscar", { exact: true, prefer: "div.boton_general, div.boton, button" });
  await sleep(9000);
  await dump("e2-result");

  if (!b1) {
    log("STEP fallback: Enter + buscar generico");
    if (input) { await input.focus(); await input.press("Enter"); }
    await sleep(8000);
    await dump("e3-result-enter");
  }

  await browser.close();
})().catch((e) => { console.error("RECON_ERROR:", e.message); process.exit(1); });
