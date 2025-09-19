// JS/cosecha.js
const API_BASE   = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK  = API_BASE + "PHP/check_session.php";
const URL_LIST   = API_BASE + "PHP/cosecha_mostrar.php"; // tu endpoint existente que debe devolver { ok:true, data: [...] }
const URL_LOGOUT = API_BASE + "PHP/logout.php";

const $ = (s) => document.querySelector(s);
const usuarioBox = $("#usuarioBox");
const tbody = $("#tbodyCosecha");
const q = $("#q");

async function requireSession() {
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) { location.href = "index.html"; throw new Error("no-session"); }
  sessionStorage.setItem("user", JSON.stringify(j));
  usuarioBox.textContent = `${j.nombre ?? ""} ${j.apellido ?? ""}`.trim() || j.usuario || "Usuario";
  return j;
}

function fmt(x, d=2){
  if (x === null || x === undefined || x === "") return "";
  return Number(x).toFixed(d);
}

async function loadCosechas(){
  const params = new URLSearchParams();
  const term = q.value.trim();
  if (term) params.set("q", term);

  tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Cargando…</td></tr>`;

  const r = await fetch(`${URL_LIST}?${params}`, { credentials: "include" });
  const j = await r.json();

  if (!j.ok) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-danger">Error: ${j.msg || "no se pudieron obtener las cosechas"}</td></tr>`;
    return;
  }

  const data = j.data || [];

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Sin resultados</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(row => {
    const id = row.id_cosecha ?? "-";
    const loteTxt = row.codigo_lote ?? row.lote ?? row.id_lote ?? "-";
    const fecha = row.fecha ?? "-";
    const cantidad = (row.cantidad_total != null) ? String(row.cantidad_total) : "-";
    const peso = (row.peso_total != null) ? fmt(row.peso_total, 2) : "-";
    const observ = row.observacion ?? "";
    const calidadTxt = row.calidad_nombre ?? (row.id_calidad ? `#${row.id_calidad}` : "-");
    const pesoCatTxt = row.peso_nombre ?? (row.id_peso ? `#${row.id_peso}` : "-");

    return `
      <tr>
        <td>${id}</td>
        <td>${loteTxt}</td>
        <td>${fecha}</td>
        <td>${cantidad}</td>
        <td>${peso}</td>
        <td>${observ}</td>
        <td>
          
        </td>
      </tr>
    `;
  }).join("");
}

document.getElementById("btnReload")?.addEventListener("click", loadCosechas);
q?.addEventListener("keydown", (e) => { if (e.key === "Enter") loadCosechas(); });

document.getElementById("btnLogout")?.addEventListener("click", async () => {
  try { await fetch(URL_LOGOUT, { credentials: "include" }); } catch {}
  sessionStorage.removeItem("user");
  location.href = "index.html";
});

// Init
await requireSession();
await loadCosechas();
