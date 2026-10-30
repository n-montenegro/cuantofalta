// fila.js
// El núcleo del sistema: maneja la fila de cada barbero y calcula la espera.
//
// Nota para próximas entregas: las acciones del barbero (Siguiente,
// No está, Deshacer) se convertirán en comandos con el patrón Command,
// para poder deshacer la última acción.

const { turnos, servicios } = require("../datos/repositorio");

// Agrega un turno ya creado a la lista
function agregar(turno) {
  turnos.push(turno);
  return turno;
}

// Devuelve quién está en la silla y quiénes esperan con un barbero
function filaDe(barberoId) {
  const enSilla = turnos.find((t) => t.barberoId === barberoId && t.estado === "EN_SILLA") || null;
  const enEspera = turnos
    .filter((t) => t.barberoId === barberoId && t.estado === "EN_ESPERA")
    .sort((a, b) => a.numero - b.numero);
  return { enSilla, enEspera };
}

function minutosDelServicio(servicioId) {
  return servicios.find((s) => s.id === servicioId).minutos;
}

// Calcula la posición y los minutos que le faltan a un turno.
// Regla: lo que le falta al cliente de la silla + lo que duran
// los servicios de los que están antes. Se redondea a 5 minutos.
function calcularEspera(numero, ahora = new Date()) {
  const turno = turnos.find((t) => t.numero === numero);
  if (!turno) return null;
  if (turno.estado !== "EN_ESPERA") return { estado: turno.estado, posicion: 0, minutos: 0 };

  const { enSilla, enEspera } = filaDe(turno.barberoId);
  const antes = enEspera.filter((t) => t.numero < turno.numero);

  let minutos = 0;
  if (enSilla) {
    const transcurridos = (ahora - enSilla.horaInicio) / 60000;
    minutos += Math.max(0, minutosDelServicio(enSilla.servicioId) - transcurridos);
  }
  for (const t of antes) {
    minutos += minutosDelServicio(t.servicioId);
  }

  return {
    estado: turno.estado,
    posicion: antes.length + 1,
    minutos: Math.round(minutos / 5) * 5,
  };
}

// El barbero toca "Siguiente": termina el cliente actual y sienta al próximo
function siguiente(barberoId, ahora = new Date()) {
  const { enSilla, enEspera } = filaDe(barberoId);
  if (enSilla) {
    enSilla.estado = "ATENDIDO";
    enSilla.horaFin = ahora;
  }
  if (enEspera.length > 0) {
    enEspera[0].estado = "EN_SILLA";
    enEspera[0].horaInicio = ahora;
  }
  return filaDe(barberoId);
}

module.exports = { agregar, filaDe, calcularEspera, siguiente };
