// baseDatos.js
// Base de datos pequeña en SQLite para que la fila, los barberos,
// los servicios y lo que el sistema ha aprendido (duraciones y
// feromonas) NO se pierdan al apagar el portátil.
//
// Usa el módulo node:sqlite que ya viene con Node.js 22, así que no
// hay que instalar ningún programa de base de datos. Todo queda en un
// solo archivo: datos/cuantofalta.db
//
// Solo repositorio.js usa esta clase. El resto del código no sabe que
// existe una base de datos (eso permite cambiarla después).

const fs = require("fs");
const path = require("path");

// node:sqlite puede no existir en versiones viejas de Node.js.
// En ese caso el sistema sigue funcionando, pero solo en memoria.
let DatabaseSync = null;
try {
  // Quita el aviso "ExperimentalWarning" que Node.js 22 muestra al usar SQLite
  const emitirOriginal = process.emitWarning;
  process.emitWarning = (aviso, ...resto) => {
    if (String(aviso).includes("SQLite")) return;
    return emitirOriginal.call(process, aviso, ...resto);
  };
  ({ DatabaseSync } = require("node:sqlite"));
} catch (error) {
  DatabaseSync = null;
}

const ESQUEMA = `
  CREATE TABLE IF NOT EXISTS barberos (
    id      INTEGER PRIMARY KEY,
    nombre  TEXT    NOT NULL,
    activo  INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS servicios (
    id      INTEGER PRIMARY KEY,
    nombre  TEXT    NOT NULL,
    minutos INTEGER NOT NULL CHECK (minutos BETWEEN 5 AND 90)
  );

  CREATE TABLE IF NOT EXISTS turnos (
    numero         INTEGER PRIMARY KEY,
    nombre         TEXT    NOT NULL,
    servicio_id    INTEGER NOT NULL REFERENCES servicios(id),
    barbero_id     INTEGER NOT NULL REFERENCES barberos(id),
    origen         TEXT    NOT NULL CHECK (origen IN ('QR', 'MANUAL')),
    dispositivo_id TEXT,
    agregado_por   INTEGER,
    estado         TEXT    NOT NULL,
    hora_llegada   TEXT,
    hora_inicio    TEXT,
    hora_fin       TEXT
  );

  CREATE TABLE IF NOT EXISTS duraciones (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    barbero_id  INTEGER NOT NULL REFERENCES barberos(id),
    servicio_id INTEGER NOT NULL REFERENCES servicios(id),
    minutos     REAL    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS feromonas (
    clave TEXT PRIMARY KEY,
    valor REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS configuracion (
    clave TEXT PRIMARY KEY,
    valor TEXT
  );
`;

class BaseDatos {
  static disponible() {
    return DatabaseSync !== null;
  }

  constructor(ruta) {
    fs.mkdirSync(path.dirname(ruta), { recursive: true });
    this.ruta = ruta;
    this.db = new DatabaseSync(ruta);
    this.db.exec(ESQUEMA);
  }

  // Lee todas las tablas y devuelve los datos como listas de objetos
  cargar() {
    const todos = (sql) => this.db.prepare(sql).all().map((fila) => ({ ...fila }));
    const config = {};
    for (const c of todos("SELECT clave, valor FROM configuracion")) config[c.clave] = c.valor;
    const feromonas = {};
    for (const f of todos("SELECT clave, valor FROM feromonas")) feromonas[f.clave] = f.valor;

    return {
      barberos: todos("SELECT id, nombre, activo FROM barberos ORDER BY id")
        .map((b) => ({ id: b.id, nombre: b.nombre, activo: b.activo === 1 })),
      servicios: todos("SELECT id, nombre, minutos FROM servicios ORDER BY id"),
      turnos: todos("SELECT * FROM turnos ORDER BY numero"),
      duraciones: todos("SELECT barbero_id, servicio_id, minutos FROM duraciones ORDER BY id")
        .map((d) => ({ barberoId: d.barbero_id, servicioId: d.servicio_id, minutos: d.minutos })),
      feromonas,
      ultimoNumero: Number(config.ultimoNumero || 0),
      fecha: config.fecha || null,
    };
  }

  // Guarda el estado completo dentro de una transacción: o se guarda
  // todo o no se guarda nada (así el archivo nunca queda a medias).
  // Para una barbería son pocos registros, así que reescribir es rápido.
  guardar(estado) {
    const db = this.db;
    db.exec("BEGIN");
    try {
      db.exec("DELETE FROM turnos; DELETE FROM duraciones; DELETE FROM feromonas; DELETE FROM configuracion; DELETE FROM barberos; DELETE FROM servicios;");

      const insBarbero = db.prepare("INSERT INTO barberos (id, nombre, activo) VALUES (?, ?, ?)");
      for (const b of estado.barberos) insBarbero.run(b.id, b.nombre, b.activo ? 1 : 0);

      const insServicio = db.prepare("INSERT INTO servicios (id, nombre, minutos) VALUES (?, ?, ?)");
      for (const s of estado.servicios) insServicio.run(s.id, s.nombre, s.minutos);

      const insTurno = db.prepare(`INSERT INTO turnos
        (numero, nombre, servicio_id, barbero_id, origen, dispositivo_id, agregado_por, estado, hora_llegada, hora_inicio, hora_fin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const t of estado.turnos) {
        insTurno.run(
          t.numero, t.nombre, t.servicioId, t.barberoId, t.origen,
          t.dispositivoId ?? null, t.agregadoPor ?? null, t.estado,
          fechaATexto(t.horaLlegada), fechaATexto(t.horaInicio), fechaATexto(t.horaFin)
        );
      }

      const insDuracion = db.prepare("INSERT INTO duraciones (barbero_id, servicio_id, minutos) VALUES (?, ?, ?)");
      for (const d of estado.duraciones) insDuracion.run(d.barberoId, d.servicioId, d.minutos);

      const insFeromona = db.prepare("INSERT INTO feromonas (clave, valor) VALUES (?, ?)");
      for (const [clave, valor] of Object.entries(estado.feromonas)) insFeromona.run(clave, valor);

      const insConfig = db.prepare("INSERT INTO configuracion (clave, valor) VALUES (?, ?)");
      insConfig.run("ultimoNumero", String(estado.ultimoNumero));
      insConfig.run("fecha", estado.fecha);

      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  cerrar() {
    this.db.close();
  }
}

function fechaATexto(fecha) {
  return fecha ? new Date(fecha).toISOString() : null;
}

module.exports = BaseDatos;
