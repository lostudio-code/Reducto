# Reducto — Homepage

Marketing homepage for Reducto, the agentic document platform. A single-page,
fully responsive site built with plain HTML, CSS, and vanilla JavaScript, with
a small React-powered tweak panel layered on top.

## Quick start

No build step. Serve the folder with any static server and open `index.html`:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit `http://localhost:8000`. Opening `index.html` directly over `file://`
also works, but a local server is recommended so the `.webm` videos and `.svg`
assets load with the right MIME types.

## Deploy

This is a fully static site — no build, no server-side code, no environment
variables or secrets. Push the repo and point any static host at the root:

- **GitHub Pages** — Settings → Pages → Deploy from branch → `main` / `root`.
  The site is live at `https://<user>.github.io/<repo>/` within a minute.
- **Netlify / Vercel / Cloudflare Pages** — import the repo, leave the build
  command empty and the publish directory as the project root.

The only runtime dependencies are loaded from CDN (Lenis, and React/Babel for
the optional tweak panel), so the deployed bundle is just HTML, CSS, JS, and the
files under `assets/`.

## Structure

```
index.html        Page markup
styles.css        Design-system foundation — tokens (color, type, spacing), base elements
sections.css      Section & component styles (nav, hero, features, industries, footer…)
theme.css         Light/dark theming layer + the hero/demo treatment
enhance.css       Motion & micro-interaction layer (smooth scroll, ripples, spotlights)
main.js           Core interactions — hero canvas, live-parse demo, logo marquee,
                  sticky product stack, how-it-works visuals, scroll reveals
enhance.js        Adds Lenis smooth scroll, scroll progress, magnetic CTAs,
                  click ripples, sliding tab indicators, spotlight glows
tweaks-panel.jsx  Tweak-panel shell (host protocol, controls)
tweaks-app.jsx    Brand/type/color tweaks wired into the page
assets/           SVG illustrations, brand logos (assets/logos), product clips (assets/products), video
```

## Stylesheet load order

`styles.css` → `sections.css` → `theme.css` → `enhance.css`. Later files
intentionally override earlier ones; keep this order if you relink them.

## Dependencies

Loaded from CDN at runtime (no install required):

- [Lenis](https://github.com/darkroomengineering/lenis) — smooth scrolling
- React 18 + Babel Standalone — only for the optional tweak panel

## Accessibility & motion

All motion respects `prefers-reduced-motion`. The decorative hero/demo visuals
are marked `aria-hidden`, and interactive elements retain visible focus states.
