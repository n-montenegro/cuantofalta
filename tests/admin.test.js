// admin.test.js
// Pruebas del panel del dueño y de la cancelación de turnos.

const test = require("node:test");
const assert = require("node:assert");
const repositorio = require("../src/datos/repositorio");
const Administracion = require("../src/nucleo/Administracion");
const { servicioNuevo, celular } = require("./ayudas");

test("un barbero inactivo no recibe turnos nuevos", () => {
  const s = servicioNuevo();
  const admin = new Administracion(s);
  admin.cambiarEstadoBarbero(1, false);
  assert.throws(
    () => s.tomarTurno({ nombre: "Ana", servicioId: 1, barberoId: 1, dispositivoId: celular() }),
    { name: "ErrorConflicto" }
  );
  // "El que esté libre primero" solo tiene en cuenta a los activos
  const turno = s.tomarTurno({ nombre: "Ana", servicioId: 1, barberoId: "auto", dispositivoId: celular() });
  assert.strictEqual(turno.barbero, "Carlos");
});

test("debe quedar al menos un barbero atendiendo", () => {
  const admin = new Administracion(servicioNuevo());
  admin.cambiarEstadoBarbero(1, false);
  assert.throws(() => admin.cambiarEstadoBarbero(2, false), { name: "ErrorConflicto" });
});

test("el dueño agrega un barbero y ya puede recibir clientes", () => {
  const s = servicioNuevo();
  const admin = new Administracion(s);
  const nuevo = admin.agregarBarbero({ nombre: "Brayan" });
  assert.strictEqual(nuevo.id, 3);
  assert.throws(() => admin.agregarBarbero({ nombre: "brayan" }), { name: "ErrorConflicto" });
  const turno = s.tomarTurno({ nombre: "Ana", servicioId: 1, barberoId: 3, dispositivoId: celular() });
  assert.strictEqual(turno.barbero, "Brayan");
});

test("la duración de un servicio debe estar entre 5 y 90 minutos", () => {
  const admin = new Administracion(servicioNuevo());
  assert.throws(() => admin.agregarServicio({ nombre: "Cejas", minutos: 4 }), { name: "ErrorValidacion" });
  assert.throws(() => admin.cambiarDuracionServicio(1, 91), { name: "ErrorValidacion" });
  assert.strictEqual(admin.cambiarDuracionServicio(1, 35).minutos, 35);
  assert.strictEqual(admin.agregarServicio({ nombre: "Cejas", minutos: 10 }).id, 4);
});

test("no se puede cerrar el día con clientes en la fila", () => {
  const s = servicioNuevo();
  const admin = new Administracion(s);
  s.tomarTurno({ nombre: "Ana", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  assert.throws(() => admin.cerrarDia(), { name: "ErrorConflicto" });
  s.siguiente(1);
  s.siguiente(1);
  admin.cerrarDia();
  assert.strictEqual(repositorio.turnos.length, 0);
});

test("el cliente cancela su propio turno y sale de la fila", () => {
  const s = servicioNuevo();
  const cel = celular();
  s.tomarTurno({ nombre: "Ana", servicioId: 1, barberoId: 1, dispositivoId: cel });
  const pedro = s.tomarTurno({ nombre: "Pedro", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  assert.strictEqual(pedro.posicion, 2);
  assert.throws(() => s.cancelarTurno(1, "otro-celular"), { name: "ErrorValidacion" });
  assert.strictEqual(s.cancelarTurno(1, cel).estado, "CANCELADO");
  assert.strictEqual(s.consultarTurno(2).posicion, 1);
  // Con el turno cancelado, el mismo celular puede tomar otro
  assert.doesNotThrow(() => s.tomarTurno({ nombre: "Ana", servicioId: 1, barberoId: 1, dispositivoId: cel }));
});

test("la pantalla de TV resume las filas de los barberos activos", () => {
  const s = servicioNuevo();
  s.tomarTurno({ nombre: "Ana", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  s.tomarTurno({ nombre: "Luis", servicioId: 2, barberoId: 1, dispositivoId: celular() });
  s.siguiente(1);
  const vista = s.vistaGeneral();
  assert.strictEqual(vista.barberos.length, 2);
  assert.strictEqual(vista.barberos[0].enSilla.nombre, "Ana");
  assert.strictEqual(vista.barberos[0].proximos[0].nombre, "Luis");
  assert.strictEqual(vista.totalEspera, 1);
});
