# AGENTS.md — mieuxvivreenville.com (MVV website)

Instructions for Codex (and any coding agent) working in this repository. Read this file fully before doing anything, then read the design reference described in section 3.

## 1. Project in one paragraph

Rebuild the website of **Mieux Vivre en Ville (MVV)**, a working group of the Conseillers du Commerce Extérieur de la France (CCE) Japan committee, supported by the French Embassy in Japan. The site is a **content site** (publications, events, committee, roadmap) that must look very attractive. It is bilingual: **French (default) and Japanese**. The owner is Sébastien Cardet (Tokyo); the editors are non-developers who will edit content only through **Pages CMS**.

## 2. Stack and hard constraints

| Layer | Choice |
| --- | --- |
| Framework | **Astro** (latest stable), static output (`output: 'static'`), TypeScript where useful |
| Content editing | **Pages CMS** (git-based, configured by `.pages.yml` at the repo root) |
| Source control | **GitHub**, `main` is production; work in branches + pull requests |
| Hosting | **Firebase Hosting**, deployed by **GitHub Actions** (preview per pull request, deploy on merge to `main`) |
| Styling | Plain CSS or CSS variables (no heavy UI framework). Keep the JavaScript minimal: small islands only (publication filters, hero carousel, session tabs, mobile menu, language switch) |

Rules:

1. **Do not change the visual design.** The two HTML prototypes in `design-reference/` are the approved design. Reproduce them faithfully (layout, spacing, colours, typography, behaviours).
2. **Do not invent content.** All texts come from the prototypes or from the content seed. If a text is missing, leave a clearly marked `TODO` in the content file and list it in your final report.
3. **All editable content lives in files Pages CMS can edit** (Markdown/JSON/YAML in `src/content/`, media in `public/`). Nothing editable may be hard-coded in components.
4. No horizontal scrolling on mobile (test at 360, 390 and 430 px).
5. Accessible and fast: semantic HTML, keyboard navigation, visible focus, `alt` text, `lang` attribute per page, `prefers-reduced-motion` respected, images sized and lazy-loaded, Lighthouse mobile performance above 90.
6. Never commit secrets. Firebase credentials stay in GitHub Actions secrets.
7. Work in small steps: one milestone = one branch = one pull request. At the end of each task, report (a) what you did, (b) what you could not verify, (c) decisions the owner must make.

## 3. Design reference (source of truth)

- `design-reference/MVV_prototype_desktop.html` — desktop design.
- `design-reference/MVV_prototype_mobile.html` — mobile design (phone frame, hamburger menu, compact two-column publication cards).
- `design-reference/pdf/` — all publication and programme PDFs.

Both prototypes are single standalone HTML files generated from one template. They contain the final texts (French and Japanese), data arrays (publications, sessions, editions, carousel slides), CSS and JavaScript behaviours. **Open them in a browser and read their source**; extract texts and data from them rather than retyping. The site is responsive: one codebase, one layout switching below **760 px** (the prototype toggles an `.m` class at that width; use a media query instead).

### Design tokens

| Token | Value |
| --- | --- |
| cream (page background) | `#F8F5F0` |
| sand | `#EDE8DE` |
| ink (text) | `#1A1A1A` |
| deep green | `#2F6B3E` |
| mid green | `#44875B` |
| green | `#4FA95A` |
| lime | `#8CB94B` |
| pale green | `#C5DDA8` |
| night green | `#12301b` |
| footer green | `#1f4a2b` |

Fonts: **Newsreader** (headings, serif), **Inter** (body), **Noto Sans JP** (Japanese). Self-host the fonts or load them with `font-display: swap`.

Logos: CCE Japon logo at the top left of the header, MVV logo (green bars) centred. Extract the images from the prototypes (they are embedded as base64) into `public/images/`.

## 4. Site structure

One page per language with anchor sections, plus an Actions page:

- `/fr/` and `/ja/` — home: hero ("À propos de Mieux Vivre en Ville"), then **Notre mission**, **Comité de pilotage**, **Publications**, **Feuille de route 2026-2027**, contact banner, footer.
- `/fr/actions/` and `/ja/actions/` — **Actions**: events (2025 Osaka, 2024 Bilan MVV with four sessions, earlier editions 2023 to 2016).
- `/` redirects to `/fr/`.
- Header menu (in this order): Notre mission, Comité de pilotage, Publications, Actions, Feuille de route 2026-2027. There is **no "À propos" menu item** (the hero is that content). FR / 日本語 switch at the right of the header, hamburger menu on mobile. Active/hover menu item: bold green underline (5 px).
- Footer has no "Nous contacter" link and there is **no mailing-list button** anywhere.
- Contact: every "Nous écrire" button is a `mailto:contact@mieuxvivreenville.com` link.

