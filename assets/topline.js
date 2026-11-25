// The site background (warm paper); each guest's colour; the Index menu; and the jump-to-quote highlight
(function () {
  // One background for the whole site: warm paper
  document.documentElement.setAttribute("data-bg", "paper");

  // Each guest keeps one of the eight print colours, in interview order (the same order as the home list and the films).
  // On an interview page it becomes --guest, which colours that interview's highlighted lines.
  var GUESTS = ["surya", "steve-ruiz", "jacob-thornton", "mihika-kapoor", "adam-ho", "liz-dorman", "colin-daymond-hanna", "noah-kerner",
    "diego-segura", "quinten-farmer", "paul-jun", "ben-and-zubin-raindrop", "nir-zicherman", "stephen-haney", "dylan-babbs"];
  var PRINT = ["pink", "yellow", "blue-print", "orange-print", "green", "lilac", "red", "sky"];
  var m = location.pathname.match(/\/interviews\/([^\/]+)/), slug = m && (m[1] === "ben-hylak" ? "ben-and-zubin-raindrop" : m[1]);
  var gi = slug ? GUESTS.indexOf(slug) : -1;
  if (gi > -1) document.documentElement.style.setProperty("--guest", "var(--cc-" + PRINT[gi % 8] + ")");
  var HEX = ["#F37DB6", "#F6DE3D", "#4A8FE7", "#F39B47", "#43B86E", "#B99AE8", "#EF5B3E", "#9FD3F2"];

  // The interview title gets a marker stroke in the guest's colour
  var title = gi > -1 && document.querySelector(".cc-article-title");
  if (title && !title.querySelector(".cc-mark")) title.innerHTML = '<span class="cc-mark">' + title.innerHTML + "</span>";

  // On an interview the cursor dot is the guest's colour
  if (gi > -1) {
    var dot = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Ccircle cx='6' cy='6' r='4.3' fill='%23" + HEX[gi % 8].slice(1) + "'/%3E%3C/svg%3E\") 6 6, pointer";
    var cs = document.createElement("style");
    cs.textContent = "@media (hover: hover) and (pointer: fine) { a[href], button:not(:disabled), [role=\"button\"], summary, label[for], .tile, .row a:not(.soon), .cc-highlight, .cc-sidebar-link, .cc-index-btn { cursor: " + dot + " !important; } }";
    document.head.appendChild(cs);
  }

  // Subscribe steps to the next print colour each time it's pointed at
  var sub = document.querySelector(".cc-top-sub");
  if (sub) {
    var k = gi > -1 ? gi % 8 : 0;
    sub.addEventListener("mouseenter", function () { k = (k + 1) % 8; sub.style.setProperty("--sub", HEX[k]); });
  }

  // The Contents tracker fills down its track as you read through the interview
  var track = document.querySelector(".cc-sidebar-track"), article = document.querySelector(".cc-article");
  if (track && article) {
    var fillTick = 0;
    var fill = function () {
      fillTick = 0;
      var r = article.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight * .6);
      var p = Math.min(1, Math.max(0, (innerHeight * .3 - r.top) / span));
      track.style.setProperty("--fill", (p * track.clientHeight).toFixed(1) + "px");
    };
    addEventListener("scroll", function () { if (!fillTick) fillTick = requestAnimationFrame(fill); }, { passive: true });
    addEventListener("resize", fill); fill();
  }

  // Index: opens a vertical list under the word; a choice, a click elsewhere or Escape closes it
  var ib = document.querySelector(".cc-index-btn"), im = document.getElementById("cc-index-menu");
  if (ib && im) {
    var top = ib.closest(".cc-top"), closing = 0;
    [].forEach.call(im.querySelectorAll("a"), function (a, k) { a.style.setProperty("--k", k); });
    var setOpen = function (o) {
      clearTimeout(closing); ib.setAttribute("aria-expanded", o ? "true" : "false");
      if (o) { im.hidden = false; void im.offsetHeight; top.classList.add("open"); }
      else { top.classList.remove("open"); closing = setTimeout(function () { im.hidden = true; }, 300); }
    };
    ib.addEventListener("click", function (e) { e.stopPropagation(); setOpen(ib.getAttribute("aria-expanded") !== "true"); });
    im.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("click", function (e) { if (ib.getAttribute("aria-expanded") === "true" && !e.target.closest(".cc-index-menu")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && ib.getAttribute("aria-expanded") === "true") { setOpen(false); ib.focus(); } });
  }

  // A link like /interviews/x/#q=<passage> scrolls to that passage and marks just the quote in magenta; after a few seconds the mark fades away
  var m = /^#q=([^:]+)/.exec(location.hash); if (!m) return;
  var q; try { q = decodeURIComponent(m[1]); } catch (e) { return; }
  var normCh = function (c) { return /\s/.test(c) ? " " : c.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').toLowerCase(); };
  var full = q.replace(/\s+/g, " ").trim(), want = full.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').toLowerCase();
  var nodes = document.querySelectorAll("main p, main blockquote, main li, main .cc-hot-take-a, main figcaption, .cc-article-intro, .cc-article p");
  var hit = null, map = null, text = "", at = -1;
  for (var i = 0; i < nodes.length && !hit; i++) {
    // Walk the text nodes, collapsing whitespace and straightening quotes so the passage matches however it is marked up
    var tw = document.createTreeWalker(nodes[i], NodeFilter.SHOW_TEXT), t, mp = [], tx = "";
    while ((t = tw.nextNode())) for (var k = 0; k < t.data.length; k++) { var c = normCh(t.data[k]); if (c === " " && (tx === "" || tx.slice(-1) === " ")) continue; tx += c; mp.push([t, k]); }
    var p = tx.indexOf(want); if (p === -1) p = tx.indexOf(want.slice(0, 60));
    if (p !== -1) { hit = nodes[i]; map = mp; text = tx; at = p; }
  }
  if (!hit) return;
  var end = Math.min(at + want.length, map.length), marks = [];
  // Wrap only the quoted words, one span per text node they run through
  for (var j = end - 1; j >= at; ) {
    var node = map[j][0], hi = map[j][1], lo = hi, jj = j;
    while (jj - 1 >= at && map[jj - 1][0] === node) { jj--; lo = Math.min(lo, map[jj][1]); }
    var r = document.createRange(); r.setStart(node, lo); r.setEnd(node, hi + 1);
    var sp = document.createElement("span"); sp.className = "cc-jump"; r.surroundContents(sp); marks.push(sp);
    j = jj - 1;
  }
  setTimeout(function () { (marks[marks.length - 1] || hit).scrollIntoView({ block: "center", behavior: "smooth" }); }, 50);
  setTimeout(function () { marks.forEach(function (n) { n.classList.add("is-fading"); }); }, 3500);
})();
