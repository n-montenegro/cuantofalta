// FabricaTurnoManual.js
// Patrón Factory Method - Creador concreto para turnos que agrega el
// barbero a un cliente sin celular. No necesita dispositivo y el turno
// queda con el barbero que lo agregó.

const FabricaTurnos = require("./FabricaTurnos");
const TurnoManual = require("../modelos/TurnoManual");
const repositorio = require("../datos/repositorio");
const { buscarPorId } = require("../utilidades/validaciones");

class FabricaTurnoManual extends FabricaTurnos {
  construirTurno(datos) {
    const barbero = buscarPorId(repositorio.barberos, datos.barberoId, "Ese barbero no existe");
    return new TurnoManual(datos.nombre, datos.servicioId, barbero.id, barbero.id);
  }
}

module.exports = FabricaTurnoManual;
