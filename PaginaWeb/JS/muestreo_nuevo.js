// JS/muestreo_nuevo.js
const API_BASE   = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK  = API_BASE + "PHP/check_session.php";
const URL_CREATE = API_BASE + "PHP/muestreo_create.php";

const $ = (s) => document.querySelector(s);
const msg = $("#msg");
const form  = $("#frmMuestreo");
const usuarioBox = document.getElementById("usuarioBox");
const btnVolver = $("#btnVolver");

// Función para leer el parámetro 'id_lote' de la URL
function getIdLoteDeURL() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id_lote"), 10);
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

function setNow() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    // Asegurarse de que el campo 'fecha' exista en el formulario
    if (form.fecha) {
        form.fecha.value = now.toISOString().slice(0, 16);
    }
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.classList.add("d-none");
  const fd = new FormData(form);

  const res = await fetch(URL_CREATE, { method: "POST", body: fd, credentials: "include" });
  const txt = await res.text();
  let j;
  try { j = JSON.parse(txt); } catch { 
    showMsg("danger", "Respuesta no válida: " + txt);
    return; 
  }

  if (!j.ok) { 
    showMsg("danger", j.msg || "No se pudo crear el muestreo");
    return; 
  }

  showMsg("success", "Muestreo creado (ID " + j.id + "). Redirigiendo…");
  // Redirigir a la lista de muestreos del lote correspondiente
  const idLote = getIdLoteDeURL();
  setTimeout(() => location.href = `muestreos.html?id_lote=${idLote}`, 900);
});


(async () => {
    try {
        const user = await requireSession();
        if (usuarioBox) {
            const nombreCompleto = `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim();
            usuarioBox.textContent = nombreCompleto || user.usuario || "Usuario";
        }
        
        const idLote = getIdLoteDeURL();
        if (!idLote) {
            alert("No se ha especificado un lote.");
            window.location.href = 'lote.html';
            return;
        }

        // Añadir el id_lote como un campo oculto en el formulario
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'id_lote';
        hiddenInput.value = idLote;
        form.prepend(hiddenInput);

        // Actualizar el botón de "Volver"
        btnVolver.href = `muestreos.html?id_lote=${idLote}`;

        setNow();

    } catch (err) {
        console.error("init error:", err);
    }
})();