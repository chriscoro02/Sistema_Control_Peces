// JS/parametro_agua.js
const API_BASE  = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK = API_BASE + "PHP/check_session.php";
const URL_LIST  = API_BASE + "PHP/parametro_list.php";

const $ = (s)=>document.querySelector(s);
const usuarioBox = $("#usuarioBox");
const tbody = $("#tbodyParams");
const q = $("#q");

async function requireSession(){
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok){ location.href="index.html"; throw new Error("no-session"); }
  usuarioBox.textContent = (`${j.nombre??""} ${j.apellido??""}`.trim() || j.usuario || "Usuario");
  sessionStorage.setItem("user", JSON.stringify(j));
  return j;
}

function fmt(x, dec=2){
  if (x===null || x===undefined || x==="") return "";
  return Number(x).toFixed(dec);
}

async function loadData(){
  const params = new URLSearchParams();
  const term = q.value.trim();
  if (term) params.set("q", term);

  tbody.innerHTML = `<tr><td colspan="11" class="text-center text-muted py-4">Cargando…</td></tr>`;

  const r = await fetch(`${URL_LIST}?${params}`, { credentials: "include" });
  const j = await r.json();

  if (!j.ok){
    tbody.innerHTML = `<tr><td colspan="11" class="text-danger">Error: ${j.msg || "no se pudo obtener los datos"}</td></tr>`;
    return;
  }
  if (!j.data.length){
    tbody.innerHTML = `<tr><td colspan="11" class="text-center text-muted">Sin resultados</td></tr>`;
    return;
  }

  tbody.innerHTML = j.data.map(row => `
    <tr>
      <td>${row.id_parametro}</td>
      <td>${row.fecha}</td>
      <td>${row.estanque || "-"}</td>
      <td>${fmt(row.temperatura,2)}</td>
      <td>${fmt(row.ph,2)}</td>
      <td>${fmt(row.oxigeno,2)}</td>
      <td>${fmt(row.amonio,3)}</td>
      <td>${fmt(row.nitritos,2)}</td>
      <td>${fmt(row.turbidez,2)}</td>
      <td>${row.observacion || ""}</td>
      <td>
        <a class="btn btn-sm btn-outline-primary"
           href="parametro_agua_editar.html?id=${row.id_parametro}">
          Modificar
        </a>
      </td>
    </tr>
  `).join("");
}

document.getElementById("btnReload")?.addEventListener("click", loadData);
q?.addEventListener("keydown", e => { if (e.key === "Enter") loadData(); });

// init
await requireSession();
await loadData();
