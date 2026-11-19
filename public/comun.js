// comun.js — funciones que usan todas las pantallas (evita repetir código).

// Llama a la API y devuelve { ok, estado, datos }
async function api(ruta, metodo = "GET", cuerpo, encabezados = {}) {
  const opciones = { method: metodo, headers: { ...encabezados } };
  if (cuerpo !== undefined) {
    opciones.headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(cuerpo);
  }
  try {
    const respuesta = await fetch("/api" + ruta, opciones);
    const datos = await respuesta.json();
    return { ok: respuesta.ok, estado: respuesta.status, datos };
  } catch (error) {
    return { ok: false, estado: 0, datos: { error: "Sin conexión con la barbería. Revisa la WiFi." } };
  }
}

// Evita que un nombre como "<script>" se ejecute al mostrarlo en la página
function escapar(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

// Mensaje flotante que desaparece solo
function avisar(mensaje, malo = false) {
  let caja = document.querySelector(".toast");
  if (!caja) {
    caja = document.createElement("div");
    caja.className = "toast";
    document.body.appendChild(caja);
  }
  caja.textContent = mensaje;
  caja.classList.toggle("malo", malo);
  caja.classList.add("visible");
  clearTimeout(avisar.temporizador);
  avisar.temporizador = setTimeout(() => caja.classList.remove("visible"), 2800);
}

// Minutos que han pasado desde una fecha (para el reloj de la silla)
function minutosDesde(fechaTexto) {
  return Math.max(0, Math.floor((Date.now() - new Date(fechaTexto).getTime()) / 60000));
}
