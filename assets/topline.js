// Background switch (soft purple by default, or white), remembered per browser; and the jump-to-quote highlight
(function () {
  var root = document.documentElement, key = "cc-bg";
  function setBg(v) { root.setAttribute("data-bg", v); try { localStorage.setItem(key, v); } catch (e) {} }
  // "cc-bg-v" marks the one-time reset that moved the default from white to soft purple
  var saved = null; try { if (localStorage.getItem("cc-bg-v") !== "2") { localStorage.removeItem(key); localStorage.setItem("cc-bg-v", "2"); } saved = localStorage.getItem(key); } catch (e) {}
  setBg(saved || "paper");
  var btn = document.querySelector(".cc-bg"); if (btn) btn.addEventListener("click", function () { setBg(root.getAttribute("data-bg") === "paper" ? "white" : "paper"); });

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
