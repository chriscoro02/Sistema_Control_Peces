// JS/muestreos.js
const API_BASE  = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK = API_BASE + "PHP/check_session.php";
const URL_LIST  = API_BASE + "PHP/muestreo_list.php"; 

const $ = (s) => document.querySelector(s);
const usuarioBox = $("#usuarioBox");
const tbody      = $("#tbodyMuestreos");
const codigoLoteBox = $("#codigoLoteBox");
const btnNuevoMuestreo = $("#btnNuevoMuestreo");

function getIdLoteDeURL() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id_lote"), 10);
  return isNaN(id) ? null : id;
}

async function requireSession() {
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) { location.href = "index.html"; throw new Error("no-session"); }
  usuarioBox.textContent = `${j.nombre ?? ""} ${j.apellido ?? ""}`.trim() || j.usuario || "Usuario";
  return j;
}

async function loadMuestreos(idLote) {
  tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Cargando…</td></tr>`;

  const r = await fetch(`${URL_LIST}?id_lote=${idLote}`, { credentials: "include" });
  const j = await r.json();

  if (!j.ok) {
    codigoLoteBox.textContent = "Error";
    tbody.innerHTML = `<tr><td colspan="8" class="text-danger">Error: ${j.msg || "No se pudo obtener los muestreos"}</td></tr>`;
    return;
  }
  
  codigoLoteBox.textContent = j.lote.codigo_lote || `ID ${idLote}`;
  btnNuevoMuestreo.href = `muestreo_nuevo.html?id_lote=${idLote}`;

  if (!j.data.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Este lote aún no tiene muestreos.</td></tr>`;
    return;
  }

  // ***** CAMBIO AQUÍ EN LAS FILAS DE LA TABLA *****
  tbody.innerHTML = j.data.map(row => `
    <tr>
      <td>${row.id_muestreo}</td>
      <td>${new Date(row.fecha).toLocaleString('es-ES')}</td>
      <td>${row.numero_muestreado || "-"}</td>
      <td>${row.peso_promedio ? parseFloat(row.peso_promedio).toFixed(3) + ' kg' : "-"}</td>
      <td>${row.talla_promedio ? parseFloat(row.talla_promedio).toFixed(2) + ' cm' : "-"}</td>
      <td>${row.biomasa ? parseFloat(row.biomasa).toFixed(2) + ' kg' : "-"}</td>
      <td>${row.conversion_alimenticia || "-"}</td>
      <td>${row.registrado_por_nombre || "-"}</td>
    </tr>
  `).join("");
  // ***********************************************
}

(async () => {
    try {
        await requireSession();
        
        const idLote = getIdLoteDeURL();
        if (idLote === null) {
            alert("ID de lote no válido.");
            window.location.href = "lote.html";
            return;
        }

        await loadMuestreos(idLote);

    } catch (err) {
        console.error("Error en la inicialización:", err);
    }
})();