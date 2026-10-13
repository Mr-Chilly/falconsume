// Wraps each page body in src/pages with the shared head, header and footer, writing the finished HTML to the site root.
// Usage: node src/build.js
const fs = require("fs");
const path = require("path");
const SRC = path.join(__dirname, "pages");
const OUT = path.join(__dirname, "..");

// Clean URLs: Vercel serves menu.html at /menu (see vercel.json)
const url = (file) => (file === "index.html" ? "/" : "/" + file.replace(/\.html$/, ""));

const NAV = [
  ["index.html", "Home"],
  ["menu.html", "The Menu"],
  ["chef.html", "The Chef"],
  ["mill.html", "The Mill"],
  ["thanks.html", "With Thanks"],
];

// The live address. Change this one line when the custom domain is ready.
const SITE_URL = "https://falconsume.vercel.app";
const abs = (p) => SITE_URL + p;
const LASTMOD = new Date().toISOString().slice(0, 10);

const RESTAURANT_ID = abs("/#restaurant");
const ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "The Top Floor, East Mill, Bridge Foot",
  addressLocality: "Belper",
  addressRegion: "Derbyshire",
  addressCountry: "GB",
};

const restaurant = {
  "@type": "Restaurant",
  "@id": RESTAURANT_ID,
  name: "Fal-consumé",
  description: "Fine dining on the top floor of Belper’s historic East Mill: a six-course tasting menu built around the peregrine falcon egg omelette.",
  url: abs("/"),
  logo: abs("/assets/img/icon-512.png"),
  image: [abs("/assets/img/og-image.jpg"), abs("/assets/img/eggs-pair.webp")],
  address: ADDRESS,
  servesCuisine: ["French", "Modern British", "Fine dining"],
  priceRange: "£££££",
  currenciesAccepted: "GBP",
  acceptsReservations: abs("/reservations"),
  hasMenu: abs("/menu"),
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Thursday", "Friday", "Saturday"],
    opens: "20:00",
    closes: "01:00",
    validFrom: "2027-01-01",
  }],
  employee: { "@id": abs("/chef#chef") },
};

const crumbs = (file, name) => ({
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
    { "@type": "ListItem", position: 2, name, item: abs(url(file)) },
  ],
});

const menuItem = (name, description) => ({ "@type": "MenuItem", name, description });

const SCHEMA = {
  "index.html": () => [
    { "@type": "WebSite", "@id": abs("/#website"), name: "Fal-consumé", url: abs("/"), inLanguage: "en-GB", publisher: { "@id": RESTAURANT_ID } },
    restaurant,
  ],
  "menu.html": () => [
    {
      "@type": "Menu",
      name: "Le Menu Pèlerin",
      url: abs("/menu"),
      inLanguage: "en-GB",
      hasMenuSection: {
        "@type": "MenuSection",
        name: "Tasting menu",
        offers: { "@type": "Offer", price: "1912", priceCurrency: "GBP", description: "Six-course tasting menu, per guest" },
        hasMenuItem: [
          menuItem("The Weir", "Consommé du Derwent: a clear, chilled consommé, served in a single spoon."),
          menuItem("Pigeon, Absent", "Hommage au pigeon des River Gardens, with Belper sourdough and cultured butter."),
          menuItem("L’Omelette Pèlerine", "Your own peregrine falcon egg, folded at your table over a copper flame."),
          menuItem("La Derwent", "Wild brown trout, lightly cured, finished in brown butter with valley watercress."),
          menuItem("Le Quatre-Vingt-Dix-Neuf", "Soft-serve of Derbyshire Jersey cream and Madagascan vanilla in a hand-rolled wafer cone."),
          menuItem("The Shell", "A fragment of the evening’s shell, gilded in 24-carat leaf."),
        ],
      },
    },
    { "@id": RESTAURANT_ID, "@type": "Restaurant", name: "Fal-consumé", hasMenu: abs("/menu") },
    crumbs("menu.html", "The Menu"),
  ],
  "chef.html": () => [
    {
      "@type": "Person",
      "@id": abs("/chef#chef"),
      name: "Burciel de Chivers",
      jobTitle: "Head Chef",
      birthPlace: { "@type": "Place", name: "Arles, France" },
      worksFor: { "@id": RESTAURANT_ID },
      image: abs("/assets/img/chef.webp"),
      url: abs("/chef"),
    },
    crumbs("chef.html", "The Chef"),
  ],
  "mill.html": () => [
    {
      "@type": "LandmarksOrHistoricalBuildings",
      name: "East Mill, Belper",
      description: "Grade II listed cotton mill completed in 1912 for the English Sewing Cotton Company, within the Derwent Valley Mills World Heritage Site.",
      address: { "@type": "PostalAddress", streetAddress: "Bridge Foot", addressLocality: "Belper", addressRegion: "Derbyshire", addressCountry: "GB" },
      image: abs("/assets/img/east-mill-tower.webp"),
      url: abs("/mill"),
    },
    crumbs("mill.html", "The Mill"),
  ],
  "reservations.html": () => [crumbs("reservations.html", "Reservations")],
  "thanks.html": () => [crumbs("thanks.html", "With Thanks")],
};

