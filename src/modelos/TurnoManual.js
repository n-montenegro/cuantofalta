// TurnoManual.js
// Turno que agregó el barbero para un cliente que llegó sin celular.

const Turno = require("./Turno");

class TurnoManual extends Turno {
  constructor(nombre, servicioId, barberoId, agregadoPor) {
    super(nombre, servicioId, barberoId);
    this.agregadoPor = agregadoPor; // id del barbero que lo agregó
  }

  get origen() {
    return "MANUAL";
  }
}

module.exports = TurnoManual;
