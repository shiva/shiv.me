# shiv.me — handoff

## What's done

A single deployable `index.html` for shiv.me. All-rounder calling card: hero, reading list, writing, FriedSilicon projects, photo gallery placeholder, and contact links.

### Design decisions (locked)

**Themes:** Reading Room (light, warm paper `#f6f2ea`, brass accent `#8a6d3f`) and Midnight (dark, deep indigo `#171a2e`, periwinkle accent `#9aa8ff`). Auto-switches via `prefers-color-scheme`; visitors can override with a ☀/☾ toggle in the nav. Override persists to localStorage.

**Type:** Hanken Grotesk for everything. JetBrains Mono for micro-labels and nav only.

**Aesthetic:** editorial restraint, near-monochrome, type-led. Informed by the IndieWeb/craftsman blog tradition (Marco.org, inessential, Fowler, Willison) and admired figures (Torvalds, Stephenson, Marcus, Kasparov). Link treatment: accent-coloured underline + soft highlight block on hover.

### How it's built

Single HTML file, no build step required. CSS custom properties define the two palettes on `body`, with `@media(prefers-color-scheme:dark)` flipping to Midnight and manual `.dark`/`.light` classes for the toggle override. Theme colour is painted by a child `.page` wrapper (not on `body`/`html` directly — this was necessary for the target webview to render dark backgrounds correctly).

No `color-mix()` anywhere — it failed silently in the preview renderer. All tinted surfaces (cards, gallery tiles, link highlights) use explicit per-theme `--surface` and `--hl` values.

### Sections (top to bottom)

The page opens with a hero (name, "I make software.", one-line bio), then the tracked sections first since they're the engagement targets, followed by projects and contact.

- **Reading** — currently-reading list (Goodreads RSS, placeholder titles until wired) + recently-finished book notes linking to blog posts.
- **Writing** — links to blog.shiv.me and Substack mirror.
- **Building** — FriedSilicon projects: SilicaDB, SODL, fdb, ActivityLog.
- **Photos** — gallery grid placeholder + Flickr link.
- **Elsewhere** — X, GitHub, LinkedIn, CV.

### Tracking

Every writing/reading link carries `data-track`. A delegated click listener fires `section_click` events to GA4 (`gtag`), Plausible, and `dataLayer` if present, plus `console.log`. Drop in whichever analytics snippet you use.

---

## What's left to wire

**Goodreads RSS.** Paste your currently-reading feed URL into the `GOODREADS_RSS` constant in the `<script>` block. The feed format is `https://www.goodreads.com/review/list_rss/<USER_ID>?shelf=currently-reading`. Goodreads has no public API (killed 2020) — the RSS feed is routed through an allorigins CORS proxy. This works for a personal site but is flaky under load; for reliability, fetch at build time or write a one-function serverless proxy (Vercel/Cloudflare Workers).

**Blog RSS.** The `BLOG_RSS` constant is set to Hugo's default `index.xml`. If the feed path differs, update it. Substack alternative: `shivan.substack.com/feed`.

**Analytics.** Add your GA4 or Plausible snippet. The `track()` function already pushes to both if present.

**Placeholder content.** The three book titles (Stephenson, Kleppmann, Kasparov) and two blog-note entries are stand-ins. Replace with real data or leave them as fallback until the Goodreads feed is wired.

**Photos.** The gallery is four placeholder tiles linking to Flickr. When ready, wire to a Flickr feed or drop in real images.

**Lab / NFT art.** Not included in this build (was marked aspirational). Add as a section when there's content for it.

---

## Technical notes

- The `.page` wrapper painting the background (rather than `body`/`html`) is load-bearing. Don't remove it or move the background declaration to `body` — it broke dark themes in the target renderer.
- The toggle cycles through three states: auto → dark → light → auto. "Auto" follows the OS. State is persisted to localStorage with try/catch (gracefully degrades if storage is blocked).
- `<meta name="color-scheme" content="light dark">` tells the browser both schemes are supported, which lets it style native controls (scrollbars, form elements) to match.
- GitHub handle confirmed via blog source: `github.com/shiva`.
- CV at shiv.me/cv is stale (lists GE Digital as current) — flagged but out of scope for this build.

---

## Files

- **`index.html`** — the deliverable. Deploy this.
- **`shiv-me-combos.html`** — the interactive theme/font explorer from the design phase. Kept as a reference / scratchpad if you want to revisit dropped palettes (Porcelain, Clay Plaster, Eggplant, Cobalt, Crimson, Reflections, Solarized, Terracotta) or fonts (Bricolage, Newsreader, System).
