# Dilit — sitio estático

Sitio de una página en español, construido con HTML, CSS y JavaScript. No requiere compilación, base de datos ni WordPress.

## Vista local

Abra `index.html` en el navegador o sirva esta carpeta con el servidor local incluido, si tiene Node.js instalado:

```powershell
node scripts/preview.mjs
```

## Publicación en GoDaddy Web Hosting Deluxe

1. Revise y apruebe esta versión local antes de tocar el sitio público.
2. En el administrador de archivos de GoDaddy o mediante FTP/SFTP, haga una copia de seguridad del contenido actual del directorio raíz del dominio. Para el dominio principal suele ser `public_html`.
3. Suba `index.html`, `styles.css`, `script.js` y la carpeta `media` a ese directorio raíz. Conserve los nombres y la estructura de carpetas.
4. Compruebe `https://dilit.co/` en escritorio y móvil, y pruebe los enlaces de navegación, teléfono y correo.
5. Si GoDaddy o una CDN muestran la versión anterior, vacíe su caché.

Los archivos originales del cliente permanecen en `Assets`. `scripts/prepare-assets.ps1` genera copias optimizadas y recortes individuales de las garrafas originales en `media` sin alterar sus etiquetas. Puede recibir un archivo fuente opcional mediante `-HeroSource` para regenerar la fotografía de imprenta. La fotografía editorial en `media/imprenta-hero.jpg` fue generada para esta versión.

La carpeta entregada no incluye una fotografía UV de inspección independiente ni imágenes originales de Actilit, Alcolit o Solvelit Lebo. El detalle luminoso del bloque Sellalit es CSS y los otros productos se presentan con texto.
