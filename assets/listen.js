// Listen: turns <div class="cc-listen" data-src="…mp3" data-duration="seconds"> into a small player with play/pause, a progress line and a speed switch (1×, 1.25×, 1.5×, 2×)
(function () {
  var SPEEDS = [1, 1.25, 1.5, 2];
  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (x < 10 ? "0" : "") + x;
  }
  function label(r) { return String(r).replace(/^0/, "") + "×"; }
  function saved() { try { var v = parseFloat(localStorage.getItem("cc-listen-speed")); return SPEEDS.indexOf(v) > -1 ? v : 1; } catch (e) { return 1; } }
  function save(v) { try { localStorage.setItem("cc-listen-speed", String(v)); } catch (e) {} }

  Array.prototype.forEach.call(document.querySelectorAll(".cc-listen[data-src]"), function (box) {
    var total = parseFloat(box.getAttribute("data-duration")) || 0;
    var audio = new Audio();
    audio.preload = "none";
    audio.src = box.getAttribute("data-src");
    var rate = saved();

    box.innerHTML =
      '<button class="cc-listen-play" type="button" aria-label="Listen to this interview"><span class="cc-listen-icon" aria-hidden="true"></span><span class="cc-listen-word">Listen</span></button>' +
      '<span class="cc-listen-len">' + (total ? Math.max(1, Math.round(total / 60)) + " min" : "") + '</span>' +
      '<span class="cc-listen-track"><input class="cc-listen-bar" type="range" min="0" max="1000" step="1" value="0" aria-label="Seek" /><span class="cc-listen-time">0:00 / ' + fmt(total) + '</span></span>' +
      '<button class="cc-listen-speed" type="button" aria-label="Playback speed">' + label(rate) + '</button>';

    var play = box.querySelector(".cc-listen-play"), word = box.querySelector(".cc-listen-word");
    var bar = box.querySelector(".cc-listen-bar"), time = box.querySelector(".cc-listen-time"), speed = box.querySelector(".cc-listen-speed");
    var seeking = false;

    function dur() { return isFinite(audio.duration) && audio.duration > 0 ? audio.duration : total; }
    function paint() {
      var d = dur(), p = d ? audio.currentTime / d : 0;
      if (!seeking) bar.value = Math.round(p * 1000);
      bar.style.setProperty("--p", (bar.value / 10) + "%");
      time.textContent = fmt(audio.currentTime) + " / " + fmt(d);
    }
    function setRate(r) { rate = r; audio.playbackRate = r; audio.defaultPlaybackRate = r; speed.textContent = label(r); save(r); }

    play.addEventListener("click", function () {
      if (audio.paused) {
        box.classList.add("is-started");
        audio.playbackRate = rate;
        var pr = audio.play();
        if (pr && pr.catch) pr.catch(function () {});
      } else audio.pause();
    });
    speed.addEventListener("click", function () { setRate(SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length]); });
    bar.addEventListener("input", function () {
      seeking = true;
      var d = dur();
      bar.style.setProperty("--p", (bar.value / 10) + "%");
      if (d) time.textContent = fmt(bar.value / 1000 * d) + " / " + fmt(d);
    });
    bar.addEventListener("change", function () {
      var d = dur();
      if (d) audio.currentTime = bar.value / 1000 * d;
      seeking = false;
    });
    audio.addEventListener("play", function () {
      box.classList.add("is-playing"); word.textContent = "Pause"; play.setAttribute("aria-label", "Pause");
      audio.playbackRate = rate;
      if ("mediaSession" in navigator && window.MediaMetadata) {
        try {
          var t = document.querySelector(".cc-article-title"), who = document.querySelector('meta[name="cc-person"]');
          navigator.mediaSession.metadata = new MediaMetadata({ title: t ? t.textContent.trim() : document.title, artist: who ? who.content : "", album: "Creative Conviction" });
        } catch (e) {}
      }
    });
    audio.addEventListener("pause", function () { box.classList.remove("is-playing"); word.textContent = "Listen"; play.setAttribute("aria-label", "Listen to this interview"); });
    audio.addEventListener("ended", function () { audio.currentTime = 0; paint(); });
    audio.addEventListener("timeupdate", paint);
    audio.addEventListener("loadedmetadata", paint);
    audio.addEventListener("ratechange", function () { if (audio.playbackRate !== rate) audio.playbackRate = rate; });
  });
})();
