// basedatos.test.js
// Pruebas de la base de datos SQLite: lo guardado debe seguir ahí
// después de "apagar y volver a encender" el servidor.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const repositorio = require("../src/datos/repositorio");
const BaseDatos = require("../src/datos/baseDatos");
const { servicioNuevo, celular, minutosDespues } = require("./ayudas");

const rutaTemporal = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cuantofalta-")), "prueba.db");

test("la fila y lo aprendido sobreviven a un reinicio del servidor", { skip: !BaseDatos.disponible() }, () => {
  const ruta = rutaTemporal();
  const s = servicioNuevo();
  repositorio.conectar(ruta);
  s.tomarTurno({ nombre: "Luis", servicioId: 1, barberoId: 1, dispositivoId: celular() });
  s.agregarCliente(1, { nombre: "Don Pedro", servicioId: 3 });
  s.siguiente(1, minutosDespues(0));
  s.siguiente(1, minutosDespues(25)); // Luis duró 25 min -> se guarda duración y feromona
  repositorio.desconectar();

  // "Apagar": se borra la memoria. "Encender": se carga desde el archivo
  repositorio.reiniciar();
  assert.strictEqual(repositorio.turnos.length, 0);
  repositorio.conectar(ruta);

  assert.strictEqual(repositorio.turnos.length, 2);
  const pedro = repositorio.buscarTurno(2);
  assert.strictEqual(pedro.origen, "MANUAL");        // vuelve a ser un TurnoManual
  assert.strictEqual(pedro.estado, "EN_SILLA");
  assert.ok(pedro.horaInicio instanceof Date);
  assert.strictEqual(repositorio.duraciones.length, 1);
  assert.strictEqual(repositorio.duraciones[0].minutos, 25);
  assert.ok(repositorio.feromonas["1-1"] > 1);       // 30 base / 25 reales -> feromona sube
  assert.strictEqual(repositorio.nuevoNumero(), 3);  // la numeración continúa
  repositorio.desconectar();
});

test("cerrar el día borra la fila pero conserva lo aprendido", { skip: !BaseDatos.disponible() }, () => {
  const ruta = rutaTemporal();
  servicioNuevo();
  repositorio.conectar(ruta);
  repositorio.duraciones.push({ barberoId: 1, servicioId: 1, minutos: 28 });
  repositorio.turnos.length = 0;
  repositorio.cerrarDia();
  repositorio.desconectar();
  repositorio.reiniciar();
  repositorio.conectar(ruta);
  assert.strictEqual(repositorio.turnos.length, 0);
  assert.strictEqual(repositorio.duraciones.length, 1);
  repositorio.desconectar();
  repositorio.reiniciar();
});
