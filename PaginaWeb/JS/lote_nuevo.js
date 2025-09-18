// JS/lote_nuevo.js
const API_BASE    = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK   = API_BASE + "PHP/check_session.php";
const URL_OPTS    = API_BASE + "PHP/lote_options.php";
const URL_CREATE  = API_BASE + "PHP/lote_create.php";

const $  = (s) => document.querySelector(s);
const msg = $("#msg");
const selEst = $("#selEstanque");
const selEsp = $("#selEspecie");
const selPro = $("#selProveedor");
const form   = $("#frmLote");

async function requireSession() {
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) { location.href = "index.html"; throw new Error("no-session"); }
  return j;
}

function fillSelect(sel, items, textKey, valueKey, withEmpty=false) {
  const opt = [];
  if (withEmpty) opt.push(`<option value="">(Sin proveedor)</option>`);
  for (const it of items) {
    opt.push(`<option value="${it[valueKey]}">${it[textKey]}</option>`);
  }
  sel.innerHTML = opt.join("");
}

async function loadOptions() {
  const r = await fetch(URL_OPTS, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) throw new Error(j.msg || "No se pudieron cargar opciones");

  fillSelect(selEst, j.estanques, "codigo", "id_estanque");
  fillSelect(selEsp, j.especies, "nombre", "id_especie");
  fillSelect(selPro, j.proveedores, "nombre_empresa", "id_proveedor", true);
}

function showMsg(type, text) {
  msg.className = `alert alert-${type}`;
  msg.textContent = text;
  msg.classList.remove("d-none");
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.classList.add("d-none");

  const fd = new FormData(form);

  // Normaliza proveedor vacío a null
  if (!fd.get("id_proveedor")) fd.delete("id_proveedor");

  const res = await fetch(URL_CREATE, {
    method: "POST",
    body: fd,
    credentials: "include"
  });

  const txt = await res.text();
  let j;
  try { j = JSON.parse(txt); } catch { showMsg("danger", "Respuesta no válida: " + txt); return; }

  if (!j.ok) { showMsg("danger", j.msg || "No se pudo crear el lote"); return; }

  showMsg("success", "Lote creado (ID " + j.id + "). Redirigiendo…");
  setTimeout(() => location.href = "lote.html", 900);
});

// init
await requireSession();
await loadOptions();
