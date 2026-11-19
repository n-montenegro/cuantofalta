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
const { ErrorNoEncontrado, ErrorConflicto, ErrorValidacion } = require("../utilidades/errores");

class FilaService {
  constructor(opcionesHormigas = {}) {
    this.asignador = new AsignadorHormigas(repositorio.feromonas, opcionesHormigas);
    this.fabricaQR = new FabricaTurnoQR((servicioId) => this.elegirBarbero(servicioId));
    this.fabricaManual = new FabricaTurnoManual();
    this.filas = {};
    this.historiales = {};
  }

  // Devuelve la fila de un barbero. Se crea la primera vez que se pide,
  // así funciona también con los barberos que el dueño agrega después.
  filaDe(barberoId) {
    const barbero = buscarPorId(repositorio.barberos, barberoId, "Ese barbero no existe");
    if (!this.filas[barbero.id]) {
      this.filas[barbero.id] = new Fila(barbero.id);
      this.historiales[barbero.id] = new HistorialComandos(); // un historial por barbero
    }
    return this.filas[barbero.id];
  }

  // Colonia de hormigas: compara a los barberos que están atendiendo y elige uno
  elegirBarbero(servicioId, ahora = new Date()) {
    const candidatos = repositorio.barberos
      .filter((b) => b.activo)
      .map((b) => ({ barberoId: b.id, espera: this.filaDe(b.id).esperaParaNuevo(ahora) }));
    if (candidatos.length === 0) throw new ErrorConflicto("En este momento no hay barberos atendiendo");
    return this.asignador.elegir(candidatos, servicioId).barberoId;
  }

  // ---- Cliente ----

  tomarTurno(datos) {
    const turno = this.fabricaQR.crearTurno(datos);
    repositorio.guardar();
    return this.consultarTurno(turno.numero);
  }

  // El cliente decide irse: solo puede cancelar su propio turno y
  // solo mientras está esperando
  cancelarTurno(numero, dispositivoId) {
    const turno = repositorio.buscarTurno(numero);
    if (!turno) throw new ErrorNoEncontrado("Ese turno no existe");
    if (!dispositivoId || turno.dispositivoId !== dispositivoId) {
      throw new ErrorValidacion("Solo puedes cancelar tu propio turno");
    }
    if (turno.estado !== "EN_ESPERA") {
      throw new ErrorConflicto("Ese turno ya no se puede cancelar");
    }
    turno.estado = "CANCELADO";
    turno.horaFin = new Date();
    repositorio.guardar();
    return this.consultarTurno(numero);
  }

  consultarTurno(numero, ahora = new Date()) {
    const turno = repositorio.buscarTurno(numero);
    if (!turno) throw new ErrorNoEncontrado("Ese turno no existe");
    const barbero = repositorio.barberos.find((b) => b.id === turno.barberoId);
    const servicio = repositorio.servicios.find((s) => s.id === turno.servicioId);
    const respuesta = {
      numero: turno.numero, estado: turno.estado, nombre: turno.nombre,
      barbero: barbero.nombre, servicio: servicio ? servicio.nombre : "",
    };
    if (turno.estado === "EN_ESPERA") {
      Object.assign(respuesta, this.filaDe(turno.barberoId).esperaDe(turno, ahora));
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
      atendidosHoy: repositorio.turnos.filter(
        (t) => t.barberoId === fila.barberoId && t.estado === "ATENDIDO"
      ).length,
    };
  }

  // Ejecuta un comando en el historial del barbero y guarda los cambios
  ejecutar(fila, comando) {
    this.historiales[fila.barberoId].ejecutar(comando);
    repositorio.guardar();
    return this.verFila(fila.barberoId);
  }

  siguiente(barberoId, ahora = new Date()) {
    const fila = this.filaDe(barberoId);
    return this.ejecutar(fila, new ComandoSiguiente(fila, this.asignador, ahora));
  }

  noEsta(barberoId, ahora = new Date()) {
    const fila = this.filaDe(barberoId);
    return this.ejecutar(fila, new ComandoNoEsta(fila, ahora));
  }

  agregarCliente(barberoId, datos) {
    const fila = this.filaDe(barberoId);
    return this.ejecutar(fila, new ComandoAgregarCliente(fila, this.fabricaManual, datos));
  }

  deshacer(barberoId) {
    const fila = this.filaDe(barberoId);
    this.historiales[fila.barberoId].deshacer();
    repositorio.guardar();
    return this.verFila(barberoId);
  }

  // Al cerrar el día los "Deshacer" pendientes ya no tienen sentido
  limpiarHistoriales() {
    this.filas = {};
    this.historiales = {};
  }

  // ---- Pantalla de la barbería (TV) ----

  // Resumen de todas las filas para mostrar en un televisor del local
  vistaGeneral(ahora = new Date()) {
    const barberos = repositorio.barberos.filter((b) => b.activo).map((b) => {
      const fila = this.filaDe(b.id);
      return {
        id: b.id,
        nombre: b.nombre,
        enSilla: fila.enSilla ? { numero: fila.enSilla.numero, nombre: fila.enSilla.nombre } : null,
        proximos: fila.enEspera.slice(0, 3).map((t) => ({ numero: t.numero, nombre: t.nombre })),
        enEspera: fila.enEspera.length,
        esperaNuevo: Math.round(fila.esperaParaNuevo(ahora) / 5) * 5,
      };
    });
    return { barberos, totalEspera: barberos.reduce((suma, b) => suma + b.enEspera, 0) };
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
