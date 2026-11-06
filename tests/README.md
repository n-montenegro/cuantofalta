# Pruebas de CuántoFalta

Se ejecutan desde la carpeta principal con:

```
npm test
```

Usan `node:test`, que ya viene con Node.js (no hay que instalar nada extra). Los casos CP-01 a CP-08 corresponden al plan de pruebas de la Guía 6.

| Archivo | Qué revisa |
|---|---|
| `fabricas.test.js` | Factory Method: validaciones, turno QR (CP-01), un turno por celular (CP-02), "el que esté libre primero" (CP-03), turno manual |
| `comandos.test.js` | Command: Siguiente, duración de 4 min descartada (CP-05), Deshacer (CP-06), No está (CP-07), Agregar cliente (CP-08), historial por barbero |
| `fila.test.js` | Cálculo de espera, promedio real, valores límite 4/5/90/91 min y redondeo |
| `hormigas.test.js` | Colonia de hormigas: fórmula de feromona, restauración, explotación y exploración |
| `api.test.js` | Integración: levanta el servidor y prueba la API con códigos 201, 400, 404 y 409 |
| `ayudas.js` | Funciones de apoyo (hora fija y servicio limpio); no es una prueba |

Resultado actual: **29 pruebas, 29 aprobadas.**
