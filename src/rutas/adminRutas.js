// adminRutas.js
// Rutas de la API que usa el panel del dueño. Todas piden el PIN
// en la cabecera "x-pin" (por defecto 1234, se cambia con CUANTOFALTA_PIN).

const express = require("express");

function adminRutas(administracion) {
  const rutas = express.Router();
  const PIN = process.env.CUANTOFALTA_PIN || "1234";

  // Sin el PIN correcto no se deja pasar
  rutas.use((req, res, next) => {
    if (req.get("x-pin") !== PIN) {
      return res.status(401).json({ error: "PIN incorrecto" });
    }
    next();
  });

  rutas.get("/resumen", (req, res) => {
    res.json(administracion.resumen());
  });

  rutas.post("/barberos", (req, res) => {
    res.status(201).json(administracion.agregarBarbero(req.body));
  });

  // Activar o poner en descanso a un barbero
  rutas.patch("/barberos/:id", (req, res) => {
    res.json(administracion.cambiarEstadoBarbero(req.params.id, req.body.activo));
  });

  rutas.post("/servicios", (req, res) => {
    res.status(201).json(administracion.agregarServicio(req.body));
  });

  // Cambiar cuántos minutos dura un servicio
  rutas.patch("/servicios/:id", (req, res) => {
    res.json(administracion.cambiarDuracionServicio(req.params.id, req.body.minutos));
  });

  rutas.post("/cerrar-dia", (req, res) => {
    res.json(administracion.cerrarDia());
  });

  return rutas;
}

module.exports = adminRutas;
