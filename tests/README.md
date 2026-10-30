# Pruebas de CuántoFalta

Esta carpeta guarda las pruebas del proyecto.

## Cómo ejecutarlas

Desde la carpeta principal del proyecto:

```
npm test
```

No hay que instalar nada extra: se usa el módulo de pruebas que ya viene con Node.js (`node:test`).

## Pruebas actuales

| Archivo | Qué revisa |
| --- | --- |
| `fila.test.js` | Que no se pueda crear un turno sin nombre |
| `fila.test.js` | Que la espera sume los servicios de quienes están antes |
| `fila.test.js` | Que el botón Siguiente mueva bien a los clientes |

## Pruebas pendientes (próximas entregas)

- Deshacer la última acción del barbero.
- Marcar a un cliente como "No está".
- Un solo turno por celular.
- Turnos agregados a mano por el barbero.
