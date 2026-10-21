// Background switch (soft purple by default, or white), remembered per browser; and the jump-to-quote highlight
(function () {
  var root = document.documentElement, key = "cc-bg";
  function setBg(v) { root.setAttribute("data-bg", v); try { localStorage.setItem(key, v); } catch (e) {} }
  // "cc-bg-v" marks the one-time reset that moved the default from white to soft purple
  var saved = null; try { if (localStorage.getItem("cc-bg-v") !== "2") { localStorage.removeItem(key); localStorage.setItem("cc-bg-v", "2"); } saved = localStorage.getItem(key); } catch (e) {}
  setBg(saved || "paper");
  var btn = document.querySelector(".cc-bg"); if (btn) btn.addEventListener("click", function () { setBg(root.getAttribute("data-bg") === "paper" ? "white" : "paper"); });

  // A link like /interviews/x/#q=<passage> scrolls to that passage and marks it in magenta; the mark fades a second after the reader moves
  var m = /^#q=([^:]+)/.exec(location.hash); if (!m) return;
  var q; try { q = decodeURIComponent(m[1]); } catch (e) { return; }
  var norm = function (s) { return s.replace(/\s+/g, " ").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').trim().toLowerCase(); };
  var want = norm(q).slice(0, 60), hit = null;
  var nodes = document.querySelectorAll("main p, main blockquote, main li, main .cc-hot-take-a, main figcaption, .cc-article-intro, .cc-article p");
  for (var i = 0; i < nodes.length && !hit; i++) if (norm(nodes[i].textContent).indexOf(want) !== -1) hit = nodes[i];
  if (!hit) return;
  hit.classList.add("cc-jump");
  setTimeout(function () { hit.scrollIntoView({ block: "center", behavior: "smooth" }); }, 50);
  var done = false;
  function go() { if (done) return; done = true; setTimeout(function () { hit.classList.add("is-fading"); }, 1000); }
  setTimeout(function () { addEventListener("mousemove", go, { once: true, passive: true }); addEventListener("touchstart", go, { once: true, passive: true }); addEventListener("keydown", go, { once: true, passive: true }); }, 700);
})();
