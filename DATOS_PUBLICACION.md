# Datos de publicación configurados

## Google Sheets

- Hoja administrable: https://docs.google.com/spreadsheets/d/1fZnA0r4Ay9K7aU863FLVVYLsr3pHygYoyXDeD4_2nIU/edit
- Pestaña `productos`: contiene los 34 productos y el plato especial semanal.
- Pestaña `configuracion`: contiene WhatsApp, dirección, Instagram, estado y mensaje destacado.

El sitio ya está conectado a las dos direcciones CSV públicas en `config.js`.

## Plato especial semanal

En la pestaña `productos`, busca la fila cuyo `id` es `especial-semana`.

- Cambia `nombre` para poner el nombre del plato de esa semana.
- Cambia `descripcion` si deseas explicar qué incluye.
- El precio actual es `24000`.
- Usa `disponible = no` para mostrarlo agotado.
- Usa `agotado_modo = ocultar` si no quieres mostrarlo temporalmente.
