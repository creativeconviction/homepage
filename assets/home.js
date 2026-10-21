// Creative Conviction — home: the title reveal, the interviews, and the picture rails (#wall and #ribbon are still there behind the URL hash)
(function () {

  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, canHover = matchMedia("(hover: hover)").matches;

  // Title: wrap each letter so it can rise out of its line
  document.querySelectorAll(".logo .line").forEach(l => { l.innerHTML = [...l.dataset.text].map((c, i) => `<span class="ch" style="--i:${i}">${c}</span>`).join(""); });

  // Every picture is paired with the passage of the interview it comes from (REFS), checked by hand
  const bySlug = Object.fromEntries(CC.interviews.map(x => [x.slug, x]));
  const refOf = im => { const r = REFS[im.n]; return { ...bySlug[r.slug], q: r.q, cap: !!r.cap, frag: r.frag }; };
  // The link carries the passage twice: #q= for the site's own highlight script, and a text fragment browsers follow on their own
  const jump = r => { const frag = r.frag || r.q.split(/\s+/).slice(0, 7).join(" ").replace(/[“”"]/g, "").replace(/[.,;:!?]+$/, ""); return `${r.url}#q=${encodeURIComponent(r.q)}:~:text=${encodeURIComponent(frag)}`; };
  const backHTML = r => `<span class="q">${r.cap ? esc(r.q) : "&ldquo;" + esc(r.q) + "&rdquo;"}</span><small>${esc(r.name)}, ${esc(r.role)}, <em>${esc(r.company)}</em></small>`;
  const tile = (im, cls = "") => { const r = refOf(im); return `<a class="tile ${cls}" href="${jump(r)}" data-n="${im.n}" aria-label="${esc(r.name)}: ${esc(r.q)}"><div class="back">${backHTML(r)}</div><div class="pic"><img src="${im.u}" alt="" loading="lazy" draggable="false" /></div></a>`; };
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
  const rows = (items, id = "", five = false) => `<section class="interviews"${id ? ` id="${id}"` : ""}><ul class="list${five ? " five" : ""}">${items.map(x => `
    <li class="row"><a href="${x.url}"${x.ext ? ' target="_blank" rel="noopener"' : ""}>
      <img class="ph" src="${x.img}" alt="" width="56" height="56" loading="lazy" />
      <span class="t">${esc(x.title)}</span>
      ${five ? `<span class="au">${esc(x.authors)}</span>` : ""}
      <span class="w">${x.line1 ? `<b>${esc(x.line1)}</b><br />` : ""}${esc(x.line2)}, <em>${esc(x.accent)}</em></span>
      <span class="d">${esc(x.date)}</span>
    </a></li>`).join("")}</ul></section>`;
  const listHTML = () => rows(CC.interviews.map(x => ({ url: x.url, img: PORTS[x.slug], title: x.headline, line1: x.name, line2: x.role, accent: x.company, date: x.date })), "interviews");
  const page = document.getElementById("page"), peek = document.getElementById("peek");
  const layouts = {
    wall:   () => listHTML() + wallHTML(),
    ribbon: () => { const h = Math.round(Math.min(innerHeight * .15, 150)); const per = Math.ceil(innerWidth / h) + 2; return listHTML() + ribbonHTML(h, 0, 1) + ribbonHTML(h, per, -1); },
    rails:  () => `<div class="rails">${railHTML(0, false)}${listHTML()}${railHTML(railPer(), true)}</div>`,
  };
  const pages = {};
  let current = "rails", rot = null, pageName = "home", ribbons = [];

  // On a touch screen the first tap reveals the passage, the second follows the link
  function armTile(t) { t.addEventListener("click", e => { if (!canHover && !t.closest(".rail") && !t.classList.contains("show")) { e.preventDefault(); page.querySelectorAll(".tile.show").forEach(o => o.classList.remove("show")); t.classList.add("show"); } }); }

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
  addEventListener("scroll", () => peek.classList.remove("on"), { passive: true });

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
    page.querySelectorAll(".ribbon").forEach(armRibbon);
    page.querySelectorAll(".rail").forEach(armRail);
    if (!reduce) rot = setInterval(rotate, 15000);
  }
  // Every 15 seconds each picture crossfades to another, one after the next; the passage underneath is never shown, and a tile someone is reading is left alone
  let shift = 0;
  function rotate() {
    shift += 7;
    const showing = () => new Set([...page.querySelectorAll(".tile")].map(t => t.dataset.n));
    [...page.querySelectorAll(".wall .tile, .ribbon .tile")].forEach((t, i) => setTimeout(() => {
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

  const fromHash = () => { const h = (location.hash || "#rails").slice(1); if (h === "interviews" || h === "top") { if (pageName !== "home") render(current); const el = document.getElementById(h === "top" ? "top" : "interviews"); if (el) el.scrollIntoView(); } else render(h); };
  addEventListener("hashchange", () => { const h = location.hash.slice(1); if (layouts[h] || pages[h] || h === "interviews" || h === "top") fromHash(); });
  fromHash();
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (pageName === "home") render(current); }, 200); });
  addEventListener("scroll", () => document.body.classList.toggle("past", scrollY > innerHeight * .4), { passive: true });
})();
