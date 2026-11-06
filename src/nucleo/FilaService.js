// FilaService.js
// Punto de entrada del núcleo. Las rutas de la API solo hablan con
// esta clase. Coordina las fábricas (Factory Method), los comandos
// (Command) y el asignador de barbero (colonia de hormigas).

const repositorio = require("../datos/repositorio");
const Fila = require("./Fila");
const HistorialComandos = require("./comandos/HistorialComandos");
const ComandoSiguiente = require("./comandos/ComandoSiguiente");
const ComandoNoEsta = require("./comandos/ComandoNoEsta");
const ComandoAgregarCliente = require("./comandos/ComandoAgregarCliente");
const FabricaTurnoQR = require("../creacion/FabricaTurnoQR");
const FabricaTurnoManual = require("../creacion/FabricaTurnoManual");
const AsignadorHormigas = require("./asignacion/AsignadorHormigas");
const { buscarPorId } = require("../utilidades/validaciones");
const { ErrorNoEncontrado } = require("../utilidades/errores");

class FilaService {
  constructor(opcionesHormigas = {}) {
    this.asignador = new AsignadorHormigas(repositorio.feromonas, opcionesHormigas);
    this.fabricaQR = new FabricaTurnoQR((servicioId) => this.elegirBarbero(servicioId));
    this.fabricaManual = new FabricaTurnoManual();
    this.filas = {};
    this.historiales = {};
    for (const b of repositorio.barberos) {
      this.filas[b.id] = new Fila(b.id);
      this.historiales[b.id] = new HistorialComandos(); // un historial por barbero
    }
  }

  filaDe(barberoId) {
    buscarPorId(repositorio.barberos, barberoId, "Ese barbero no existe");
    return this.filas[Number(barberoId)];
  }

  // Colonia de hormigas: compara a todos los barberos y elige uno
  elegirBarbero(servicioId, ahora = new Date()) {
    const candidatos = repositorio.barberos.map((b) => ({
      barberoId: b.id,
      espera: this.filas[b.id].esperaParaNuevo(ahora),
    }));
    return this.asignador.elegir(candidatos, servicioId).barberoId;
  }

  // ---- Cliente ----

  tomarTurno(datos) {
    const turno = this.fabricaQR.crearTurno(datos);
    return this.consultarTurno(turno.numero);
  }

  consultarTurno(numero, ahora = new Date()) {
    const turno = repositorio.buscarTurno(numero);
    if (!turno) throw new ErrorNoEncontrado("Ese turno no existe");
    const barbero = repositorio.barberos.find((b) => b.id === turno.barberoId);
    const respuesta = { numero: turno.numero, estado: turno.estado, barbero: barbero.nombre };
    if (turno.estado === "EN_ESPERA") {
      Object.assign(respuesta, this.filas[turno.barberoId].esperaDe(turno, ahora));
    }
    return respuesta;
  }

  // ---- Barbero ----

  verFila(barberoId) {
    const fila = this.filaDe(barberoId);
    return {
      enSilla: fila.enSilla,
      enEspera: fila.enEspera,
      puedeDeshacer: this.historiales[fila.barberoId].pila.length > 0,
    };
  }

  siguiente(barberoId, ahora = new Date()) {
    const fila = this.filaDe(barberoId);
    this.historiales[fila.barberoId].ejecutar(new ComandoSiguiente(fila, this.asignador, ahora));
    return this.verFila(barberoId);
  }

  noEsta(barberoId, ahora = new Date()) {
    const fila = this.filaDe(barberoId);
    this.historiales[fila.barberoId].ejecutar(new ComandoNoEsta(fila, ahora));
    return this.verFila(barberoId);
  }

  agregarCliente(barberoId, datos) {
    const fila = this.filaDe(barberoId);
    this.historiales[fila.barberoId].ejecutar(new ComandoAgregarCliente(fila, this.fabricaManual, datos));
    return this.verFila(barberoId);
  }

  deshacer(barberoId) {
    const fila = this.filaDe(barberoId);
    this.historiales[fila.barberoId].deshacer();
    return this.verFila(barberoId);
  }

  // Para mostrar en clase cómo va el rastro de feromona
  verFeromonas() {
    const tabla = [];
    for (const b of repositorio.barberos) {
      for (const s of repositorio.servicios) {
        tabla.push({ barbero: b.nombre, servicio: s.nombre, feromona: Number(this.asignador.feromona(b.id, s.id).toFixed(3)) });
      }
    }
    return tabla;
  }
}

module.exports = FilaService;
