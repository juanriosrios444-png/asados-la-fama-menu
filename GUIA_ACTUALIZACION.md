# Guía de actualización y publicación

Esta guía está pensada para administrar el menú sin editar la página. El costo mensual puede ser **$0 COP** usando Google Sheets, GitHub y GitHub Pages.

## 1. Crear la hoja de Google Sheets

1. Entra a [Google Sheets](https://sheets.google.com) con una cuenta de Google.
2. Crea una hoja en blanco y llámala `Menu Asados La Fama`.
3. Renombra la primera pestaña como `productos`.
4. Crea otra pestaña y llámala `configuracion`.

No guardes contraseñas, documentos personales ni información privada en esta hoja: al publicarla como CSV, cualquier persona con el enlace podría leerla.

## 2. Pestaña `productos`

En la fila 1 escribe exactamente estas columnas:

| id | categoria | nombre | descripcion | precio | imagen | disponible | etiqueta | destacado | orden | agotado_modo |
|---|---|---|---|---:|---|---|---|---|---:|---|
| pollo-01 | Platos de pollo | Pollo a la plancha | Pechuga asada con acompañamientos | 21900 | https://.../pollo.jpg | si | Más vendido | si | 10 | mostrar |

Qué significa cada columna:

- `id`: identificador único, sin repetir. Ejemplo: `pollo-01`.
- `categoria`: crea automáticamente el filtro y la sección.
- `nombre`: nombre visible del producto.
- `descripcion`: texto corto.
- `precio`: solo números, sin `$` ni puntos. Ejemplo: `21900`.
- `imagen`: dirección pública `https://...` o ruta local `assets/img/foto.jpg`.
- `disponible`: `si` o `no`.
- `etiqueta`: opcional. Usa `Nuevo`, `Recomendado`, `Promoción` o `Más vendido`.
- `destacado`: `si` para mostrarlo en “Los favoritos de la casa”; `no` para un producto normal.
- `orden`: número menor aparece primero.
- `agotado_modo`: `mostrar` deja la tarjeta con el aviso Agotado; `ocultar` no la muestra.

## 3. Pestaña `configuracion`

Usa dos columnas: `clave` y `valor`.

| clave | valor |
|---|---|
| nombre_restaurante | Asados La Fama |
| eslogan | Sabor y calidad |
| whatsapp | 573053864006 |
| mensaje_whatsapp | Hola, vi el menú digital de Asados La Fama y quiero hacer un pedido. |
| direccion | Centro Comercial La Gran Manzana, segundo piso, local 227, Itagüí, Antioquia |
| horario | Lunes a domingo, 11:30 a. m. a 9:00 p. m. |
| texto_domicilios | Pregunta por cobertura y costo del domicilio. |
| instagram | https://instagram.com/TU_USUARIO |
| estado_restaurante | abierto |
| mensaje_destacado | Pregunta por la promoción del día. |

Para cerrar temporalmente, cambia `estado_restaurante` a `cerrado`. El aviso será visible y el menú seguirá disponible.

## 4. Publicar las dos pestañas como CSV

Haz este proceso una vez por cada pestaña:

1. En Google Sheets abre **Archivo → Compartir → Publicar en la Web**.
2. En el primer selector elige solo `productos` (no “Documento completo”).
3. En el segundo selector elige **Valores separados por comas (.csv)**.
4. Pulsa **Publicar**, confirma y copia el enlace.
5. Repite el proceso seleccionando `configuracion` y copia el segundo enlace.

La hoja debe permanecer publicada para que el menú pueda leerla. No necesitas una API, clave ni tarjeta de crédito.

## 5. Colocar los enlaces en el proyecto

1. Abre `config.js` con Bloc de notas.
2. Pega el enlace de `productos` entre las comillas de `PRODUCTS_CSV_URL`.
3. Pega el enlace de `configuracion` entre las comillas de `SETTINGS_CSV_URL`.
4. Guarda el archivo.

Ejemplo:

```js
window.MENU_CONFIG = {
  PRODUCTS_CSV_URL: "https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv",
  SETTINGS_CSV_URL: "https://docs.google.com/spreadsheets/d/e/.../pub?gid=123&single=true&output=csv",
  LOCAL_FALLBACK_URL: "menu-ejemplo.json",
  CACHE_MINUTES: 5
};
```

## 6. Actualizaciones frecuentes

### Agregar un producto

Añade una fila en `productos`, completa las columnas y asigna un `id` que no exista.

### Cambiar un precio

Desde el celular abre la app Google Sheets, toca la celda de `precio`, escribe el valor sin puntos ni signo peso y confirma. No hay que subir de nuevo la página.

### Marcar un producto agotado

Cambia `disponible` a `no`. Usa `mostrar` en `agotado_modo` para conservar la tarjeta con la etiqueta **Agotado**, o `ocultar` para quitarla del menú.

### Cambiar una imagen

Pega en `imagen` una URL pública que empiece por `https://`. Comprueba el enlace en una ventana privada: si allí se ve la imagen, normalmente el menú también podrá verla. Para una imagen guardada en el proyecto, súbela a `assets/img/` y escribe, por ejemplo, `assets/img/picada-familiar.jpg`.

### Crear una categoría

Escribe el nuevo nombre en `categoria`. El filtro y la sección se crean automáticamente. Usa exactamente la misma escritura en todos los productos de esa categoría.

### Cuánto tarda un cambio

Normalmente se refleja en unos minutos. La página renueva la consulta cada 5 minutos y Google también puede tardar unos minutos en actualizar el CSV publicado. Si no aparece, recarga la página o prueba en una ventana privada.

## 7. Publicar gratis en GitHub Pages (recomendado)

### Crear cuenta y repositorio

1. Entra a [github.com](https://github.com) y crea una cuenta gratuita.
2. Confirma el correo electrónico.
3. Pulsa **New repository**.
4. Nombre: `asados-la-fama-menu`.
5. Selecciona **Public** y crea el repositorio.

### Subir los archivos

1. Dentro del repositorio pulsa **Add file → Upload files**.
2. Arrastra **el contenido de esta carpeta**, incluyendo `assets` (no subas el ZIP como única cosa).
3. Verifica que `index.html` quede en la raíz del repositorio.
4. Pulsa **Commit changes**.

### Activar GitHub Pages

1. Abre **Settings → Pages**.
2. En **Build and deployment**, elige **Deploy from a branch**.
3. Selecciona la rama `main`, carpeta `/(root)` y pulsa **Save**.
4. Espera unos minutos. GitHub mostrará una dirección parecida a:
   `https://usuario.github.io/asados-la-fama-menu/`
5. Ábrela desde el celular y prueba búsqueda, filtros y WhatsApp.

Para corregir `config.js`, el logo o las fotos locales sí debes subir de nuevo esos archivos a GitHub. Para cambiar productos, precios, disponibilidad y textos administrados desde Sheets no debes volver a tocar GitHub.

## 8. QR permanente

1. Publica primero el sitio y copia la dirección completa de GitHub Pages.
2. Usa un generador de QR gratuito que permita descargar PNG o SVG sin registro ni prueba temporal.
3. Pega la dirección de la **página web**, no la de Google Sheets, una imagen ni un PDF.
4. Descarga el QR y pruébalo con al menos dos celulares antes de imprimir.
5. Guarda una copia del QR original.

Mientras no cambies el usuario de GitHub ni el nombre del repositorio, la dirección seguirá igual. El mismo QR funcionará aunque cambien productos, precios, promociones o disponibilidad en Google Sheets.

## 9. Otras opciones gratuitas (opcionales)

El proyecto también funciona en Netlify o Vercel: se crea una cuenta, se importa el repositorio y se publica como sitio estático sin comando de construcción. No son necesarios ni se recomiendan como método principal; GitHub Pages es más directo para este caso y no exige tarjeta.

## 10. Archivos visuales oficiales

Reemplaza dentro de `assets/img/`:

- `logo-oficial.png` por el logo oficial sin alterar proporción ni colores.
- `favicon.png` por el icono cuadrado.
- `imagen-compartir.jpg` por la imagen horizontal usada al compartir el enlace.
- Las fotos de platos que decidas guardar localmente.

Si todavía no existe `logo-oficial.png`, el sitio muestra un rótulo de texto para no dejar un espacio roto.

## Lista final antes de publicar

- [ ] Reemplacé todos los precios de ejemplo.
- [ ] Revisé nombres, descripciones, categorías y orden.
- [ ] Probé disponible `si`, agotado visible y agotado oculto.
- [ ] Publiqué ambas pestañas como CSV y pegué los dos enlaces en `config.js`.
- [ ] Reemplacé logo, favicon e imagen para compartir.
- [ ] Comprobé las fotos con Wi-Fi y datos móviles.
- [ ] Revisé dirección, horario, WhatsApp e Instagram.
- [ ] Probé el mensaje del botón de WhatsApp.
- [ ] Probé búsqueda y filtros en Android o iPhone.
- [ ] Abrí el enlace de GitHub Pages en una ventana privada.
- [ ] Escaneé el QR impreso antes de producir copias.
- [ ] Guardé una copia de la carpeta y del QR.
