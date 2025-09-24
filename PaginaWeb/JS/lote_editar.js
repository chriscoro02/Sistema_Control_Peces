// JS/lote_editar.js
const API_BASE   = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK  = API_BASE + "PHP/check_session.php";
const URL_OPTS   = API_BASE + "PHP/lote_options.php";
const URL_GET    = API_BASE + "PHP/lote_get.php";
const URL_UPDATE = API_BASE + "PHP/lote_update.php";

const $ = (s) => document.querySelector(s);
const msg = $("#msg");
const form = $("#frmLote");
const usuarioBox = document.getElementById("usuarioBox");

// Función para leer el ID de la URL
function getIdLoteDeURL() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);
  return isNaN(id) ? null : id;
}

async function requireSession() {
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) { location.href = "index.html"; throw new Error("no-session"); }
  return j;
}

function showMsg(type, text) {
  msg.className = `alert alert-${type}`;
  msg.textContent = text;
  msg.classList.remove("d-none");
}

// Rellena un <select> con opciones
function fillSelect(sel, items, textKey, valueKey, firstOptionText = "-- Seleccionar --") {
  const opt = [`<option value="">${firstOptionText}</option>`];
  for (const it of items) {
    opt.push(`<option value="${it[valueKey]}">${it[textKey]}</option>`);
  }
  sel.innerHTML = opt.join("");
}

// Rellena el formulario con los datos del lote
function populateForm(loteData) {
    form.codigo_lote.value = loteData.codigo_lote;
    form.id_estanque.value = loteData.id_estanque;
    form.id_especie.value = loteData.id_especie;
    form.id_fase_crianza.value = loteData.id_fase_crianza;
    form.id_proveedor.value = loteData.id_proveedor || "";
    form.fecha_siembra.value = loteData.fecha_siembra;
    form.cantidad_inicial.value = loteData.cantidad_inicial;
    form.observacion.value = loteData.observacion || "";
}

form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.classList.add("d-none");
    const fd = new FormData(form);

    const res = await fetch(URL_UPDATE, { method: "POST", body: fd, credentials: "include" });
    const txt = await res.text();
    let j;
    try { j = JSON.parse(txt); } catch {
        showMsg("danger", "Respuesta no válida: " + txt);
        return;
    }

    if (!j.ok) {
        showMsg("danger", j.msg || "No se pudo actualizar el lote");
        return;
    }

    showMsg("success", "Lote actualizado correctamente. Redirigiendo…");
    setTimeout(() => location.href = "lote.html", 1200);
});

// ===== Flujo de Inicialización =====
(async () => {
    try {
        const user = await requireSession();
        if (usuarioBox) {
            const nombreCompleto = `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim();
            usuarioBox.textContent = nombreCompleto || user.usuario || "Usuario";
        }
        
        const idLote = getIdLoteDeURL();
        if (!idLote) {
            alert("ID de lote no válido.");
            window.location.href = 'lote.html';
            return;
        }

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'id_lote';
        hiddenInput.value = idLote;
        form.prepend(hiddenInput);

        // ===== Se añade el parámetro a la URL =====
        const optsRes = await fetch(`${URL_OPTS}?para_editar=1`, { credentials: "include" });
        // =======================================================
        
        const optsJson = await optsRes.json();
        if (!optsJson.ok) throw new Error("No se pudieron cargar las opciones");
        
        fillSelect($("#selEstanque"), optsJson.estanques, "codigo", "id_estanque");
        fillSelect($("#selEspecie"), optsJson.especies, "nombre", "id_especie");
        fillSelect($("#selProveedor"), optsJson.proveedores, "nombre_empresa", "id_proveedor", "(Sin proveedor)");
        fillSelect($("#selFase"), optsJson.fases, "nombre", "id_fase_crianza");

        const loteRes = await fetch(`${URL_GET}?id=${idLote}`, { credentials: "include" });
        const loteJson = await loteRes.json();
        if (!loteJson.ok) throw new Error(loteJson.msg || "No se pudo cargar el lote");

        populateForm(loteJson.data);

    } catch (err) {
        console.error("Error en la inicialización:", err);
        showMsg("danger", err.message);
    }
})();