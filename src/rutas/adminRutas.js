// Administracion.js
// Lo que hace el dueño de la barbería desde su panel: manejar barberos
// y servicios, ver el resumen del día y cerrar la jornada.
// Se separó de FilaService para que cada clase tenga una sola
// responsabilidad (principio S de SOLID).

const repositorio = require("../datos/repositorio");
const { validarTexto, buscarPorId } = require("../utilidades/validaciones");
const { ErrorValidacion, ErrorConflicto } = require("../utilidades/errores");

class Administracion {
  constructor(filaService) {
    this.filaService = filaService;
  }

  // ---- Barberos ----

  agregarBarbero(datos = {}) {
    const nombre = validarTexto(datos.nombre, "Escribe el nombre del barbero");
    const repetido = repositorio.barberos.some((b) => b.nombre.toLowerCase() === nombre.toLowerCase());
    if (repetido) throw new ErrorConflicto("Ya existe un barbero con ese nombre");
    const barbero = { id: repositorio.siguienteId(repositorio.barberos), nombre, activo: true };
    repositorio.barberos.push(barbero);
    repositorio.guardar();
    return barbero;
  }

  // Activo = está atendiendo hoy. Un barbero inactivo no recibe turnos
  // nuevos, pero conserva a los clientes que ya tenía en su fila.
  cambiarEstadoBarbero(barberoId, activo) {
    const barbero = buscarPorId(repositorio.barberos, barberoId, "Ese barbero no existe");
    const quedanActivos = repositorio.barberos.filter((b) => b.activo && b.id !== barbero.id).length;
    if (!activo && quedanActivos === 0) {
      throw new ErrorConflicto("Debe quedar al menos un barbero atendiendo");
    }
    barbero.activo = Boolean(activo);
    repositorio.guardar();
    return barbero;
  }

  // ---- Servicios ----

  agregarServicio(datos = {}) {
    const nombre = validarTexto(datos.nombre, "Escribe el nombre del servicio");
    const minutos = validarMinutos(datos.minutos);
    const servicio = { id: repositorio.siguienteId(repositorio.servicios), nombre, minutos };
    repositorio.servicios.push(servicio);
    repositorio.guardar();
    return servicio;
  }

  cambiarDuracionServicio(servicioId, minutos) {
    const servicio = buscarPorId(repositorio.servicios, servicioId, "Ese servicio no existe");
    servicio.minutos = validarMinutos(minutos);
    repositorio.guardar();
    return servicio;
  }

  // ---- Resumen del día ----

  resumen() {
    const turnos = repositorio.turnos;
    const contar = (estado) => turnos.filter((t) => t.estado === estado).length;

    const porBarbero = repositorio.barberos.map((b) => {
      const atendidos = turnos.filter((t) => t.barberoId === b.id && t.estado === "ATENDIDO");
      const fila = this.filaService.filaDe(b.id);
      return {
        id: b.id,
        nombre: b.nombre,
        activo: b.activo,
        atendidos: atendidos.length,
        enEspera: fila.enEspera.length,
        promedioMinutos: promedio(atendidos.map((t) => (t.horaFin - t.horaInicio) / 60000)),
      };
    });

    // Cuánto esperaron, en la vida real, los que ya pasaron a la silla
    const esperasReales = turnos
      .filter((t) => t.horaInicio && t.horaLlegada)
      .map((t) => (t.horaInicio - t.horaLlegada) / 60000);

    return {
      totalTurnos: turnos.length,
      atendidos: contar("ATENDIDO"),
      enEspera: contar("EN_ESPERA"),
      enSilla: contar("EN_SILLA"),
      ausentes: contar("AUSENTE"),
      cancelados: contar("CANCELADO"),
      porQr: turnos.filter((t) => t.origen === "QR").length,
      manuales: turnos.filter((t) => t.origen === "MANUAL").length,
      esperaPromedioReal: promedio(esperasReales),
      porBarbero,
      feromonas: this.filaService.verFeromonas(),
      baseDatos: repositorio.conectado(),
    };
  }

  // Termina la jornada. No deja cerrar si todavía hay clientes en la fila.
  cerrarDia() {
    const pendientes = repositorio.turnos.filter((t) => t.estado === "EN_ESPERA" || t.estado === "EN_SILLA");
    if (pendientes.length > 0) {
      throw new ErrorConflicto(`Todavía hay ${pendientes.length} cliente(s) en la fila`);
    }
    repositorio.cerrarDia();
    this.filaService.limpiarHistoriales();
    return { mensaje: "Día cerrado. La numeración vuelve a empezar en 1." };
  }
}

function validarMinutos(valor) {
  const minutos = Number(valor);
  if (!Number.isInteger(minutos) || minutos < 5 || minutos > 90) {
    throw new ErrorValidacion("La duración debe ser un número entero entre 5 y 90 minutos");
  }
  return minutos;
}

function promedio(lista) {
  if (lista.length === 0) return null;
  return Math.round(lista.reduce((a, b) => a + b, 0) / lista.length);
}

module.exports = Administracion;
