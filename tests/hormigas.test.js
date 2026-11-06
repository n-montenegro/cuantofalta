// hormigas.test.js
// Pruebas del asignador por colonia de hormigas (ACO).

const test = require("node:test");
const assert = require("node:assert");
const AsignadorHormigas = require("../src/nucleo/asignacion/AsignadorHormigas");

test("la feromona empieza en 1", () => {
  const a = new AsignadorHormigas({});
  assert.strictEqual(a.feromona(1, 1), 1);
});

test("depositar aplica tau = (1 - rho) * tau + rho * (base / real)", () => {
  const a = new AsignadorHormigas({}, { rho: 0.2 });
  a.depositar(1, 1, 20, 30);              // terminó un corte de 30 en 20 min
  // 0.8 * 1 + 0.2 * 1.5 = 1.1
  assert.ok(Math.abs(a.feromona(1, 1) - 1.1) < 1e-9);
});

test("restaurar devuelve la feromona a su valor anterior", () => {
  const a = new AsignadorHormigas({});
  const anterior = a.depositar(1, 1, 20, 30);
  a.restaurar(1, 1, anterior);
  assert.strictEqual(a.feromona(1, 1), 1);
});

test("explotación: elige al barbero con menos espera si las feromonas son iguales", () => {
  const a = new AsignadorHormigas({}, { aleatorio: () => 0 });
  const r = a.elegir([{ barberoId: 1, espera: 60 }, { barberoId: 2, espera: 10 }], 1);
  assert.deepStrictEqual(r, { barberoId: 2, modo: "EXPLOTACION" });
});

test("una feromona más fuerte puede compensar un poco más de espera", () => {
  const feromonas = { "1-1": 3 }; // Jhon ha sido muy rápido en cortes
  const a = new AsignadorHormigas(feromonas, { aleatorio: () => 0 });
  // Jhon: 3 * (1/11)^2 = 0.0248 ; Carlos: 1 * (1/9)^2 = 0.0123
  const r = a.elegir([{ barberoId: 1, espera: 10 }, { barberoId: 2, espera: 8 }], 1);
  assert.strictEqual(r.barberoId, 1);
});

test("exploración: a veces reparte y puede elegir al que no es el mejor", () => {
  // Puntajes: Jhon 1 * (1/1)^2 = 1 ; Carlos 1 * (1/3)^2 = 0.111 ; total 1.111
  // 0.9 >= q0 -> explora; 0.95 * 1.111 = 1.056 cae en la parte de Carlos
  const valores = [0.9, 0.95];
  const a = new AsignadorHormigas({}, { aleatorio: () => valores.shift() });
  const r = a.elegir([{ barberoId: 1, espera: 0 }, { barberoId: 2, espera: 2 }], 1);
  assert.deepStrictEqual(r, { barberoId: 2, modo: "EXPLORACION" });
});