const jsonLd = (file) => {
  const graph = SCHEMA[file] ? SCHEMA[file]() : [];
  if (!graph.length) return "";
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/</g, "\\u003c");
  return `  <script type="application/ld+json">\n${json}\n  </script>\n`;
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const head = (p, file) => {
  const canonical = abs(url(file));
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${p.title}</title>
  <meta name="description" content="${esc(p.description)}">
${p.noindex ? '  <meta name="robots" content="noindex">\n' : `  <link rel="canonical" href="${canonical}">\n`}  <meta name="theme-color" content="#13110e">
  <meta http-equiv="X-Clacks-Overhead" content="GNU Terry Pratchett">
  <meta property="og:type" content="${file === "index.html" ? "restaurant.restaurant" : "website"}">
  <meta property="og:site_name" content="Fal-consumé">
  <meta property="og:locale" content="en_GB">
  <meta property="og:title" content="${esc(p.title)}">
  <meta property="og:description" content="${esc(p.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${abs("/assets/img/og-image.jpg")}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="The fal-consumé logo beside two speckled peregrine falcon eggs on black.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(p.title)}">
  <meta name="twitter:description" content="${esc(p.description)}">
  <meta name="twitter:image" content="${abs("/assets/img/og-image.jpg")}">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" href="/assets/fonts/cormorant-garamond.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/jost.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/cormorant-garamond-italic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/style.css">
${jsonLd(file)}</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
`;
};

const header = (file) => `
<header class="site-header">
  <div class="wrap site-header__inner">
    <a class="brand" href="/"${file === "index.html" ? ' aria-current="page"' : ""}>
      <img src="/assets/img/logo-mark-cream.png" alt="" width="181" height="490">
      <span class="brand__name">fal-consumé</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
      <span class="nav-toggle__bars" aria-hidden="true"></span>
      <span class="nav-toggle__label">Menu</span>
    </button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      <ul>
${NAV.map(([href, label]) => `        <li><a href="${url(href)}"${href === file ? ' aria-current="page"' : ""}>${label}</a></li>`).join("\n")}
        <li class="nav-cta"><a href="/reservations"${file === "reservations.html" ? ' aria-current="page"' : ""}>Reservations</a></li>
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
        <img src="/assets/img/logo-full-cream.png" alt="fal-consumé" width="403" height="579">
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
${NAV.map(([href, label]) => `          <li><a href="${url(href)}">${label}</a></li>`).join("\n")}
          <li><a href="/reservations">Reservations</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__small">
      <p>&copy; 2026 Fal-consumé. All rights reserved. &middot; <a href="/mill#credits">Photography credits</a></p>
    </div>
  </div>
</footer>
<script src="/assets/js/main.js" defer></script>
</body>
</html>
`;

const pages = [];
for (const f of fs.readdirSync(SRC)) {
  const raw = fs.readFileSync(path.join(SRC, f), "utf8");
  const nl = raw.indexOf("\n");
  const meta = JSON.parse(raw.slice(0, nl));
  const body = raw.slice(nl + 1);
  if (!meta.noindex) pages.push(f);
  fs.writeFileSync(path.join(OUT, f), head(meta, f) + header(f) + '\n<main id="main" tabindex="-1">\n' + body + "</main>\n" + footer);
  console.log("wrote", f);
}

const priority = (f) => (f === "index.html" ? "1.0" : ["menu.html", "reservations.html"].includes(f) ? "0.9" : "0.7");
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((f) => `  <url>
    <loc>${abs(url(f))}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <priority>${priority(f)}</priority>
  </url>`).join("\n")}
</urlset>
`);

fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${abs("/sitemap.xml")}
`);

fs.writeFileSync(path.join(OUT, "site.webmanifest"), JSON.stringify({
  name: "Fal-consumé",
  short_name: "Fal-consumé",
  description: "Fine dining on the top floor of the East Mill, Belper.",
  start_url: "/",
  display: "standalone",
  background_color: "#13110e",
  theme_color: "#13110e",
  icons: [
    { src: "/assets/img/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/assets/img/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
}, null, 2) + "\n");
console.log("wrote sitemap.xml, robots.txt, site.webmanifest");
