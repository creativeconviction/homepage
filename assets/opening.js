// Creative Conviction — the landing page opening (see opening.css for the beats); it runs by itself on the first load of a visit. Uses the CC / PORTS / IMGS / REFS data the page carries.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, body = document.body;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const PALETTE = ["#E79AAB", "#7B6DE6", "#E66A5B", "#E8AD35", "#4FAE8C", "#4A8EE8", "#EC8549", "#2F8A2C", "#4D7AA8"];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const intro = $("intro"), stage = $("stage"), board = $("board"), main = $("main"), cue = $("cue"), peek = $("peek");
  const bySlug = Object.fromEntries(CC.interviews.map(x => [x.slug, x]));
  const refOf = n => { const r = REFS[n]; if (!r) return null; const x = bySlug[r.slug]; return x ? { x, q: r.q, cap: !!r.cap } : null; };
  const quoted = (q, cap) => cap ? esc(q) : "&ldquo;" + esc(q) + "&rdquo;";

  // The wordmark, letter by letter, each starting somewhere else on the screen
  intro.querySelectorAll(".line").forEach(l => { l.innerHTML = [...l.dataset.text].map(c => `<span class="ch">${c}</span>`).join(""); });
  [...intro.querySelectorAll(".ch")].forEach((c, i) => {
    c.style.setProperty("--dl", (Math.random() * 220 + i * 16 | 0) + "ms");
    c.style.transform = `translate(${(Math.random() - .5) * innerWidth * .9}px, ${(Math.random() - .5) * innerHeight * .8}px) rotate(${(Math.random() - .5) * 80}deg) scale(${.4 + Math.random() * 1.3})`;
  });

  // The list
  main.innerHTML = `<section class="interviews" id="interviews"><ul class="list" id="list">${CC.interviews.map((x, i) => `
    <li class="row" style="--i:${i}"><a${x.soon ? ' class="soon" aria-disabled="true" tabindex="-1"' : ` href="${x.url}"`}>
      <img class="ph" src="${PORTS[x.slug]}" alt="" width="56" height="56" data-slug="${x.slug}" />
      <span class="t">${esc(x.headline)}</span>
      <span class="w"><b>${esc(x.name)}</b><br />${esc(x.role)}, <em>${esc(x.company)}</em></span>
      <span class="d">${esc(x.date)}</span>
    </a></li>`).join("")}</ul></section>`;
  const list = $("list");

  // The board: every face, plus as many pictures as fill the rows exactly (the rest wait for another day). It is laid out for the window
  // it's in and laid out again whenever the window changes size, so it always fills the width with whole rows and sits above the fold.
  const faces = CC.interviews.map(x => ({ face: x.slug, u: PORTS[x.slug] })), pics = shuffle(IMGS.filter(i => REFS[i.n]).map(i => ({ n: i.n, u: i.u }))), total = faces.length + pics.length;
  const seats = shuffle([...Array(total).keys()]);
  const colour = {}; [...faces, ...pics].forEach(it => { colour[it.face || it.n] = PALETTE[Math.random() * PALETTE.length | 0]; });
  function buildBoard() {
    const pad = innerWidth < 560 ? 12 : 32, gap = innerWidth < 560 ? 3 : 5, availH = innerHeight - 56 - pad * 2;
    let cols = innerWidth < 560 ? 6 : 10, cell, rows;
    for (;; cols++) { cell = Math.floor((innerWidth - pad * 2 - gap * (cols - 1)) / cols); rows = Math.floor(total / cols); if (rows * cell + (rows - 1) * gap <= availH || cols > 20) break; }
    board.style.setProperty("--cols", cols); board.style.setProperty("--cell", cell + "px"); board.style.setProperty("--gap", gap + "px");
    const want = rows * cols, chosen = [...faces, ...pics.slice(0, want - faces.length)];
    const slots = seats.filter(i => i < want).map(i => chosen[i]);
    board.innerHTML = slots.map(it => `<div class="tile ${it.face ? "face" : "pic"}" ${it.face ? `data-face="${it.face}"` : `data-n="${it.n}"`} style="--c:${colour[it.face || it.n]}; --dl:${Math.random() * 240 | 0}ms"><img src="${it.u}" alt="" /></div>`).join("");
  }
  buildBoard();
  let phase = 0, busy = false, rsz = 0, again = false;
  addEventListener("resize", () => { clearTimeout(rsz); rsz = setTimeout(() => { if (phase === 3) return; if (busy) { again = true; return; } buildBoard(); }, 120); });

  // While the board is in focus, a picture under the pointer (or a tapped one) shows its passage beside it
  const canHover = matchMedia("(hover: hover)").matches;
  const peekFor = t => {
    const o = t.dataset.face ? { x: bySlug[t.dataset.face], q: bySlug[t.dataset.face].quote } : refOf(t.dataset.n); if (!o) return;
    peek.innerHTML = `<img src="${t.querySelector("img").src}" alt="" /><div class="cap">${quoted(o.q, o.cap)}<small>${esc(o.x.name)}, <em>${esc(o.x.company)}</em></small></div>`;
    const b = t.getBoundingClientRect(), left = b.left + b.width / 2 < innerWidth / 2;
    if (canHover) { peek.style.left = left ? (b.right + 14) + "px" : ""; peek.style.right = left ? "" : (innerWidth - b.left + 14) + "px"; peek.style.top = Math.max(72, Math.min(innerHeight - 520, b.top)) + "px"; }
    else { peek.style.left = peek.style.right = peek.style.top = ""; }
    peek.classList.add("on");
  };
  const live = () => stage.classList.contains("live") && !stage.classList.contains("colour");
  board.addEventListener("pointerover", e => { if (!live() || !canHover) return; const t = e.target.closest(".tile"); if (t) peekFor(t); });
  board.addEventListener("pointerout", e => { if (canHover && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".tile"))) peek.classList.remove("on"); });
  board.addEventListener("click", e => { if (!live() || canHover) return; const t = e.target.closest(".tile"); if (!t) return; const k = t.dataset.face || t.dataset.n;
    if (peek.classList.contains("on") && peek.dataset.k === k) peek.classList.remove("on"); else { peekFor(t); peek.dataset.k = k; } });

  // The beats
  const land = () => { phase = 3; body.classList.remove("opening"); body.classList.add("docked"); intro.remove(); stage.classList.add("gone"); cue.classList.remove("on"); peek.classList.remove("on"); list.classList.add("show"); };
  async function beat1() {
    busy = true; cue.classList.remove("on");
    board.classList.add("in"); $("grain").classList.add("on");
    await wait(500); intro.classList.add("out"); body.classList.add("docked");
    await wait(1700); phase = 2; busy = false; stage.classList.add("live");
    if (again) { again = false; buildBoard(); }
  }
  async function beat2() {
    busy = true; cue.classList.remove("on"); peek.classList.remove("on"); stage.classList.remove("live");
    stage.classList.add("colour");
    await wait(1000);
    const tiles = [...board.querySelectorAll(".tile.face")], order = CC.interviews.map(x => x.slug);
    tiles.sort((a, b) => order.indexOf(a.dataset.face) - order.indexOf(b.dataset.face));
    tiles.forEach((t, k) => {
      const ph = list.querySelector(`.ph[data-slug="${t.dataset.face}"]`); if (!ph) return;
      const a = t.getBoundingClientRect(), b = ph.getBoundingClientRect();
      const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2), s = b.width / a.width;
      t.style.setProperty("--dl", (k * 55) + "ms"); t.classList.add("fly"); void t.offsetWidth;
      t.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
    });
    stage.classList.add("leaving");
    await wait(1300 + tiles.length * 55 + 100);
    land();
  }
  const onScrollIntent = () => { if (busy || phase === 3) return; if (phase === 1) beat1(); else if (phase === 2) beat2(); };
  addEventListener("wheel", e => { if (e.deltaY > 2) onScrollIntent(); }, { passive: true });
  let ty = null; addEventListener("touchstart", e => { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchmove", e => { if (ty !== null && ty - e.touches[0].clientY > 12) { ty = null; onScrollIntent(); } }, { passive: true });
  addEventListener("keydown", e => { if (["ArrowDown", "PageDown", " "].includes(e.key)) onScrollIntent(); });

  // It plays by itself, once per visit: later loads in the same session go straight to the list. Scrolling still moves it on sooner.
  let seen = false; try { seen = sessionStorage.getItem("cc-opened") === "1"; sessionStorage.setItem("cc-opened", "1"); } catch (e) {}
  (async () => {
    body.classList.add("opening"); scrollTo(0, 0);
    if (reduce || seen) { await wait(50); return land(); }
    [...board.querySelectorAll("img")].forEach(im => im.decode().catch(() => {}));
    await wait(40); intro.classList.add("go");
    await wait(2200); phase = 1;
    if (!busy) await beat1();
    await wait(1600);
    if (phase === 2 && !busy) beat2();
  })();
})();
