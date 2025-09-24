// JS/venta_nueva.js
const API_BASE   = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK  = API_BASE + "PHP/check_session.php";
const URL_OPTS   = API_BASE + "PHP/venta_options.php";
const URL_CREATE = API_BASE + "PHP/venta_create.php";

const $ = (s) => document.querySelector(s);
const msg = $("#msg");
const selCosecha = $("#selCosecha");
const selDestino = $("#selDestino");
const form = $("#frmVenta");
const usuarioBox = document.getElementById("usuarioBox");

async function requireSession() {
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) { location.href = "index.html"; throw new Error("no-session"); }
  return j;
}

function fillSelect(sel, items, textKey, valueKey, firstOptionText) {
  const opt = [`<option value="">${firstOptionText}</option>`];
  for (const it of items) {
    opt.push(`<option value="${it[valueKey]}">${it[textKey]}</option>`);
  }
  sel.innerHTML = opt.join("");
}

async function loadOptions() {
  const r = await fetch(URL_OPTS, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) throw new Error(j.msg || "No se pudieron cargar opciones");

  fillSelect(selCosecha, j.cosechas, "cosecha_info", "id_cosecha", "Seleccionar Cosecha...");
  fillSelect(selDestino, j.destinos, "tipo", "id_destino", "Seleccionar Destino...");
}

function showMsg(type, text) {
  msg.className = `alert alert-${type}`;
  msg.textContent = text;
  msg.classList.remove("d-none");
}

function setNow() {
  // set default datetime-local = ahora (sin segundos)
  const inp = form.querySelector('input[name="fecha_venta"]');
  if (!inp) return;
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  inp.value = d.toISOString().slice(0,16);
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.classList.add("d-none");
  const fd = new FormData(form);

  // Normaliza opcionales vacíos
  ["presentacion","temperatura_transporte","observacion"].forEach(k=>{
    const v = (fd.get(k)||"").toString().trim();
    if (v === "") fd.delete(k);
  });

  const res = await fetch(URL_CREATE, { method: "POST", body: fd, credentials: "include" });
  const txt = await res.text();
  let j;
  try { j = JSON.parse(txt); } catch { showMsg("danger", "Respuesta no válida: " + txt); return; }

  if (!j.ok) { showMsg("danger", j.msg || "No se pudo crear el registro de venta"); return; }

  showMsg("success", "Venta registrada (ID " + j.id + "). Redirigiendo…");
  setTimeout(() => location.href = "ventas.html", 1200);
});

(async () => {
  try {
    const user = await requireSession();
    if (usuarioBox) {
      const nombreCompleto = `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim();
      usuarioBox.textContent = nombreCompleto || user.usuario || "Usuario";
    }
    await loadOptions();
    setNow();
  } catch (err) {
    console.error("init error:", err);
  }
})();
