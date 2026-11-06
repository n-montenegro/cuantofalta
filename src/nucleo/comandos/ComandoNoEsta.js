// ComandoNoEsta.js
// Botón "No está": el cliente llamado a la silla no apareció.
// Queda AUSENTE (su tiempo no cuenta para el promedio) y se sienta
// al siguiente que espera.

const Comando = require("./Comando");
const { ErrorValidacion } = require("../../utilidades/errores");

class ComandoNoEsta extends Comando {
  constructor(fila, ahora = new Date()) {
    super();
    this.fila = fila;
    this.ahora = ahora;
  }

  ejecutar() {
    this.ausente = this.fila.enSilla;
    if (!this.ausente) throw new ErrorValidacion("No hay nadie llamado a la silla");
    this.horaInicioAnterior = this.ausente.horaInicio;
    this.llamado = this.fila.enEspera[0] || null;

    this.ausente.estado = "AUSENTE";
    if (this.llamado) this.fila.sentar(this.llamado, this.ahora);
    return true;
  }

  deshacer() {
    if (this.llamado) {
      this.llamado.estado = "EN_ESPERA";
      this.llamado.horaInicio = null;
    }
    this.ausente.estado = "EN_SILLA";
    this.ausente.horaInicio = this.horaInicioAnterior;
  }
}

module.exports = ComandoNoEsta;
