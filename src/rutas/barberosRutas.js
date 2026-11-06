// barberosRutas.js
// Rutas de la API que usa el panel del barbero. Cada botón del panel
// termina en un comando del patrón Command dentro de FilaService.

const express = require("express");

function barberosRutas(filaService) {
  const rutas = express.Router();

  rutas.get("/:id/fila", (req, res) => {
    res.json(filaService.verFila(req.params.id));
  });

  rutas.post("/:id/siguiente", (req, res) => {
    res.json(filaService.siguiente(req.params.id));
  });

  rutas.post("/:id/no-esta", (req, res) => {
    res.json(filaService.noEsta(req.params.id));
  });

  rutas.post("/:id/clientes", (req, res) => {
    res.status(201).json(filaService.agregarCliente(req.params.id, req.body));
  });

  rutas.post("/:id/deshacer", (req, res) => {
    res.json(filaService.deshacer(req.params.id));
  });

  return rutas;
}

module.exports = barberosRutas;
