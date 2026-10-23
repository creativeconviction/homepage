// Creative Conviction — the Library wall on the home page. Uses the CC / IMGS / REFS data the page carries.
// Full width, square tiles. Click a tile and it flips over to the passage it comes from; the passage links to that spot
// in the interview. The wall shows seven rows; the pictures not on it wait their turn, so when it changes nothing on screen ever repeats.
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const bySlug = Object.fromEntries(CC.interviews.map(x => [x.slug, x]));
  const refOf = n => { const r = REFS[n]; if (!r) return null; const x = bySlug[r.slug]; return x ? { x, q: r.q, cap: !!r.cap, credit: r.credit } : null; };
  // The link carries the passage in #q=; the site's own script marks just those words for a few seconds
  const jump = (x, q) => `${x.url}#q=${encodeURIComponent(q)}`;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, canHover = matchMedia("(hover: hover)").matches;

  // Pictures from the interviews (no headshots), and public-domain works from The Met that show what a guest is talking about (credited on the back)
  const items = shuffle(IMGS.map(im => ({ u: im.u, ref: refOf(im.n) })).filter(o => o.ref));
  const backHTML = o => `<p class="q">${o.ref.cap || /^[“"]/.test(o.ref.q) ? esc(o.ref.q) : "&ldquo;" + esc(o.ref.q) + "&rdquo;"}</p>
      <p class="who">${esc(o.ref.x.name)}<br /><em>${esc(o.ref.x.company)}</em></p>
      <a class="go" href="${jump(o.ref.x, o.ref.q)}">Read the interview &rarr;</a>${o.ref.credit ? `<p class="credit">${esc(o.ref.credit)}</p>` : ""}`;
  const tileHTML = i => `<div class="tile" data-i="${i}" role="button" tabindex="0" aria-pressed="false" aria-label="${esc(items[i].ref.x.name)}: show the passage">
      <div class="flip"><div class="face front"><img src="${items[i].u}" alt="" loading="lazy" /><img class="next" alt="" /></div><div class="face back">${backHTML(items[i])}</div></div></div>`;

  const lib = document.getElementById("library");
  lib.innerHTML = `<h2>Library</h2><div class="wallgrid" id="wall"></div>`;
  const wall = document.getElementById("wall");
  const tiles = () => [...wall.children];

  // Square cells that fill the width exactly (about 170px on a laptop, three across on a phone): seven whole rows on a laptop,
  // twelve on a phone, always leaving at least a row's worth of pictures waiting to come in
  let cols = 0, count = 0;
  function layout() {
    const w = wall.clientWidth || innerWidth, gap = innerWidth < 720 ? 3 : 6, target = innerWidth < 720 ? 110 : Math.min(200, Math.max(150, innerWidth / 9));
    const c = Math.max(3, Math.round((w + gap) / (target + gap))), cell = (w - gap * (c - 1)) / c, rows = innerWidth < 720 ? 12 : 7;
    const n = Math.max(1, Math.min(rows, Math.floor((items.length - c) / c))) * c;
    wall.style.setProperty("--cols", c); wall.style.setProperty("--cell", cell + "px"); wall.style.setProperty("--gap", gap + "px");
    if (c === cols && n === count) return;
    cols = c; count = n;
    const keep = tiles().map(t => +t.dataset.i).slice(0, n), rest = shuffle(items.map((_, i) => i).filter(i => !keep.includes(i)));
    wall.innerHTML = [...keep, ...rest.slice(0, n - keep.length)].map(tileHTML).join("");
  }
  layout(); addEventListener("resize", layout);

  // Flip: one card over at a time. Click it again, press Escape, flip another card, or move off the wall to turn it back
  const setFlip = (t, on) => { t.classList.toggle("over", on); t.setAttribute("aria-pressed", on); t.setAttribute("aria-label", `${items[t.dataset.i].ref.x.name}: ${on ? "show the picture" : "show the passage"}`); };
  const flipOnly = t => tiles().forEach(o => { if (o !== t && o.classList.contains("over")) setFlip(o, false); });
  wall.addEventListener("click", e => { if (e.target.closest(".go")) return; const t = e.target.closest(".tile"); if (!t) return; const on = !t.classList.contains("over"); flipOnly(t); setFlip(t, on); });
  wall.addEventListener("keydown", e => { const t = e.target.closest(".tile"); if (!t || e.target.closest(".go")) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); t.click(); } });
  addEventListener("keydown", e => { if (e.key === "Escape") flipOnly(null); });
  if (canHover) wall.addEventListener("pointerleave", () => flipOnly(null));

  // The wall changes by itself, all at once and slowly: every nine seconds a soft ripple crosses it from one corner and each
  // of the tiles dissolves into a picture that isn't on the wall (as many as are waiting, scattered across it). A card that is
  // turned over, or the picture under the pointer, stays put.
  const show = (t, i, delay) => setTimeout(() => {
    const cur = t.querySelector(".front img:not(.next)"), nxt = t.querySelector(".front img.next");
    t.dataset.i = i; t.querySelector(".back").innerHTML = backHTML(items[i]); t.setAttribute("aria-label", `${items[i].ref.x.name}: show the passage`);
    nxt.onload = () => { nxt.classList.add("on"); setTimeout(() => { cur.src = items[i].u; cur.onload = () => nxt.classList.remove("on"); }, 1800); };
    nxt.src = items[i].u;
  }, delay);
  function wave() {
    if (document.hidden) return;
    const all = tiles(), onWall = new Set(all.map(t => +t.dataset.i)), waiting = shuffle(items.map((_, i) => i).filter(i => !onWall.has(i)));
    const free = all.filter(t => !t.classList.contains("over") && !t.matches(":hover"));
    const corner = Math.random() * 4 | 0, W = wall.clientWidth || 1, H = wall.clientHeight || 1, top = wall.getBoundingClientRect();
    shuffle(free).slice(0, waiting.length).forEach((t, k) => {
      const b = t.getBoundingClientRect(); let x = (b.left - top.left) / W, y = (b.top - top.top) / H;
      if (corner & 1) x = 1 - x; if (corner & 2) y = 1 - y;
      show(t, waiting[k], (x + y) / 2 * 1800);
    });
  }
  if (!reduce) setInterval(wave, 9000);
})();