Astro i18n: locales `['fr', 'ja']`, default `fr`, URLs prefixed (`/fr/`, `/ja/`). Provide `hreflang` alternates and a language switch that keeps the current page.

Translate all site copy, including accessibility labels, into Japanese during implementation whenever a prototype supplies it only in French. Store both versions in `src/content/` and render the selected language at build time. Preserve proper names and original publication artwork as appropriate. The publication PDF fallback below still applies.

## 5. Sections and behaviours

### Hero
- Left: eyebrow "Groupe d'expertise · CCE Japon", title "À propos de *Mieux Vivre en Ville*", two paragraphs, buttons "Notre mission" and "Voir les publications".
- Right: an arched visual (rounded top) made of a **tilted mosaic of six publication covers** (article Aug 2026, Journal 2025, Revue 2024, Revue 2023, Rapport 2021-2022, Compilation 2020-2021). A dark-green gradient overlay sits at the bottom. If a cover fails to load, keep the green tile.
- Over the visual: a **carousel widget** (card), auto-rotating every 5 seconds, with clickable dots. It is **content-managed** (Pages CMS collection "À la une"). Current slides:
  1. "Dernière publication" · Août 2026 · *Territoires et énergie, un enjeu partagé* · link "Lire l'article" (goes to Publications).
  2. "À paraître" · Décembre 2026 · *Cybersécurité et villes intelligentes* · no link, label "Bientôt disponible".
  3. "À paraître" · Janvier 2027 · *Financer les infrastructures des villes intelligentes* · no link, label "Bientôt disponible".
- Known inconsistency to fix in content: the first slide's subtitle ("Histoires de villes, histoires de personnes.") differs from the publication card subtitle. Use the card subtitle, and flag it.

### Notre mission
Text and three statistics (86+, 1 250+, 244+). Copy from the prototype.

### Comité de pilotage
Four members as cards (photo, name, role, company), each card is a link to the member's LinkedIn profile (new tab). Maïa Maniglier is highlighted (green card, pill "Pilote du comité", title "Présidente", company "Exprime Inc."). Members: Maïa Maniglier, Isabelle Senghor (EDF Japon), Sébastien Cardet (Dassault Systèmes Japon), Benjamin Lamberg ("Senior Country Officer", Crédit Agricole Japon). On mobile: two photos per row, with name, role and company in a box under each photo. **The LinkedIn URLs in the prototype are name-search placeholders; mark them `TODO` in the content until real profile URLs are provided.**

### Publications
- Filter chips by type: Tous les documents, Articles, Journaux et revues, Rapports et synthèses, Compilations, Sessions. **No "Programmes" type. No year filter in the UI** (except the removable "Années : 2026 · 2027 ✕" tag set by the roadmap link "Lire les articles", which pre-filters Articles for 2026-2027).
- Cards show the cover image (with the dark-green overlay, the document icon and the year centred), the title, a subtitle of **at most 3 lines**, the page count and the available languages. Card: "Lire" button.
- Default: 10 documents displayed, then a "older years" toggle. Desktop: grid; mobile: two compact columns.
- **Language rule**: the list follows the site language. In French, French documents are shown. In Japanese, **all** documents are shown; a document with no Japanese version shows the note "日本語版はありません · Disponible en français uniquement" and the button "Lire (français)". Each publication has `pdf_fr` and optionally `pdf_ja`; the rule is driven by which fields are filled.
- The 13 documents, with their data, are in `content-seed/publications.seed.json` (title, subtitle, type, year, pages, languages, cover source URL). Covers currently come from the old Squarespace site (`cover_source_url`): **download them into `public/images/covers/` and reference the local copies**; never hot-link in production.

### Actions
- Header: "Treize ans de rencontres pour mieux vivre en ville".
- 2025 Osaka feature block.
- 2024 "Bilan MVV 2024 : Pour des villes Smart & Sexy, une nouvelle conception de la durabilité": a post-event summary (two paragraphs) and **four session tabs**, each with a title, a short summary and the list of speakers (name, role) beneath it. The link "Lire le programme" opens `MVV_programme_2024.pdf`.
- "Éditions précédentes": 2023, 2021-2022, 2019, 2017, 2016. Each edition shows a year block, title, date and place, a short intro, bullet items with a one-line description each, and one link: "Lire le programme" (2023, 2019, 2017, 2016) or "Lire la revue 2022" (2021-2022). The corresponding PDFs are in `design-reference/pdf/`.
- This page keeps only events; documents not tied to an event live in Publications.

