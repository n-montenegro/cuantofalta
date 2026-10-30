// fila.test.js
// Pruebas básicas del núcleo. Se ejecutan con: npm test
// Usan el módulo de pruebas que ya trae Node.js (no hay que instalar nada).

const test = require("node:test");
const assert = require("node:assert");
const { reiniciar } = require("../src/datos/repositorio");
const { crearTurno } = require("../src/creacion/crearTurno");
const fila = require("../src/nucleo/fila");

test("no deja crear un turno sin nombre", () => {
  reiniciar();
  assert.throws(() => crearTurno({ nombre: "", servicioId: 1, barberoId: 1 }));
});

test("calcula la espera sumando los servicios de los que están antes", () => {
  reiniciar();
  fila.agregar(crearTurno({ nombre: "Luis", servicioId: 2, barberoId: 1 }));   // 45 min
  fila.agregar(crearTurno({ nombre: "Pedro", servicioId: 1, barberoId: 1 }));  // 30 min
  const andres = fila.agregar(crearTurno({ nombre: "Andrés", servicioId: 1, barberoId: 1 }));
  const espera = fila.calcularEspera(andres.numero);
  assert.strictEqual(espera.posicion, 3);
  assert.strictEqual(espera.minutos, 75);
});

test("Siguiente sienta al primero en espera y termina al de la silla", () => {
  reiniciar();
  const a = fila.agregar(crearTurno({ nombre: "Ana", servicioId: 3, barberoId: 2 }));
  const b = fila.agregar(crearTurno({ nombre: "Beto", servicioId: 3, barberoId: 2 }));
  fila.siguiente(2);
  assert.strictEqual(a.estado, "EN_SILLA");
  fila.siguiente(2);
  assert.strictEqual(a.estado, "ATENDIDO");
  assert.strictEqual(b.estado, "EN_SILLA");
});
