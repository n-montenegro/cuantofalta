// ComandoSiguiente.js
// Botón "Siguiente": termina al cliente de la silla, guarda cuánto duró
// (si fue entre 5 y 90 min), deja feromona para el algoritmo de hormigas
// y sienta al primero que espera.

const Comando = require("./Comando");
const repositorio = require("../../datos/repositorio");

class ComandoSiguiente extends Comando {
  constructor(fila, asignador, ahora = new Date()) {
    super();
    this.fila = fila;
    this.asignador = asignador;
    this.ahora = ahora;
  }

  ejecutar() {
    // Guardar lo necesario para poder deshacer
    this.anterior = this.fila.enSilla;
    this.llamado = this.fila.enEspera[0] || null;
    this.registro = null;

    if (!this.anterior && !this.llamado) return false; // silla vacía y nadie esperando

    if (this.anterior) {
      this.registro = this.fila.finalizar(this.anterior, this.ahora);
      if (this.registro) {
        const base = repositorio.servicios.find((s) => s.id === this.anterior.servicioId).minutos;
        this.feromonaAnterior = this.asignador.depositar(
          this.fila.barberoId, this.anterior.servicioId, this.registro.minutos, base
        );
      }
    }
    if (this.llamado) this.fila.sentar(this.llamado, this.ahora);
    return true;
  }

  deshacer() {
    if (this.llamado) {
      this.llamado.estado = "EN_ESPERA";
      this.llamado.horaInicio = null;
    }
    if (this.anterior) {
      this.anterior.estado = "EN_SILLA";
      this.anterior.horaFin = null;
      if (this.registro) {
        this.fila.borrarRegistro(this.registro);
        this.asignador.restaurar(this.fila.barberoId, this.anterior.servicioId, this.feromonaAnterior);
      }
    }
  }
}

module.exports = ComandoSiguiente;
