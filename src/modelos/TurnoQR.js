// TurnoQR.js
// Turno que pidió el cliente desde su celular escaneando el QR.

const Turno = require("./Turno");

class TurnoQR extends Turno {
  constructor(nombre, servicioId, barberoId, dispositivoId) {
    super(nombre, servicioId, barberoId);
    this.dispositivoId = dispositivoId; // identifica el celular del cliente
  }

  get origen() {
    return "QR";
  }
}

module.exports = TurnoQR;
