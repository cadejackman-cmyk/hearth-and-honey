# Hearth & Honey — Website Design Spec

Date: 2026-09-06
Owner: Cade Jackman (for Megan Jackman, bakery owner)
Status: Approved for planning

## 1. Purpose

A small, fast, warm public website for Hearth & Honey, Megan Jackman's home bakery in
Draper, Utah. The single business goal is to get visitors to place an order by
**email** (orders@hearthhoneybakery.com) or **Instagram DM** (@hearth.honey.bakery).
Everything on the site funnels toward one of those two actions.

Secondary goals, in priority order:

1. Rank for local searches such as "cinnamon rolls Draper Utah" and the brand name.
2. Be fully readable by AI crawlers and answer engines (clear structure, structured data, `llms.txt`).
3. Meet WCAG 2.2 AA so the site is usable by everyone (ADA).
4. Be easy for a non-developer to extend with more products later.
5. Be fun: the site should feel like the bakery, not like a template.

## 2. Facts the site is built on

| Item | Value |
|---|---|
| Brand name (display) | Hearth & Honey |
| Legal / schema name | Hearth & Honey Bakery (alternateName: Hearth and Honey) |
| Owner | Megan Jackman, founder and baker |
| Location | Draper, Utah 84020 (city only; no street address on the site) |
| Fulfillment | Meet-up handoff at a public place around Draper. No shipping. |
| Order email | orders@hearthhoneybakery.com |
| Instagram | @hearth.honey.bakery → https://www.instagram.com/hearth.honey.bakery/ ; DM deep link https://ig.me/m/hearth.honey.bakery |
| Domain | https://hearthhoneybakery.com (apex; www redirects to apex) |
| Hosting | GitHub Pages, repo `cadejackman-cmyk/hearth-and-honey`, branch `main`, root folder |
| Brand colors | Cream `#FAF3E8`, Red `#C84C5A` |
| Product (launch) | Cinnamon Rolls. Ingredients: flour, milk, brown sugar, heavy cream, butter, eggs, water, sugar, yeast, salt, vanilla, cinnamon. Contains: wheat, milk, eggs. |
| Pricing | None shown anywhere. |
| Legal disclosure | Utah Food Freedom Act: "Made in a home kitchen that is not licensed or inspected by the Utah Department of Agriculture and Food or a local health department." Shown in the footer and on the menu page. |
| Phone | Not published (goal is email/Instagram). |

Supplied assets: logo wordmark (PNG, red on white), product label (source of ingredients
and a line-art roll illustration), portrait of Megan (JPG 1512×2016).

Not supplied: a product photograph. The site ships with an on-brand SVG line-art
cinnamon roll illustration in the same spirit as the label. Each product card has a
documented slot for a real photo later.

## 3. Approach

Plain static site with no build step for the pages themselves: hand-written HTML, one
CSS file, two small JS files. GitHub Pages serves the root of `main` directly.

Rationale: four pages and one product do not justify a generator. Zero build means zero
deploy failures, sub-second loads, and content that lives in HTML where every crawler can
read it. Adding a product is copying one card block.

Helper scripts (image processing, font fetching, verification) live under `tools/` and
run locally on demand. They are never needed to deploy.

## 4. Information architecture

| URL | Page | H1 | Job |
|---|---|---|---|
| `/` | Home | Hand-rolled cinnamon rolls, fresh from a Draper kitchen | Hook, prove, and push to Order |
| `/menu/` | Menu | What's baking | List every orderable item; show room for more |
| `/about/` | Meet Megan | Meet Megan | Trust and personality |
| `/order/` | Order | Order from Hearth & Honey | Convert: compose an email, or DM |
| `/404.html` | Not found | This page got eaten | Route back home |

Nav (all pages, in order): Home, Menu, Meet Megan, Order (styled as the primary button).
Footer (all pages): email, Instagram, "Draper, Utah", Food Freedom Act disclosure,
copyright, tiny link to sitemap.

### 4.1 Home sections, top to bottom

1. **Hero.** Eyebrow "Home-baked in Draper, Utah". H1. One-sentence sub. Two CTAs:
   "Start an order" (→ `/order/`) and "Message on Instagram" (→ ig.me). Illustration of a
   cinnamon roll with three animated steam wisps.
2. **What's baking.** One live product card (Cinnamon Rolls) with illustration,
   description, allergen line, and "Order cinnamon rolls" (→ `/order/?item=cinnamon-rolls`).
