/* ============================================================
   REDUCTO — interactions & motion
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- NAV scroll state ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Scroll reveals ---------- */
  const reveals = $$(".reveal");
  if (reduce) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const show = (el) => el.classList.add("in");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
    // Failsafe 1: anything already in the viewport reveals immediately on load.
    const sweep = () => {
      const h = window.innerHeight || 800;
      reveals.forEach((el) => {
        if (el.classList.contains("in")) return;
        const r = el.getBoundingClientRect();
        if (r.top < h * 0.94 && r.bottom > 0) show(el);
      });
    };
    requestAnimationFrame(sweep);
    window.addEventListener("load", () => setTimeout(sweep, 60));
    window.addEventListener("scroll", sweep, { passive: true });
    // Failsafe 2: never leave content hidden if observers misbehave.
    setTimeout(() => reveals.forEach(show), 2600);
  }

  /* ---------- Scroll parallax ----------
     Elements with [data-parallax="<speed>"] drift against the scroll for depth.
     We measure each element's center vs. the viewport center and translate by
     (-distance * speed). Reveal targets never carry [data-parallax] so the two
     transform systems never fight. */
  const parallaxEls = $$("[data-parallax]");
  if (parallaxEls.length) {
    const pOff = () => reduce || document.documentElement.classList.contains("no-motion");
    let pTick = false;
    const applyParallax = () => {
      pTick = false;
      const vh = window.innerHeight || 800;
      if (pOff()) { parallaxEls.forEach((el) => { el.style.removeProperty("--parallax"); }); return; }
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.05;
        const r = el.getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) return; // skip far offscreen
        const dist = (r.top + r.height / 2) - vh / 2;
        const y = (-dist * speed).toFixed(1);
        el.style.setProperty("--parallax", y + "px");
      });
    };
    const onParallax = () => { if (!pTick) { pTick = true; requestAnimationFrame(applyParallax); } };
    window.addEventListener("scroll", onParallax, { passive: true });
    window.addEventListener("resize", onParallax);
    window.addEventListener("load", () => requestAnimationFrame(applyParallax));
    requestAnimationFrame(applyParallax);
  }

  /* ---------- Gradient primary buttons: cursor-tracking sheen ----------
     Update --btn-mx / --btn-my to the pointer position inside each primary
     button; CSS turns that into a radial highlight on the purple gradient. */
  const gradBtns = $$(".btn-primary, .hero-form-btn, .nav-cta, .ind .btn-on-dark");
  gradBtns.forEach((btn) => {
    const move = (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--btn-mx", (e.clientX - r.left).toFixed(1) + "px");
      btn.style.setProperty("--btn-my", (e.clientY - r.top).toFixed(1) + "px");
    };
    btn.addEventListener("pointermove", move, { passive: true });
    btn.addEventListener("pointerenter", move, { passive: true });
  });

  /* ---------- Logo board (dissolve + rotate) ---------- */
  const logos = [
    { f: "harvey" }, { f: "scale" }, { f: "newfront" }, { f: "medallion" },
    { f: "vanta" }, { f: "legora" }, { f: "rogo" }, { t: "JLL" },
    { f: "vise" }, { f: "laurel" }, { t: "toast" }, { t: "Mercor" },
    { f: "zip" }, { f: "anterior" }, { f: "supio" }, { f: "levelpath" },
  ];
  const board = $("#marqueeTrack");
  if (board) {
    const SLOTS = 6;
    const logoHTML = (l) =>
      l.f
        ? `<img src="assets/logos/${l.f}.svg" alt="${l.f}">`
        : `<span class="wordmark">${l.t}</span>`;

    // simple shuffle so the opening set varies on each load
    const pool = logos.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // build fixed slots
    const slots = [];
    for (let i = 0; i < SLOTS; i++) {
      const slot = document.createElement("div");
      slot.className = "logo-slot";
      const logo = document.createElement("div");
      logo.className = "logo";
      logo.innerHTML = logoHTML(pool[i % pool.length]);
      slot.appendChild(logo);
      board.appendChild(slot);
      slots.push(logo);
    }
    let cursor = SLOTS; // next logo to deal out

    const swap = (logo, l) => {
      logo.classList.add("hide"); // dissolve out
      setTimeout(() => {
        logo.style.transition = "none"; // swap content while hidden
        logo.innerHTML = logoHTML(l);
        // force reflow so removing .hide animates back in
        void logo.offsetWidth;
        logo.style.transition = "";
        logo.classList.remove("hide"); // dissolve in
      }, 560);
    };

    const rotate = () => {
      // wave: each slot swaps slightly after the previous one
      slots.forEach((logo, i) => {
        const next = pool[(cursor + i) % pool.length];
        setTimeout(() => swap(logo, next), i * 120);
      });
      cursor = (cursor + SLOTS) % pool.length;
    };

    let timer = setInterval(rotate, 3600);
    // pause when the tab is hidden so it doesn't jump on return
    document.addEventListener("visibilitychange", () => {
      clearInterval(timer);
      if (!document.hidden) timer = setInterval(rotate, 3600);
    });
  }

  /* ---------- Counter ---------- */
  const counter = $("#counter");
  if (counter) {
    const target = +counter.dataset.target;
    const fmt = (n) => Math.floor(n).toLocaleString("en-US");
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      counter.textContent = fmt(target); // robust fallback: correct value first
      if (reduce || !document.hasFocus()) return; // only animate when actually visible & focused
      const dur = 2000, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        counter.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(tick);
        else counter.textContent = fmt(target);
      };
      // start from 0 only when we can actually animate (focused);
      // otherwise the fallback value above stays correct.
      counter.textContent = fmt(0);
      requestAnimationFrame(tick);
      // hard guarantee: if rAF is throttled/frozen, force final value.
      setTimeout(() => { if (started) counter.textContent = fmt(target); }, 2400);
    };
    new IntersectionObserver((es, ob) => {
      es.forEach((e) => { if (e.isIntersecting) { run(); ob.disconnect(); } });
    }, { threshold: 0.5 }).observe(counter);
  }

  /* ---------- HERO email-capture form ---------- */
  const heroForm = document.getElementById("heroForm");
  if (heroForm) {
    const email = document.getElementById("heroEmail");
    const note = document.getElementById("heroFormNote");
    const defaultNote = note.textContent;
    const valid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    heroForm.addEventListener("submit", (e) => {
      e.preventDefault();
      heroForm.classList.remove("ok", "err");
      note.classList.remove("ok", "err");
      if (!valid(email.value)) {
        heroForm.classList.add("err");
        note.classList.add("err");
        note.textContent = "Please enter a valid work email.";
        email.focus();
        return;
      }
      heroForm.classList.add("ok");
      note.classList.add("ok");
      note.textContent = "Thanks — we'll be in touch shortly.";
      email.value = "";
      email.setAttribute("disabled", "");
      heroForm.querySelector(".hero-form-btn").textContent = "Request sent ✓";
    });
    email.addEventListener("input", () => {
      if (heroForm.classList.contains("err")) {
        heroForm.classList.remove("err");
        note.classList.remove("err");
        note.textContent = defaultNote;
      }
    });
  }

  /* ---------- HERO twinkle square grid ---------- */
  const heroCanvas = document.getElementById("heroGrid");
  if (heroCanvas) {
    const heroEl = heroCanvas.closest(".hero");
    const ctx = heroCanvas.getContext("2d");
    const CELL = 26;
    const COLORS = [[220,191,251],[199,33,201],[226,79,228]];
    let W = 0, H = 0, cols = 0, rows = 0, squares = [], raf = 0, running = false;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const motionOff = () => reduce || document.documentElement.classList.contains("no-motion");
    const spawn = (now) => ({
      x: Math.floor(Math.random() * cols) * CELL,
      y: Math.floor(Math.random() * rows) * CELL,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      dur: 2200 + Math.random() * 3000,
      t0: now,
      max: 0.1 + Math.random() * 0.3,
    });
    const build = () => {
      const r = heroEl.getBoundingClientRect();
      W = r.width; H = r.height;
      heroCanvas.width = Math.ceil(W * dpr);
      heroCanvas.height = Math.ceil(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CELL); rows = Math.ceil(H / CELL);
      const count = Math.min(72, Math.round(cols * rows * 0.045));
      const now = performance.now();
      squares = [];
      for (let i = 0; i < count; i++) {
        const s = spawn(now);
        s.t0 = now - Math.random() * s.dur; // stagger
        squares.push(s);
      }
    };
    const draw = (now) => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < squares.length; i++) {
        let s = squares[i];
        let p = (now - s.t0) / s.dur;
        if (p >= 1) { s = squares[i] = spawn(now); p = 0; }
        const a = Math.sin(p * Math.PI) * s.max;
        ctx.fillStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${a.toFixed(3)})`;
        ctx.fillRect(s.x + 1, s.y + 1, CELL - 2, CELL - 2);
      }
    };
    const frame = (now) => {
      if (!running) return;
      draw(now);
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (running || motionOff()) return; running = true; raf = requestAnimationFrame(frame); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    build();
    draw(performance.now()); // initial static frame (robust if rAF is throttled)
    start();
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { dpr = Math.min(window.devicePixelRatio || 1, 2); build(); }, 150); });
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? start() : stop()))).observe(heroEl);
  }

  /* ---------- HERO word rotator ---------- */
  const rotator = document.getElementById("rotator");
  if (rotator) {
    const words = ["parse", "split", "extract", "edit"];
    let ri = 0;
    const noMotion = () => reduce || document.documentElement.classList.contains("no-motion");
    setInterval(() => {
      ri = (ri + 1) % words.length;
      rotator.textContent = words[ri];
      if (!noMotion()) {
        rotator.classList.remove("spin");
        void rotator.offsetWidth;
        rotator.classList.add("spin");
      }
    }, 2200);
  }

  /* ---------- HERO live parse demo ---------- */
  const demo = $("#demo");
  if (demo && !reduce) {
    const regions = $$(".doc-region", demo);
    const bars = $$(".doc-h, .doc-line, .doc-table span", demo);
    const outLines = $$("#demoOut .ln");
    const statusEl = $("#demoStatus");
    const progress = $("#demoProgress") || { style: {} };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let alive = true;

    async function cycle() {
      demo.classList.add("live");
      while (alive) {
        // reset
        regions.forEach((r) => r.classList.remove("lit"));
        outLines.forEach((l) => l.classList.remove("show"));
        bars.forEach((b) => { b.style.transition = "none"; b.style.transform = "scaleX(0)"; });
        progress.style.transition = "none";
        progress.style.width = "0%";
        statusEl.textContent = "Reading…";
        void demo.offsetWidth;
        await sleep(220);

        // draw document lines in, left -> right (staggered)
        for (let i = 0; i < bars.length; i++) {
          bars[i].style.transition = "transform .5s cubic-bezier(.22,.61,.36,1)";
          bars[i].style.transform = "scaleX(1)";
          await sleep(55);
        }
        await sleep(260);
        statusEl.textContent = "Scanning…";
        await sleep(160);

        // scan
        demo.classList.remove("scanning");
        void demo.offsetWidth;
        demo.classList.add("scanning");
        progress.style.transition = "width 2.1s linear";
        progress.style.width = "62%";

        // light up regions in sequence as the scan passes
        for (let i = 0; i < regions.length; i++) {
          await sleep(2100 / regions.length);
          regions[i].classList.add("lit");
        }
        demo.classList.remove("scanning");
        statusEl.textContent = "Extracting…";

        // stream output
        progress.style.transition = "width 1.4s ease";
        progress.style.width = "100%";
        for (let i = 0; i < outLines.length; i++) {
          outLines[i].classList.add("show");
          await sleep(85);
        }
        statusEl.textContent = "Done ✓";
        await sleep(2600);
      }
    }
    // start when in view
    new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting && alive && !demo.dataset.started) {
          demo.dataset.started = "1";
          cycle();
        }
      });
    }, { threshold: 0.3 }).observe(demo);
  } else if (demo && reduce) {
    $$(".doc-region", demo).forEach((r) => r.classList.add("lit"));
    $$("#demoOut .ln").forEach((l) => l.classList.add("show"));
    $("#demoStatus").textContent = "Done ✓";
    const p = $("#demoProgress"); if (p) p.style.width = "100%";
  }

  /* ---------- PRODUCT tabs ---------- */
  const products = [
    {
      eyebrow: "API · Parse",
      title: "Read documents like a human would.",
      desc: "Reducto's parser captures layout, structure, and meaning with state-of-the-art accuracy. Agentic OCR reviews and corrects its own output — so even dense tables and scanned pages come back clean.",
      feats: ["Preserves tables, reading order & bounding boxes", "Agentic OCR self-corrects low-quality scans", "Markdown, HTML, or structured JSON output"],
      visual: "parse",
    },
    {
      eyebrow: "API · Split",
      title: "Separate the packet, automatically.",
      desc: "Break multi-document files and long forms into individually useful units. Layout-aware splitting and intelligent heuristics find the boundaries — no fixed page counts required.",
      feats: ["Detects document boundaries automatically", "Handles mixed packets & long forms", "Routes each unit to the right pipeline"],
      visual: "split",
    },
    {
      eyebrow: "API · Extract",
      title: "Structured data, schema-level precise.",
      desc: "Pull structured data straight from documents with schema-level precision — invoice fields, onboarding forms, financial disclosures. Define a schema, get clean JSON with confidence scores.",
      feats: ["Define your schema, get typed JSON", "Per-field confidence scores", "No templates or bounding boxes needed"],
      visual: "extract",
    },
    {
      eyebrow: "API · Edit",
      title: "Fill documents back in.",
      desc: "Populate detected blanks, tables, and checkboxes with your data. No bounding boxes or pre-defined templates — Edit dynamically maps your values onto the original document.",
      feats: ["Fill blanks, tables & checkboxes", "Works on the original layout", "Round-trip back to PDF"],
      visual: "edit",
    },
    {
      eyebrow: "API · Classify",
      title: "Know what you're looking at.",
      desc: "Automatically categorize documents by type before you process them — routing each one to the right workflow. Define your own labels or use ours out of the box.",
      feats: ["Custom or built-in label sets", "Confidence-scored predictions", "Route by type into downstream APIs"],
      visual: "classify",
    },
  ];

  const vid = (name) => `<video class="sc-video" autoplay loop muted playsinline preload="auto" aria-hidden="true"><source src="assets/products/${name}.webm" type="video/webm"></video>`;
  const visuals = {
    parse: vid("Parse"),
    split: vid("Split"),
    extract: vid("Extract"),
    edit: vid("Edit"),
    classify: `<div class="classify-list">${["Contract","Invoice","Medical record","Tax form"].map((t,i)=>`<div class="cl-row" style="--i:${i}"><span class="cl-label">${t}</span><span class="vchip">${[0.98,0.94,0.99,0.91][i]}</span></div>`).join("")}</div>`,
  };

  /* ---------- PRODUCT stack (3D scroll depth) ---------- */
  const stack = document.getElementById("prodStack");
  if (stack) {
    const ckSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>`;
    const arrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
    stack.innerHTML = products
      .map(
        (p, i) => `
      <article class="stack-card" style="z-index:${i + 1}">
        <div class="sc-info">
          <div class="sc-num">${String(i + 1).padStart(2, "0")} <span>/ 05</span></div>
          <span class="eyebrow">${p.eyebrow}</span>
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <ul class="prod-feats">${p.feats
            .map((f) => `<li><span class="ck">${ckSvg}</span>${f}</li>`)
            .join("")}</ul>
          <a href="#developers" class="link-arrow">Learn more ${arrow}</a>
        </div>
        <div class="sc-visual"><div class="sc-panes">${visuals[p.visual]}</div></div>
      </article>`
      )
      .join("");

    const cards = Array.from(stack.querySelectorAll(".stack-card"));
    // Reveal each card's visual (scan sweep + content build-in) when it enters view
    const vio = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); vio.unobserve(e.target); } });
    }, { threshold: 0.2 });
    cards.forEach((c) => vio.observe(c));
    setTimeout(() => cards.forEach((c) => c.classList.add("in")), 2500);
    const STICK = 116; // matches .stack-card top
    const motionOff = () => reduce || document.documentElement.classList.contains("no-motion");
    let ticking = false;
    const applyDepth = () => {
      ticking = false;
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const next = cards[i + 1];
        let p = 0;
        if (next) {
          const h = card.offsetHeight || 1;
          const nt = next.getBoundingClientRect().top;
          p = Math.max(0, Math.min(1, (STICK + h - nt) / h));
        }
        card.style.transform = `translateY(${(-p * 20).toFixed(2)}px) scale(${(1 - p * 0.07).toFixed(4)})`;
        card.style.filter = `brightness(${(1 - p * 0.16).toFixed(3)})`;
      }
    };
    const onScrollStack = () => {
      if (motionOff()) return;
      if (!ticking) { ticking = true; requestAnimationFrame(applyDepth); }
    };
    window.addEventListener("scroll", onScrollStack, { passive: true });
    window.addEventListener("resize", onScrollStack);
    if (!motionOff()) applyDepth();
  }

  /* ---------- INDUSTRY switcher ---------- */
  const indTabs = $$(".ind-tab");
  const indPanels = $$(".ind-panel");
  indTabs.forEach((t, i) =>
    t.addEventListener("click", () => {
      indTabs.forEach((x) => x.classList.remove("active"));
      indPanels.forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      indPanels[i].classList.add("active");
    })
  );

  /* Overlay a scan-line + detection boxes on each industry illustration
     (the SVGs load as <img>, so we animate a layer on top instead). */
  const indBoxes = [
    [[20, 26], [60, 44], [38, 66]], // finance
    [[24, 30], [58, 40], [30, 70]], // healthcare
    [[22, 24], [62, 50], [44, 72]], // insurance
    [[20, 30], [56, 46], [40, 68]], // legal
  ];
  $$(".ind-visual").forEach((v, i) => {
    const o = document.createElement("div");
    o.className = "ind-scan";
    o.setAttribute("aria-hidden", "true");
    o.innerHTML =
      '<span class="iscan-line"></span>' +
      (indBoxes[i] || indBoxes[0])
        .map(([l, t]) => `<span class="ibox" style="left:${l}%;top:${t}%"></span>`)
        .join("");
    v.appendChild(o);
  });

  /* ---------- HOW-IT-WORKS step visuals (lightweight inline) ---------- */
  const stepVis = {
    layout: `<svg viewBox="0 0 200 120" class="sv-layout" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><g fill="none" stroke="var(--stone-300)" stroke-width="1.5"><rect x="40" y="14" width="120" height="92" rx="4" fill="#fff"/></g><g class="lregs" stroke="var(--orange)" stroke-width="1.6" fill="rgba(194,105,31,.09)"><rect class="lreg" x="50" y="24" width="70" height="10" rx="2"/><rect class="lreg" x="50" y="42" width="100" height="22" rx="2"/><rect class="lreg" x="50" y="72" width="46" height="26" rx="2"/><rect class="lreg" x="104" y="72" width="46" height="26" rx="2"/></g><line class="lscan" x1="42" y1="16" x2="158" y2="16" stroke="#e0892e" stroke-width="2"/></svg>`,
    vlm: `<svg viewBox="0 0 200 120" class="sv-vlm" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><circle cx="60" cy="60" r="22" fill="none" stroke="rgba(59,130,246,.5)" stroke-width="1.6"/><circle class="veye" cx="60" cy="60" r="6" fill="#3b82f6"/><path class="varrow" d="M82 60h28" fill="none" stroke="#3b82f6" stroke-width="1.6" pathLength="1"/><path d="M104 54l8 6-8 6" fill="none" stroke="#3b82f6" stroke-width="1.6"/><rect x="120" y="40" width="56" height="40" rx="4" fill="#fff" stroke="var(--stone-300)" stroke-width="1.4"/><g class="vlines" stroke="var(--stone-300)" stroke-width="3" stroke-linecap="round" fill="none"><path class="vline" d="M128 52h40" pathLength="1"/><path class="vline" d="M128 60h40" pathLength="1"/><path class="vline" d="M128 68h26" pathLength="1"/></g></svg>`,
    correct: `<svg viewBox="0 0 200 120" class="sv-correct" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><rect x="50" y="22" width="100" height="76" rx="5" fill="#fff" stroke="var(--stone-300)" stroke-width="1.4"/><g class="clines" stroke="var(--stone-300)" stroke-width="3" stroke-linecap="round" fill="none"><path class="cl" d="M64 40h72" pathLength="1"/><path class="cl" d="M64 52h72" pathLength="1"/><path class="cl" d="M64 64h48" pathLength="1"/></g><circle class="cring" cx="138" cy="86" r="18" fill="#1f9d55"/><path class="ccheck" d="M130 86l6 6 10-12" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>`,
  };
  $$(".step .vis").forEach((v) => { v.innerHTML = stepVis[v.dataset.vis] || ""; });

  /* ---------- FAQ accordion ---------- */
  $$(".faq-item").forEach((item) => {
    const q = $(".faq-q", item);
    const a = $(".faq-a", item);
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      $$(".faq-item").forEach((other) => {
        other.classList.remove("open");
        $(".faq-a", other).style.maxHeight = null;
      });
      if (!open) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- FEATURES — rotating "and more" showcase ---------- */
  const rotate = $("#featRotate");
  if (rotate) {
    const svgs = $$(".rot-svg", rotate);
    const track = $(".rot-track", rotate);
    const spans = $$(".rot-track span", rotate);
    const n = spans.length;
    const LINE = 24;
    let i = 0;
    const apply = () => {
      // center the active span within the 3-line window (one line above visible)
      track.style.transform = `translateY(${-(i - 1) * LINE}px)`;
      spans.forEach((s, k) => s.classList.toggle("is-active", k === i));
      svgs.forEach((s, k) => s.classList.toggle("is-active", k === i));
    };
    apply();
    const motionOff = () => document.body.classList.contains("no-motion") || reduce;
    let timer = null;
    const tick = () => { if (!motionOff()) { i = (i + 1) % n; apply(); } };
    const start = () => { if (!timer) timer = setInterval(tick, 2400); };
    const io2 = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) start();
        else if (timer) { clearInterval(timer); timer = null; }
      });
    }, { threshold: 0.2 });
    io2.observe(rotate);
  }

  /* ---------- CODE tabs + copy ---------- */
  const codeTabs = $$(".code-tab");
  const pres = $$(".code-body pre");
  codeTabs.forEach((t, i) =>
    t.addEventListener("click", () => {
      codeTabs.forEach((x) => x.classList.remove("active"));
      pres.forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      pres[i].classList.add("active");
    })
  );
  const copyBtn = $("#codeCopy");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const active = $(".code-body pre.active");
      navigator.clipboard?.writeText(active.innerText).then(() => {
        const orig = copyBtn.innerHTML;
        copyBtn.innerHTML = "Copied ✓";
        setTimeout(() => (copyBtn.innerHTML = orig), 1600);
      });
    });
  }

  /* ---------- CODE type-on (Python block, triggers when section hits top) ---------- */
  (function typeOnCode() {
    const pre = $('.code-body pre[data-pre="0"]');
    const section = $("#developers");
    if (!pre || !section) return;
    if (reduce) return; // leave full, highlighted code in place

    // Flatten into chars that remember their highlight class.
    const chars = [];
    pre.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        for (const c of node.nodeValue) chars.push({ c, cls: null });
      } else if (node.nodeType === 1) {
        const cls = node.getAttribute("class");
        for (const c of node.textContent) chars.push({ c, cls });
      }
    });
    if (!chars.length) return;

    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const render = (k, withCaret) => {
      let html = "", curCls = null, buf = "";
      const flush = () => {
        if (!buf) return;
        html += curCls ? `<span class="${curCls}">${esc(buf)}</span>` : esc(buf);
        buf = "";
      };
      for (let i = 0; i < k; i++) {
        const ch = chars[i];
        if (ch.cls !== curCls) { flush(); curCls = ch.cls; }
        buf += ch.c;
      }
      flush();
      pre.innerHTML = html + (withCaret ? '<span class="type-caret"></span>' : "");
    };

    // Blank it out now so there's no flash of the finished code.
    render(0, true);

    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      let i = 0;
      const step = () => {
        i = Math.min(i + 2, chars.length);
        render(i, true);
        if (i < chars.length) {
          // brief pause at line breaks for a natural cadence
          const justWroteNewline = chars[i - 1] && chars[i - 1].c === "\n";
          setTimeout(step, justWroteNewline ? 130 : 16);
        } else {
          setTimeout(() => render(chars.length, false), 1100);
        }
      };
      step();
    };

    // Fire when the section scrolls up into the top quarter of the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { run(); io.disconnect(); }
        });
      },
      { rootMargin: "0px 0px -75% 0px", threshold: 0 }
    );
    io.observe(section);
    // Failsafe: if it never triggers, reveal the full code after a while.
    setTimeout(() => { if (!started) { started = true; render(chars.length, false); } }, 9000);
  })();
})();
