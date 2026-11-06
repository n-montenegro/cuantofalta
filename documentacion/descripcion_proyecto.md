# Descripción del proyecto: CuántoFalta

## 1. Descripción general de la solución

Muchas barberías de barrio atienden por orden de llegada. El cliente llega, ve gente esperando y no sabe si le faltan 15 minutos o una hora. CuántoFalta es una fila virtual: el cliente escanea un código QR en la entrada, pide su turno desde el navegador del celular (sin instalar nada) y ve en qué puesto va y cuánto tiempo le falta. El barbero maneja la fila desde su propio celular con un botón de "Siguiente".

## 2. Módulos o componentes principales

| Componente | Archivo o carpeta | Responsabilidad |
| --- | --- | --- |
| Pantalla del cliente | `public/index.html` | Pedir turno y mostrar puesto y tiempo de espera |
| Panel del barbero | `public/barbero.html` | Ver la fila; Siguiente, No está, Deshacer y Agregar cliente |
| Funciones compartidas de las pantallas | `public/js/api.js` | Llamar a la API y mostrar los errores |
| Servidor | `src/server.js` | Armar la aplicación Express y arrancarla |
| Rutas (API) | `src/rutas/` | Recibir las peticiones de los celulares y responder JSON |
| Modelos | `src/modelos/` | `Turno`, `TurnoQR` y `TurnoManual` |
| Creación de turnos | `src/creacion/` | Patrón Factory Method |
| Núcleo de la fila | `src/nucleo/` | `Fila`, `FilaService` y los comandos (patrón Command) |
| Asignación de barbero | `src/nucleo/asignacion/` | Algoritmo de colonia de hormigas |
| Datos | `src/datos/` | Barberos, servicios, turnos, duraciones y feromonas en memoria |
| Utilidades | `src/utilidades/` | Validaciones, tipos de error y manejo de errores de la API |

## 3. Responsabilidades de cada componente

- **Creación:** valida nombre y servicio, aplica las reglas de cada origen (QR o manual) y numera el turno.
- **Núcleo:** mantiene el orden de llegada y ejecuta las acciones del barbero como comandos que se pueden deshacer.
- **Cálculo de la espera:** tiempo que le falta al cliente de la silla + duración esperada de quienes están antes. La duración esperada es el promedio de las últimas 10 duraciones válidas (entre 5 y 90 minutos) de ese barbero en ese servicio, o la duración base si tiene menos de 3. Se redondea a múltiplos de 5 minutos.
- **Asignación:** si el cliente elige "El que esté libre primero", el barbero se elige con colonia de hormigas.
- **Rutas:** conectan las pantallas con `FilaService`; no toman decisiones de negocio.
- **Datos:** único lugar que guarda información, para poder cambiarlo después por una base de datos.

## 4. Tecnologías y herramientas

- **Lenguaje:** JavaScript.
- **Servidor:** Node.js con Express.
- **Pantallas:** HTML y CSS, sin frameworks.
- **Pruebas:** módulo `node:test` incluido en Node.js.
- **Control de versiones:** Git y GitHub.
- **Editor:** Visual Studio Code.
- **Organización del trabajo:** tablero Kanban.

## 5. Organización del desarrollo

El trabajo se organiza con **Kanban**, con un tablero de cinco columnas: Por hacer, En análisis, En desarrollo, En pruebas y Hecho. Cada historia de usuario se divide en tareas pequeñas y se limita a dos tareas en desarrollo al mismo tiempo.

En el repositorio:

- La rama `main` guarda siempre una versión que funciona.
- Cada integrante hace commits pequeños con mensajes claros que dicen qué se hizo.
- Las pruebas se ejecutan con `npm test` antes de subir cambios.

## 6. Patrones implementados (segunda entrega)

- **Factory Method** en `src/creacion/`: ver `documentacion/patrones/factory-method.md`.
- **Command** en `src/nucleo/comandos/`: ver `documentacion/patrones/command.md`.
- **Colonia de hormigas (ACO)** en `src/nucleo/asignacion/`: ver `documentacion/patrones/colonia-hormigas.md`.
