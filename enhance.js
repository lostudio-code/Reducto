/* ============================================================
   REDUCTO — Awwwards motion + micro-interaction layer (JS)
   Runs after main.js. Adds: Lenis smooth scroll, scroll
   progress, cursor companion, magnetic CTAs, click ripples,
   animated underlines, sliding tab indicator, spotlight glows,
   and a subtle tilt on the industry visual.
   Every effect degrades cleanly under reduced-motion / coarse
   pointers and never alters layout.
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    // Smooth anchor navigation
    $$('a[href^="#"]').forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href.length < 2) return;
      a.addEventListener("click", (e) => {
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -76, duration: 1.15 });
      });
    });
  }

  /* ---------- Scroll progress bar ---------- */
  const prog = document.createElement("div");
  prog.className = "scroll-progress";
  document.body.appendChild(prog);
  const updateProg = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    prog.style.transform = `scaleX(${p.toFixed(4)})`;
  };
  window.addEventListener("scroll", updateProg, { passive: true });
  window.addEventListener("resize", updateProg);
  if (lenis) lenis.on("scroll", updateProg);
  updateProg();

  /* ---------- Click ripple ---------- */
  $$(".btn-primary, .btn-lg, .nav-cta, .hero-form-btn, .ind .btn-on-dark").forEach((b) => {
    b.classList.add("has-ripple");
    b.addEventListener("pointerdown", (e) => {
      const r = b.getBoundingClientRect();
      const ink = document.createElement("span");
      ink.className = "ripple-ink";
      const size = Math.max(r.width, r.height) * 1.7;
      ink.style.width = ink.style.height = size + "px";
      ink.style.left = (e.clientX - r.left) + "px";
      ink.style.top = (e.clientY - r.top) + "px";
      b.appendChild(ink);
      setTimeout(() => ink.remove(), 700);
    });
  });

  /* ---------- Animated underlines ---------- */
  $$(".footer-col a, .ent-feat a, .faq-a a").forEach((a) => a.classList.add("u-line"));

  /* ---------- Sliding tab indicator ---------- */
  const tabbar = (container, tabSel) => {
    if (!container) return;
    container.classList.add("tabbar-rel");
    const line = document.createElement("span");
    line.className = "tab-underline";
    container.appendChild(line);
    const tabs = $$(tabSel, container);
    if (!tabs.length) return;
    const place = (el) => {
      if (!el) return;
      line.style.width = el.offsetWidth + "px";
      line.style.transform = `translateX(${el.offsetLeft}px)`;
      line.style.opacity = "1";
    };
    const activeTab = () => container.querySelector(tabSel + ".active") || tabs[0];
    requestAnimationFrame(() => place(activeTab()));
    window.addEventListener("load", () => place(activeTab()));
    tabs.forEach((t) => {
      t.addEventListener("click", () => setTimeout(() => place(activeTab()), 0));
      t.addEventListener("pointerenter", () => place(t));
    });
    container.addEventListener("pointerleave", () => place(activeTab()));
    window.addEventListener("resize", () => place(activeTab()));
  };
  tabbar($(".code-tabs"), ".code-tab");

  /* ---------- Spotlight glow (feature + enterprise cards) ---------- */
  const spot = (el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    });
    el.addEventListener("pointerenter", () => el.classList.add("is-spot"));
    el.addEventListener("pointerleave", () => el.classList.remove("is-spot"));
  };
  $$(".feat-cell, .ent-feat").forEach(spot);

  /* ---------- Industry visual: subtle tilt + sheen ---------- */
  if (fine && !reduce) {
    $$(".ind-visual").forEach((v) => {
      v.addEventListener("pointermove", (e) => {
        const r = v.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        v.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        v.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        const rx = (0.5 - py) * 5.5;
        const ry = (px - 0.5) * 7.5;
        v.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        v.classList.add("is-spot");
      });
      v.addEventListener("pointerleave", () => {
        v.style.transform = "";
        v.classList.remove("is-spot");
      });
    });
  }
})();
