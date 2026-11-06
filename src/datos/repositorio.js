// repositorio.js
// Único lugar donde se guardan los datos. Por ahora viven en memoria:
// si el servidor se apaga, la fila se borra. Más adelante se puede
// cambiar por una base de datos sin tocar el resto del código.

const barberos = [
  { id: 1, nombre: "Jhon" },
  { id: 2, nombre: "Carlos" },
];

// Duración base de cada servicio en minutos (la pone el dueño).
// Se usa mientras un barbero tenga menos de 3 servicios registrados.
const servicios = [
  { id: 1, nombre: "Corte", minutos: 30 },
  { id: 2, nombre: "Corte + barba", minutos: 45 },
  { id: 3, nombre: "Barba", minutos: 20 },
];

// Todos los turnos del día (de cualquier barbero y estado)
const turnos = [];

// Duraciones reales de servicios terminados: { barberoId, servicioId, minutos }
const duraciones = [];

// Rastro de feromona del algoritmo de colonia de hormigas.
// Clave "barberoId-servicioId" -> valor numérico (empieza en 1)
const feromonas = {};

let ultimoNumero = 0;

// Devuelve el siguiente número de turno del día (1, 2, 3...)
function nuevoNumero() {
  ultimoNumero = ultimoNumero + 1;
  return ultimoNumero;
}

function buscarTurno(numero) {
  return turnos.find((t) => t.numero === Number(numero)) || null;
}

// ¿Este celular ya tiene un turno sin terminar?
function turnoActivoDe(dispositivoId) {
  return turnos.find(
    (t) => t.dispositivoId === dispositivoId && (t.estado === "EN_ESPERA" || t.estado === "EN_SILLA")
  ) || null;
}

// Borra todo (lo usan las pruebas para empezar desde cero)
function reiniciar() {
  turnos.length = 0;
  duraciones.length = 0;
  for (const clave of Object.keys(feromonas)) delete feromonas[clave];
  ultimoNumero = 0;
}

module.exports = {
  barberos, servicios, turnos, duraciones, feromonas,
  nuevoNumero, buscarTurno, turnoActivoDe, reiniciar,
};
