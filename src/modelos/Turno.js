// Turno.js
// Datos que tiene todo turno, sin importar cómo se creó.
// Estados: EN_ESPERA -> EN_SILLA -> ATENDIDO
//          EN_SILLA  -> AUSENTE  (lo llamaron y no estaba)

class Turno {
  constructor(nombre, servicioId, barberoId) {
    this.numero = null;        // lo pone la fábrica
    this.nombre = nombre;
    this.servicioId = servicioId;
    this.barberoId = barberoId;
    this.estado = null;        // lo pone la fábrica
    this.horaLlegada = null;
    this.horaInicio = null;    // cuando se sienta en la silla
    this.horaFin = null;       // cuando termina el servicio
  }

  get origen() {
    return "GENERAL";
  }

  // Al enviarlo como JSON se incluye también el origen (QR o MANUAL)
  toJSON() {
    return { ...this, origen: this.origen };
  }
}

module.exports = Turno;
