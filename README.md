# Reducto Homepage

Marketing website for [Reducto](https://reducto.ai) — the agentic document platform for AI teams. Built as a pixel-perfect implementation of a Claude Design handoff.

## Overview

A single-page marketing site covering the full Reducto product story: hero with live document parsing demo, product API stack, industry use cases, platform features, enterprise security, developer onboarding, FAQ, and CTA. Designed with a warm plum/aubergine brand palette, rich scroll animations, and Awwwards-grade micro-interactions.

## Stack

- **HTML / CSS / Vanilla JS** — no build step, no framework dependencies
- **Lenis** — smooth scroll with inertia
- **Google Fonts** — Schibsted Grotesk (display/body), Geist Mono (code/mono)
- All assets are local (SVGs, WebM videos)

## Sections

| Section | Description |
|---|---|
| Nav | Fixed dark nav, transitions to frosted-glass light on scroll |
| Hero | Dark gradient, animated twinkle canvas, 3D-tilted live parse demo, email capture form with rotating border beam |
| Marquee | Dissolve-cycling customer logo board (Harvey, Scale, Legora, Rogo, etc.) |
| Products | 5-card 3D sticky scroll stack — Parse, Split, Extract, Edit, Classify — with product demo videos |
| Industries | Finance / Healthcare / Insurance / Legal tabs with animated scan-line overlays |
| How It Works | 3-step animated diagram: layout detection, VLM review, agentic self-correction |
| Features | 6-cell bordered grid with feature demo videos and a rotating capability showcase |
| Enterprise | Dark section with floating illustration, animated gradient tint, conic glow, and sparks |
| Developers | Code block with Python / cURL / Response tabs and a type-on animation |
| FAQ | Animated accordion |
| CTA | Full-width video banner with primary CTAs |
| Footer | Dark plum with giant wordmark bleeding off the bottom, animated halftone gradient |

## Motion & Interactions

- **Scroll reveals** — elements fade + slide up on enter, with staggered delays
- **Scroll parallax** — hero demo and enterprise illustration drift against scroll
- **Lenis smooth scroll** — lerp-based inertia, smooth anchor navigation
- **Scroll progress bar** — gradient bar under the nav
- **Click ripples** — radial ink burst on all CTA buttons
- **Spotlight glows** — cursor-tracked radial highlight on feature and enterprise cards
- **Industry visual tilt** — perspective tilt + sheen follows the cursor
- **Animated underlines** — draw-in on footer links and inline anchors
- **Sliding tab indicator** — smooth underline slides between active code tabs
- **Type-on effect** — Python code block types itself in when the section enters view
- **3D product stack** — cards scale and dim as the next card scrolls up over them
- All effects degrade cleanly under `prefers-reduced-motion`

## Running Locally

No build step required — serve the directory with any static file server:

```bash
# Python (built-in)
cd reducto
python3 -m http.server 8080

# Node (npx)
npx serve .
```

Then open [http://localhost:8080](http://localhost:8080).

> Opening `index.html` directly as a `file://` URL will work for most content but WebM videos may not autoplay in all browsers — a local server is recommended.

## File Structure

```
reducto/
├── index.html          # Full page markup
├── styles.css          # Design system — tokens, typography, layout, buttons
├── sections.css        # Section & component styles
├── theme.css           # Light/dark theme overrides, gradient buttons
├── enhance.css         # Motion layer — Lenis, progress bar, ripples, spotlights
├── main.js             # Core interactions — reveals, parallax, demos, animations
├── enhance.js          # Awwwards motion layer — Lenis init, micro-interactions
└── assets/
    ├── logos/          # Customer logo SVGs (marquee)
    ├── products/       # Product demo WebM videos (Parse, Split, Extract, Edit)
    ├── feature-*.webm  # Feature section demo videos
    ├── hero.webm       # CTA section background video
    ├── *-illustration.svg  # Section illustrations
    └── *.svg           # Logo, wordmark, textures
```

## Design

Designed in Claude Design and implemented from a handoff bundle. Brand: warm plum/aubergine (`#2a0a2c`) with magenta accent (`#9d17a0`), stone warm neutrals, and papery editorial base (`#F9F8F7`).
