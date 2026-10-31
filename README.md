# Fal-consumé

Static website for Fal-consumé, the top floor of the East Mill, Belper.

## Editing

Page content lives in `src/pages/`. Each file starts with a one-line JSON header (`title`, `description`) followed by the page body. The shared head, header and footer are in `src/build.js`.

After editing, rebuild the HTML in the site root:

```sh
node src/build.js
```

No dependencies are needed beyond Node.js.

To preview locally, serve the folder rather than opening the files directly (links use clean URLs such as `/menu`):

```sh
npx serve .
```

`vercel.json` enables clean URLs on Vercel: `/menu` serves `menu.html`, and `/menu.html` redirects to `/menu`.

## SEO

`src/build.js` also writes `sitemap.xml` and `robots.txt`, and adds canonical URLs, social-share tags and schema.org structured data (Restaurant, Menu, Person, breadcrumbs) to each page. All absolute URLs come from `SITE_URL` at the top of `src/build.js`; change it when the custom domain is live, rebuild and push.

## Structure

- `*.html` – built pages (served as-is)
- `assets/css/style.css` – all styles, including the self-hosted font faces
- `assets/js/main.js` – navigation, reservation calendar and request form
- `assets/fonts/` – Cormorant Garamond and Jost (latin subset)
- `assets/img/` – photography and logos; credits on `mill.html#credits`
- `12398.jpg`, `12399.jpg` – original logo artwork

## Reservation requests

The booking form sends nothing anywhere. A valid submission opens a popup saying the request does not meet our requirements and has been automatically deleted.
