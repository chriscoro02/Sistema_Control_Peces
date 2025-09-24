// JS/parametro_agua_editar.js
const API_BASE   = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK  = API_BASE + "PHP/check_session.php";
const URL_OPTS   = API_BASE + "PHP/parametro_options.php";
const URL_GET    = API_BASE + "PHP/parametro_get.php?id=";
const URL_UPDATE = API_BASE + "PHP/parametro_update.php";

const $ = (s)=>document.querySelector(s);
const usuarioBox = $("#usuarioBox");
const form = $("#frmParam");
const selEst = $("#selEstanque");
const msg = $("#msg");

const qs = new URLSearchParams(location.search);
const ID = Number(qs.get("id") || 0);
if (!ID) { alert("Falta id de parámetro"); location.href="parametro_agua.html"; }

async function requireSession(){
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok){ location.href="index.html"; throw new Error("no-session"); }
  usuarioBox.textContent = (`${j.nombre??""} ${j.apellido??""}`.trim() || j.usuario || "Usuario");
  return j;
}

function showMsg(type, text){
  msg.className = `alert alert-${type}`;
  msg.textContent = text;
  msg.classList.remove("d-none");
}

function fillEstanques(list){
  selEst.innerHTML = list.map(e=>`<option value="${e.id_estanque}">${e.codigo}</option>`).join("");
}

function toDatetimeLocal(s){ // "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM"
  if (!s) return "";
  return s.replace(" ", "T").slice(0,16);
}

async function loadOptions(){
  const r = await fetch(URL_OPTS, { credentials:"include" });
  const j = await r.json();
  if (!j.ok) throw new Error(j.msg || "No se pudieron cargar estanques");
  fillEstanques(j.estanques || []);
}

async function loadParam(){
  const r = await fetch(URL_GET + ID, { credentials:"include" });
  const j = await r.json();
  if (!j.ok){ showMsg("danger", j.msg || "No se pudo cargar el registro"); throw new Error("no-rec"); }

  $("#id_parametro").value = j.data.id_parametro;
  selEst.value             = String(j.data.id_estanque);
  $("#fecha").value        = toDatetimeLocal(j.data.fecha);
  $("#temperatura").value  = j.data.temperatura ?? "";
  $("#ph").value           = j.data.ph ?? "";
  $("#oxigeno").value      = j.data.oxigeno ?? "";
  $("#amonio").value       = j.data.amonio ?? "";
  $("#nitritos").value     = j.data.nitritos ?? "";
  $("#turbidez").value     = j.data.turbidez ?? "";
  $("#tipo").value         = j.data.tipo ?? "";
  $("#observacion").value  = j.data.observacion ?? "";
}

form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  msg.classList.add("d-none");

  const fd = new FormData(form);
  // vacíos => NULL (solo para opcionales)
  ["temperatura","ph","oxigeno","amonio","nitritos","turbidez","observacion","tipo"].forEach(k=>{
    const v = (fd.get(k)||"").toString().trim();
    if(v==="") fd.delete(k);
  });

  const res = await fetch(URL_UPDATE, { method:"POST", body:fd, credentials:"include" });
  const txt = await res.text();
  let j; try{ j = JSON.parse(txt); } catch { showMsg("danger","Respuesta no válida: "+txt); return; }

  if (!j.ok){ showMsg("danger", j.msg || "No se pudo actualizar"); return; }
  showMsg("success","Actualizado ✔");
  setTimeout(()=>location.href="parametro_agua.html", 800);
});

// init
await requireSession();
await loadOptions();
await loadParam();
