// Creative Conviction — the Library wall on the home page. Uses the CC / IMGS / REFS data the page carries.
// Full width, tiles shaped like their pictures (wide, tall, square, and the odd large one). Click a tile and it
// flips over to the passage it comes from; the passage links to that spot in the interview.
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const bySlug = Object.fromEntries(CC.interviews.map(x => [x.slug, x]));
  const refOf = n => { const r = REFS[n]; if (!r) return null; const x = bySlug[r.slug]; return x ? { x, q: r.q, cap: !!r.cap } : null; };
  // The link carries the passage in #q=; the site's own script marks just those words for a few seconds
  const jump = (x, q) => `${x.url}#q=${encodeURIComponent(q)}`;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, canHover = matchMedia("(hover: hover)").matches;

  // Pictures from the interviews only (no headshots), each once. Its shape decides its tile; every fifth square one is drawn large
  const shapeOf = im => im.w / im.h > 1.3 ? "wide" : im.h / im.w > 1.3 ? "tall" : "sq";
  const items = shuffle(IMGS.map(im => ({ u: im.u, shape: shapeOf(im), ref: refOf(im.n) })).filter(o => o.ref));
  let sq = 0; items.forEach(o => { o.size = o.shape === "sq" && sq++ % 5 === 2 ? "big" : o.shape; });

  const lib = document.getElementById("library");
  const backHTML = o => `<p class="q">${o.ref.cap || /^[“"]/.test(o.ref.q) ? esc(o.ref.q) : "&ldquo;" + esc(o.ref.q) + "&rdquo;"}</p>
      <p class="who">${esc(o.ref.x.name)}<br /><em>${esc(o.ref.x.company)}</em></p>
      <a class="go" href="${jump(o.ref.x, o.ref.q)}">Read the interview &rarr;</a>`;
  lib.innerHTML = `<h2>Library</h2><div class="wallgrid" id="wall">${items.map((o, i) => `
    <div class="tile ${o.size}" data-i="${i}" data-shape="${o.shape}" role="button" tabindex="0" aria-pressed="false" aria-label="${esc(o.ref.x.name)}: show the passage">
      <div class="flip"><div class="face front"><img src="${o.u}" alt="" loading="lazy" /><img class="next" alt="" /></div><div class="face back">${backHTML(o)}</div></div>
    </div>`).join("")}</div>`;
  const wall = document.getElementById("wall"), tiles = [...wall.children];

  // Square cells that fill the width exactly: about 180px on a laptop, three across on a phone
  const fit = () => { const w = wall.clientWidth || innerWidth, gap = innerWidth < 720 ? 3 : 6, target = innerWidth < 720 ? 110 : Math.min(200, Math.max(150, innerWidth / 9));
    const cols = Math.max(3, Math.round((w + gap) / (target + gap))), cell = (w - gap * (cols - 1)) / cols;
    wall.style.setProperty("--cols", cols); wall.style.setProperty("--cell", cell + "px"); wall.style.setProperty("--gap", gap + "px"); };
  fit(); addEventListener("resize", fit);

  // Flip: one card over at a time. Click the back (anywhere but its link), press Escape, or flip another card to turn it back
  const setFlip = (t, on) => { t.classList.toggle("over", on); t.setAttribute("aria-pressed", on); t.setAttribute("aria-label", `${items[t.dataset.i].ref.x.name}: ${on ? "show the picture" : "show the passage"}`); };
  const flipOnly = t => tiles.forEach(o => { if (o !== t && o.classList.contains("over")) setFlip(o, false); });
  wall.addEventListener("click", e => { if (e.target.closest(".go")) return; const t = e.target.closest(".tile"); if (!t) return; const on = !t.classList.contains("over"); flipOnly(t); setFlip(t, on); });
  wall.addEventListener("keydown", e => { const t = e.target.closest(".tile"); if (!t || e.target.closest(".go")) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); t.click(); } });
  addEventListener("keydown", e => { if (e.key === "Escape") flipOnly(null); });
  if (canHover) wall.addEventListener("pointerleave", () => flipOnly(null));

  // The wall changes by itself, all at once and slowly: every nine seconds a soft ripple crosses it from one corner and each
  // picture dissolves into another of the same shape, so nothing is cropped badly and nothing ever shows twice.
  // A card that is turned over, or the picture under the pointer, stays put.
  const show = (t, i, delay) => setTimeout(() => {
    const cur = t.querySelector(".front img:not(.next)"), nxt = t.querySelector(".front img.next");
    t.dataset.i = i; t.querySelector(".back").innerHTML = backHTML(items[i]); t.setAttribute("aria-label", `${items[i].ref.x.name}: show the passage`);
    nxt.onload = () => { nxt.classList.add("on"); setTimeout(() => { cur.src = items[i].u; cur.onload = () => nxt.classList.remove("on"); }, 1800); };
    nxt.src = items[i].u;
  }, delay);
  function wave() {
    if (document.hidden) return;
    const free = tiles.filter(t => !t.classList.contains("over") && !t.matches(":hover"));
    const corner = Math.random() * 4 | 0, W = wall.clientWidth || 1, H = wall.clientHeight || 1, top = wall.getBoundingClientRect();
    ["wide", "tall", "sq"].forEach(shape => {
      const mine = free.filter(t => t.dataset.shape === shape), order = shuffle(mine.map(t => +t.dataset.i));
      mine.forEach((t, k) => {
        if (order[k] === +t.dataset.i) return;
        const b = t.getBoundingClientRect(); let x = (b.left - top.left) / W, y = (b.top - top.top) / H;
        if (corner & 1) x = 1 - x; if (corner & 2) y = 1 - y;
        show(t, order[k], (x + y) / 2 * 1800);
      });
    });
  }
  if (!reduce) setInterval(wave, 9000);
})();
