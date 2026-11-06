// validaciones.js
// Funciones pequeñas para revisar datos. Se reutilizan en las fábricas
// y en las rutas para no repetir los mismos "if" en varios archivos.

const { ErrorValidacion, ErrorNoEncontrado } = require("./errores");

function validarTexto(valor, mensaje) {
  const texto = (valor || "").toString().trim();
  if (texto === "") throw new ErrorValidacion(mensaje);
  if (texto.length > 40) throw new ErrorValidacion("El nombre no puede tener más de 40 letras");
  return texto;
}

// Busca un elemento por id en una lista; si no está, lanza un error
function buscarPorId(lista, id, mensaje) {
  const elemento = lista.find((e) => e.id === Number(id));
  if (!elemento) throw new ErrorNoEncontrado(mensaje);
  return elemento;
}

function validarServicio(servicios, servicioId) {
  if (servicioId === undefined || servicioId === null || servicioId === "") {
    throw new ErrorValidacion("Elige un servicio de la lista");
  }
  return buscarPorId(servicios, servicioId, "Ese servicio no existe");
}

module.exports = { validarTexto, buscarPorId, validarServicio };
