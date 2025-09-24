// JS/muestreo_nuevo.js
const API_BASE   = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK  = API_BASE + "PHP/check_session.php";
const URL_CREATE = API_BASE + "PHP/muestreo_create.php";
// Necesitamos este nuevo endpoint para obtener la cantidad de peces
const URL_GET_LOTE = API_BASE + "PHP/lote_get.php"; 

const $ = (s) => document.querySelector(s);
const msg = $("#msg");
const form  = $("#frmMuestreo");
const usuarioBox = document.getElementById("usuarioBox");
const btnVolver = $("#btnVolver");

// (Las funciones getIdLoteDeURL, requireSession, showMsg y setNow son iguales, no cambian)
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
    if (form.fecha) {
        form.fecha.value = now.toISOString().slice(0, 16);
    }
}


// El código para guardar el formulario no cambia
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
  const idLote = getIdLoteDeURL();
  setTimeout(() => location.href = `muestreos.html?id_lote=${idLote}`, 900);
});


// ===== Flujo de Inicialización (con la nueva lógica) =====
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

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'id_lote';
        hiddenInput.value = idLote;
        form.prepend(hiddenInput);

        btnVolver.href = `muestreos.html?id_lote=${idLote}`;
        setNow();

        // --- NUEVA LÓGICA PARA CÁLCULO AUTOMÁTICO DE BIOMASA ---
        
        // 1. Obtener la cantidad inicial de peces del lote
        const loteRes = await fetch(`${URL_GET_LOTE}?id=${idLote}`);
        const loteJson = await loteRes.json();
        if (!loteJson.ok) {
            console.error("No se pudo cargar la información del lote para calcular la biomasa.");
            return;
        }
        const cantidadPeces = loteJson.data.cantidad_inicial;

        // 2. Escuchar cada vez que el usuario escribe en el campo de "peso_promedio"
        const pesoPromedioInput = form.peso_promedio;
        if (pesoPromedioInput) {
            pesoPromedioInput.addEventListener('input', () => {
                const pesoPromedio = parseFloat(pesoPromedioInput.value);
                const biomasaInput = form.biomasa;

                if (!isNaN(pesoPromedio) && biomasaInput) {
                    // 3. Calcular y rellenar el campo de biomasa
                    const biomasaCalculada = pesoPromedio * cantidadPeces;
                    // Redondear a 2 decimales
                    biomasaInput.value = biomasaCalculada.toFixed(2);
                }
            });
        }
        // --- FIN DE LA NUEVA LÓGICA ---

    } catch (err) {
        console.error("init error:", err);
    }
})();