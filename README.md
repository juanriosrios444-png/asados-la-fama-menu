# Menú digital — Asados La Fama

Sitio estático, rápido y adaptable a celulares. Lee productos y datos generales desde dos pestañas de Google Sheets publicadas como CSV. Si la hoja de productos falla, muestra automáticamente `menu-ejemplo.json`.

> Los productos y precios fueron transcritos de los menús oficiales entregados el 20 de julio de 2026. Conviene revisarlos una vez más antes de publicar, especialmente el precio de la botella de vino, que aparece como `$6.000` en la imagen original.

## Estructura

- `index.html`: contenido y etiquetas SEO.
- `styles.css`: diseño mobile-first rojo, naranja, blanco y crema.
- `app.js`: lectura CSV/JSON, búsqueda, filtros, destacados y estados.
- `config.js`: enlaces activos de Google Sheets.
- `config.example.js`: plantilla limpia de configuración.
- `menu-ejemplo.json`: respaldo local y productos de muestra.
- `plantilla-productos.csv` y `plantilla-configuracion.csv`: archivos que puedes importar en Google Sheets para empezar más rápido.
- `GUIA_ACTUALIZACION.md`: instrucciones para administrar y publicar.
- `assets/img/`: logo, fotografías, favicon e imagen para compartir.

## Probar en el computador

Por seguridad, algunos navegadores no permiten cargar JSON al abrir `index.html` con doble clic. Usa un servidor local:

### Opción sencilla con Python

1. Abre una terminal dentro de esta carpeta.
2. Ejecuta `python -m http.server 8000`.
3. Abre `http://localhost:8000`.
4. Para terminar, presiona `Ctrl + C`.

### Opción con Visual Studio Code

Instala la extensión gratuita **Live Server**, abre esta carpeta y selecciona **Open with Live Server**.

No hace falta instalar nada para GitHub Pages.

## Conectar Google Sheets

Sigue [GUIA_ACTUALIZACION.md](GUIA_ACTUALIZACION.md). En resumen, publica por separado las pestañas `productos` y `configuracion` como CSV y pega sus enlaces en `config.js`.

## Publicación gratuita

GitHub Pages es el método recomendado y está explicado paso a paso en la guía. Netlify y Vercel también pueden alojar estos archivos, pero no son necesarios; el proyecto está pensado para funcionar por **$0 COP al mes** con GitHub Pages y Google Sheets.

## Reemplazar recursos visuales

Coloca estos archivos en `assets/img/` conservando exactamente los nombres:

- `logo-oficial.png`: versión recortada del logo oficial para la cabecera.
- `logo-original.png`: archivo original entregado, conservado sin cambios.
- `favicon.png`: icono cuadrado del sitio (recomendado: 512 × 512 px).
- `imagen-compartir.jpg`: imagen horizontal para WhatsApp/redes (recomendado: 1200 × 630 px).

Las fotos de platos pueden estar alojadas en una dirección pública `https://...` y esa dirección se pega en la columna `imagen`. También se admiten rutas como `assets/img/churrasco.jpg` si la foto se sube al repositorio.

## Verificación técnica incluida

La aplicación no usa frameworks, claves privadas, servicios pagos ni API con cobro. Las URL se validan antes de usarse, el CSV admite comas, saltos de línea y comillas, y los textos externos se escapan antes de mostrarse.
