// Creative Conviction — the big wordmark on the landing page.
// Assemble: the letters arrive scattered and spring into the name. Scroll and they break apart again, then regroup on one line in the
// middle of the top bar; once they have settled there the real wordmark link takes over (body.docked). While the letters sit in the hero,
// the pointer pushes them a little and they ease back.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body, h1 = document.querySelector(".logo h1");
  if (!h1) return;
  let tagEl = document.querySelector(".logo .tag"), timers = [], raf = 0;
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const chars = () => [...h1.querySelectorAll(".ch")];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const tagOpacity = v => { if (tagEl) tagEl.style.setProperty("opacity", String(v), "important"); };

  // Rebuild the letters (and the tagline) so the motion starts clean
  function rebuild() {
    if (!h1.querySelector(".ch")) h1.querySelectorAll(".line").forEach(l => { l.innerHTML = [...l.dataset.text].map((c, i) => `<span class="ch" style="--i:${i}">${c}</span>`).join(""); });
    if (tagEl) { const t = tagEl.cloneNode(true); t.removeAttribute("style"); tagEl.replaceWith(t); tagEl = t; }
  }

  let parts = [], px = -1e4, py = -1e4, t0 = 0, geo = null, sp = 0;
  addEventListener("pointermove", e => { if (e.pointerType !== "mouse") { px = py = -1e4; return; } px = e.clientX; py = e.clientY; }, { passive: true });
  document.addEventListener("pointerleave", () => { px = py = -1e4; });
  const back = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const smooth = x => x * x * x * (x * (x * 6 - 15) + 10);
  // Untransformed letter boxes come from offsetLeft/Top (transforms don't move them), so the targets stay right as fonts load or the page reflows
  function measure() {
    const fs = parseFloat(getComputedStyle(h1).fontSize), small = innerWidth < 720 ? 16 : 20, s = small / fs;
    const hb = h1.getBoundingClientRect(), l1n = h1.querySelectorAll(".l1 .ch").length, gap = fs * .26;
    const total = parts.reduce((a, p) => a + p.c.offsetWidth, 0) + gap;
    let x = innerWidth / 2 - total * s / 2;
    parts.forEach((p, i) => { const w = p.c.offsetWidth; if (i === l1n) x += gap * s; p.ox = p.c.offsetLeft + w / 2; p.oy = p.c.offsetTop + p.c.offsetHeight / 2; p.tx = x + w * s / 2; p.ty = 28; x += w * s; });
    geo = { s, hl: hb.left, ht: hb.top + scrollY, travel: Math.max(1, (hb.top + scrollY + hb.height / 2 - 28) * 1.6) };
  }
  function start() {
    t0 = performance.now(); sp = 0;
    parts = chars().map((c, i) => ({ c, dx: (Math.random() - .5) * innerWidth * 1.1, dy: (Math.random() - .5) * innerHeight * .9, r: (Math.random() - .5) * 90, sc: .35 + Math.random() * 1.5, d: Math.random() * 450 + i * 18, rx: 0, ry: 0 }));
    measure(); sp = wantOf();
    tagOpacity(0); later(() => { if (tagEl) { tagEl.style.removeProperty("opacity"); tagEl.classList.add("late"); } }, 1300);
    // Put every letter in its scattered place first, then reveal them, so nothing flashes in the wrong spot
    tick(performance.now());
    body.classList.add("logo-go");
  }
  // On a phone the title only breaks apart on a clear, long scroll down; a nudge, a drag on the ribbon or a small scroll leaves it be
  const phone = matchMedia("(max-width: 720px)");
  const wantOf = () => { const dead = phone.matches ? Math.max(90, geo.travel * .3) : 0; return clamp((scrollY - dead) / Math.max(1, geo.travel - dead)); };
  function tick(now) {
    const want = wantOf();
    sp += (want - sp) * (reduce ? 1 : .08); if (Math.abs(want - sp) < .0004) sp = want;
    const e = smooth(sp), burst = reduce ? 0 : Math.sin(Math.PI * sp) * 1.15, hb = { left: geo.hl, top: geo.ht - scrollY };
    parts.forEach(p => {
      const k = reduce ? 1 : clamp((now - t0 - p.d) / 1300), amt = (1 - back(k)) + burst;
      // In the hero, letters within reach of the pointer lean away and ease back
      let tx = 0, ty = 0;
      if (k >= 1 && e < .02) { const cx = hb.left + p.ox, cy = hb.top + p.oy, vx = cx - px, vy = cy - py, d = Math.hypot(vx, vy), reach = 160; if (d < reach) { const f = (1 - d / reach) * 46; tx = vx / d * f; ty = vy / d * f; } }
      p.rx += (tx - p.rx) * .14; p.ry += (ty - p.ry) * .14;
      const mx = (p.tx - hb.left - p.ox) * e, my = (p.ty - hb.top - p.oy) * e, scale = (1 + (geo.s - 1) * e) * (1 + (p.sc - 1) * clamp(amt, -.2, 1.5));
      const tf = `translate(${(mx + p.dx * amt + p.rx).toFixed(2)}px, ${(my + p.dy * amt + p.ry).toFixed(2)}px) rotate(${(p.r * amt).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      if (tf !== p.tf) { p.tf = tf; p.c.style.transform = tf; }
    });
    tagOpacity(Math.max(0, 1 - sp * 4));
    body.classList.toggle("docked", sp > .985);
    raf = requestAnimationFrame(tick);
  }

  body.dataset.logo = "assemble";
  rebuild();
  requestAnimationFrame(start);
  addEventListener("resize", () => { if (parts.length) measure(); });
  if (document.fonts) document.fonts.ready.then(() => { if (parts.length) measure(); });
  if (window.ResizeObserver) new ResizeObserver(() => { if (parts.length) measure(); }).observe(h1);
  addEventListener("load", () => { if (parts.length) measure(); });
})();
