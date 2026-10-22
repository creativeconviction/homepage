// Creative Conviction — the Library wall. Uses the CC / PORTS / IMGS / REFS data the page carries.
(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const bySlug = Object.fromEntries(CC.interviews.map(x => [x.slug, x]));
  const refOf = n => { const r = REFS[n]; if (!r) return null; const x = bySlug[r.slug]; return x ? { x, q: r.q, cap: !!r.cap } : null; };
  // The link carries the passage in #q=; the site's own script marks just those words for a few seconds
  const jump = (x, q) => `${x.url}#q=${encodeURIComponent(q)}`;
  const items = shuffle([...IMGS.map(im => ({ u: im.u, ref: refOf(im.n) })).filter(o => o.ref), ...CC.interviews.filter(x => !x.soon).map(x => ({ u: PORTS[x.slug], ref: { x, q: x.quote } }))]);
  const lib = document.getElementById("library");
  lib.innerHTML = `<h2>Library</h2>
    <div class="wallgrid" id="wall">${items.map((o, i) => `<button type="button" data-i="${i}"><img src="${o.u}" alt="" loading="lazy" /></button>`).join("")}</div>
    <div class="card-back" id="cardback"></div>
    <a class="card" id="card" role="dialog" aria-modal="true"><button class="x" type="button" aria-label="Close">×</button><img alt="" /><div class="body"><p class="q"></p><p class="who"></p></div></a>`;
  const wall = document.getElementById("wall"), card = document.getElementById("card"), back = document.getElementById("cardback");
  // Whole rows only, however wide the window is
  const fit = () => { const w = wall.clientWidth || innerWidth, min = innerWidth < 720 ? 100 : 150, g = innerWidth < 720 ? 3 : 6, lc = Math.max(2, Math.floor((w + g) / (min + g))), keep = Math.floor(items.length / lc) * lc;
    wall.style.setProperty("--lc", lc); [...wall.children].forEach((b, i) => b.classList.toggle("spare", i >= keep)); };
  fit(); addEventListener("resize", fit);
  const open = o => {
    card.querySelector("img").src = o.u; card.querySelector(".q").innerHTML = o.ref.cap ? esc(o.ref.q) : "&ldquo;" + esc(o.ref.q) + "&rdquo;";
    card.querySelector(".who").innerHTML = `<b>${esc(o.ref.x.name)}</b><br />${esc(o.ref.x.role)}, <em>${esc(o.ref.x.company)}</em>`;
    card.href = jump(o.ref.x, o.ref.q);
    back.classList.add("on"); card.classList.add("on");
  };
  const close = () => { back.classList.remove("on"); card.classList.remove("on"); };
  wall.addEventListener("click", e => { const b = e.target.closest("button"); if (b) open(items[b.dataset.i]); });
  back.addEventListener("click", close);
  card.querySelector(".x").addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); close(); });
  addEventListener("keydown", e => { if (e.key === "Escape") close(); });
})();
