# CuántoFalta

Fila virtual con tiempo estimado de espera para barberías que atienden por orden de llegada.

## Descripción y objetivo

CuántoFalta permite que el cliente de una barbería pida su turno escaneando un código QR y vea desde su celular en qué puesto va y cuánto tiempo le falta. El barbero maneja la fila desde su propio celular.

**Objetivo:** desarrollar una aplicación web que le muestre al cliente de una barbería su posición en la fila y el tiempo aproximado de espera, para que pueda esperar sin quedarse en el local, sin instalar aplicaciones y sin cambiar la forma de trabajo del barbero.

## Problema que busca resolver

En las barberías de barrio que no trabajan con citas, el cliente solo sabe cuántas personas hay antes, pero no cuánto tiempo tendrá que esperar, porque cada servicio y cada barbero tardan distinto. Eso hace que muchos clientes se vayan, que otros esperen incómodos y que los barberos tengan que interrumpir su trabajo para responder "¿cuánto falta?".

## Integrantes del equipo


| Nicolas Montenegro | 
| Jhorman Pardo| 
| Brayan escobar | 

## Tecnologías seleccionadas

- JavaScript
- Node.js y Express (servidor)
- HTML y CSS (pantallas)
- `node:test` (pruebas)
- Git y GitHub (control de versiones)
- Kanban (organización del trabajo)

## Estructura del repositorio

```
cuantofalta/
├── docs/
│   └── descripcion_proyecto.md   Descripción técnica de la solución
├── public/
│   ├── index.html                Pantalla del cliente (tomar turno)
│   ├── barbero.html              Panel del barbero
│   └── estilos.css               Estilos de las pantallas
├── src/
│   ├── server.js                 Archivo principal (arranca el servidor)
│   ├── creacion/crearTurno.js    Crea y valida turnos
│   ├── nucleo/fila.js            Maneja la fila y calcula la espera
│   └── datos/repositorio.js      Datos en memoria
├── tests/
│   ├── README.md                 Explicación de las pruebas
│   └── fila.test.js              Pruebas del núcleo
├── package.json
├── README.md
└── .gitignore
```

## Cómo ejecutar el proyecto

1. Instalar [Node.js](https://nodejs.org) (versión LTS).
2. Descargar o clonar este repositorio.
3. Abrir una terminal en la carpeta del proyecto e instalar las dependencias:
   ```
   npm install
   ```
4. Iniciar el servidor:
   ```
   npm start
   ```
5. Abrir en el navegador:
   - Cliente: http://localhost:3000
   - Barbero: http://localhost:3000/barbero.html
6. Para ejecutar las pruebas:
   ```
   npm test
   ```

## Estado del proyecto

Primera entrega: estructura inicial, funcionalidad básica de tomar turno, ver la espera y llamar al siguiente cliente. Los patrones de diseño se aplicarán en las próximas entregas (ver `docs/descripcion_proyecto.md`).
