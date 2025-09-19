// JS/cosecha_nuevo.js
const API_BASE = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK = API_BASE + "PHP/check_session.php";
const URL_OPTS  = API_BASE + "PHP/cosecha_options.php"; // veremos que este endpoint devuelve { ok:true, lotes:[], calidades:[], pesos:[] }
const URL_CREATE = API_BASE + "PHP/cosecha_create.php";
const URL_LOGOUT = API_BASE + "PHP/logout.php";

const $ = (s)=>document.querySelector(s);
const usuarioBox = $("#usuarioBox");
const selLote = $("#selLote");
const selCalidad = $("#selCalidad");
const selPesoCat = $("#selPesoCat");
const form = $("#frmCosecha");
const msg = $("#msg");

function showMsg(type, text){
  msg.className = `alert alert-${type}`;
  msg.textContent = text;
  msg.classList.remove("d-none");
}

async function requireSession(){
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok){ location.href="index.html"; throw new Error("no-session"); }
  usuarioBox.textContent = (`${j.nombre??""} ${j.apellido??""}`.trim() || j.usuario || "Usuario");
  return j;
}

async function loadOptions(){
  const r = await fetch(URL_OPTS, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) throw new Error(j.msg || "No se pudieron cargar opciones");

  const lotes = j.lotes || [];
  const calidades = j.calidades || [];
  const pesos = j.pesos || [];

  selLote.innerHTML = lotes.map(l => `<option value="${l.id_lote}">${l.codigo_lote ?? l.codigo ?? ('Lote '+l.id_lote)}</option>`).join("");
  selCalidad.innerHTML = `<option value="">(Sin seleccionar)</option>` + calidades.map(c => `<option value="${c.id_calidad}">${c.nombre ?? c.descripcion ?? ('#'+c.id_calidad)}</option>`).join("");
  selPesoCat.innerHTML = `<option value="">(Sin seleccionar)</option>` + pesos.map(p => `<option value="${p.id_peso}">${p.nombre ?? p.descripcion ?? ('#'+p.id_peso)}</option>`).join("");
}

form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  msg.classList.add("d-none");

  const fd = new FormData(form);

  const res = await fetch(URL_CREATE, { method: "POST", body: fd, credentials: "include" });
  const txt = await res.text();
  let j;
  try { j = JSON.parse(txt); } catch { showMsg("danger","Respuesta no válida: "+txt); return; }

  if (!j.ok) { showMsg("danger", j.msg || "No se pudo crear la cosecha"); return; }
  showMsg("success", "Cosecha creada (ID " + (j.id || j.insert_id || "") + "). Redirigiendo…");
  setTimeout(()=> location.href = "cosecha.html", 900);
});

// init
await requireSession();
await loadOptions();
