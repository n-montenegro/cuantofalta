// api.test.js
// Prueba de integración: levanta el servidor y llama a la API como lo
// haría el celular (rutas + FilaService + fábricas + comandos juntos).

const test = require("node:test");
const assert = require("node:assert");
const repositorio = require("../src/datos/repositorio");
const { crearApp } = require("../src/server");

test("flujo completo por la API", async () => {
  repositorio.reiniciar();
  const servidor = crearApp().listen(0);
  const url = `http://localhost:${servidor.address().port}/api`;
  const enviar = (ruta, cuerpo) => fetch(url + ruta, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo || {}),
  });

  try {
    let r = await enviar("/turnos", { nombre: "", servicioId: 1, dispositivoId: "x" });
    assert.strictEqual(r.status, 400);

    r = await enviar("/turnos", { nombre: "Andrés", servicioId: 1, barberoId: 1, dispositivoId: "x" });
    assert.strictEqual(r.status, 201);

    r = await enviar("/turnos", { nombre: "Andrés", servicioId: 1, barberoId: 1, dispositivoId: "x" });
    assert.strictEqual(r.status, 409);
    assert.strictEqual((await r.json()).numero, 1);

    r = await enviar("/barberos/1/siguiente");
    assert.strictEqual((await r.json()).enSilla.nombre, "Andrés");

    r = await enviar("/barberos/1/deshacer");
    assert.strictEqual((await r.json()).enEspera[0].nombre, "Andrés");

    r = await fetch(url + "/turnos/999");
    assert.strictEqual(r.status, 404);

    r = await enviar("/barberos/7/siguiente");
    assert.strictEqual(r.status, 404);
  } finally {
    servidor.close();
  }
});
