// repositorio.js
// Aquí se guardan los datos del sistema. Por ahora viven en memoria:
// si el servidor se apaga, la fila se borra. Más adelante se puede
// cambiar por una base de datos sin tocar el resto del código.

const barberos = [
  { id: 1, nombre: "Jhon" },
  { id: 2, nombre: "Carlos" },
];

// Duración base de cada servicio en minutos (la pone el dueño)
const servicios = [
  { id: 1, nombre: "Corte", minutos: 30 },
  { id: 2, nombre: "Corte + barba", minutos: 45 },
  { id: 3, nombre: "Barba", minutos: 20 },
];

// Lista de todos los turnos del día
const turnos = [];

let ultimoNumero = 0;

// Devuelve el siguiente número de turno (1, 2, 3...)
function nuevoNumero() {
  ultimoNumero = ultimoNumero + 1;
  return ultimoNumero;
}

// Borra todo (lo usan las pruebas para empezar desde cero)
function reiniciar() {
  turnos.length = 0;
  ultimoNumero = 0;
}

module.exports = { barberos, servicios, turnos, nuevoNumero, reiniciar };
