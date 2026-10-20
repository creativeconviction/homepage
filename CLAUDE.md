# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

- This is a static HTML/CSS/JS site with no build step. Keep it that way.
- Never push to `main`. Always work on a branch.
- Keep the hand-made, art-like look of the site.
- Ask before adding any library.
- Do not touch `CNAME` or `.nojekyll`.
- Make one small change at a time, and explain what you changed.

## What this is

Static site for **Creative Conviction** (creativeconviction.ai): interviews with design leaders, hiring lists for NYC product designers, gatherings, and a three-part report series. It is hand-written HTML/CSS/JS with no build step, package manager, tests, or linter. Hosting is GitHub Pages (`CNAME`, `.nojekyll`); `main` is the deploy branch. To preview, open the HTML files directly or run `python3 -m http.server` from the repo root.

## Architecture

- **Every page is self-contained.** Each `index.html` inlines its own `<style>` block and nav/sidebar markup. Only shared assets are `share-quote.js`, the favicons at the repo root, and Google Fonts (EB Garamond + Inter). There are no shared stylesheets or templates, so a change to nav, tokens, or footer must be repeated in every page (`grep` for it to find them all).
- **Design tokens** are CSS custom properties on `:root` in each page (`--cc-magenta`, `--cc-indigo`, `--cc-paper`, `--cc-ink`, `--font-serif`, `--font-sans`, ...). `share-quote.js` hardcodes the same hex values and fonts, so keep them in sync if the palette changes.
- **Relative asset paths** (`../../favicon.ico`, `../../share-quote.js`) depend on page depth. Pages live at `section/slug/index.html` (`interviews/<person>/`, `hiring-lists/<month-day-year>/`) or `section/index.html`.
- **`share-quote.js`** powers highlight-to-share on interview pages. It reads `<meta name="cc-person">` and `<meta name="cc-role">` for attribution and renders a 1200×1200 canvas card. Pull quotes are marked with `<span class="cc-highlight">`; on touch devices a small inline script toggles `.is-on` on click.
- **Interview pages** include a scroll-tracking sidebar (`#cc-sidebar`, `.cc-sidebar-link[data-target]` pointing at section ids) driven by an inline script, plus OG/Twitter meta tags that reference `interviews/images/<person>.jpg`. Per-interview media sits in `interviews/<person>/images/` (and `videos/`).
- **Reports:** `reports/<name>/index.html` and the top-level `brand-and-narrative/`, `product-design/`, `welcome/` pages are near-duplicates of each other. Check both locations when editing one. Report pages load `marked` from a CDN.

## Adding content

- **New interview:** copy an existing `interviews/<person>/index.html`, update the title, `cc-person`/`cc-role` and OG meta, sidebar sections, and body. Add a square thumbnail at `interviews/images/<person>.jpg`. Then add an entry (the `<li class="cc-episode">` pattern) to `index.html` and `interviews/index.html`.
- **New hiring list:** copy a previous `hiring-lists/<month-day-year>/index.html` and add it to `hiring-lists/index.html`.
- **Image cache-busting:** replaced images use a query string (e.g. `adam-ho.jpg?v=2`) in both the listing and OG tags. Bump it when swapping an image.

## Copy conventions (from git history)

Interview copy uses curly quotes and dashes as HTML entities (`&rsquo;`, `&ldquo;`, `&mdash;`). Recent commits removed italics from references and captions and dropped links to well-known names, so don't add either back.

## Git

Work happens on feature branches (currently `first-edit`) and reaches `main` only through a merge the user approves, never a direct push.
