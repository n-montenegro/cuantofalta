# Descripción del proyecto: CuántoFalta

## 1. Descripción general de la solución

Muchas barberías de barrio atienden por orden de llegada. El cliente llega, ve gente esperando y no sabe si le faltan 15 minutos o una hora. CuántoFalta es una fila virtual: el cliente escanea un código QR en la entrada, pide su turno desde el navegador del celular (sin instalar nada) y ve en qué puesto va y cuánto tiempo le falta. El barbero maneja la fila desde su propio celular con un botón de "Siguiente".

## 2. Módulos o componentes principales

| Componente | Archivo o carpeta | Responsabilidad |
| --- | --- | --- |
| Pantalla del cliente | `public/index.html` | Pedir turno y mostrar puesto y tiempo de espera |
| Panel del barbero | `public/barbero.html` | Ver quién está en la silla y quiénes esperan; llamar al siguiente |
| Servidor (API) | `src/server.js` | Recibir las peticiones de los celulares y responder con los datos |
| Creación de turnos | `src/creacion/` | Crear turnos nuevos y validar que los datos estén completos |
| Núcleo de la fila | `src/nucleo/` | Ordenar la fila de cada barbero, mover clientes y calcular la espera |
| Datos | `src/datos/` | Guardar barberos, servicios y turnos (por ahora en memoria) |

## 3. Responsabilidades iniciales de cada componente

- **Creación:** revisa que el turno tenga nombre, servicio y barbero válidos, y le asigna un número consecutivo.
- **Núcleo:** mantiene el orden de llegada, sienta al siguiente cliente cuando el barbero lo pide y calcula la espera con esta regla: tiempo que le falta al cliente de la silla + duración de los servicios de quienes están antes.
- **Servidor:** conecta las pantallas con la lógica; no toma decisiones de negocio.
- **Datos:** es el único lugar que guarda información, para poder cambiarlo después por una base de datos.

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

## 6. Próximas entregas: patrones de diseño previstos

En esta primera entrega no se implementan patrones completos. Ya se dejó la estructura lista para aplicarlos:

- **Factory Method** en `src/creacion/`: los turnos pueden nacer por QR o agregados a mano por el barbero, y cada origen tiene reglas distintas.
- **Command** en `src/nucleo/`: las acciones del barbero (Siguiente, No está, Agregar cliente) serán objetos que se puedan deshacer.
