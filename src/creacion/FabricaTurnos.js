// FabricaTurnos.js
// Patrón Factory Method - Creador abstracto.
// crearTurno() hace los pasos que comparten TODOS los turnos y llama
// al método de fábrica construirTurno(), que cada subclase implementa
// con las reglas de su origen (QR o manual).

const repositorio = require("../datos/repositorio");
const { validarTexto, validarServicio } = require("../utilidades/validaciones");

class FabricaTurnos {
  crearTurno(datos = {}) {
    const nombre = validarTexto(datos.nombre, "Escribe el nombre para tomar el turno");
    const servicio = validarServicio(repositorio.servicios, datos.servicioId);

    const turno = this.construirTurno({ ...datos, nombre, servicioId: servicio.id }); // método de fábrica

    turno.numero = repositorio.nuevoNumero();
    turno.estado = "EN_ESPERA";
    turno.horaLlegada = new Date();
    repositorio.turnos.push(turno);
    return turno;
  }

  // Método de fábrica: lo implementa cada subclase
  construirTurno(datos) {
    throw new Error("construirTurno() debe implementarse en la subclase");
  }
}

module.exports = FabricaTurnos;