### Feuille de route 2026-2027
Heading, three cards (2026 "Les Smart Cities observées sous de nouveaux angles" with the link "Lire les articles"; 2027; Automne 2027), then the timeline "De janvier à l'automne 2027" with four steps (Janvier 2027 Événement de lancement; T1-T2 2027 Recherche et entretiens; Été 2027 Rédaction; Automne 2027 Publication et événement).

## 6. Content model (Pages CMS)

Create `.pages.yml` at the repo root. Study the documentation before writing it: <https://pagescms.org/docs/configuration/> and <https://pagescms.org/llms.txt>. Do not guess field types or syntax.

Suggested collections and files (adapt to what Pages CMS supports):

| Content | Suggested location | Notes |
| --- | --- | --- |
| Publications | `src/content/publications/*.md` or `.json` | fields: title (fr/ja), subtitle (fr/ja), type (select), year, pages, cover (image), `pdf_fr`, `pdf_ja` (files), published (boolean) |
| Committee | `src/content/committee/*.md` | name, role (fr/ja), company, photo, linkedin, highlighted (boolean), order |
| Carousel "À la une" | `src/content/featured/*.md` | kicker, badge date, title, subtitle, link, state (published / coming soon), order |
| Events / editions | `src/content/actions/*.md` | year, title, date, place, summary, bullets, program or report PDF, sessions (list with speakers) |
| Roadmap | `src/content/roadmap.json` | cards and timeline steps |
| Site texts | `src/content/site.json` (+ `ui.json` for labels) | hero, mission, statistics, contact email, footer, FR and JA strings |
| Media | `public/images/`, `public/pdf/` | configure the Pages CMS `media` entries accordingly |

**Multilingual handling in Pages CMS is not yet verified.** Before building the content model, confirm from the documentation how to edit two languages. Preferred option: one folder per language (`src/content/fr/…`, `src/content/ja/…`) with a Pages CMS collection each, or one entry with `fr`/`ja` field groups. Choose the simplest option that lets a non-technical editor work, explain your choice in the pull request, and use Astro content collections with a schema (Zod) so that the build fails on invalid content.

## 7. Deployment (Firebase)

- Build: `npm ci && npm run build` → output in `dist/`.
- `firebase.json`: public directory `dist`; `cleanUrls`; redirect `/` → `/fr/`; redirects for old URLs (`/actions` → `/fr/actions/`, `/en/publications` → `/fr/#publications`); cache headers: long cache for fingerprinted assets, short for HTML.
- GitHub Actions: a workflow for pull-request previews and a workflow deploying to the live channel on merge to `main`. Use the Firebase service-account secret created by `firebase init hosting:github`.
- Default Firebase URL (`mieuxvivreenville.web.app`) first; the custom domain `mieuxvivreenville.com` is connected by the owner **after** validation. Do not touch DNS.

## 8. Milestones (one pull request each)

1. Astro skeleton, i18n `/fr/` `/ja/`, tokens, header, footer, hero (static), language switch.
2. Mission, Committee, Roadmap, contact banner.
3. Publications: content collection from the seed, filters, language rule, covers, pagination, year tag, mobile two-column layout. Hero mosaic and carousel.
4. Actions page: 2024 with sessions, earlier editions, PDF links.
5. `.pages.yml` with all collections; test an edit end to end.
6. Firebase Hosting + GitHub Actions + preview deployments.
7. SEO (titles, descriptions, Open Graph image, sitemap, `hreflang`), accessibility, performance, 404 page.

## 9. Definition of done (for each pull request)

- `npm run build` passes with no warnings about invalid content.
- Visually matches the prototypes at 1440, 1024, 390 px (screenshots in the pull request description).
- No horizontal scroll at 360–430 px.
- No hard-coded editable text in components.
- The report lists the open items below that the change touches.

## 10. Open items to flag (do not decide yourself)

- Real LinkedIn URLs for the four members; original (higher-resolution) committee photos.
- Titles and descriptions of the two upcoming articles (December 2026, January 2027).
- Cover for "Journal 2026 (japonais)" (none exists); page count for Journal 2025.
- Possible harmonisation of titles "Synthèse 2016 / Synthèse 2017 / Rapport 2019" into "Rapport du symposium …".
- Japanese translations must be reviewed by a native speaker before launch.
- Which Japanese PDF versions exist for each publication (drives the language rule).
