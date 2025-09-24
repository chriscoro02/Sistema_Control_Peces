// JS/parametro_agua_nuevo.js
const API_BASE   = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK  = API_BASE + "PHP/check_session.php";
const URL_OPTS   = API_BASE + "PHP/parametro_options.php";
const URL_CREATE = API_BASE + "PHP/parametro_create.php";

const $ = (s)=>document.querySelector(s);
const selEst = $("#selEstanque");
const form   = $("#frmParam");
const msg    = $("#msg");
const usuarioBox = $("#usuarioBox");
const inpFecha = $("#inpFecha");

async function requireSession(){
  const r = await fetch(URL_CHECK,{credentials:"include"}); const j = await r.json();
  if(!j.ok){ location.href="index.html"; throw new Error("no-session"); }
  usuarioBox.textContent = (`${j.nombre??""} ${j.apellido??""}`.trim() || j.usuario || "Usuario");
  return j;
}

function showMsg(type, text){
  msg.className = `alert alert-${type}`;
  msg.textContent = text;
  msg.classList.remove("d-none");
}

function fillSelect(sel, items){
  sel.innerHTML = items.map(it => `<option value="${it.id_estanque}">${it.codigo}</option>`).join("");
}

async function loadOptions(){
  const r = await fetch(URL_OPTS, { credentials:"include" });
  const j = await r.json();
  if(!j.ok) throw new Error(j.msg||"No se pudieron cargar estanques");
  fillSelect(selEst, j.estanques);
}

form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  msg.classList.add("d-none");

  const fd = new FormData(form);
  // vacíos => NULL
  ["temperatura","ph","oxigeno","amonio","nitritos","turbidez","observacion","tipo"].forEach(k=>{
    const v = (fd.get(k)||"").toString().trim();
    if(v==="") fd.delete(k);
  });

  const res = await fetch(URL_CREATE, { method:"POST", body:fd, credentials:"include" });
  const txt = await res.text();
  let j; try{ j = JSON.parse(txt); }catch{ showMsg("danger","Respuesta no válida: "+txt); return; }

  if(!j.ok){ showMsg("danger", j.msg || "No se pudo guardar"); return; }

  showMsg("success", "Registro creado (ID "+j.id+"). Redirigiendo…");
  setTimeout(()=>location.href="parametro_agua.html",900);
});

// init
await requireSession();
await loadOptions();
// set default datetime-local ahora (sin segundos)
(function setNow(){
  const d=new Date();
  const pad=n=>n.toString().padStart(2,"0");
  const val = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if(inpFecha) inpFecha.value = val;
})();
