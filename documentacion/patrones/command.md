# Patrón Command — acciones del barbero

**Categoría:** de comportamiento (Gamma et al., 1994).

## Problema
El barbero trabaja con afán y puede tocar el botón equivocado. Si "Siguiente" cambiara la fila directamente, no habría forma ordenada de revertirlo, y cada acción necesitaría su propia lógica de deshacer dispersa en el código.

## Justificación
Command encapsula cada acción como un objeto con `ejecutar()` y `deshacer()`. Antes de ejecutar, el comando guarda lo necesario para revertirse; un historial los apila y "Deshacer" saca el último.

## Aplicación y componentes
| Rol | Clase | Archivo |
|---|---|---|
| Comando abstracto | `Comando` | `src/nucleo/comandos/Comando.js` |
| Comando concreto | `ComandoSiguiente` | `src/nucleo/comandos/ComandoSiguiente.js` |
| Comando concreto | `ComandoNoEsta` | `src/nucleo/comandos/ComandoNoEsta.js` |
| Comando concreto | `ComandoAgregarCliente` | `src/nucleo/comandos/ComandoAgregarCliente.js` |
| Invocador | `HistorialComandos` (uno por barbero) | `src/nucleo/comandos/HistorialComandos.js` |
| Cliente | `FilaService` | `src/nucleo/FilaService.js` |
| Receptor | `Fila` | `src/nucleo/Fila.js` |

| Comando | Guarda antes de ejecutar | Al deshacer |
|---|---|---|
| `ComandoSiguiente` | Cliente en silla, primero en espera, registro de duración y feromona anterior | Devuelve ambos turnos a su estado, borra el registro y restaura la feromona |
| `ComandoNoEsta` | Cliente llamado y su hora de inicio | Lo vuelve a la silla y regresa al siguiente a la espera |
| `ComandoAgregarCliente` | Turno creado | Lo elimina de la fila |

## Código
```javascript
class HistorialComandos {
  constructor() { this.pila = []; }
  ejecutar(comando) {
    const huboCambio = comando.ejecutar();
    if (huboCambio) this.pila.push(comando);
    return huboCambio;
  }
  deshacer() {
    const comando = this.pila.pop();
    if (!comando) throw new ErrorValidacion("No hay acciones para deshacer");
    comando.deshacer();
    return comando;
  }
}
```

## Relación con Factory Method
`ComandoAgregarCliente` usa `FabricaTurnoManual` para crear el turno; por eso agregar un cliente sin celular también se puede deshacer.

## Beneficios
- El deshacer funciona igual para todas las acciones.
- Una acción nueva (por ejemplo "Pausa de almuerzo") es un comando nuevo, sin tocar los demás.
- `HistorialComandos` depende solo de la interfaz `Comando` (inversión de dependencias).
- Cada barbero tiene su historial: el "Deshacer" de Jhon no afecta la fila de Carlos.

**Decisión de alcance:** solo se deshace en orden inverso (pila) y el historial vive en memoria.
**Pruebas:** `tests/comandos.test.js`.
