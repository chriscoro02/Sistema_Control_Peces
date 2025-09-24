// JS/lote_nuevo.js
const API_BASE   = "https://sienna-curlew-728554.hostingersite.com/Sistema_Peces/";
const URL_CHECK  = API_BASE + "PHP/check_session.php";
const URL_OPTS   = API_BASE + "PHP/lote_options.php";
const URL_CREATE = API_BASE + "PHP/lote_create.php";

const $   = (s) => document.querySelector(s);
const msg = $("#msg");
const selEst = $("#selEstanque");
const selEsp = $("#selEspecie");
const selPro = $("#selProveedor");
const selFase = $("#selFase");
const form  = $("#frmLote");
const usuarioBox = document.getElementById("usuarioBox");

async function requireSession() {
  const r = await fetch(URL_CHECK, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) { location.href = "index.html"; throw new Error("no-session"); }
  return j;
}

// =============================================================
// ===== FUNCIÓN QUE FALTABA =====
// Esta función se encarga de mostrar los mensajes en la alerta
function showMsg(type, text) {
  msg.className = `alert alert-${type}`;
  msg.textContent = text;
  msg.classList.remove("d-none");
}
// =============================================================

function fillSelect(sel, items, textKey, valueKey, firstOptionText) {
  const opt = [`<option value="">${firstOptionText}</option>`];
  for (const it of items) {
    opt.push(`<option value="${it[valueKey]}">${it[textKey]}</option>`);
  }
  sel.innerHTML = opt.join("");
}

async function cargarEstanquesPorFase(idFase) {
    selEst.disabled = true;
    selEst.innerHTML = `<option value="">Cargando estanques...</option>`;
    
    try {
        const r = await fetch(`${URL_OPTS}?id_fase_crianza=${idFase}`, { credentials: "include" });
        const j = await r.json();
        if (j.ok && j.estanques) {
            fillSelect(selEst, j.estanques, "codigo", "id_estanque", "Seleccionar estanque...");
            selEst.disabled = false;
        }
    } catch (err) {
        console.error("Error al cargar estanques:", err);
        selEst.innerHTML = `<option value="">Error al cargar</option>`;
    }
}

async function loadInitialOptions() {
  const r = await fetch(URL_OPTS, { credentials: "include" });
  const j = await r.json();
  if (!j.ok) throw new Error(j.msg || "No se pudieron cargar opciones");

  fillSelect(selEsp, j.especies, "nombre", "id_especie", "Seleccionar especie...");
  fillSelect(selPro, j.proveedores, "nombre_empresa", "id_proveedor", "(Sin proveedor)");
  fillSelect(selFase, j.fases, "nombre", "id_fase_crianza", "Seleccionar fase...");
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.classList.add("d-none");
  const fd = new FormData(form);

  if (!fd.get("id_proveedor")) fd.delete("id_proveedor");

  const res = await fetch(URL_CREATE, { method: "POST", body: fd, credentials: "include" });
  const txt = await res.text();
  let j;
  try { j = JSON.parse(txt); } catch { 
    showMsg("danger", "Respuesta no válida: " + txt); // Ahora esto funcionará
    return; 
  }

  if (!j.ok) { 
    showMsg("danger", j.msg || "No se pudo crear el lote"); // Y esto también
    return; 
  }

  showMsg("success", "Lote creado (ID " + j.id + "). Redirigiendo…"); // Y lo más importante, esto
  setTimeout(() => location.href = "lote.html", 900);
});

// ===== init =====
(async () => {
    try {
        const user = await requireSession();
        if (usuarioBox) {
            const nombreCompleto = `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim();
            usuarioBox.textContent = nombreCompleto || user.usuario || "Usuario";
        }
        await loadInitialOptions();
        
        selEst.disabled = true;
        selEst.innerHTML = `<option value="">-- Seleccionar Fase Primero --</option>`;

        selFase.addEventListener('change', () => {
            const idFaseSeleccionada = selFase.value;
            if (idFaseSeleccionada) {
                cargarEstanquesPorFase(idFaseSeleccionada);
            } else {
                selEst.disabled = true;
                selEst.innerHTML = `<option value="">-- Seleccionar Fase Primero --</option>`;
            }
        });

    } catch (err) {
        console.error("init error:", err);
    }
})();