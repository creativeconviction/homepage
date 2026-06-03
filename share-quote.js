// Highlight-to-share — Creative Conviction
(function () {
  'use strict';

  var CARD_W = 1200, CARD_H = 1200;
  var PAD = 96;
  var BG = '#F7F5FA';
  var INK = '#1A1130';
  var MAGENTA = '#D8016A';
  var INDIGO = '#361C76';
  var SERIF = '"EB Garamond", "Iowan Old Style", Charter, Georgia, serif';
  var SANS  = '"Inter", ui-sans-serif, system-ui, sans-serif';

  function getMeta(name) {
    var el = document.querySelector('meta[name="' + name + '"]');
    return el ? el.getAttribute('content') : '';
  }
  var PERSON = getMeta('cc-person');
  var ROLE   = getMeta('cc-role');

  var X_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.621 5.905-5.621Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/></svg>';
  var LI_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';
  var DL_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

  // ── Styles ─────────────────────────────────────────────────────────────────
  var css = [
    '#cc-qtip{position:fixed;display:flex;align-items:center;gap:2px;background:#1A1130;border-radius:7px;padding:5px 7px;z-index:9999;opacity:0;pointer-events:none;transform:translateY(5px);transition:opacity 130ms ease,transform 130ms ease;box-shadow:0 4px 20px rgba(26,17,48,.22);}',
    '#cc-qtip.is-on{opacity:1;pointer-events:auto;transform:translateY(0);}',
    '#cc-qtip::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#1A1130;}',
    '.cc-qtip-label{font-family:' + SANS + ';font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.42);padding:0 5px 0 3px;user-select:none;}',
    '.cc-qtip-sep{width:1px;height:14px;background:rgba(255,255,255,.14);margin:0 2px;}',
    '.cc-qtip-btn{background:none;border:none;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:5px;transition:background 90ms ease;}',
    '.cc-qtip-btn:hover{background:rgba(255,255,255,.11);}',

    '#cc-overlay{position:fixed;inset:0;background:rgba(26,17,48,.52);backdrop-filter:blur(6px);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 200ms ease;}',
    '#cc-overlay.is-on{opacity:1;pointer-events:auto;}',
    '#cc-modal{background:#F7F5FA;border-radius:16px;padding:28px;width:min(520px,calc(100vw - 40px));box-shadow:0 28px 72px rgba(26,17,48,.30);transform:translateY(14px) scale(.975);transition:transform 220ms ease;position:relative;}',
    '#cc-overlay.is-on #cc-modal{transform:translateY(0) scale(1);}',
    '#cc-modal-close{position:absolute;top:14px;right:14px;background:rgba(26,17,48,.08);border:none;cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#1A1130;font-size:17px;line-height:1;transition:background 90ms ease;}',
    '#cc-modal-close:hover{background:rgba(26,17,48,.14);}',
    '#cc-preview{width:100%;aspect-ratio:1;border-radius:10px;display:block;margin-bottom:20px;box-shadow:0 2px 18px rgba(26,17,48,.12);}',
    '#cc-actions{display:flex;gap:10px;flex-wrap:wrap;}',
    '.cc-act{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;border-radius:8px;border:none;cursor:pointer;font-family:' + SANS + ';font-size:13px;font-weight:500;transition:opacity 100ms ease,transform 80ms ease;}',
    '.cc-act:hover{opacity:.82;}',
    '.cc-act:active{transform:scale(.97);}',
    '.cc-act-dl{background:rgba(26,17,48,.08);color:#1A1130;}',
    '.cc-act-x{background:#000;color:#fff;}',
    '.cc-act-li{background:#0A66C2;color:#fff;}',

    '#cc-toast{position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(10px);background:#1A1130;color:#fff;font-family:' + SANS + ';font-size:13px;font-weight:500;padding:10px 18px;border-radius:8px;z-index:11000;opacity:0;pointer-events:none;transition:opacity 200ms ease,transform 200ms ease;white-space:nowrap;}',
    '#cc-toast.is-on{opacity:1;transform:translateX(-50%) translateY(0);}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Tooltip ────────────────────────────────────────────────────────────────
  var tip = document.createElement('div');
  tip.id = 'cc-qtip';
  tip.setAttribute('role', 'toolbar');
  tip.setAttribute('aria-label', 'Share quote');
  tip.innerHTML =
    '<span class="cc-qtip-label">Share</span>' +
    '<div class="cc-qtip-sep"></div>' +
    '<button class="cc-qtip-btn" data-p="x"  title="Share on X">' + X_SVG + '</button>' +
    '<button class="cc-qtip-btn" data-p="li" title="Share on LinkedIn">' + LI_SVG + '</button>';
  document.body.appendChild(tip);

  // ── Modal ──────────────────────────────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.id = 'cc-overlay';
  overlay.innerHTML =
    '<div id="cc-modal">' +
      '<button id="cc-modal-close" aria-label="Close">×</button>' +
      '<img id="cc-preview" alt="Quote card preview" />' +
      '<div id="cc-actions">' +
        '<button class="cc-act cc-act-dl" id="cc-dl">' + DL_SVG + ' Download</button>' +
        '<button class="cc-act cc-act-x"  id="cc-x">'  + X_SVG  + ' Post on X</button>' +
        '<button class="cc-act cc-act-li" id="cc-li">' + LI_SVG + ' Post on LinkedIn</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  // ── Toast ──────────────────────────────────────────────────────────────────
  var toast = document.createElement('div');
  toast.id = 'cc-toast';
  document.body.appendChild(toast);
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 3200);
  }

  // ── State ──────────────────────────────────────────────────────────────────
  var pending = '';
  var currentDataUrl = '';
  var hideTimer;

  // ── Selection ──────────────────────────────────────────────────────────────
  function placeTip(rect) {
    var w = tip.offsetWidth || 130;
    var left = rect.left + rect.width / 2 - w / 2;
    var top  = rect.top - tip.offsetHeight - 10;
    if (left < 8) left = 8;
    if (top  < 8) top  = rect.bottom + 10;
    tip.style.left = Math.round(left) + 'px';
    tip.style.top  = Math.round(top)  + 'px';
  }

  document.addEventListener('mouseup', function (e) {
    if (tip.contains(e.target) || overlay.contains(e.target)) return;
    clearTimeout(hideTimer);
    setTimeout(function () {
      var sel  = window.getSelection();
      var text = sel ? sel.toString().trim() : '';
      if (text.length < 10) { hideTip(); return; }
      var article = document.querySelector('.cc-article');
      if (!article || !article.contains(sel.anchorNode)) { hideTip(); return; }
      pending = text;
      placeTip(sel.getRangeAt(0).getBoundingClientRect());
      tip.classList.add('is-on');
    }, 10);
  });

  document.addEventListener('selectionchange', function () {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed) hideTimer = setTimeout(hideTip, 260);
  });

  function hideTip() { tip.classList.remove('is-on'); }
  tip.addEventListener('mousedown', function (e) { e.preventDefault(); });

  // ── Tooltip → open modal ───────────────────────────────────────────────────
  tip.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-p]');
    if (!btn || !pending) return;
    openModal(pending, btn.getAttribute('data-p'));
  });

  function openModal(text, focusBtn) {
    document.fonts.ready.then(function () {
      currentDataUrl = buildCard(text);
      document.getElementById('cc-preview').src = currentDataUrl;
      overlay.classList.add('is-on');
      var target = focusBtn === 'x' ? document.getElementById('cc-x') : document.getElementById('cc-li');
      if (target) target.focus();
    });
  }

  function closeModal() { overlay.classList.remove('is-on'); }

  document.getElementById('cc-modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

  // ── Action buttons ─────────────────────────────────────────────────────────
  document.getElementById('cc-dl').addEventListener('click', function () {
    downloadPng(currentDataUrl);
    showToast('Image downloaded');
  });

  document.getElementById('cc-x').addEventListener('click', function () {
    doShare('x');
  });

  document.getElementById('cc-li').addEventListener('click', function () {
    doShare('li');
  });

  function doShare(platform) {
    // Copy image first, then open the share dialog
    copyToClipboard(currentDataUrl).then(function (ok) {
      if (ok) {
        showToast('Image copied — paste it into your post (Cmd+V / Ctrl+V)');
      } else {
        // Clipboard blocked (e.g. local file). Download instead.
        downloadPng(currentDataUrl);
        showToast('Image saved — attach it to your post');
      }
    });

    var href = window.location.href;
    var isLocal = href.startsWith('file://');
    var pageUrl = isLocal ? 'https://creativeconviction.github.io/homepage/' : href;
    var tweet = encodeURIComponent('“' + pending + '”\n\n— Creative Conviction\n' + pageUrl);

    setTimeout(function () {
      if (platform === 'x') {
        window.open('https://twitter.com/intent/tweet?text=' + tweet, '_blank');
      } else {
        window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(pageUrl), '_blank');
      }
    }, 120);
  }

  function copyToClipboard(dataUrl) {
    return fetch(dataUrl)
      .then(function (r) { return r.blob(); })
      .then(function (blob) {
        return navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      })
      .then(function () { return true; })
      .catch(function () { return false; });
  }

  // ── Card generation ────────────────────────────────────────────────────────
  function buildCard(text) {
    var cv = document.createElement('canvas');
    cv.width  = CARD_W;
    cv.height = CARD_H;
    var ctx = cv.getContext('2d');

    // Background + border
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.strokeStyle = 'rgba(26,17,48,.07)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, CARD_W - 2, CARD_H - 2);

    // Opening curly quote
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign    = 'left';
    ctx.fillStyle    = INDIGO;
    ctx.font         = '180px ' + SERIF;
    ctx.fillText('“', PAD - 6, PAD + 130);

    // Quote text (adaptive size)
    ctx.fillStyle = INK;
    var maxW       = CARD_W - PAD * 2;
    var attrH      = PERSON ? 150 : 0;
    var maxTextH   = CARD_H - PAD * 2 - 260 - attrH;
    var sz         = pickSize(ctx, text, maxW, maxTextH);
    ctx.font       = sz + 'px ' + SERIF;
    var lineH      = Math.round(sz * 1.44);
    var lines      = wrapText(ctx, text, maxW);
    var y          = PAD + 222;
    lines.forEach(function (l, i) { ctx.fillText(l, PAD, y + i * lineH); });

    // Attribution — name + role, no rule
    if (PERSON) {
      var attrY = CARD_H - PAD - 80;
      ctx.fillStyle = INK;
      ctx.font      = '500 28px ' + SANS;
      ctx.fillText(PERSON, PAD, attrY);

      if (ROLE) {
        ctx.fillStyle = 'rgba(26,17,48,.48)';
        ctx.font      = '22px ' + SANS;
        ctx.fillText(ROLE, PAD, attrY + 38);
      }
    }

    // Logo bottom right: Creative Conviction
    var lsz = 30;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign    = 'left';
    ctx.font         = lsz + 'px ' + SERIF;
    var cw           = ctx.measureText('Creative ').width;
    ctx.font         = 'italic ' + lsz + 'px ' + SERIF;
    var kw           = ctx.measureText('Conviction').width;
    var lx           = CARD_W - PAD - cw - kw;
    var ly           = CARD_H - PAD;
    ctx.font         = lsz + 'px ' + SERIF;
    ctx.fillStyle    = INK;
    ctx.fillText('Creative ', lx, ly);
    ctx.font         = 'italic ' + lsz + 'px ' + SERIF;
    ctx.fillStyle    = MAGENTA;
    ctx.fillText('Conviction', lx + cw, ly);

    return cv.toDataURL('image/png');
  }

  function pickSize(ctx, text, maxW, maxH) {
    var sizes = [58, 50, 44, 38, 32, 26];
    for (var i = 0; i < sizes.length; i++) {
      var sz = sizes[i];
      ctx.font   = sz + 'px ' + SERIF;
      var totalH = wrapText(ctx, text, maxW).length * Math.round(sz * 1.44);
      if (totalH <= maxH) return sz;
    }
    return 22;
  }

  function wrapText(ctx, text, maxW) {
    var words = text.split(' ');
    var lines = [];
    var line  = '';
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  function downloadPng(dataUrl) {
    var a      = document.createElement('a');
    a.href     = dataUrl;
    a.download = 'creative-conviction-quote.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
})();
