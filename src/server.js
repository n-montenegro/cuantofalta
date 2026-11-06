// server.js
// Archivo principal: arma el servidor, conecta las rutas y lo arranca.
// Para iniciarlo: npm start  ->  luego abrir http://localhost:3000

const express = require("express");
const path = require("path");
const repositorio = require("./datos/repositorio");
const FilaService = require("./nucleo/FilaService");
const turnosRutas = require("./rutas/turnosRutas");
const barberosRutas = require("./rutas/barberosRutas");
const manejoErrores = require("./utilidades/manejoErrores");

function crearApp(filaService = new FilaService()) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Barberos y servicios para llenar las listas de las pantallas
  app.get("/api/datos", (req, res) => {
    res.json({ barberos: repositorio.barberos, servicios: repositorio.servicios });
  });

  app.use("/api/turnos", turnosRutas(filaService));
  app.use("/api/barberos", barberosRutas(filaService));

  // Rastro de feromona del algoritmo de hormigas (para la demostración)
  app.get("/api/feromonas", (req, res) => {
    res.json(filaService.verFeromonas());
  });

  // Rutas de la API que no existen
  app.use("/api", (req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

  // Siempre al final: convierte los errores en respuestas JSON
  app.use(manejoErrores);
  return app;
}

// Solo arranca el servidor si se ejecuta directamente (no en las pruebas)
if (require.main === module) {
  const PUERTO = process.env.PORT || 3000;
  crearApp().listen(PUERTO, () => {
    console.log(`CuántoFalta funcionando en http://localhost:${PUERTO}`);
    console.log(`Panel del barbero:      http://localhost:${PUERTO}/barbero.html`);
  });
}

module.exports = { crearApp };
