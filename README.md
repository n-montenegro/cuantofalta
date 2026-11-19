# ✂ CuántoFalta

**Fila virtual con tiempo estimado de espera para barberías que atienden por orden de llegada.**

Proyecto final de *Patrones y Metodologías de Construcción de Software* — Universidad Manuela Beltrán (UMB), 2026.
Versión final: **1.0.0**

[![Abrir en GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/n-montenegro/cuantofalta)

| Cliente | Barbero | Dueño | Pantalla TV |
|---|---|---|---|
| ![](documentacion/evidencias/02-cliente-mi-turno.png) | ![](documentacion/evidencias/03-panel-barbero.png) | ![](documentacion/evidencias/04-panel-dueno.png) | ![](documentacion/evidencias/05-pantalla-tv.png) |

---

## 1. Problema abordado

En las barberías de barrio que no trabajan con citas, el cliente solo ve cuántas personas hay antes, pero no sabe **cuánto tiempo** tendrá que esperar, porque cada servicio y cada barbero tardan distinto. Por eso muchos clientes se van, otros esperan incómodos en el local y los barberos interrumpen su trabajo para responder "¿cuánto falta?".

## 2. Solución desarrollada

Una aplicación web que funciona en la red WiFi de la barbería con un portátil como servidor. Nadie instala nada:

- **Cliente** (`/`): escanea el QR pegado en la entrada, escribe su nombre, elige servicio y barbero (o "El que esté libre primero") y ve su número, su puesto y los minutos que le faltan. Se actualiza cada 15 s, vibra cuando le toca y puede cancelar si ya no puede esperar.
- **Barbero** (`/barbero.html`): ve quién está en la silla y quién espera. Botones **Siguiente**, **No está**, **Deshacer** y **Agregar cliente sin celular**.
- **Dueño** (`/admin.html`, con PIN): agrega barberos y servicios, cambia duraciones base, marca barberos en descanso, ve el resumen del día y el rastro de feromona, y cierra la jornada.
- **Pantalla para TV** (`/pantalla.html`) y **cartel QR imprimible** (`/qr.html`).

La espera se calcula con lo que **realmente** tarda cada barbero: promedio de sus últimas 10 duraciones válidas (entre 5 y 90 min); si tiene menos de 3, se usa la duración base del servicio.

### Historias de usuario

| HU | Descripción | Estado |
|---|---|---|
| HU-01 | Tomar turno por QR con nombre, servicio y barbero (un solo turno activo por celular) | ✅ |
| HU-02 | Ver mi turno: puesto y espera estimada, actualizada sola | ✅ |
| HU-03 | Gestionar la fila: Siguiente, No está, Deshacer | ✅ |
| HU-04 | Agregar cliente sin celular | ✅ |
| Final | Base de datos SQLite, panel del dueño, cancelar turno, pantalla TV, cartel QR | ✅ |

## 3. Patrones utilizados y su propósito

| Patrón | Tipo | Dónde | Propósito |
|---|---|---|---|
| **Factory Method** | Creacional | `src/creacion/` | Un turno nace por QR o manual con reglas distintas. `FabricaTurnos` hace los pasos comunes (validar, numerar, poner en espera) y cada fábrica concreta implementa `construirTurno()`. Evita un `if` por origen y permite agregar orígenes nuevos sin modificar los existentes. [Detalle](documentacion/patrones/factory-method.md) |
| **Command** | Comportamiento | `src/nucleo/comandos/` | Cada botón del barbero es un objeto con `ejecutar()` y `deshacer()`. `HistorialComandos` (uno por barbero) los apila y "Deshacer" revierte el último sin dañar la fila. [Detalle](documentacion/patrones/command.md) |
| **Colonia de hormigas (ACO)** | Algoritmo de búsqueda | `src/nucleo/asignacion/` | Para "El que esté libre primero": puntaje `τ^α · η^β` con feromona τ (sube si el barbero termina más rápido que la base, evaporación ρ = 0,2) y η = 1/(espera+1). 80 % elige al mejor, 20 % reparte (Ant Colony System). [Detalle](documentacion/patrones/colonia-hormigas.md) |
| **Repositorio** | Acceso a datos | `src/datos/repositorio.js` | Único punto que guarda información; esconde que existe SQLite. Por eso agregar la base de datos no obligó a cambiar las fábricas ni los comandos. |
| **Fachada (Service)** | Estructural | `FilaService`, `Administracion` | Las rutas de la API solo hablan con estas clases, que coordinan fábricas, comandos, hormigas y datos. |
| **Middleware / cadena** | Comportamiento | `manejoErrores.js`, PIN en `adminRutas.js` | Errores propios convertidos en JSON con el código HTTP correcto y control de acceso antes de las rutas del dueño. |

Diagrama de clases: [documentacion/diagramas/diagrama-clases.md](documentacion/diagramas/diagrama-clases.md) · Flujo: [documentacion/diagramas/flujo.md](documentacion/diagramas/flujo.md)

## 4. Métodos y buenas prácticas aplicadas

- **Kanban** para organizar el trabajo en las 3 semanas, con entregas incrementales (v0.1 → v0.2 → v1.0).
- **Principios SOLID:** responsabilidad única (`Fila`, `FilaService`, `Administracion`, `BaseDatos` separados); abierto/cerrado (nuevas fábricas y comandos sin tocar los existentes); inversión de dependencias (el asignador recibe la función aleatoria, lo que permite probarlo).
- **Pruebas automatizadas** con `node:test`: 38 pruebas (unitarias, de integración y de persistencia), con los casos CP-01 a CP-08 de la Guía 6, valores límite (4/5/90/91 min) y códigos HTTP.
- **Integración continua:** GitHub Actions ejecuta las pruebas en cada cambio y genera el ejecutable al publicar una versión.
- **Validaciones y errores propios** (`ErrorValidacion` 400, `ErrorNoEncontrado` 404, `ErrorConflicto` 409) y mensajes claros para el usuario.
- **Seguridad básica:** los nombres se escapan antes de mostrarse (evita inyección de HTML), PIN para el panel del dueño, transacciones en la base de datos, cada cliente solo puede cancelar su propio turno.
- **Código legible:** nombres en español, comentarios que explican el *porqué*, funciones pequeñas y reutilizadas (`validaciones.js`, `public/comun.js`).
- **Control de versiones** con commits descriptivos (`feat:`, `docs:`, `refactor:`, `build:`) de todos los integrantes.

## 5. Principales decisiones de desarrollo

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| Web en el navegador + QR | App móvil | El cliente no instala nada; un QR basta |
| Node.js + Express, HTML/CSS/JS sin frameworks | React, Angular | Alcance de 3 semanas y código fácil de leer para el equipo |
| **SQLite incluido en Node.js 22** (`node:sqlite`) | MySQL, PostgreSQL | No hay que instalar programas; un solo archivo; suficiente para una barbería. [Detalle](documentacion/base-datos.md) |
| Listas en memoria + guardado en SQLite tras cada acción | Consultas SQL en cada operación | No hubo que reescribir el núcleo y las pruebas siguen siendo rápidas |
| Polling cada 10–15 s | WebSockets | Más simple; la espera se mide en minutos |
| Promedio de las últimas 10 duraciones válidas (5–90 min) | Duración fija por servicio | Cada barbero tarda distinto; se descartan los toques por error |
| PIN sencillo para el dueño | Usuarios y contraseñas | Fuera de alcance; la app solo vive en la WiFi del local |
| Cierre automático del día al encender en otra fecha | Cierre manual obligatorio | El dueño puede olvidarlo; lo aprendido se conserva |

## 6. Resultado final

- Las 4 historias de usuario funcionan de punta a punta en celulares reales conectados a la misma WiFi.
- La fila, las duraciones y las feromonas **sobreviven a un reinicio** gracias a la base de datos.
- 4 pantallas para los 3 roles (cliente, barbero, dueño) más la pantalla de TV y el cartel QR.
- **38 de 38 pruebas aprobadas**, ejecutadas también en GitHub Actions.
- Ejecutable para Windows y Linux en la sección **Releases**.
- Evidencias: [documentacion/evidencias](documentacion/evidencias/README.md).

---

## Cómo ejecutar el proyecto

### Opción A: desde GitHub, sin instalar nada (Codespaces)

1. Pulsar el botón **Open in GitHub Codespaces** de arriba y luego **Create codespace**. El servidor arranca solo.
2. Abrir el aviso **Open in Browser** (pantalla del cliente). Para las demás pantallas agregar al final de la dirección `/barbero.html`, `/admin.html`, `/pantalla.html` o `/qr.html`.
3. Para entrar desde los celulares: pestaña **Ports** → puerto 3000 → clic derecho → **Port Visibility → Public**, y abrir esa dirección (o escanear el QR de `/qr.html`).

Si el servidor no arrancó solo, escribir en la terminal: `npm start`.

### Opción B: en un computador con Node.js 22 o superior

```bash
git clone https://github.com/n-montenegro/cuantofalta.git
cd cuantofalta
npm install
npm start
```

La consola muestra todas las direcciones:

```
  Clientes:           http://localhost:3000
  Panel del barbero:  http://localhost:3000/barbero.html
  Panel del dueño:    http://localhost:3000/admin.html   (PIN: 1234)
  Pantalla para TV:   http://localhost:3000/pantalla.html
  Desde los celulares (misma WiFi): http://192.168.x.x:3000
  Base de datos: .../cuantofalta/datos/cuantofalta.db
```

### Opción C: ejecutable (sin instalar Node.js)

Descargar `cuantofalta-win.exe` o `cuantofalta-linux` desde **Releases**, abrirlo y entrar a las direcciones que muestra. La base de datos se crea en la carpeta `datos` junto al ejecutable.

### Configuración opcional

| Variable | Para qué | Por defecto |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `CUANTOFALTA_PIN` | PIN del panel del dueño | `1234` |
| `CUANTOFALTA_DB` | Ruta del archivo de base de datos | `datos/cuantofalta.db` |

### Demostración sugerida (5 minutos)

1. Abrir `/admin.html` en el portátil (PIN 1234) → **Cartel con QR**.
2. Dos compañeros escanean el QR y toman turno; uno elige "El que esté libre primero".
3. En `/barbero.html` agregar un cliente sin celular, tocar **Siguiente**, **No está** y **Deshacer**.
4. Mostrar `/pantalla.html` actualizándose y cómo cambian los minutos en los celulares.
5. Apagar el servidor (Ctrl + C), volver a encenderlo y mostrar que la fila sigue igual (base de datos).
6. Mostrar `npm test` y la pestaña **Actions**.

## Pruebas

```bash
npm test
```

38 pruebas con `node:test` (incluido en Node.js): fábricas, comandos, cálculo de espera, colonia de hormigas, panel del dueño, base de datos y API. Ver [tests/README.md](tests/README.md).

## API

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/datos` | Barberos y servicios |
| POST | `/api/turnos` | Tomar turno |
| GET | `/api/turnos/:numero` | Consultar turno |
| POST | `/api/turnos/:numero/cancelar` | Cancelar turno propio |
| GET | `/api/barberos/:id/fila` | Fila de un barbero |
| POST | `/api/barberos/:id/siguiente` · `/no-esta` · `/deshacer` · `/clientes` | Comandos del barbero |
| GET | `/api/estado` | Resumen para la pantalla de TV |
| GET | `/api/qr` | Código QR (SVG) con la dirección para los celulares |
| GET | `/api/feromonas` | Rastro de feromona |
| GET · POST · PATCH | `/api/admin/...` | Panel del dueño (encabezado `x-pin`) |

## Estructura del proyecto

```
cuantofalta/
├── README.md
├── package.json
├── .devcontainer/                   Configuración de Codespaces
├── .github/workflows/
│   ├── pruebas.yml                  Corre las pruebas en cada cambio
│   └── ejecutable.yml               Genera el ejecutable al publicar una versión
├── public/                          Pantallas (HTML, CSS y JS sin frameworks)
│   ├── index.html                   Cliente: tomar turno y ver la espera
│   ├── barbero.html                 Panel del barbero
│   ├── admin.html                   Panel del dueño
│   ├── pantalla.html                Pantalla para el televisor
│   ├── qr.html                      Cartel imprimible con el QR
│   ├── comun.js                     Funciones compartidas
│   └── estilos.css
├── src/
│   ├── server.js                    Arranca Express, conecta la BD y las rutas
│   ├── rutas/                       API REST (turnos, barberos, admin)
│   ├── modelos/                     Turno, TurnoQR, TurnoManual
│   ├── creacion/                    Patrón Factory Method
│   ├── nucleo/
│   │   ├── Fila.js                  Fila de un barbero y cálculo de espera
│   │   ├── FilaService.js           Fachada del núcleo
│   │   ├── Administracion.js        Operaciones del dueño
│   │   ├── comandos/                Patrón Command
│   │   └── asignacion/              Colonia de hormigas
│   ├── datos/
│   │   ├── repositorio.js           Datos en memoria + guardado
│   │   └── baseDatos.js             SQLite (tablas y transacciones)
│   └── utilidades/                  Errores, validaciones, middleware e IP
├── tests/                           38 pruebas automatizadas
└── documentacion/
    ├── descripcion_proyecto.md
    ├── base-datos.md                Modelo entidad-relación y tablas
    ├── presentacion-final.md        Guion para la sustentación
    ├── patrones/                    Un documento por patrón
    ├── diagramas/                   Clases y flujo (Mermaid)
    └── evidencias/                  Capturas y pruebas de funcionamiento
```

## Integrantes del equipo

| Integrante | Aporte |
|---|---|
| Nicolas Montenegro | Patrones Factory Method y Command, base de datos SQLite y panel del dueño |
| Jhorman Pardo | Algoritmo de colonia de hormigas, cálculo de espera e interfaz (cliente, barbero, TV y QR) |
| Brayan Escobar | Pruebas automatizadas, integración continua, evidencias y documentación |

## Trabajo futuro

- Notificación por WhatsApp o push cuando falten 10 minutos.
- Varias sedes y reportes semanales para el dueño.
- Ajustar α, β, ρ y q0 del algoritmo de hormigas con datos de una barbería real.

## Referencias

- Dorigo, M., & Gambardella, L. M. (1997). Ant colony system: A cooperative learning approach to the traveling salesman problem. *IEEE Transactions on Evolutionary Computation, 1*(1), 53–66. https://doi.org/10.1109/4235.585892
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design patterns: Elements of reusable object-oriented software*. Addison-Wesley.
- Fowler, M. (2002). *Patterns of enterprise application architecture*. Addison-Wesley.
- Node.js. (s. f.). *SQLite* [Documentación]. https://nodejs.org/api/sqlite.html
