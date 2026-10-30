// server.js
// Archivo principal: arranca el servidor y define las rutas (API).
// Para iniciarlo: npm start  ->  luego abrir http://localhost:3000

const express = require("express");
const path = require("path");
const { barberos, servicios } = require("./datos/repositorio");
const { crearTurno } = require("./creacion/crearTurno");
const fila = require("./nucleo/fila");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Barberos y servicios para llenar las listas de las pantallas
app.get("/api/datos", (req, res) => {
  res.json({ barberos, servicios });
});

// El cliente toma un turno
app.post("/api/turnos", (req, res) => {
  try {
    const turno = fila.agregar(crearTurno(req.body));
    res.status(201).json({ numero: turno.numero });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// El cliente consulta su turno
app.get("/api/turnos/:numero", (req, res) => {
  const numero = Number(req.params.numero);
  const espera = fila.calcularEspera(numero);
  if (!espera) return res.status(404).json({ error: "Ese turno no existe" });
  res.json({ numero, ...espera });
});

// El barbero ve su fila
app.get("/api/barberos/:id/fila", (req, res) => {
  res.json(fila.filaDe(Number(req.params.id)));
});

// El barbero toca "Siguiente"
app.post("/api/barberos/:id/siguiente", (req, res) => {
  res.json(fila.siguiente(Number(req.params.id)));
});

const PUERTO = 3000;
app.listen(PUERTO, () => {
  console.log(`CuántoFalta funcionando en http://localhost:${PUERTO}`);
  console.log(`Panel del barbero:      http://localhost:${PUERTO}/barbero.html`);
});
