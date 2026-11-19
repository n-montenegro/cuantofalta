// repositorio.js
// Único lugar donde se guardan los datos.
//
// El sistema trabaja con las listas en memoria (rápido y sencillo) y,
// si se llamó a conectar(), después de cada cambio las copia a la base
// de datos SQLite (baseDatos.js). Al volver a encender el servidor se
// cargan desde ahí, así que la fila y lo aprendido no se pierden.
//
// Las pruebas no llaman a conectar(): trabajan solo en memoria.

const BaseDatos = require("./baseDatos");
const TurnoQR = require("../modelos/TurnoQR");
const TurnoManual = require("../modelos/TurnoManual");

// Datos con los que arranca una barbería nueva (el dueño los cambia
// desde el panel del dueño)
const BARBEROS_INICIALES = [
  { id: 1, nombre: "Jhon", activo: true },
  { id: 2, nombre: "Carlos", activo: true },
];

// Duración base de cada servicio en minutos (la pone el dueño).
// Se usa mientras un barbero tenga menos de 3 servicios registrados.
const SERVICIOS_INICIALES = [
  { id: 1, nombre: "Corte", minutos: 30 },
  { id: 2, nombre: "Corte + barba", minutos: 45 },
  { id: 3, nombre: "Barba", minutos: 20 },
];

const barberos = [];
const servicios = [];
const turnos = [];      // Todos los turnos del día (de cualquier barbero y estado)
const duraciones = [];  // Duraciones reales: { barberoId, servicioId, minutos }
const feromonas = {};   // Colonia de hormigas: "barberoId-servicioId" -> valor

let ultimoNumero = 0;
let fecha = hoy();
let baseDatos = null;

// ---- Conexión con la base de datos ----

// Abre (o crea) la base de datos y carga lo que tenga.
// Devuelve true si quedó conectada, false si solo trabaja en memoria.
function conectar(ruta) {
  if (!BaseDatos.disponible()) return false;
  baseDatos = new BaseDatos(ruta);
  const guardado = baseDatos.cargar();

  if (guardado.barberos.length === 0) {
    guardar(); // base de datos nueva: se guardan los datos iniciales
    return true;
  }

  reemplazar(barberos, guardado.barberos);
  reemplazar(servicios, guardado.servicios);
  reemplazar(turnos, guardado.turnos.map(reconstruirTurno));
  reemplazar(duraciones, guardado.duraciones);
  for (const clave of Object.keys(feromonas)) delete feromonas[clave];
  Object.assign(feromonas, guardado.feromonas);
  ultimoNumero = guardado.ultimoNumero;
  fecha = guardado.fecha || hoy();

  // Si el servidor se enciende otro día, la fila empieza de nuevo
  // (lo aprendido: duraciones y feromonas, se conserva)
  if (fecha !== hoy()) cerrarDia();
  return true;
}

function desconectar() {
  if (baseDatos) baseDatos.cerrar();
  baseDatos = null;
}

function conectado() {
  return baseDatos !== null;
}

// Copia todo a la base de datos (si hay una conectada)
function guardar() {
  if (!baseDatos) return;
  baseDatos.guardar({ barberos, servicios, turnos, duraciones, feromonas, ultimoNumero, fecha });
}

// Una fila de la tabla "turnos" vuelve a ser un objeto TurnoQR o TurnoManual
function reconstruirTurno(fila) {
  const turno = fila.origen === "MANUAL"
    ? new TurnoManual(fila.nombre, fila.servicio_id, fila.barbero_id, fila.agregado_por)
    : new TurnoQR(fila.nombre, fila.servicio_id, fila.barbero_id, fila.dispositivo_id);
  turno.numero = fila.numero;
  turno.estado = fila.estado;
  turno.horaLlegada = fila.hora_llegada ? new Date(fila.hora_llegada) : null;
  turno.horaInicio = fila.hora_inicio ? new Date(fila.hora_inicio) : null;
  turno.horaFin = fila.hora_fin ? new Date(fila.hora_fin) : null;
  return turno;
}

// ---- Turnos ----

// Devuelve el siguiente número de turno del día (1, 2, 3...)
function nuevoNumero() {
  ultimoNumero = ultimoNumero + 1;
  return ultimoNumero;
}

function buscarTurno(numero) {
  return turnos.find((t) => t.numero === Number(numero)) || null;
}

// ¿Este celular ya tiene un turno sin terminar?
function turnoActivoDe(dispositivoId) {
  return turnos.find(
    (t) => t.dispositivoId === dispositivoId && (t.estado === "EN_ESPERA" || t.estado === "EN_SILLA")
  ) || null;
}

// Fin de la jornada: se borra la fila del día y la numeración vuelve a 1.
// Las duraciones y las feromonas se conservan porque son lo que el
// sistema aprendió de cada barbero.
function cerrarDia() {
  turnos.length = 0;
  ultimoNumero = 0;
  fecha = hoy();
  guardar();
}

// Siguiente id libre de una lista (para barberos y servicios nuevos)
function siguienteId(lista) {
  return lista.reduce((mayor, e) => Math.max(mayor, e.id), 0) + 1;
}

// Borra todo y vuelve a los datos iniciales (lo usan las pruebas)
function reiniciar() {
  reemplazar(barberos, BARBEROS_INICIALES.map((b) => ({ ...b })));
  reemplazar(servicios, SERVICIOS_INICIALES.map((s) => ({ ...s })));
  turnos.length = 0;
  duraciones.length = 0;
  for (const clave of Object.keys(feromonas)) delete feromonas[clave];
  ultimoNumero = 0;
  fecha = hoy();
}

// ---- Ayudas internas ----

// Cambia el contenido de una lista sin cambiar la lista (otros archivos
// guardan la referencia, por eso no se puede hacer lista = nueva)
function reemplazar(lista, nuevos) {
  lista.length = 0;
  lista.push(...nuevos);
}

function hoy() {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

reiniciar(); // datos iniciales al cargar el módulo

module.exports = {
  barberos, servicios, turnos, duraciones, feromonas,
  conectar, desconectar, conectado, guardar,
  nuevoNumero, buscarTurno, turnoActivoDe, cerrarDia, siguienteId, reiniciar,
};
