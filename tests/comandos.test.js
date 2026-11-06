// comandos.test.js
// Pruebas del patrón Command (acciones del barbero y Deshacer).

const test = require("node:test");
const assert = require("node:assert");
const repositorio = require("../src/datos/repositorio");
const { servicioNuevo, celular, minutosDespues } = require("./ayudas");

// Deja a Jhon con: Ana en la silla (desde el minuto 0) y Beto esperando
function jhonConDosClientes() {
  const s = servicioNuevo();
  s.tomarTurno({ nombre: "Ana", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  s.tomarTurno({ nombre: "Beto", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  s.siguiente(1, minutosDespues(0));
  return s;
}

test("Siguiente con silla vacía y nadie esperando no cambia nada", () => {
  const s = servicioNuevo();
  const fila = s.siguiente(1);
  assert.strictEqual(fila.enSilla, null);
  assert.strictEqual(fila.puedeDeshacer, false);
});

test("Siguiente termina al de la silla, guarda su duración y sienta al próximo", () => {
  const s = jhonConDosClientes();
  const fila = s.siguiente(1, minutosDespues(28));
  assert.strictEqual(repositorio.buscarTurno(1).estado, "ATENDIDO");
  assert.strictEqual(fila.enSilla.nombre, "Beto");
  assert.deepStrictEqual(repositorio.duraciones, [{ barberoId: 1, servicioId: 1, minutos: 28 }]);
});

test("CP-05: una duración de 4 minutos se descarta del promedio", () => {
  const s = jhonConDosClientes();
  s.siguiente(1, minutosDespues(4));
  assert.strictEqual(repositorio.duraciones.length, 0);
  assert.strictEqual(s.verFila(1).enSilla.nombre, "Beto");
});

test("CP-06: Deshacer Siguiente deja la fila, la duración y la feromona como estaban", () => {
  const s = jhonConDosClientes();
  const feromonaAntes = s.asignador.feromona(1, 1);
  s.siguiente(1, minutosDespues(25));
  assert.notStrictEqual(s.asignador.feromona(1, 1), feromonaAntes);

  const fila = s.deshacer(1);
  assert.strictEqual(fila.enSilla.nombre, "Ana");
  assert.strictEqual(fila.enEspera[0].nombre, "Beto");
  assert.strictEqual(repositorio.duraciones.length, 0);
  assert.strictEqual(s.asignador.feromona(1, 1), feromonaAntes);
});

test("CP-07: No está marca ausente al llamado y sienta al siguiente; Deshacer lo revierte", () => {
  const s = jhonConDosClientes();
  let fila = s.noEsta(1, minutosDespues(3));
  assert.strictEqual(repositorio.buscarTurno(1).estado, "AUSENTE");
  assert.strictEqual(fila.enSilla.nombre, "Beto");

  fila = s.deshacer(1);
  assert.strictEqual(fila.enSilla.nombre, "Ana");
  assert.strictEqual(fila.enEspera.length, 1);
});

test("No está sin nadie en la silla avisa el error", () => {
  const s = servicioNuevo();
  assert.throws(() => s.noEsta(1), /Nadie|nadie/);
});

test("CP-08: Agregar cliente lo pone al final y Deshacer lo quita", () => {
  const s = jhonConDosClientes();
  let fila = s.agregarCliente(1, { nombre: "Don José", servicioId: 3 });
  assert.strictEqual(fila.enEspera[fila.enEspera.length - 1].nombre, "Don José");

  fila = s.deshacer(1);
  assert.ok(!fila.enEspera.some((t) => t.nombre === "Don José"));
});

test("Deshacer sin acciones previas avisa el error", () => {
  const s = servicioNuevo();
  assert.throws(() => s.deshacer(1), /deshacer/);
});

test("el Deshacer de un barbero no afecta la fila del otro", () => {
  const s = jhonConDosClientes();
  s.tomarTurno({ nombre: "Caro", servicioId: 3, barberoId: 2, dispositivoId: celular() });
  s.siguiente(2, minutosDespues(1));
  s.deshacer(1); // deshace la última acción de Jhon
  assert.strictEqual(s.verFila(2).enSilla.nombre, "Caro");
});
