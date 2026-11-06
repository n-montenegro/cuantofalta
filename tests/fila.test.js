// fila.test.js
// Pruebas del cálculo de espera del núcleo.

const test = require("node:test");
const assert = require("node:assert");
const repositorio = require("../src/datos/repositorio");
const { esDuracionValida } = require("../src/nucleo/Fila");
const { servicioNuevo, celular, minutosDespues } = require("./ayudas");

test("calcula la espera sumando los servicios de los que están antes", () => {
  const s = servicioNuevo();
  s.tomarTurno({ nombre: "Luis", servicioId: 2, barberoId: 1, dispositivoId: celular() });  // 45 min
  s.tomarTurno({ nombre: "Pedro", servicioId: 1, barberoId: 1, dispositivoId: celular() }); // 30 min
  const andres = s.tomarTurno({ nombre: "Andrés", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  assert.strictEqual(andres.posicion, 3);
  assert.strictEqual(andres.minutos, 75);
});

test("descuenta lo que ya lleva el cliente de la silla", () => {
  const s = servicioNuevo();
  s.tomarTurno({ nombre: "Luis", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  s.tomarTurno({ nombre: "Andrés", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  s.siguiente(1, minutosDespues(0)); // Luis se sienta
  const espera = s.consultarTurno(2, minutosDespues(10));
  assert.strictEqual(espera.minutos, 20); // 30 base - 10 que lleva
});

test("con 3 o más registros usa el promedio real del barbero", () => {
  const s = servicioNuevo();
  repositorio.duraciones.push(
    { barberoId: 1, servicioId: 1, minutos: 20 },
    { barberoId: 1, servicioId: 1, minutos: 22 },
    { barberoId: 1, servicioId: 1, minutos: 24 }
  );
  assert.strictEqual(s.filas[1].duracionEsperada(1), 22);
  assert.strictEqual(s.filas[2].duracionEsperada(1), 30); // Carlos aún usa la base
});

test("con menos de 3 registros usa la duración base", () => {
  const s = servicioNuevo();
  repositorio.duraciones.push({ barberoId: 1, servicioId: 1, minutos: 10 });
  assert.strictEqual(s.filas[1].duracionEsperada(1), 30);
});

test("valores límite del filtro de duraciones (5 a 90 minutos)", () => {
  assert.strictEqual(esDuracionValida(4), false);
  assert.strictEqual(esDuracionValida(5), true);
  assert.strictEqual(esDuracionValida(90), true);
  assert.strictEqual(esDuracionValida(91), false);
});

test("redondea la espera a múltiplos de 5 minutos", () => {
  const s = servicioNuevo();
  s.tomarTurno({ nombre: "Luis", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  s.tomarTurno({ nombre: "Andrés", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  s.siguiente(1, minutosDespues(0));
  assert.strictEqual(s.consultarTurno(2, minutosDespues(13)).minutos, 15); // faltan 17 -> 15
});
