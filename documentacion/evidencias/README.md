# Evidencias de funcionamiento (versión final)

Capturas tomadas con el servidor en ejecución (`npm start`) y una fila de ejemplo: 7 turnos, 2 barberos, un cliente agregado sin celular.

| # | Pantalla | Qué demuestra |
|---|---|---|
| 1 | ![Tomar turno](01-cliente-tomar-turno.png) | **HU-01** Tomar turno: nombre, servicio y barbero; opción "El que esté libre primero" (colonia de hormigas) |
| 2 | ![Mi turno](02-cliente-mi-turno.png) | **HU-02** Ver mi turno: número, puesto, minutos estimados y opción de cancelar |
| 3 | ![Panel barbero](03-panel-barbero.png) | **HU-03 y HU-04** Siguiente, No está, Deshacer (patrón Command) y cliente sin celular (Factory Method) |
| 4 | ![PIN](04a-dueno-pin.png) | El panel del dueño pide PIN |
| 5 | ![Panel dueño](04-panel-dueno.png) | Resumen del día, barberos activos, duraciones base, feromonas y cierre de jornada; estado de la base de datos |
| 6 | ![Pantalla TV](05-pantalla-tv.png) | Pantalla para el televisor del local con las filas y el QR |
| 7 | ![Cartel QR](06-cartel-qr.png) | Cartel imprimible con el código QR que lleva a la IP del portátil en la WiFi |

## Prueba de persistencia (base de datos)

1. Se tomaron 6 turnos y se llamó a "Siguiente" en ambos barberos.
2. Se apagó el servidor (Ctrl + C) y se volvió a encender.
3. `GET /api/estado` devolvió exactamente la misma fila y la tabla `turnos` de `datos/cuantofalta.db` tenía los 6 registros (5 por QR y 1 manual).

## Pruebas automatizadas

`npm test` → **38 pruebas, 38 aprobadas** (ver [tests/README.md](../../tests/README.md)). También se ejecutan en GitHub Actions en cada cambio (pestaña **Actions**).

## Ejecutable

El ejecutable de Linux generado con pkg arrancó, creó `datos/cuantofalta.db` junto al programa y respondió a la API correctamente.
