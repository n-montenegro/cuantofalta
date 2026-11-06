// errores.js
// Tipos de error propios del sistema. Cada uno sabe qué código HTTP
// debe devolver la API, así las rutas no tienen que decidirlo.

class ErrorValidacion extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorValidacion";
    this.codigoHttp = 400; // los datos enviados están mal
  }
}

class ErrorNoEncontrado extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorNoEncontrado";
    this.codigoHttp = 404; // lo que se busca no existe
  }
}

class ErrorConflicto extends Error {
  constructor(mensaje, datos = {}) {
    super(mensaje);
    this.name = "ErrorConflicto";
    this.codigoHttp = 409; // choca con algo que ya existe
    this.datos = datos;
  }
}

module.exports = { ErrorValidacion, ErrorNoEncontrado, ErrorConflicto };
