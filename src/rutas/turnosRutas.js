// turnosRutas.js
// Rutas de la API que usa la pantalla del cliente.

const express = require("express");

function turnosRutas(filaService) {
  const rutas = express.Router();

  // El cliente toma un turno (por QR)
  rutas.post("/", (req, res) => {
    res.status(201).json(filaService.tomarTurno(req.body));
  });

  // El cliente consulta su posición y su espera
  rutas.get("/:numero", (req, res) => {
    res.json(filaService.consultarTurno(req.params.numero));
  });

  // El cliente cancela su turno porque ya no puede esperar
  rutas.post("/:numero/cancelar", (req, res) => {
    res.json(filaService.cancelarTurno(req.params.numero, req.body.dispositivoId));
  });

  return rutas;
}

module.exports = turnosRutas;
