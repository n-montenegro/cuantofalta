// AsignadorHormigas.js
// Elige barbero cuando el cliente pide "el que esté libre primero",
// usando la Optimización por Colonia de Hormigas (ACO), en su versión
// Ant Colony System (Dorigo y Gambardella, 1997).
//
// Analogía:
//   - Cada cliente que llega es una "hormiga" que busca camino.
//   - Cada barbero es un "camino" posible.
//   - La feromona (tau) es el rastro que deja cada barbero en cada
//     servicio: crece cuando termina servicios más rápido que la
//     duración base y se evapora con el tiempo.
//   - La heurística (eta) es 1 / (espera actual + 1): mientras menos
//     fila tenga el barbero, más atractivo es.
//
// Regla de elección (pseudoaleatoria proporcional):
//   - Con probabilidad q0 (80 %) se elige el barbero con mayor
//     tau^alfa * eta^beta  -> "casi siempre el más rápido".
//   - El otro 20 % se sortea con probabilidad proporcional a ese valor
//     -> "a veces repartir" entre los barberos.

const FEROMONA_INICIAL = 1;

class AsignadorHormigas {
  constructor(feromonas, opciones = {}) {
    this.feromonas = feromonas;               // tabla guardada en el repositorio
    this.alfa = opciones.alfa ?? 1;           // peso de la feromona
    this.beta = opciones.beta ?? 2;           // peso de la espera actual
    this.rho = opciones.rho ?? 0.2;           // tasa de evaporación
    this.q0 = opciones.q0 ?? 0.8;             // probabilidad de elegir al mejor
    this.aleatorio = opciones.aleatorio ?? Math.random; // se reemplaza en las pruebas
  }

  clave(barberoId, servicioId) {
    return `${barberoId}-${servicioId}`;
  }

  feromona(barberoId, servicioId) {
    return this.feromonas[this.clave(barberoId, servicioId)] ?? FEROMONA_INICIAL;
  }

  // Actualización de feromona al terminar un servicio:
  //   tau = (1 - rho) * tau + rho * (minutosBase / minutosReales)
  // Si tardó lo mismo que la base, el aporte es 1; si tardó menos, es mayor.
  // Devuelve el valor anterior para que el comando pueda deshacerlo.
  depositar(barberoId, servicioId, minutosReales, minutosBase) {
    const anterior = this.feromona(barberoId, servicioId);
    const aporte = minutosBase / minutosReales;
    this.feromonas[this.clave(barberoId, servicioId)] =
      (1 - this.rho) * anterior + this.rho * aporte;
    return anterior;
  }

  restaurar(barberoId, servicioId, valorAnterior) {
    this.feromonas[this.clave(barberoId, servicioId)] = valorAnterior;
  }

  // candidatos: [{ barberoId, espera }]  (espera en minutos)
  elegir(candidatos, servicioId) {
    if (candidatos.length === 0) throw new Error("No hay barberos disponibles");

    const puntajes = candidatos.map((c) => {
      const tau = this.feromona(c.barberoId, servicioId);
      const eta = 1 / (c.espera + 1);
      return { barberoId: c.barberoId, valor: tau ** this.alfa * eta ** this.beta };
    });

    if (this.aleatorio() < this.q0) {
      // Explotación: el de mayor puntaje
      const mejor = puntajes.reduce((a, b) => (b.valor > a.valor ? b : a));
      return { barberoId: mejor.barberoId, modo: "EXPLOTACION" };
    }

    // Exploración: ruleta proporcional al puntaje
    const total = puntajes.reduce((suma, p) => suma + p.valor, 0);
    let punto = this.aleatorio() * total;
    for (const p of puntajes) {
      punto -= p.valor;
      if (punto <= 0) return { barberoId: p.barberoId, modo: "EXPLORACION" };
    }
    return { barberoId: puntajes[puntajes.length - 1].barberoId, modo: "EXPLORACION" };
  }
}

module.exports = AsignadorHormigas;
