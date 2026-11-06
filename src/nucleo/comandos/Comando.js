// Comando.js
// Patrón Command - Interfaz común de todas las acciones del barbero.
// ejecutar() devuelve true si cambió algo en la fila (solo esas
// acciones se guardan en el historial para poder deshacerlas).

class Comando {
  ejecutar() {
    throw new Error("ejecutar() debe implementarse en la subclase");
  }

  deshacer() {
    throw new Error("deshacer() debe implementarse en la subclase");
  }
}

module.exports = Comando;
