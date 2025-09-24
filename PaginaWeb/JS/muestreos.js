// JS/muestreos.js
const API_BASE = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK = API_BASE + "PHP/check_session.php";
// Necesitarás crear este nuevo archivo PHP
const URL_LIST = API_BASE + "PHP/muestreo_list.php";

const $ = (s) => document.querySelector(s);
const usuarioBox = $("#usuarioBox");
const tbody = $("#tbodyMuestreos");
const codigoLoteBox = $("#codigoLoteBox");
const btnNuevoMuestreo = $("#btnNuevoMuestreo");

// --- Nueva Lógica ---
// Función para leer el parámetro 'id_lote' de la URL
function getIdLoteDeURL() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id_lote"), 10);
    return isNaN(id) ? null : id;
}
// --------------------

async function requireSession() {
    // (Esta función es igual que en tus otros archivos)
    const r = await fetch(URL_CHECK, { credentials: "include" });
    const j = await r.json();
    if (!j.ok) { location.href = "index.html"; throw new Error("no-session"); }
    usuarioBox.textContent = `${j.nombre ?? ""} ${j.apellido ?? ""}`.trim() || j.usuario || "Usuario";
    return j;
}

async function loadMuestreos(idLote) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Cargando…</td></tr>`;

    // Se envía el idLote al script PHP para que filtre los resultados
    const r = await fetch(`${URL_LIST}?id_lote=${idLote}`, { credentials: "include" });
    const j = await r.json();

    if (!j.ok) {
        codigoLoteBox.textContent = "Error";
        tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Error: ${j.msg || "No se pudo obtener los muestreos"}</td></tr>`;
        return;
    }

    // Actualizamos el título de la página y el botón "Nuevo"
    codigoLoteBox.textContent = j.lote.codigo_lote || `ID ${idLote}`;
    btnNuevoMuestreo.href = `muestreo_nuevo.html?id_lote=${idLote}`;


    if (!j.data.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Este lote aún no tiene muestreos.</td></tr>`;
        return;
    }

    tbody.innerHTML = j.data.map(row => `
    <tr>
      <td>${row.id_muestreo}</td>
      <td>${new Date(row.fecha).toLocaleString('es-ES')}</td>
      <td>${row.numero_muestreado || "-"}</td>
      <td>${row.peso_promedio ? parseFloat(row.peso_promedio).toFixed(3) + ' kg' : "-"}</td>
      <td>${row.talla_promedio ? parseFloat(row.talla_promedio).toFixed(2) + ' cm' : "-"}</td>
      <td>${row.comportamiento || "-"}</td>
      <td>${row.registrado_por_nombre || "-"}</td>
    </tr>
  `).join("");
}

// --- Flujo de Inicialización ---
(async () => {
    try {
        await requireSession();

        const idLote = getIdLoteDeURL();
        if (idLote === null) {
            alert("ID de lote no válido.");
            window.location.href = "lote.html"; // Redirigir si no hay ID
            return;
        }

        await loadMuestreos(idLote);

    } catch (err) {
        console.error("Error en la inicialización:", err);
    }
})();