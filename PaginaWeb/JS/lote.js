// JS/lote.js
const API_BASE   = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK  = API_BASE + "PHP/check_session.php";
const URL_LOGOUT = API_BASE + "PHP/logout.php";
const URL_LIST   = API_BASE + "PHP/lote_list.php";

const $ = (s) => document.querySelector(s);
const usuarioBox = $("#usuarioBox");
const tbody      = $("#tbodyLotes");
const q          = $("#q");

async function requireSession() {
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) { location.href = "index.html"; throw new Error("no-session"); }
  sessionStorage.setItem("user", JSON.stringify(j));
  usuarioBox.textContent = `${j.nombre ?? ""} ${j.apellido ?? ""}`.trim() || j.usuario || "Usuario";
  return j;
}

async function loadLotes() {
  const params = new URLSearchParams();
  const term = q.value.trim();
  if (term) params.set("q", term);

  tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Cargando…</td></tr>`;

  const r = await fetch(`${URL_LIST}?${params}`, { credentials: "include" });
  const j = await r.json();

  if (!j.ok) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-danger">Error: ${j.msg || "no se pudo obtener los lotes"}</td></tr>`;
    return;
  }

  if (!j.data.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Sin resultados</td></tr>`;
    return;
  }

  tbody.innerHTML = j.data.map(row => `
    <tr>
      <td>${row.id_lote}</td>
      <td><strong>${row.codigo_lote}</strong></td>
      <td>${row.estanque || "-"}</td>
      <td>${row.especie || "-"}</td>
      <td>${row.proveedor || "-"}</td>
      <td>${row.fecha_siembra}</td>
      <td>${row.cantidad_inicial}</td>
      <td>${row.origen || "-"}</td>
    </tr>
  `).join("");
}

document.getElementById("btnReload")?.addEventListener("click", loadLotes);
q?.addEventListener("keydown", (e) => { if (e.key === "Enter") loadLotes(); });

document.getElementById("btnLogout")?.addEventListener("click", async () => {
  try { await fetch(URL_LOGOUT, { credentials: "include" }); } catch {}
  sessionStorage.removeItem("user");
  location.href = "index.html";
});

// Init
await requireSession();
await loadLotes();