3. **More is proofing.** Two dashed-outline placeholder cards: "Next bake: TBA, follow
   Instagram to hear first" and "Have a request? Megan takes custom asks." These make the
   future menu obvious and give the page rhythm.
4. **How ordering works.** Three numbered steps: tell us what you'd like → Megan bakes
   it fresh → meet-up handoff in Draper.
5. **Meet the baker.** Megan's photo (square crop), two sentences, link to `/about/`.
6. **Come see the swirl.** Instagram CTA band.

### 4.2 Menu page

Intro paragraph. Card grid using the same product card as Home. One live card, plus the
two placeholder cards. Allergen and Food Freedom Act notes below the grid. An HTML
comment above the grid documents how to add a card (copy block, change name, description,
allergens, `?item=` slug).

### 4.3 About page

Portrait (3:4), H1, short generic blurb (owner asked for short for now), a "Why the name"
paragraph framed as the site's reading of the name rather than a claimed origin story, and
a CTA to Order. An HTML comment marks where to expand the bio.

### 4.4 Order page

1. Intro: two ways to order, both fine.
2. **Order form** (see §6).
3. **Prefer Instagram?** DM button.
4. **FAQ** (also emitted as FAQPage JSON-LD):
   - How far ahead should I order? (Assumed 48 hours; single constant, flagged for Megan.)
   - Where do we meet? (A public spot around Draper, agreed when Megan confirms.)
   - Do you deliver or ship? (Meet-up only, no shipping.)
   - Allergens? (Contains wheat, milk, eggs; home kitchen is not allergen-free.)
   - How do I pay? (Megan confirms payment details with your order.)

## 5. Visual design

Single warm light theme. No dark mode.

**Palette**

| Token | Hex | Use |
|---|---|---|
| `--cream` | `#FAF3E8` | Page background |
| `--cream-2` | `#F3E6D3` | Section bands, placeholders |
| `--paper` | `#FFFCF7` | Card surfaces |
| `--red` | `#C84C5A` | Headings ≥24px, buttons, accents, ornaments |
| `--red-ink` | `#A6323F` (or darker if needed) | Small text in red, links. Must be ≥4.5:1 on cream and paper |
| `--ink` | `#3B2A22` | Body text |
| `--ink-soft` | `#6B5A50` | Secondary text. Must be ≥4.5:1 on cream |
| `--honey` | `#E3A93D` | Decorative only (drips, highlights). Never text |

Contrast is verified by script, not by eye. Known: `#C84C5A` on `#FAF3E8` ≈ 4.1:1, so the
pure brand red is used only for large text, buttons with white labels, and UI/graphics.

**Type.** Display: Fraunces (variable, soft optical axis) for H1–H3 and the wordmark
fallback. Body: Figtree. Both self-hosted as woff2 (latin subset) with `font-display: swap`
and system fallbacks. Fluid sizes via `clamp()`.

**Ornament and motion.** SVG cinnamon-swirl motif as section divider and list marker;
honey-drip edge under the hero and above the footer; card lift and shadow on hover;
button press scale; hero steam wisps. Every animation is disabled under
`prefers-reduced-motion: reduce`.

**Layout.** Mobile-first, max content width 72rem, generous whitespace, cards on a
responsive grid. Header: logo left, nav right; below 48rem the nav collapses behind a
disclosure button labeled "Site navigation" (icon plus visually hidden text), never
"Menu", so it cannot be confused with the Menu page.

**Logo.** Vectorized from the supplied PNG if tracing produces a clean result; otherwise a
trimmed transparent PNG/WebP. Rendered at ~180px wide in the header, ~320px in the footer.

## 6. Order form behavior

Fields: Name (required), Email (required, for the reply), Item (select; launch options:
Cinnamon Rolls, Something else), Quantity (number, min 1, required), Date wanted (date,
min = today + lead time), Instagram handle (optional), Notes (optional textarea).

On submit with JS: validate, show inline errors plus an error summary that receives focus,
then build a `mailto:orders@hearthhoneybakery.com` URL with subject
`Order request: {Item} × {Qty} for {Date}` and a plain-text body listing every field, and
open it. Below the form, show a "Copy order details" panel containing the same text and
the address, for people whose device has no mail app. `?item=` in the URL preselects the item.

Without JS: the form is hidden by a `no-js` class and a plain block appears with the email
link and the DM link, so nobody dead-ends.

## 7. SEO, SXO, and AI readiness

