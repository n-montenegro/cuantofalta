# CuántoFalta

Fila virtual con tiempo estimado de espera para barberías que atienden por orden de llegada.

## Descripción

CuántoFalta permite que el cliente de una barbería pida su turno escaneando un código QR y vea desde su celular en qué puesto va y cuánto tiempo le falta. El barbero maneja la fila desde su propio celular: llama al siguiente, marca a quien no está, agrega clientes sin celular y deshace la última acción si se equivoca.

## Objetivo

Desarrollar una aplicación web que le muestre al cliente de una barbería su posición en la fila y el tiempo aproximado de espera, para que pueda esperar sin quedarse en el local, sin instalar aplicaciones y sin cambiar la forma de trabajo del barbero.

## Problema que busca resolver

En las barberías de barrio que no trabajan con citas, el cliente solo sabe cuántas personas hay antes, pero no cuánto tiempo tendrá que esperar, porque cada servicio y cada barbero tardan distinto. Eso hace que muchos clientes se vayan, que otros esperen incómodos y que los barberos tengan que interrumpir su trabajo para responder "¿cuánto falta?".

## Alcance

**Incluye:** tomar turno por QR, consultar posición y espera, gestión de la fila por el barbero (Siguiente, No está, Deshacer, Agregar cliente) y estimación de la espera con las duraciones reales de cada barbero.

**No incluye:** citas, pagos, comisiones, notificaciones por WhatsApp, inicio de sesión, reportes ni base de datos. Los datos viven en memoria.

## Funcionalidades implementadas

| Funcionalidad | Historia de usuario | Estado |
|---|---|---|
| Tomar turno con nombre, servicio y barbero | HU-01 | ✅ |
| Un solo turno activo por celular | HU-01 | ✅ |
| Opción "El que esté libre primero" (asignación por colonia de hormigas) | HU-01 | ✅ |
| Ver posición y espera, actualizada cada 15 s | HU-02 | ✅ |
| Siguiente, No está y Deshacer en el panel del barbero | HU-03 | ✅ |
| Agregar cliente sin celular | HU-04 | ✅ |
| Espera calculada con el promedio real de cada barbero (duraciones de 5 a 90 min) | HU-02 | ✅ |
| Validaciones y mensajes de error claros (400, 404, 409) | Todas | ✅ |

## Tecnologías utilizadas

- JavaScript
- Node.js y Express (servidor y API REST)
- HTML y CSS sin frameworks (pantallas)
- `node:test` (pruebas automatizadas, incluido en Node.js)
- Git y GitHub (control de versiones)
- Kanban (organización del trabajo)

## Estructura actual del proyecto

```
cuantofalta/
├── README.md
├── package.json
├── .gitignore
├── public/                          Pantallas
│   ├── index.html                   Cliente: tomar turno y ver la espera
│   ├── barbero.html                 Panel del barbero
│   └── estilos.css
├── src/
│   ├── server.js                    Arranca Express y conecta las rutas
│   ├── rutas/                       API REST
│   │   ├── turnosRutas.js
│   │   └── barberosRutas.js
│   ├── modelos/                     Turno, TurnoQR, TurnoManual
│   ├── creacion/                    Patrón Factory Method
│   │   ├── FabricaTurnos.js
│   │   ├── FabricaTurnoQR.js
│   │   └── FabricaTurnoManual.js
│   ├── nucleo/
│   │   ├── Fila.js                  Fila de un barbero y cálculo de espera
│   │   ├── FilaService.js           Punto de entrada del núcleo
│   │   ├── comandos/                Patrón Command
│   │   │   ├── Comando.js
│   │   │   ├── ComandoSiguiente.js
│   │   │   ├── ComandoNoEsta.js
│   │   │   ├── ComandoAgregarCliente.js
│   │   │   └── HistorialComandos.js
│   │   └── asignacion/
│   │       └── AsignadorHormigas.js Algoritmo de colonia de hormigas
│   ├── datos/
│   │   └── repositorio.js           Datos en memoria
│   └── utilidades/                  Errores, validaciones y middleware
├── tests/                           Pruebas automatizadas
└── documentacion/
    ├── descripcion_proyecto.md
    ├── patrones/                    Un documento por patrón
    └── diagramas/                   Diagrama de clases y flujo (Mermaid)
```

## Patrones y decisiones de construcción

