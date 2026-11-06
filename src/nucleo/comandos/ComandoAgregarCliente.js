// ComandoAgregarCliente.js
// Botón "Agregar cliente": para quien llega sin celular.
// Une los dos patrones: el comando usa FabricaTurnoManual (Factory
// Method) para crear el turno, y por ser un comando se puede deshacer.

const Comando = require("./Comando");
const repositorio = require("../../datos/repositorio");

class ComandoAgregarCliente extends Comando {
  constructor(fila, fabricaManual, datos) {
    super();
    this.fila = fila;
    this.fabricaManual = fabricaManual;
    this.datos = datos;
  }

  ejecutar() {
    this.turno = this.fabricaManual.crearTurno({ ...this.datos, barberoId: this.fila.barberoId });
    return true;
  }

  deshacer() {
    const posicion = repositorio.turnos.indexOf(this.turno);
    if (posicion !== -1) repositorio.turnos.splice(posicion, 1);
  }
}

module.exports = ComandoAgregarCliente;
