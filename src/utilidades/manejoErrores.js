// manejoErrores.js
// Middleware de Express: atrapa cualquier error lanzado en las rutas
// y lo convierte en una respuesta JSON con el código HTTP correcto.

function manejoErrores(error, req, res, next) {
  const codigo = error.codigoHttp || 500;
  if (codigo === 500) console.error(error); // error inesperado: se muestra en consola
  res.status(codigo).json({
    error: codigo === 500 ? "Ocurrió un error en el servidor" : error.message,
    ...(error.datos || {}),
  });
}

module.exports = manejoErrores;
