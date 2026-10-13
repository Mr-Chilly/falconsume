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

- `api/reserve.js` – Vercel Function that emails reservation requests

## Reservation requests

The booking form posts to `/api/reserve`, which validates the request and emails it to the restaurant via [Resend](https://resend.com). Requests for fully booked evenings are marked as waiting-list entries. Replying to the email replies to the guest.

Set these in Vercel → Project → Settings → Environment Variables, then redeploy:

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | API key from resend.com |
| `RESERVATIONS_TO` | Inbox for requests (comma-separate for several) |
| `RESERVATIONS_FROM` | Sender on a domain verified in Resend, e.g. `Fal-consumé <reservations@yourdomain>` |

Without `RESERVATIONS_FROM`, Resend's test sender is used, which only delivers to the email address on your Resend account.
