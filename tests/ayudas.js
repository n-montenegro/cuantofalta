// ayudas.js
// Funciones de apoyo para las pruebas (no es una prueba).

const repositorio = require("../src/datos/repositorio");
const FilaService = require("../src/nucleo/FilaService");

// Hora fija para que las pruebas no dependan del reloj
const INICIO = new Date("2026-11-07T09:00:00");

function minutosDespues(minutos) {
  return new Date(INICIO.getTime() + minutos * 60000);
}

// Servicio limpio. aleatorio = () => 0 hace que el asignador
// de hormigas elija siempre al mejor (modo explotación).
function servicioNuevo(aleatorio = () => 0) {
  repositorio.reiniciar();
  return new FilaService({ aleatorio });
}

let contador = 0;
function celular() {
  contador = contador + 1;
  return "celular-" + contador;
}

module.exports = { INICIO, minutosDespues, servicioNuevo, celular };
