// fabricas.test.js
// Pruebas del patrón Factory Method (creación de turnos).

const test = require("node:test");
const assert = require("node:assert");
const repositorio = require("../src/datos/repositorio");
const FabricaTurnos = require("../src/creacion/FabricaTurnos");
const TurnoQR = require("../src/modelos/TurnoQR");
const TurnoManual = require("../src/modelos/TurnoManual");
const { servicioNuevo, celular } = require("./ayudas");

test("no deja crear un turno sin nombre", () => {
  const s = servicioNuevo();
  assert.throws(() => s.tomarTurno({ nombre: "  ", servicioId: 1, dispositivoId: celular() }), /nombre/);
});

test("no deja crear un turno con un servicio que no existe", () => {
  const s = servicioNuevo();
  assert.throws(() => s.tomarTurno({ nombre: "Ana", servicioId: 99, dispositivoId: celular() }), /servicio/);
});

test("CP-01: la fábrica QR crea un TurnoQR numerado y en espera", () => {
  const s = servicioNuevo();
  s.tomarTurno({ nombre: "Andrés", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  const turno = repositorio.buscarTurno(1);
  assert.ok(turno instanceof TurnoQR);
  assert.strictEqual(turno.estado, "EN_ESPERA");
  assert.strictEqual(turno.origen, "QR");
});

test("CP-02: un celular no puede tener dos turnos activos", () => {
  const s = servicioNuevo();
  const mio = celular();
  s.tomarTurno({ nombre: "Andrés", servicioId: 1, barberoId: 1, dispositivoId: mio });
  assert.throws(
    () => s.tomarTurno({ nombre: "Andrés", servicioId: 1, barberoId: 1, dispositivoId: mio }),
    (error) => error.codigoHttp === 409 && error.datos.numero === 1
  );
});

test("CP-03: 'el que esté libre primero' asigna al barbero con menos fila", () => {
  const s = servicioNuevo();
  s.tomarTurno({ nombre: "Luis", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  s.tomarTurno({ nombre: "Pedro", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  const turno = s.tomarTurno({ nombre: "Andrés", servicioId: 1, barberoId: "auto", dispositivoId: celular() });
  assert.strictEqual(turno.barbero, "Carlos"); // Jhon tiene 2 en fila, Carlos 0
});

test("la fábrica manual crea un TurnoManual con el barbero que lo agregó", () => {
  const s = servicioNuevo();
  s.agregarCliente(2, { nombre: "Don José", servicioId: 3 });
  const turno = repositorio.buscarTurno(1);
  assert.ok(turno instanceof TurnoManual);
  assert.strictEqual(turno.agregadoPor, 2);
  assert.strictEqual(turno.origen, "MANUAL");
});

test("la fábrica abstracta obliga a implementar construirTurno()", () => {
  servicioNuevo();
  assert.throws(() => new FabricaTurnos().crearTurno({ nombre: "Ana", servicioId: 1 }), /subclase/);
});
