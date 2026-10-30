// crearTurno.js
// Se encarga de crear un turno nuevo y revisar que los datos estén bien.
//
// Nota para próximas entregas: aquí se aplicará el patrón Factory Method,
// porque un turno puede nacer de dos formas distintas (por QR o agregado
// a mano por el barbero) y cada una tiene sus propias reglas.

const { barberos, servicios, nuevoNumero } = require("../datos/repositorio");

function crearTurno(datos) {
  const nombre = (datos.nombre || "").trim();
  const servicioId = Number(datos.servicioId);
  const barberoId = Number(datos.barberoId);

  if (nombre === "") {
    throw new Error("Escribe tu nombre para tomar el turno");
  }
  if (!servicios.some((s) => s.id === servicioId)) {
    throw new Error("Elige un servicio de la lista");
  }
  if (!barberos.some((b) => b.id === barberoId)) {
    throw new Error("Elige un barbero de la lista");
  }

  return {
    numero: nuevoNumero(),
    nombre: nombre,
    servicioId: servicioId,
    barberoId: barberoId,
    estado: "EN_ESPERA", // EN_ESPERA -> EN_SILLA -> ATENDIDO
    horaLlegada: new Date(),
    horaInicio: null,
    horaFin: null,
  };
}

module.exports = { crearTurno };
