// direccionRed.js
// Busca la IP del portátil en la red WiFi para que los celulares
// puedan entrar a CuántoFalta (por ejemplo http://192.168.1.10:3000).

const os = require("os");

function obtenerIpLocal() {
  const interfaces = os.networkInterfaces();
  for (const nombre in interfaces) {
    for (const red of interfaces[nombre]) {
      // Solo IPv4 y que no sea la interna (127.0.0.1)
      if (red.family === "IPv4" && !red.internal) {
        return red.address;
      }
    }
  }
  return null; // Sin red: solo funciona en este mismo equipo
}

module.exports = { obtenerIpLocal };
