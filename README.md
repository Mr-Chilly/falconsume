# Fal-consumé

Static website for Fal-consumé, the top floor of the East Mill, Belper.

## Editing

Page content lives in `src/pages/`. Each file starts with a one-line JSON header (`title`, `description`) followed by the page body. The shared head, header and footer are in `src/build.js`.

After editing, rebuild the HTML in the site root:

```sh
node src/build.js
```

No dependencies are needed beyond Node.js.

## Structure

- `*.html` – built pages (served as-is)
- `assets/css/style.css` – all styles, including the self-hosted font faces
- `assets/js/main.js` – navigation, reservation calendar and request form
- `assets/fonts/` – Cormorant Garamond and Jost (latin subset)
- `assets/img/` – photography and logos; credits on `mill.html#credits`
- `12398.jpg`, `12399.jpg` – original logo artwork

The reservation form does not send data anywhere yet; it needs a form backend before launch.
