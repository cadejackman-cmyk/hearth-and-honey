# Hearth & Honey — website

The public site for Hearth & Honey Bakery, Draper, Utah. Live at https://hearthhoneybakery.com, hosted on GitHub Pages from the root of the `main` branch.

Plain HTML, one CSS file, two small scripts. There is no build step: edit a file, commit, push, and GitHub Pages publishes it within a minute or two.

## Where things are

| Path | What it is |
|---|---|
| `index.html` | Home |
| `menu/index.html` | Menu |
| `about/index.html` | Meet Megan |
| `order/index.html` | Order form + FAQ |
| `policies/index.html` | Privacy notice, accessibility statement, ordering terms |
| `404.html` | Not-found page |
| `assets/css/site.css` | All styling. Colors and type sizes are variables at the top. |
| `assets/js/order-mail.js` | Order email logic: item list, lead time, subject/body |
| `assets/js/order.js`, `assets/js/site.js` | Form behavior, mobile nav |
| `assets/js/analytics.js` | Google Analytics 4 config (tag ID lives here) |
| `assets/img/` | Logo, illustrations, photos, social image, icons |
| `assets/fonts/` | Self-hosted fonts |
| `robots.txt`, `sitemap.xml`, `llms.txt`, `site.webmanifest` | Search-engine and AI-crawler files |
| `CNAME` | Custom domain for GitHub Pages. Do not delete. |
| `tools/` | Optional helper scripts. Not needed to publish. |
| `docs/superpowers/` | The design spec and implementation plan |

## Everyday edits

**Change words.** Open the page, find the text, change it. The header and footer are repeated in every page, so a change there needs to be made in all five files (`index.html`, `menu/`, `about/`, `order/`, `404.html`).

**Add a product.** In `menu/index.html`, follow the `HOW TO ADD A PRODUCT` comment above the card grid. In short: copy the cinnamon-roll card, change its id, name, description, ingredients, and allergens; add the same id and label to `ITEMS` in `assets/js/order-mail.js`; add a matching `<option>` in `order/index.html`; optionally copy the card onto the home page. Remove one placeholder card so the grid stays balanced. Add a `<url>` to `sitemap.xml` only if you add a whole new page.

**Swap in a real photo.** Every product card has a `PHOTO SLOT` comment. Put the photo in `assets/img/` (WebP or JPEG, about 800 px wide, under 150 KB) and replace the `<img>` as the comment shows. Write an alt that describes the photo.

**Expand Megan's bio.** `about/index.html`, look for the `BIO` comment.

**Change the lead time.** `LEAD_DAYS` in `assets/js/order-mail.js`, and the "2 days' notice" text in `order/index.html` (hint, FAQ, and the FAQPage JSON near the top) and in the notes on `menu/index.html`.

**Analytics.** Google Analytics (GA4, property G-DCZV25M028) is loaded from every page's `<head>`. Removing it means deleting the `<script>` tag that loads `analytics.js` in each page, deleting `assets/js/analytics.js`, and updating the privacy notice on `/policies/`. Cloudflare's content-security policy allows Google's analytics domains; if Google adds new ones (for example when Google Signals is turned on), add them to the header rule in Cloudflare.

**Prices.** There are none by design. If you add them later, put them in the card body and in the `Product` JSON-LD as an `offers` block.

## Things to confirm with Megan

Copy that was written as a safe default and is easy to change:

- Cinnamon roll description ("vanilla-cream glaze", "best eaten warm") on Home and Menu.
- "Please give at least 2 days' notice."
- "Everything is made in a home kitchen that also handles nuts and other allergens" (Menu notes).
- "A reply from Megan herself, usually within a day" and "never from a freezer case" (About).
- "Why Hearth & Honey" wording (About).
- Ordering terms on `/policies/`: cancellation and refund rules are deliberately not stated; add them once Megan decides. Update the "Last updated" date when you change any policy text.

## Publishing and the domain

Pushing to `main` publishes. In the repository, Settings → Pages should show: Source "Deploy from a branch", Branch `main` / `/ (root)`, Custom domain `hearthhoneybakery.com`, Enforce HTTPS on.

DNS records at the domain registrar (one-time):

| Type | Host | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `cadejackman-cmyk.github.io` |

After DNS propagates (minutes to a day), GitHub issues the certificate and `www` redirects to the apex. Then submit `https://hearthhoneybakery.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Caching (Cloudflare)

The domain sits behind Cloudflare. Every page and asset is cached at Cloudflare's edge for a day, and fonts and images for a year. A GitHub Action (`.github/workflows/purge-cloudflare-cache.yml`) clears the edge cache automatically after each successful Pages deployment, so a push shows up within a couple of minutes. Browsers keep pages, CSS, and JS for at most 10 minutes.

Two consequences:

- If you overwrite an existing image or font file **under the same filename**, visitors who already have it may keep the old one for up to a year. Use a new filename instead (for example `cinnamon-rolls-2.webp`).
- To clear the cache by hand: Cloudflare dashboard → Caching → Configuration → Purge Everything.

The Action needs two repository secrets, `CLOUDFLARE_API_TOKEN` (a token with Cache Purge permission on the zone) and `CLOUDFLARE_ZONE_ID`. Both are set. If the token is ever revoked, create a new one with only "Zone → Cache Purge → Purge" and update the secret under Settings → Secrets and variables → Actions.

## Tools (optional)

Node 24+ and Chrome installed. From `tools/`: `npm install` once, then:

- `npm run serve` — preview at http://127.0.0.1:8080
- `npm run verify` — unit tests, contrast, HTML validation, links, structured data, axe accessibility, Lighthouse
- `npm run build:images` — regenerate logo/photos/icons from `tools/source/`
- `npm run build:illustrations` — regenerate the SVG roll, swirl, favicon
- `npm run fetch:fonts` — re-download fonts (already committed)

Reports land in `tools/reports/` (ignored by git).