- Per page: unique `<title>` (brand + Draper keyword), meta description ≤155 chars,
  canonical, `robots` index/follow, Open Graph (title, description, url, type, image
  1200×630, site_name, locale) and Twitter `summary_large_image`.
- JSON-LD `@graph` on every page: `Bakery` (#bakery: name, alternateName, url, email,
  logo, image, sameAs Instagram, address city/region/postal/country only, areaServed
  Draper UT, founder → #megan, hasMenu → Menu → MenuSection → MenuItem Cinnamon Rolls),
  `WebSite` (#website), `WebPage` for the current page, `BreadcrumbList`. About page adds
  `Person` (#megan). Menu and Home add `Product` for Cinnamon Rolls (no Offer). Order page
  adds `FAQPage`.
- `sitemap.xml` (4 URLs, lastmod), `robots.txt` (allow all, explicit allow for GPTBot,
  ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended; sitemap line), `llms.txt`
  (markdown summary of business, product, ordering, links), `site.webmanifest`, favicon
  set (SVG, ICO, 32/180/192/512 PNG), `CNAME`, `.nojekyll`.
- Semantic HTML: one H1, descriptive H2s that mirror queries, landmarks, `<picture>` with
  WebP + JPG, width/height on every image, lazy loading below the fold, `fetchpriority`
  on the hero image.
- Targets on mobile Lighthouse: Performance ≥ 95, Accessibility 100, Best Practices ≥ 95,
  SEO 100. Total home page weight under 500 KB.

## 8. Accessibility (WCAG 2.2 AA)

Skip link; `header`/`nav`/`main`/`footer` landmarks with labels; `aria-current="page"`;
mobile nav button with `aria-expanded`/`aria-controls`, Escape closes; visible 3px focus
ring with offset on every interactive element; text contrast ≥4.5:1 and UI ≥3:1 (scripted
check); form labels, `autocomplete`, hints and errors via `aria-describedby`, error summary
focused on submit, `aria-live` status region; tap targets ≥44×44; alt text on meaningful
images, `aria-hidden` on decorative SVG; no color-only meaning; logical heading order;
reduced-motion support; `lang="en-US"`; no autoplaying media; no cookies, no banners.

## 9. Repository layout

```
hearth-and-honey/
  index.html            menu/index.html      about/index.html     order/index.html
  404.html              CNAME                .nojekyll            robots.txt
  sitemap.xml           llms.txt             site.webmanifest     favicon.ico
  assets/css/site.css
  assets/js/site.js     (nav toggle, no-js flag)
  assets/js/order.js    (order form)
  assets/img/           (logo, roll illustration, megan-*.{webp,jpg}, og-image.png, icons)
  assets/fonts/         (fraunces-*.woff2, figtree-*.woff2)
  tools/                (package.json, build-images.mjs, fetch-fonts.mjs, verify/*.mjs)
  docs/superpowers/     (this spec, the plan)
  README.md             (how to edit, how to add a product, DNS records, how to deploy)
```

## 10. Deployment

1. Push `main` to `cadejackman-cmyk/hearth-and-honey` using a token supplied by Cade,
   passed as an HTTP header for the push only and never written to disk or git config.
2. Enable Pages (source: `main`, `/`), set custom domain `hearthhoneybakery.com`, enforce
   HTTPS. Done via API if the token allows, otherwise two clicks in Settings → Pages.
3. DNS at the registrar: four `A` records for the apex → 185.199.108.153, .109.153,
   .110.153, .111.153; `CNAME` `www` → `cadejackman-cmyk.github.io`.
4. After DNS propagates: confirm HTTPS, submit sitemap in Google Search Console
   (Cade's action; the site is ready for it).

## 11. Verification (evidence before "done")

Run locally against a static server, all four pages plus 404:

- `html-validate` clean.
- Playwright (system Chrome) + axe-core: zero violations.
- Lighthouse mobile: meets §7 targets; report actual numbers.
- Structured data: every JSON-LD block parses; required fields present per type.
- Contrast script over every text/background token pair.
- Internal link and asset check: no 404s; sitemap URLs match real pages.
- Keyboard walkthrough of nav and order form via Playwright: focus order, Escape,
  error summary focus, mailto URL contents.
- Reduced-motion check: no running animations when the media query is emulated.

## 12. Out of scope (for now)

Online payment, shopping cart, prices, analytics, a blog, dark mode, multiple languages,
a real product photo (slot provided), full biography (slot provided), phone number.
