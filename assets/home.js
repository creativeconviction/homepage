// Creative Conviction — home: the title reveal, the interviews, and the picture rails (#wall and #ribbon are still there behind the URL hash)
(function () {

  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, canHover = matchMedia("(hover: hover)").matches;

  // Title: wrap each letter so it can rise out of its line
  document.querySelectorAll(".logo .line").forEach(l => { l.innerHTML = [...l.dataset.text].map((c, i) => `<span class="ch" style="--i:${i}">${c}</span>`).join(""); });

  // Every picture is paired with the passage of the interview it comes from (REFS), checked by hand
  const bySlug = Object.fromEntries(CC.interviews.map(x => [x.slug, x]));
  const refOf = im => { const r = REFS[im.n]; return { ...bySlug[r.slug], q: r.q, cap: !!r.cap, frag: r.frag }; };
  // The link carries the passage in #q=, and the site's own script marks just those words for a few seconds
  const jump = r => `${r.url}#q=${encodeURIComponent(r.q)}`;
  const backHTML = r => `<span class="q">${r.cap ? esc(r.q) : "&ldquo;" + esc(r.q) + "&rdquo;"}</span><small>${esc(r.name)}, ${esc(r.role)}, <em>${esc(r.company)}</em></small>`;
  const tile = (im, cls = "") => { const r = refOf(im); return `<a class="tile ${cls}" href="${jump(r)}" data-n="${im.n}" aria-label="${esc(r.name)}: ${esc(r.q)}"><div class="back">${backHTML(r)}</div><div class="pic"><img src="${im.u}" alt="" loading="lazy" decoding="async" draggable="false" /></div></a>`; };
  const pick = (k, offset = 0) => Array.from({ length: k }, (_, i) => IMGS[(offset + i) % IMGS.length]);

  // Wall: one screen of pictures
  function wallHTML() {
    const w = innerWidth, n = w < 560 ? 3 : w < 768 ? 4 : w < 1100 ? 6 : w < 1400 ? 8 : 10, gap = w < 720 ? 3 : 4, cell = (w - gap * (n - 1)) / n;
    const rows = Math.max(2, Math.round(innerHeight / (cell + gap))), cells = rows * n; let area = 0, html = "", ii = 0;
    while (area < cells && ii < IMGS.length) { const im = IMGS[ii]; const tall = im.h / im.w > 1.3 && area + 2 <= cells && ii % 3 === 0; html += tile(im, tall ? "h2" : ""); area += tall ? 2 : 1; ii++; }
    return `<div class="wall" style="grid-template-columns: repeat(${n}, ${cell}px); grid-auto-rows: ${cell}px">${html}</div>`;
  }
  // Ribbon: enough pictures to fill the row three times over, so it can loop seamlessly
  function ribbonHTML(h, offset, dir) {
    const per = Math.ceil(innerWidth / h) + 2, items = pick(per, offset).map(im => tile(im)).join("");
    return `<div class="ribbon" data-dir="${dir}" style="--h:${h}px"><div class="track">${items}${items}${items}</div></div>`;
  }
  // Rails: a column repeated so it never runs dry; the rail's width and column count come from the stylesheet (--rail, --rail-cols)
  const railPer = () => { const cs = getComputedStyle(document.documentElement), railW = parseFloat(cs.getPropertyValue("--rail")) || 240, cols = parseInt(cs.getPropertyValue("--rail-cols")) || 2, tw = (railW - 4 * (cols - 1)) / cols; return cols * (Math.ceil(innerHeight / (tw + 4)) + 2); };
  function railHTML(offset, rev) {
    const per = railPer();
    const items = pick(per, offset).map(im => tile(im)).join("");
    return `<div class="rail"><div class="track${rev ? " rev" : ""}">${items}${items}</div></div>`;
  }

  // One row style for everything
  const rows = (items, id = "", five = false) => `<section class="interviews"${id ? ` id="${id}"` : ""}><ul class="list${five ? " five" : ""}">${items.map((x, i) => `
    <li class="row" style="--i:${i}"><a${x.soon ? ' class="soon" aria-disabled="true" tabindex="-1"' : ` href="${x.url}"`}${x.ext ? ' target="_blank" rel="noopener"' : ""}>
      <img class="ph" src="${x.img}" alt="" width="56" height="56" loading="lazy" />
      <span class="t">${esc(x.title)}</span>
      ${five ? `<span class="au">${esc(x.authors)}</span>` : ""}
      <span class="w">${x.line1 ? `<b>${esc(x.line1)}</b><br />` : ""}${esc(x.line2)}${x.accent ? `, <em>${esc(x.accent)}</em>` : ""}</span>
      <span class="d">${esc(x.date)}</span>
    </a></li>`).join("")}</ul></section>`;
  // A page can bring its own rows (Writing, Community) and keep the same frame, pictures and type as Interviews
  const listHTML = () => window.PAGE ? rows(PAGE.items, "interviews", !!PAGE.five) : rows(CC.interviews.map(x => ({ url: x.url, img: PORTS[x.slug], title: x.headline, line1: x.name, line2: x.role, accent: x.company, date: x.date, soon: x.soon })), "interviews");
  const page = document.getElementById("page"), peek = document.getElementById("peek");
  // Phones get one drifting ribbon of pictures instead of the side rails
  const isMobile = () => matchMedia("(max-width: 720px)").matches;
  function mobileRibbonHTML() {
    const h = Math.round(Math.min(innerWidth * .225, 96)), items = IMGS.map(im => tile(im)).join("");
    return `<div class="ribbon m-ribbon" data-dir="1" style="--h:${h}px"><div class="track">${items}${items}${items}</div></div>`;
  }
  const layouts = {
    wall:   () => listHTML() + wallHTML(),
    ribbon: () => { const h = Math.round(Math.min(innerHeight * .15, 150)); const per = Math.ceil(innerWidth / h) + 2; return listHTML() + ribbonHTML(h, 0, 1) + ribbonHTML(h, per, -1); },
    rails:  () => isMobile() ? mobileRibbonHTML() + listHTML() : `<div class="rails">${railHTML(0, false)}${listHTML()}${railHTML(railPer(), true)}</div>`,
  };
  const pages = {};
  let current = "rails", rot = null, pageName = "home", ribbons = [];

  // On a touch screen, tapping a picture opens a card with the passage; the magenta arrow under it opens the article
  let veil = null;
  const closeCard = () => { peek.classList.remove("on", "card"); if (veil) veil.classList.remove("on"); };
  function openCard(t) {
    const im = IMGS.find(x => x.n === t.dataset.n), r = refOf(im);
    const who = `${esc(r.name)}, ${esc(r.role)}, <em>${esc(r.company)}</em> <a class="go" href="${jump(r)}" aria-label="Read the interview">&rarr;</a>`;
    peek.innerHTML = `<img src="${im.u}" alt="" /><div class="cap"><span class="q">${r.cap ? esc(r.q) : "&ldquo;" + esc(r.q) + "&rdquo;"}</span><small>${who}</small></div>`;
    if (!veil) { veil = document.createElement("div"); veil.className = "peekveil"; veil.addEventListener("click", closeCard); document.body.appendChild(veil); }
    peek.style.left = peek.style.right = peek.style.top = "";
    peek.classList.add("on", "card"); veil.classList.add("on");
  }
  function armTile(t) { t.addEventListener("click", e => { if (t.closest(".rail") || !(t.closest(".m-ribbon") || !canHover)) return; e.preventDefault(); openCard(t); }); }

  // First visit on a phone: the squares scatter in from every side and settle into the ribbon (as the big letters do); the interviews load in after both
  const body = document.body; let introDone = false;
  const back = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const clamp01 = v => Math.min(1, Math.max(0, v));
  function flyTiles(mr, done) {
    const spots = [...mr.querySelectorAll(".tile")].map(t => ({ t, r: t.getBoundingClientRect() })).filter(o => o.r.right > -10 && o.r.left < innerWidth + 10);
    const layer = document.createElement("div"); layer.className = "m-fly"; document.body.appendChild(layer);
    const parts = spots.map((o, i) => {
      const d = document.createElement("div"); d.style.cssText = `left:${o.r.left}px;top:${o.r.top + scrollY}px;width:${o.r.width}px;height:${o.r.height}px`;
      const im = document.createElement("img"); im.src = o.t.querySelector("img").src; im.alt = ""; d.appendChild(im); layer.appendChild(d);
      return { d, dx: (Math.random() - .5) * innerWidth * 1.1, dy: (Math.random() - .5) * innerHeight * .9, r: (Math.random() - .5) * 90, sc: .35 + Math.random() * 1.5, dl: Math.random() * 450 + i * 22 };
    });
    const finish = () => { layer.remove(); mr.style.visibility = ""; done(); };
    const run = () => { const t0 = performance.now();
      (function step(now) { let all = true;
        parts.forEach(p => { const k = clamp01((now - t0 - p.dl) / 1300); if (k < 1) all = false; const amt = 1 - back(k);
          p.d.style.transform = `translate(${(p.dx * amt).toFixed(1)}px, ${(p.dy * amt).toFixed(1)}px) rotate(${(p.r * amt).toFixed(1)}deg) scale(${(1 + (p.sc - 1) * Math.min(1.5, Math.max(-.2, amt))).toFixed(3)})`; });
        if (all) finish(); else requestAnimationFrame(step); })(t0); };
    // Start the squares scattered (before they are shown), once their pictures are ready
    parts.forEach(p => { p.d.style.transform = `translate(${p.dx}px, ${p.dy}px) rotate(${p.r}deg) scale(${p.sc})`; });
    Promise.race([Promise.all(parts.map(p => p.d.firstChild.decode().catch(() => {}))), new Promise(r => setTimeout(r, 700))]).then(run);
  }
  function runIntro(mr) {
    body.classList.add("m-pending"); mr.classList.add("intro"); mr.style.visibility = "hidden";
    const withLogo = body.dataset.logo === "assemble"; let ribbonDone = false, logoDone = !withLogo, released = false, started = false;
    const release = () => { if (released) return; released = true; body.classList.remove("m-pending"); mr.classList.remove("intro"); mr.style.visibility = ""; document.querySelectorAll(".m-fly").forEach(n => n.remove()); };
    const check = () => { if (ribbonDone && logoDone) release(); };
    const go = () => { if (started) return; started = true; flyTiles(mr, () => { ribbonDone = true; check(); }); };
    if (withLogo) { document.addEventListener("cc-logo-settled", () => { logoDone = true; check(); }, { once: true }); document.addEventListener("cc-logo-start", go, { once: true }); setTimeout(go, 900); } else go();
    setTimeout(release, 6000); // never leave the list hidden
  }

  // The phone ribbon scrolls natively under the finger (so a quick flick carries it further, fast); left alone it drifts and loops
  function armTouchRibbon(rb) {
    const third = () => rb.scrollWidth / 3; let fpos = third(), touching = false, lastUser = 0, last = performance.now(), settleT = 0, drag = null;
    rb.scrollLeft = fpos;
    const settle = () => { const t = third(); if (rb.scrollLeft < t * .5) rb.scrollLeft += t; else if (rb.scrollLeft > t * 1.5) rb.scrollLeft -= t; fpos = rb.scrollLeft; };
    rb.addEventListener("touchstart", () => { touching = true; lastUser = performance.now(); }, { passive: true });
    const lift = () => { touching = false; lastUser = performance.now(); };
    rb.addEventListener("touchend", lift, { passive: true }); rb.addEventListener("touchcancel", lift, { passive: true });
    // Our own nudges are not the reader's; only a real move pauses the drift (and keeps us from cutting a flick short)
    rb.addEventListener("scroll", () => { if (Math.abs(rb.scrollLeft - fpos) > 1.5) { lastUser = performance.now(); fpos = rb.scrollLeft; } clearTimeout(settleT); settleT = setTimeout(() => { if (!touching) settle(); }, 160); }, { passive: true });
    // A mouse on a narrow window can drag it too
    rb.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse" || e.button !== 0) return; drag = { x: e.clientX, left: rb.scrollLeft }; rb.classList.add("dragging"); rb.setPointerCapture(e.pointerId); });
    rb.addEventListener("pointermove", e => { if (drag) rb.scrollLeft = drag.left - (e.clientX - drag.x); });
    const end = () => { drag = null; rb.classList.remove("dragging"); lastUser = performance.now(); };
    rb.addEventListener("pointerup", end); rb.addEventListener("pointercancel", end);
    ribbons.push({ rb, tick: now => {
      const dt = Math.min(50, now - last); last = now;
      if (reduce || touching || drag || rb.classList.contains("intro") || peek.classList.contains("card") || now - lastUser < 260) return;
      fpos += 30 * dt / 1000; rb.scrollLeft = fpos;
      if (rb.scrollLeft > third() * 1.75) settle();
    } });
  }

  // Ribbons drift on their own, loop, and can be dragged or scrolled by hand
  function armRibbon(rb) {
    const third = () => rb.scrollWidth / 3; let idle = true, drag = null, moved = 0, last = performance.now(), pauseUntil = 0;
    rb.scrollLeft = third();
    const wrap = () => { const t = third(); if (rb.scrollLeft < t * .5) rb.scrollLeft += t; else if (rb.scrollLeft > t * 1.5) rb.scrollLeft -= t; };
    rb.addEventListener("scroll", wrap, { passive: true });
    rb.addEventListener("wheel", () => { pauseUntil = performance.now() + 2500; }, { passive: true });
    rb.addEventListener("pointerdown", e => { if (e.pointerType === "mouse" && e.button !== 0) return; drag = { x: e.clientX, left: rb.scrollLeft }; moved = 0; rb.classList.add("dragging"); rb.setPointerCapture(e.pointerId); });
    rb.addEventListener("pointermove", e => { if (!drag) return; const dx = e.clientX - drag.x; moved = Math.max(moved, Math.abs(dx)); rb.scrollLeft = drag.left - dx; });
    const end = () => { if (!drag) return; drag = null; rb.classList.remove("dragging"); pauseUntil = performance.now() + 2500; };
    rb.addEventListener("pointerup", end); rb.addEventListener("pointercancel", end);
    rb.addEventListener("click", e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    rb.addEventListener("pointerenter", () => { idle = false; }); rb.addEventListener("pointerleave", () => { idle = true; });
    const speed = +rb.dataset.dir * 28; // px per second
    const r = { rb, tick: now => { const dt = Math.min(50, now - last); last = now; if (!reduce && idle && !drag && now > pauseUntil) { rb.scrollLeft += speed * dt / 1000; } } };
    ribbons.push(r);
  }
  (function loop(now) { ribbons.forEach(r => r.tick(now)); requestAnimationFrame(loop); })(performance.now());

  // Rails: with a mouse, hovering a picture shows it large, with its passage, beside the rail. On a touch screen, pressing and holding a picture shows it over the middle of the screen, and letting go hides it; a quick tap still opens the interview at that passage.
  function armRail(rail) {
    const show = t => {
      const im = IMGS.find(x => x.n === t.dataset.n), r = refOf(im);
      peek.innerHTML = `<img src="${im.u}" alt="" /><div class="cap">${backHTML(r)}</div>`;
      if (canHover) { const b = t.getBoundingClientRect(), left = rail.getBoundingClientRect().left < innerWidth / 2;
        peek.style.left = left ? (b.right + 16) + "px" : ""; peek.style.right = left ? "" : (innerWidth - b.left + 16) + "px";
        peek.style.top = Math.max(72, Math.min(innerHeight - 560, b.top)) + "px"; }
      else { peek.style.left = peek.style.right = peek.style.top = ""; rail.classList.add("held"); }
      peek.classList.add("on");
    };
    const hide = () => { peek.classList.remove("on"); rail.classList.remove("held"); };
    rail.querySelectorAll(".tile").forEach(t => {
      if (canHover) { t.addEventListener("pointerenter", () => show(t)); t.addEventListener("pointerleave", hide); return; }
      let timer = null, held = false;
      t.addEventListener("pointerdown", () => { held = false; clearTimeout(timer); timer = setTimeout(() => { held = true; show(t); }, 180); });
      const end = () => { clearTimeout(timer); hide(); };
      t.addEventListener("pointerup", end); t.addEventListener("pointercancel", end); t.addEventListener("pointerleave", end);
      t.addEventListener("click", e => { if (held) { e.preventDefault(); held = false; } });
      t.addEventListener("contextmenu", e => e.preventDefault());
    });
  }
  addEventListener("scroll", () => { if (!peek.classList.contains("card")) peek.classList.remove("on"); }, { passive: true });

  function render(v) {
    ribbons = []; clearInterval(rot);
    if (pages[v]) { pageName = v; document.body.classList.add("sub"); page.innerHTML = pages[v](); scrollTo(0, 0); }
    else { pageName = "home"; document.body.classList.remove("sub"); current = layouts[v] ? v : current; page.innerHTML = layouts[current](); }
    document.querySelectorAll(".top [data-page]").forEach(a => a.setAttribute("aria-current", a.dataset.page === pageName && pageName !== "home" ? "page" : "false"));
    
    if (pageName !== "home") return;
    const wall = page.querySelector(".wall");
    if (wall) { const n = wall.style.gridTemplateColumns.match(/repeat\((\d+)/)[1] * 1, cell = parseFloat(wall.style.gridAutoRows);
      for (let k = 0; k < 20; k++) { const rows = Math.round((wall.offsetHeight + 4) / (cell + 4)), area = [...wall.children].reduce((a, t) => a + (t.classList.contains("h2") ? 2 : 1), 0);
        if (rows * n - area <= 0) break; const used = new Set([...wall.children].map(t => t.dataset.n)), im = IMGS.find(x => !used.has(x.n)); if (!im) break; wall.insertAdjacentHTML("beforeend", tile(im)); } }
    page.querySelectorAll(".tile").forEach(armTile);
    page.querySelectorAll(".ribbon").forEach(rb => rb.classList.contains("m-ribbon") ? armTouchRibbon(rb) : armRibbon(rb));
    const mr = page.querySelector(".m-ribbon"); if (mr && !introDone && !reduce && body.dataset.heroless !== "1") { introDone = true; runIntro(mr); }
    page.querySelectorAll(".rail").forEach(armRail);
    if (!reduce) rot = setInterval(rotate, 15000);
  }
  // Every 15 seconds each picture crossfades to another, one after the next; the passage underneath is never shown, and a tile someone is reading is left alone
  let shift = 0;
  function rotate() {
    shift += 7;
    const showing = () => new Set([...page.querySelectorAll(".tile")].map(t => t.dataset.n));
    [...page.querySelectorAll(".wall .tile, .ribbon:not(.m-ribbon) .tile")].forEach((t, i) => setTimeout(() => {
      if (t.matches(":hover") || t.classList.contains("show")) return;
      const used = showing(), start = IMGS.findIndex(x => x.n === t.dataset.n) + shift;
      let im = null; for (let k = 0; k < IMGS.length; k++) { const c = IMGS[(start + k) % IMGS.length]; if (!used.has(c.n)) { im = c; break; } }
      if (!im) return;
      const r = refOf(im), pic = t.querySelector(".pic"), old = pic.querySelector("img");
      t.dataset.n = im.n; const img = document.createElement("img"); img.className = "next"; img.alt = ""; img.draggable = false; img.src = im.u;
      const go = () => { pic.appendChild(img); requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add("on")));
        setTimeout(() => { old.remove(); img.className = ""; t.dataset.n = im.n; t.href = jump(r); t.setAttribute("aria-label", `${r.name}: ${r.q}`); t.querySelector(".back").innerHTML = backHTML(r); }, 700); };
      if (img.complete) go(); else img.onload = go;
    }, (i % 24) * 60));
  }

  // #interviews goes straight to the list with no title screen (the wordmark comes back in the top line); every other view shows the title
  const heroless = document.body.dataset.heroless === "1";
  const setHero = skip => { skip = skip || heroless; document.body.classList.toggle("no-hero", skip); const top = document.querySelector(".cc-top"); if (top) top.classList.toggle("no-mark", !skip); };
  const fromHash = () => { const h = (location.hash || "#rails").slice(1);
    if (h === "interviews" || h === "top") {
      setHero(h === "interviews");
      if (pageName !== "home" || !page.firstElementChild) render(current);
      if (h === "interviews") scrollTo(0, 0); else { const el = document.getElementById("top"); if (el) el.scrollIntoView(); }
    } else { setHero(false); render(h); } };
  addEventListener("hashchange", () => { const h = location.hash.slice(1); if (!h || layouts[h] || pages[h] || h === "interviews" || h === "top") fromHash(); });
  fromHash();
  let lastW = innerWidth, rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (pageName === "home" && Math.abs(innerWidth - lastW) > 1) { lastW = innerWidth; render(current); } }, 200); });
  addEventListener("scroll", () => document.body.classList.toggle("past", scrollY > innerHeight * .4), { passive: true });
})();