| Patrón | Categoría | Dónde | Problema que resuelve |
|---|---|---|---|
| **Factory Method** | Creacional | `src/creacion/` | Un turno nace por QR o manual, con reglas distintas |
| **Command** | Comportamiento | `src/nucleo/comandos/` | Las acciones del barbero deben poder deshacerse |
| **Colonia de hormigas (ACO)** | Algoritmo de búsqueda | `src/nucleo/asignacion/` | Elegir barbero: casi siempre el más rápido, a veces repartir |

### Factory Method
`FabricaTurnos` hace los pasos comunes (validar, numerar, poner en espera) y llama a `construirTurno()`, que cada fábrica concreta implementa. `FabricaTurnoQR` exige el celular y un solo turno activo; `FabricaTurnoManual` deja el turno con el barbero que lo agregó. **Por qué:** evita un `if` por origen y permite agregar orígenes nuevos sin modificar los existentes. Detalle en [documentacion/patrones/factory-method.md](documentacion/patrones/factory-method.md).

### Command
Cada botón del barbero es un objeto con `ejecutar()` y `deshacer()`. `HistorialComandos` (uno por barbero) los apila y "Deshacer" revierte el último. `ComandoAgregarCliente` usa `FabricaTurnoManual`, lo que une ambos patrones. **Por qué:** el barbero trabaja con afán y necesita corregir errores sin dañar la fila. Detalle en [documentacion/patrones/command.md](documentacion/patrones/command.md).

### Colonia de hormigas (ACO)
Cuando el cliente elige "El que esté libre primero", cada barbero recibe un puntaje `τ^α · η^β`: τ es la feromona (crece cuando el barbero termina un servicio más rápido que la duración base y se evapora con ρ = 0,2) y η = 1 / (espera + 1). El 80 % de las veces se elige al de mayor puntaje y el 20 % se sortea proporcionalmente (Ant Colony System, Dorigo y Gambardella, 1997). La feromona se deposita en `ComandoSiguiente` y se restaura al deshacer. **Por qué:** combina la fila actual con el desempeño reciente y reparte parte del trabajo. Detalle en [documentacion/patrones/colonia-hormigas.md](documentacion/patrones/colonia-hormigas.md).

Diagrama de clases: [documentacion/diagramas/diagrama-clases.md](documentacion/diagramas/diagrama-clases.md).

### Otras decisiones
- **Polling cada 15 s** en lugar de WebSockets: más simple y la espera se mide en minutos.
- **Datos en memoria** en `repositorio.js`: es el único archivo que guarda información, para cambiarlo luego por una base de datos.
- **Errores propios** (`ErrorValidacion`, `ErrorNoEncontrado`, `ErrorConflicto`) y un middleware que los convierte en respuestas JSON.

## Cómo ejecutar el proyecto

1. Instalar [Node.js](https://nodejs.org) (versión LTS).
2. Clonar este repositorio y abrir una terminal en su carpeta.
3. Instalar dependencias: `npm install`
4. Iniciar el servidor: `npm start`
5. Abrir en el navegador:
   - Cliente: http://localhost:3000
   - Barbero: http://localhost:3000/barbero.html
   - Feromonas del algoritmo: http://localhost:3000/api/feromonas
6. Ejecutar las pruebas: `npm test`

Para probar con celulares, conectarlos a la misma red WiFi del portátil y abrir `http://IP-DEL-PORTATIL:3000`.

## Pruebas

29 pruebas automatizadas con `node:test` que cubren las fábricas, los comandos, el cálculo de espera, el algoritmo de hormigas y la API. Ver [tests/README.md](tests/README.md).

## Integrantes del equipo

| Integrante | Aporte en la segunda entrega |
|---|---|
| Nicolas Montenegro | Patrones Factory Method y Command |
| Jhorman Pardo | Algoritmo de colonia de hormigas, cálculo de espera y pantallas |
| Brayan Escobar | Pruebas automatizadas y documentación |

## Estado actual del proyecto

**Segunda entrega (v0.2.0):** las cuatro historias de usuario están implementadas con Factory Method y Command, la asignación de barbero usa colonia de hormigas y todas las pruebas pasan.

## Próximos avances

- Generar el código QR imprimible de la barbería.
- Guardar los datos en una base de datos para no perderlos al reiniciar.
- Pantalla para que el dueño configure barberos, servicios y duraciones base.
- Ajustar los parámetros del algoritmo de hormigas con datos de una barbería real.
