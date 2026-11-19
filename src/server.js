// server.js
// Archivo principal: arma el servidor, conecta las rutas y lo arranca.
// Para iniciarlo: npm start  ->  luego abrir http://localhost:3000

const express = require("express");
const path = require("path");
const QRCode = require("qrcode");
const repositorio = require("./datos/repositorio");
const FilaService = require("./nucleo/FilaService");
const Administracion = require("./nucleo/Administracion");
const turnosRutas = require("./rutas/turnosRutas");
const barberosRutas = require("./rutas/barberosRutas");
const adminRutas = require("./rutas/adminRutas");
const manejoErrores = require("./utilidades/manejoErrores");
const { obtenerIpLocal } = require("./utilidades/direccionRed");

function crearApp(filaService = new FilaService()) {
  const app = express();
  const administracion = new Administracion(filaService);
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Barberos y servicios para llenar las listas de las pantallas
  app.get("/api/datos", (req, res) => {
    res.json({ barberos: repositorio.barberos, servicios: repositorio.servicios });
  });

  // Resumen de todas las filas para el televisor de la barbería
  app.get("/api/estado", (req, res) => {
    res.json(filaService.vistaGeneral());
  });

  // Código QR que se imprime y se pega en la barbería.
  // Si el dueño abrió la página desde el mismo portátil (localhost), el QR
  // lleva la IP de la red WiFi para que los celulares sí puedan entrar.
  app.get("/api/qr", async (req, res, next) => {
    try {
      let host = req.get("host");
      if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
        const ip = obtenerIpLocal();
        if (ip) host = host.replace(/^(localhost|127\.0\.0\.1)/, ip);
      }
      const protocolo = req.get("x-forwarded-proto") || req.protocol;
      const url = `${protocolo}://${host}/`;
      const svg = await QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#16181d", light: "#ffffff" } });
      res.json({ url, svg });
    } catch (error) {
      next(error);
    }
  });

  app.use("/api/turnos", turnosRutas(filaService));
  app.use("/api/barberos", barberosRutas(filaService));
  app.use("/api/admin", adminRutas(administracion));

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

  // La base de datos queda junto al programa, en la carpeta "datos"
  const rutaBase = process.env.CUANTOFALTA_DB || path.join(process.cwd(), "datos", "cuantofalta.db");
  const conectada = repositorio.conectar(rutaBase);

  crearApp().listen(PUERTO, () => {
    console.log("");
    console.log("  ✂  CuántoFalta v1.0 funcionando");
    console.log("");
    console.log(`  Clientes:           http://localhost:${PUERTO}`);
    console.log(`  Panel del barbero:  http://localhost:${PUERTO}/barbero.html`);
    console.log(`  Panel del dueño:    http://localhost:${PUERTO}/admin.html   (PIN: ${process.env.CUANTOFALTA_PIN ? "el configurado" : "1234"})`);
    console.log(`  Pantalla para TV:   http://localhost:${PUERTO}/pantalla.html`);
    const ip = obtenerIpLocal();
    if (ip) console.log(`  Desde los celulares (misma WiFi): http://${ip}:${PUERTO}`);
    console.log("");
    console.log(conectada
      ? `  Base de datos: ${rutaBase}`
      : "  Aviso: esta versión de Node.js no trae SQLite. Los datos solo viven en memoria.");
    console.log("  Para apagar el servidor cierre esta ventana o presione Ctrl + C");
  });
}

module.exports = { crearApp };
