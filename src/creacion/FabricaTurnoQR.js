// FabricaTurnoQR.js
// Patrón Factory Method - Creador concreto para turnos pedidos por QR.
// Reglas propias: el celular debe identificarse, solo puede tener un
// turno activo y, si el cliente no elige barbero, se asigna uno con el
// algoritmo de colonia de hormigas.

const FabricaTurnos = require("./FabricaTurnos");
const TurnoQR = require("../modelos/TurnoQR");
const repositorio = require("../datos/repositorio");
const { buscarPorId } = require("../utilidades/validaciones");
const { ErrorValidacion, ErrorConflicto } = require("../utilidades/errores");

class FabricaTurnoQR extends FabricaTurnos {
  // elegirBarbero: función (servicioId) => barberoId, la pone FilaService
  constructor(elegirBarbero) {
    super();
    this.elegirBarbero = elegirBarbero;
  }

  construirTurno(datos) {
    if (!datos.dispositivoId) {
      throw new ErrorValidacion("No se pudo identificar el celular");
    }
    const activo = repositorio.turnoActivoDe(datos.dispositivoId);
    if (activo) {
      throw new ErrorConflicto("Este celular ya tiene un turno", { numero: activo.numero });
    }

    const quiereCualquiera = !datos.barberoId || datos.barberoId === "auto";
    const barberoId = quiereCualquiera
      ? this.elegirBarbero(datos.servicioId)
      : buscarPorId(repositorio.barberos, datos.barberoId, "Ese barbero no existe").id;

    return new TurnoQR(datos.nombre, datos.servicioId, barberoId, datos.dispositivoId);
  }
}

module.exports = FabricaTurnoQR;
