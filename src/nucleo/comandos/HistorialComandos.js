// HistorialComandos.js
// Patrón Command - Invocador. Pila con las acciones ejecutadas de UN
// barbero. "Deshacer" saca la última y la revierte.
// Solo depende de la interfaz Comando, no de cada acción concreta.

const { ErrorValidacion } = require("../../utilidades/errores");

class HistorialComandos {
  constructor() {
    this.pila = [];
  }

  ejecutar(comando) {
    const huboCambio = comando.ejecutar();
    if (huboCambio) this.pila.push(comando);
    return huboCambio;
  }

  deshacer() {
    const comando = this.pila.pop();
    if (!comando) throw new ErrorValidacion("No hay acciones para deshacer");
    comando.deshacer();
    return comando;
  }

  limpiar() {
    this.pila.length = 0;
  }
}

module.exports = HistorialComandos;
