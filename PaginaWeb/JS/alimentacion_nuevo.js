// JS/alimentacion_nuevo.js
const API_BASE   = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK  = API_BASE + "PHP/check_session.php";
const URL_OPTS   = API_BASE + "PHP/alimentacion_options.php";
const URL_CREATE = API_BASE + "PHP/alimentacion_create.php";

const $   = (s) => document.querySelector(s);
const msg = $("#msg");
const selLote = $("#selLote");
const selTipoAlimento = $("#selTipoAlimento");
const form  = $("#frmAlimentacion");
const usuarioBox = document.getElementById("usuarioBox"); // Cambio aplicado

async function requireSession() {
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) { location.href = "index.html"; throw new Error("no-session"); }
  return j; // Cambio aplicado: ya no modifica el DOM aquí
}

function fillSelect(sel, items, textKey, valueKey, firstOptionText = "-- Seleccionar --") {
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
  fillSelect(selTipoAlimento, j.tipos_alimento, "nombre", "id_tipo_alimento", "Seleccionar Alimento...");
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

  const res = await fetch(URL_CREATE, {
    method: "POST",
    body: fd,
    credentials: "include"
  });

  const txt = await res.text();
  let j;
  try { j = JSON.parse(txt); } catch { showMsg("danger", "Respuesta no válida del servidor: " + txt); return; }

  if (!j.ok) { showMsg("danger", j.msg || "No se pudo crear el registro"); return; }

  showMsg("success", "Registro de alimentación guardado (ID " + j.id + "). Redirigiendo…");
  setTimeout(() => location.href = "alimentacion.html", 1200);
});

// ===== init ===== (Bloque de inicialización mejorado)
try {
  const user = await requireSession();
  
  // Pinta el nombre en el chip
  if (usuarioBox) {
    const nombreCompleto = `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim();
    usuarioBox.textContent = nombreCompleto || user.usuario || "Usuario";
  }

  await loadOptions();
  setNow();
  
} catch (err) {
  console.error("init error:", err);
  // Si requireSession falla, el error es capturado aquí y redirige
  // location.href = "index.html"; // La redirección ya ocurre dentro de requireSession
}