// JS/parametro_agua.js
const API_BASE   = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK  = API_BASE + "PHP/check_session.php";
const URL_LIST   = API_BASE + "PHP/parametro_list.php";

const $ = (s)=>document.querySelector(s);
const usuarioBox = $("#usuarioBox");
const tbody = $("#tbodyParam");
const q = $("#q");

async function requireSession(){
  const r = await fetch(URL_CHECK,{credentials:"include"}); const j = await r.json();
  if(!j.ok){ location.href="index.html"; throw new Error("no-session"); }
  usuarioBox.textContent = (`${j.nombre??""} ${j.apellido??""}`.trim() || j.usuario || "Usuario");
  sessionStorage.setItem("user", JSON.stringify(j));
  return j;
}

function fmt(n){ return (n===null || n===undefined || n==="") ? "-" : n; }

async function loadData(){
  const params = new URLSearchParams();
  const term = q.value.trim(); if(term) params.set("q", term);

  tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">Cargando…</td></tr>`;
  const r = await fetch(`${URL_LIST}?${params}`, { credentials:"include" });
  const j = await r.json();

  if(!j.ok){
    tbody.innerHTML = `<tr><td colspan="10" class="text-danger">Error: ${j.msg||"no se pudo obtener datos"}</td></tr>`;
    return;
  }
  if(!j.data.length){
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">Sin resultados</td></tr>`;
    return;
  }

  tbody.innerHTML = j.data.map(x=>`
    <tr>
      <td>${x.id_parametro}</td>
      <td>${x.fecha}</td>
      <td>${x.estanque}</td>
      <td>${fmt(x.temperatura)}</td>
      <td>${fmt(x.ph)}</td>
      <td>${fmt(x.oxigeno)}</td>
      <td>${fmt(x.amonio)}</td>
      <td>${fmt(x.nitritos)}</td>
      <td>${fmt(x.turbidez)}</td>
      <td>${fmt(x.observacion)}</td>
    </tr>
  `).join("");
}

document.getElementById("btnReload")?.addEventListener("click", loadData);
q?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") loadData(); });

await requireSession();
await loadData();
