// JS/lote_editar.js
const API_BASE    = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK   = API_BASE + "PHP/check_session.php";
const URL_OPTS    = API_BASE + "PHP/lote_options.php";
const URL_GET     = API_BASE + "PHP/lote_get.php?id=";
const URL_UPDATE  = API_BASE + "PHP/lote_update.php";

const $  = (s)=>document.querySelector(s);
const msg = $("#msg");
const usuarioBox = $("#usuarioBox");
const form = $("#frmLote");
const selEst = $("#selEstanque");
const selEsp = $("#selEspecie");
const selPro = $("#selProveedor");

const qs = new URLSearchParams(location.search);
const ID = Number(qs.get("id")||0);

if(!ID){ alert("Falta id de lote."); location.href="lote.html"; }

async function requireSession(){
  const r = await fetch(URL_CHECK,{credentials:"include"}); const j = await r.json();
  if(!j.ok){ location.href="index.html"; throw new Error("no-session"); }
  usuarioBox.textContent = (`${j.nombre??""} ${j.apellido??""}`.trim() || j.usuario || "Usuario");
  return j;
}

function showMsg(type,text){
  msg.className = `alert alert-${type}`;
  msg.textContent = text;
  msg.classList.remove("d-none");
}

function fill(sel, items, textKey, valueKey, withEmpty=false){
  const out = [];
  if(withEmpty) out.push(`<option value="">(Sin proveedor)</option>`);
  for(const it of items) out.push(`<option value="${it[valueKey]}">${it[textKey]}</option>`);
  sel.innerHTML = out.join("");
}

async function loadOptions(){
  const r = await fetch(URL_OPTS,{credentials:"include"}); const j = await r.json();
  if(!j.ok) throw new Error(j.msg||"No se pudieron cargar opciones");
  fill(selEst, j.estanques, "codigo", "id_estanque");
  fill(selEsp, j.especies , "nombre", "id_especie");
  fill(selPro, j.proveedores, "nombre_empresa", "id_proveedor", true);
}

async function loadLote(){
  const r = await fetch(URL_GET + ID, { credentials:"include" });
  const j = await r.json();
  if(!j.ok){ showMsg("danger", j.msg||"No se pudo cargar el lote"); throw new Error("no-lote"); }

  // Asignar valores
  $("#id_lote").value        = j.data.id_lote;
  $("#codigo_lote").value    = j.data.codigo_lote;
  $("#fecha_siembra").value  = j.data.fecha_siembra; // viene YYYY-MM-DD
  $("#cantidad_inicial").value = j.data.cantidad_inicial;
  $("#origen").value         = j.data.origen || "";

  selEst.value = String(j.data.id_estanque);
  selEsp.value = String(j.data.id_especie);
  selPro.value = j.data.id_proveedor ? String(j.data.id_proveedor) : "";
}

form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  msg.classList.add("d-none");

  const fd = new FormData(form);
  if(!fd.get("id_proveedor")) fd.delete("id_proveedor"); // null si vacío

  const res = await fetch(URL_UPDATE, { method:"POST", body:fd, credentials:"include" });
  const txt = await res.text();
  let j; try{ j = JSON.parse(txt); } catch { showMsg("danger","Respuesta no válida: "+txt); return; }

  if(!j.ok){ showMsg("danger", j.msg || "No se pudo actualizar"); return; }
  showMsg("success", "Lote actualizado ✔"); 
  setTimeout(()=> location.href="lote.html", 800);
});

// Init
await requireSession();
await loadOptions();
await loadLote();
