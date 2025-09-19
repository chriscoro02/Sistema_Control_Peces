// JS/cosecha_nueva.js
const API_BASE   = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK  = API_BASE + "PHP/check_session.php";
const URL_OPTS   = API_BASE + "PHP/cosecha_options.php";
const URL_CREATE = API_BASE + "PHP/cosecha_create.php";

const $ = (s) => document.querySelector(s);
const msg = $("#msg");
const selLote = $("#selLote");
const selCalidad = $("#selCalidad");
const selPeso = $("#selPeso");
const form = $("#frmCosecha");
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

  fillSelect(selLote, j.lotes, "codigo_lote", "id_lote", "Seleccionar Lote...");
  fillSelect(selCalidad, j.calidades, "clase", "id_calidad", "(Opcional)");
  fillSelect(selPeso, j.pesos, "categoria", "id_peso", "(Opcional)");
}

function showMsg(type, text) {
  msg.className = `alert alert-${type}`;
  msg.textContent = text;
  msg.classList.remove("d-none");
}

function setNow() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    form.fecha.value = now.toISOString().slice(0, 16);
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.classList.add("d-none");
  const fd = new FormData(form);

  const res = await fetch(URL_CREATE, { method: "POST", body: fd, credentials: "include" });
  const txt = await res.text();
  let j;
  try { j = JSON.parse(txt); } catch { showMsg("danger", "Respuesta no válida: " + txt); return; }

  if (!j.ok) { showMsg("danger", j.msg || "No se pudo registrar la cosecha"); return; }

  showMsg("success", "Cosecha registrada (ID " + j.id + "). Redirigiendo…");
  setTimeout(() => location.href = "cosechas.html", 1200);
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