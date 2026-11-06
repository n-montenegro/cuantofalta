// Fila.js
// La fila de UN barbero: quién está en la silla, quiénes esperan
// y cuánto le falta a cada uno. Es el "receptor" del patrón Command:
// los comandos usan estos métodos para cambiar la fila.

const repositorio = require("../datos/repositorio");

const DURACION_MINIMA = 5;   // menos de esto: el barbero tocó el botón por error
const DURACION_MAXIMA = 90;  // más de esto: se le olvidó tocar el botón
const REGISTROS_PROMEDIO = 10;
const REGISTROS_MINIMOS = 3;

class Fila {
  constructor(barberoId) {
    this.barberoId = barberoId;
  }

  get enSilla() {
    return repositorio.turnos.find(
      (t) => t.barberoId === this.barberoId && t.estado === "EN_SILLA"
    ) || null;
  }

  // Los que esperan, en orden de llegada (número de turno)
  get enEspera() {
    return repositorio.turnos
      .filter((t) => t.barberoId === this.barberoId && t.estado === "EN_ESPERA")
      .sort((a, b) => a.numero - b.numero);
  }

  // Cuánto suele tardar ESTE barbero en un servicio:
  // promedio de sus últimas 10 duraciones válidas, o la duración base
  // del servicio si todavía tiene menos de 3 registros.
  duracionEsperada(servicioId) {
    const registros = repositorio.duraciones
      .filter((d) => d.barberoId === this.barberoId && d.servicioId === servicioId)
      .slice(-REGISTROS_PROMEDIO);

    if (registros.length < REGISTROS_MINIMOS) {
      return repositorio.servicios.find((s) => s.id === servicioId).minutos;
    }
    const suma = registros.reduce((total, d) => total + d.minutos, 0);
    return suma / registros.length;
  }

  // Lo que le falta al cliente que está en la silla (nunca negativo)
  minutosRestantesSilla(ahora) {
    const cliente = this.enSilla;
    if (!cliente) return 0;
    const transcurridos = (ahora - cliente.horaInicio) / 60000;
    return Math.max(0, this.duracionEsperada(cliente.servicioId) - transcurridos);
  }

  // Posición y minutos de espera de un turno que está en esta fila
  esperaDe(turno, ahora = new Date()) {
    const antes = this.enEspera.filter((t) => t.numero < turno.numero);
    let minutos = this.minutosRestantesSilla(ahora);
    for (const t of antes) minutos += this.duracionEsperada(t.servicioId);
    return { posicion: antes.length + 1, minutos: redondear(minutos) };
  }

  // Cuánto esperaría alguien que llegue AHORA a esta fila
  esperaParaNuevo(ahora = new Date()) {
    let minutos = this.minutosRestantesSilla(ahora);
    for (const t of this.enEspera) minutos += this.duracionEsperada(t.servicioId);
    return minutos;
  }

  // ---- Métodos que usan los comandos ----

  sentar(turno, ahora) {
    turno.estado = "EN_SILLA";
    turno.horaInicio = ahora;
  }

  // Termina el servicio. Devuelve el registro de duración si fue válido,
  // o null si se descartó por estar fuera de 5 a 90 minutos.
  finalizar(turno, ahora) {
    turno.estado = "ATENDIDO";
    turno.horaFin = ahora;
    const minutos = (turno.horaFin - turno.horaInicio) / 60000;
    if (!esDuracionValida(minutos)) return null;
    const registro = { barberoId: this.barberoId, servicioId: turno.servicioId, minutos };
    repositorio.duraciones.push(registro);
    return registro;
  }

  borrarRegistro(registro) {
    const posicion = repositorio.duraciones.indexOf(registro);
    if (posicion !== -1) repositorio.duraciones.splice(posicion, 1);
  }
}

function esDuracionValida(minutos) {
  return minutos >= DURACION_MINIMA && minutos <= DURACION_MAXIMA;
}

// Redondea a múltiplos de 5 minutos (58 -> 60, 72 -> 70)
function redondear(minutos) {
  return Math.round(minutos / 5) * 5;
}

module.exports = Fila;
module.exports.esDuracionValida = esDuracionValida;
