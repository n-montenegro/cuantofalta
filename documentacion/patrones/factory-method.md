# Patrón Factory Method — creación de turnos

**Categoría:** creacional (Gamma et al., 1994).

## Problema
En la barbería un turno nace de dos formas con reglas distintas:

| | Turno por QR | Turno manual |
|---|---|---|
| Quién lo crea | El cliente desde su celular | El barbero desde su panel |
| Identificación | Requiere `dispositivoId` | No tiene celular |
| Validación especial | Un solo turno activo por celular | Ninguna |
| Barbero | El elegido o el que asigne el algoritmo de hormigas | El que lo agregó |

Sin el patrón, una sola función tendría un `if (origen === "QR") {...} else {...}` con todas las reglas mezcladas, y cada origen nuevo (por ejemplo WhatsApp) obligaría a modificarla.

## Justificación
Los pasos comunes (validar nombre y servicio, numerar, poner `EN_ESPERA`, hora de llegada) son iguales; solo cambia cómo se construye el turno. Eso es exactamente lo que resuelve Factory Method.

## Aplicación y componentes
| Rol | Clase | Archivo |
|---|---|---|
| Creador abstracto | `FabricaTurnos` | `src/creacion/FabricaTurnos.js` |
| Creador concreto | `FabricaTurnoQR` | `src/creacion/FabricaTurnoQR.js` |
| Creador concreto | `FabricaTurnoManual` | `src/creacion/FabricaTurnoManual.js` |
| Producto abstracto | `Turno` | `src/modelos/Turno.js` |
| Productos concretos | `TurnoQR`, `TurnoManual` | `src/modelos/` |

## Código
```javascript
class FabricaTurnos {
  crearTurno(datos = {}) {
    const nombre = validarTexto(datos.nombre, "Escribe el nombre para tomar el turno");
    const servicio = validarServicio(repositorio.servicios, datos.servicioId);
    const turno = this.construirTurno({ ...datos, nombre, servicioId: servicio.id }); // método de fábrica
    turno.numero = repositorio.nuevoNumero();
    turno.estado = "EN_ESPERA";
    turno.horaLlegada = new Date();
    repositorio.turnos.push(turno);
    return turno;
  }
  construirTurno(datos) { throw new Error("construirTurno() debe implementarse en la subclase"); }
}
```

## Beneficios
- Un origen nuevo es una subclase nueva, sin tocar las existentes (abierto/cerrado).
- Cada fábrica tiene una sola razón para cambiar (responsabilidad única).
- Todos los turnos se numeran e inician igual porque esos pasos viven en un solo lugar.

**Pruebas:** `tests/fabricas.test.js`.
