# Algoritmo de Colonia de Hormigas (ACO) — asignación de barbero

**Tipo:** algoritmo de búsqueda y optimización (metaheurística). No es un patrón de diseño GoF; complementa a Factory Method y Command.

## Dónde se usa
Cuando el cliente elige **"El que esté libre primero"**, `FabricaTurnoQR` le pide a `FilaService.elegirBarbero()` que decida. Este método consulta a `AsignadorHormigas` (`src/nucleo/asignacion/AsignadorHormigas.js`).

## Problema
Mandar siempre al barbero con menos fila parece justo, pero ignora que un barbero puede ser más rápido en ciertos servicios. Y mandar siempre al "mejor" concentra el trabajo en uno solo. La barbería pidió: **casi siempre el más rápido, a veces repartir**.

## Analogía
| ACO | CuántoFalta |
|---|---|
| Hormiga | Cliente que busca barbero |
| Camino | Cada barbero |
| Feromona τ | Rastro de cada barbero en cada servicio |
| Evaporación ρ | El rastro viejo pierde peso frente al reciente |
| Heurística η | `1 / (espera actual + 1)` |

## Funcionamiento (variante Ant Colony System)
1. **Puntaje** de cada barbero: `τ^α · η^β`, con α = 1 y β = 2.
2. **Regla pseudoaleatoria proporcional:** con probabilidad q0 = 0,8 se elige el de mayor puntaje (explotación); el 20 % restante se sortea con probabilidad proporcional al puntaje (exploración).
3. **Actualización de feromona** cada vez que `ComandoSiguiente` termina un servicio válido (5 a 90 min):
   `τ = (1 − ρ) · τ + ρ · (duración base / duración real)`, con ρ = 0,2.
   Si el barbero tardó menos que la base, el aporte es mayor que 1 y su rastro crece.
4. **Deshacer:** `ComandoSiguiente` guarda la feromona anterior y la restaura, así el algoritmo nunca aprende de una acción deshecha.

## Componentes
| Clase | Papel |
|---|---|
| `AsignadorHormigas` | Calcula puntajes, elige barbero y actualiza feromona |
| `FilaService.elegirBarbero()` | Arma los candidatos con la espera de cada fila |
| `FabricaTurnoQR` | Usa la elección cuando `barberoId` es `"auto"` |
| `ComandoSiguiente` | Deposita y, al deshacer, restaura la feromona |
| `repositorio.feromonas` | Guarda la tabla de feromonas |

La tabla puede verse en `GET /api/feromonas` durante la demostración.

## Beneficios
- Combina dos fuentes: la fila actual (η) y el desempeño reciente (τ).
- Reparte parte de los clientes, lo que evita que un barbero acapare todo.
- Los parámetros (α, β, ρ, q0) se pueden ajustar sin cambiar el resto del código.

**Pruebas:** `tests/hormigas.test.js` y caso CP-03 en `tests/fabricas.test.js`.

## Referencias
- Dorigo, M., Maniezzo, V. y Colorni, A. (1996). Ant system: Optimization by a colony of cooperating agents. *IEEE Transactions on Systems, Man, and Cybernetics, Part B, 26*(1), 29–41.
- Dorigo, M. y Gambardella, L. M. (1997). Ant colony system: A cooperative learning approach to the traveling salesman problem. *IEEE Transactions on Evolutionary Computation, 1*(1), 53–66.
