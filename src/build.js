// Wraps each page body in src/pages with the shared head, header and footer, writing the finished HTML to the site root.
// Usage: node src/build.js
const fs = require("fs");
const path = require("path");
const SRC = path.join(__dirname, "pages");
const OUT = path.join(__dirname, "..");

const NAV = [
  ["index.html", "Home"],
  ["menu.html", "The Menu"],
  ["chef.html", "The Chef"],
  ["mill.html", "The Mill"],
  ["thanks.html", "With Thanks"],
];

const head = (p) => `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${p.title}</title>
  <meta name="description" content="${p.description}">
  <meta name="theme-color" content="#13110e">
  <meta property="og:title" content="${p.title}">
  <meta property="og:description" content="${p.description}">
  <meta property="og:image" content="assets/img/east-mill-tower.webp">
  <link rel="icon" type="image/png" href="assets/img/favicon.png">
  <link rel="preload" href="assets/fonts/cormorant-garamond.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/jost.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/cormorant-garamond-italic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
`;

const header = (file) => `
<header class="site-header">
  <div class="wrap site-header__inner">
    <a class="brand" href="index.html"${file === "index.html" ? ' aria-current="page"' : ""}>
      <img src="assets/img/logo-mark-cream.png" alt="" width="181" height="490">
      <span class="brand__name">fal-consumé</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
      <span class="nav-toggle__bars" aria-hidden="true"></span>
      <span class="nav-toggle__label">Menu</span>
    </button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      <ul>
${NAV.map(([href, label]) => `        <li><a href="${href}"${href === file ? ' aria-current="page"' : ""}>${label}</a></li>`).join("\n")}
        <li class="nav-cta"><a href="reservations.html"${file === "reservations.html" ? ' aria-current="page"' : ""}>Reservations</a></li>
      </ul>
    </nav>
  </div>
</header>
`;

const footer = `
<footer class="site-footer">
  <div class="wrap">
    <div class="site-footer__grid">
      <div class="site-footer__logo">
        <img src="assets/img/logo-full-cream.png" alt="fal-consumé" width="403" height="579">
      </div>
      <div>
        <h2>Find us</h2>
        <address>
          The Top Floor<br>
          East Mill, Bridge Foot<br>
          Belper, Derbyshire<br>
          Derwent Valley Mills World Heritage Site
        </address>
      </div>
      <div>
        <h2>Service</h2>
        <p>Thursday, Friday &amp; Saturday<br>8pm until 1am<br>From 1 January 2027</p>
        <p class="muted">Closed Sunday to Wednesday, so that the falcons may rest.</p>
      </div>
      <div>
        <h2>Explore</h2>
        <ul>
${NAV.map(([href, label]) => `          <li><a href="${href}">${label}</a></li>`).join("\n")}
          <li><a href="reservations.html">Reservations</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__small">
      <p>&copy; 2026 Fal-consumé. All rights reserved. &middot; <a href="mill.html#credits">Photography credits</a></p>
    </div>
  </div>
</footer>
<script src="assets/js/main.js" defer></script>
</body>
</html>
`;

for (const f of fs.readdirSync(SRC)) {
  const raw = fs.readFileSync(path.join(SRC, f), "utf8");
  const nl = raw.indexOf("\n");
  const meta = JSON.parse(raw.slice(0, nl));
  const body = raw.slice(nl + 1);
  fs.writeFileSync(path.join(OUT, f), head(meta) + header(f) + '\n<main id="main" tabindex="-1">\n' + body + "</main>\n" + footer);
  console.log("wrote", f);
}
