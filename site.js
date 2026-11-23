/* Dealgrade site prototype: what every page shares (header, menu, footer, reveals, small helpers). */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var ARROW = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>';
  var LABELS = {A:'Well below market value', B:'Below market value', C:'At market value', D:'Above market value', F:'Well above market value'};
  var money = function(v){
    if(v == null || isNaN(v)) return '';
    if(v >= 1e9) return 'AED ' + (v / 1e9).toFixed(1) + 'B';
    if(v >= 1e6) return 'AED ' + (v / 1e6).toFixed(2) + 'M';
    if(v >= 1e3) return 'AED ' + Math.round(v / 1e3) + 'K';
    return 'AED ' + Math.round(v);
  };
  var parseMoney = function(s){
    var m = /AED ([\d.,]+)([KMB]?)/.exec(s || ''); if(!m) return null;
    return parseFloat(m[1].replace(/,/g, '')) * ({'':1, K:1e3, M:1e6, B:1e9}[m[2]]);
  };
  var PF = 'https://new-projects-media.propertyfinder.com/project/';

  var page = document.body.dataset.page || '';
  var NAV = [
    ['valuate', 'valuate.html', 'Valuation', 'What a home is worth'],
    ['listings', 'listings.html', 'Listings', 'Homes for sale by their owners'],
    ['projects', 'projects.html', 'New projects', 'Off-plan launches from developers'],
    ['map', 'map.html', 'Map', 'Prices in each community'],
    ['prices', 'prices.html', 'Prices', 'How prices have moved'],
    ['legal', 'legal.html', 'Legal', 'Law, fees and procedures']
  ];

  /* header, phone menu, footer */
  /* PREVIEW marks every page as a review copy. Set it to false when the pages go live on Dealgrade's own site. */
  var PREVIEW = true;
  var STRIP = '<div class="pv-strip"><b>Design preview for the Dealgrade team.</b><span>This is not the live site, and nothing you type here is sent.</span></div>';
  if(PREVIEW) document.documentElement.classList.add('pv');

  var head = $('#head');
  if(head){
    head.className = 'head' + (head.dataset.solid != null ? ' solid' : '');
    head.innerHTML = (PREVIEW ? STRIP : '') + '<div class="wrap"><a class="brand" href="index.html" aria-label="Dealgrade, home"><span class="wm"></span></a>'
      + '<nav class="nav" aria-label="Dealgrade">' + NAV.map(function(n){ return '<a href="' + n[1] + '"' + (n[0] === page ? ' aria-current="page"' : '') + '>' + n[2] + '</a>'; }).join('') + '</nav>'
      + '<div class="head-r"><a class="signin" href="login.html" data-ev="sign_in" data-at="header">Sign in</a><a class="btn btn-solid btn-sm" href="valuate.html" data-ev="value_home" data-at="header">Value a home</a>'
      + '<button class="burger" type="button" aria-label="Open the menu" aria-expanded="false" aria-controls="menu"><span><i></i><i></i></span></button></div></div>';
    var menu = document.createElement('div');
    menu.className = 'menu'; menu.id = 'menu';
    menu.innerHTML = '<nav aria-label="Dealgrade, all pages">' + NAV.map(function(n, i){ return '<a href="' + n[1] + '" style="--i:' + i + '"' + (n[0] === page ? ' aria-current="page"' : '') + '>' + (n[0] === 'legal' ? 'Legal guide' : n[2]) + '<span>' + n[3] + '</span></a>'; }).join('') + '</nav>'
      + '<div class="menu-foot"><a class="btn btn-solid" href="valuate.html" data-ev="value_home" data-at="menu">Value a home ' + ARROW + '</a><a class="btn btn-line" href="login.html" data-ev="sign_in" data-at="menu">Sign in</a><a class="btn btn-line" href="signup.html" data-ev="create_account" data-at="menu">Create your account</a></div>';
    head.after(menu);
    var burger = $('.burger', head);
    var setMenu = function(open){
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close the menu' : 'Open the menu');
    };
    burger.addEventListener('click', function(){ setMenu(!document.body.classList.contains('menu-open')); });
    addEventListener('keydown', function(e){ if(e.key === 'Escape') setMenu(false); });
    matchMedia('(min-width:1101px)').addEventListener('change', function(){ setMenu(false); });
    var onScroll = function(){ head.classList.toggle('scrolled', scrollY > 24); };
    addEventListener('scroll', onScroll, {passive:true}); onScroll();
  }
  var foot = $('#foot');
  if(foot){
    foot.innerHTML = '<div class="wrap"><div class="ft"><a class="brand" href="index.html" aria-label="Dealgrade, home"><span class="wm"></span></a>'
      + '<nav aria-label="All pages"><a href="valuate.html">Valuation</a><a href="listings.html">Listings</a><a href="projects.html">New projects</a><a href="listings.html#distress">Distress sales</a><a href="signup.html?next=sell">List a property</a><a href="map.html">Map</a><a href="prices.html">Prices</a><a href="legal.html">Legal guide</a><a href="login.html">Sign in</a><a href="signup.html">Create your account</a></nav></div>'
      + '<p class="fine">Statistical estimates from Dubai Land Department transactions, not a certified valuation. Sales data runs to 7 July 2026. Project details are as published on Property Finder\'s new-projects pages, and the valuations are Dealgrade\'s own.</p>'
      + '<p class="fine">© Dealgrade 2026 · Dubai, UAE</p></div>';
  }

  /* headline words */
  var split = function(el){
    if(el.__split) return; el.__split = true;
    var i = 0, out = document.createDocumentFragment();
    $$('*', el).length; // keep live
    Array.prototype.slice.call(el.childNodes).forEach(function(n){
      if(n.nodeType === 3){
        n.textContent.split(/(\s+)/).forEach(function(t){
          if(!t) return;
          if(/^\s+$/.test(t)){ out.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          var s = document.createElement('span'); s.style.setProperty('--i', i++); s.textContent = t;
          w.appendChild(s); out.appendChild(w);
        });
      } else {
        var w = document.createElement('span'); w.className = 'w';
        var s = document.createElement('span'); s.style.setProperty('--i', i++); s.appendChild(n.cloneNode(true));
        w.appendChild(s); out.appendChild(w);
      }
    });
    el.textContent = ''; el.appendChild(out);
  };

  /* reveal on scroll; anything in the first screen shows at once */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ show(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -5% 0px'}) : null;
  function show(el){ if(el.classList.contains('in')) return; el.classList.add('in'); if(io) io.unobserve(el); if(el.__in) el.__in(); }
  function watch(root){
    $$('[data-split]', root).forEach(split);
    if(doorIO) $$('.door', root).forEach(function(d){ if(!d.__seen){ d.__seen = true; doorIO.observe(d); } });
    $$('[data-reveal],[data-split]', root).forEach(function(el){
      if(el.classList.contains('in')) return;
      var r = el.getBoundingClientRect();
      if(!io || reduce || (r.top < innerHeight && r.bottom > 0)) setTimeout(function(){ show(el); }, 60); else io.observe(el);
    });
  }

  /* count up */
  var countFmt = function(v, el){
    var dec = +(el.dataset.dec || 0), s = el.dataset.sep ? Math.round(v).toLocaleString('en-US') : v.toFixed(dec);
    return (el.dataset.prefix || '') + s + (el.dataset.suffix || '');
  };
  function counts(root){
    $$('[data-count]', root).forEach(function(el){
      var box = el.closest('[data-reveal]') || el, to = +el.dataset.count;
      box.__in = function(){
        if(reduce) return;
        var t0 = performance.now(), dur = 1400;
        (function tick(now){
          var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
          el.textContent = countFmt(to * e, el);
          if(p < 1) requestAnimationFrame(tick); else el.textContent = countFmt(to, el);
        })(t0);
      };
    });
  }

  /* price index chart, used on the home and prices pages */
  function indexChart(svg, d){
    var W = 800, H = 380, l = 36, r = 14, t = 16, b = 34, n = d.length;
    var max = Math.max.apply(null, d.map(function(p){ return p.hi || p.v; })), y1 = Math.ceil((max + 6) / 20) * 20, y0 = 0;
    var min = Math.min.apply(null, d.map(function(p){ return p.lo || p.v; })); y0 = Math.max(0, Math.floor((min - 8) / 20) * 20);
    var X = function(i){ return l + i / (n - 1) * (W - l - r); };
    var Y = function(v){ return t + (1 - (v - y0) / (y1 - y0)) * (H - t - b); };
    var cut = 0; d.forEach(function(p, i){ if(!p.f) cut = i; });
    var path = function(a, off){ return a.map(function(p, i){ return (i ? 'L' : 'M') + X(i + off).toFixed(1) + ' ' + Y(p.v).toFixed(1); }).join(''); };
    var s = '<g class="grid">';
    for(var v = y0 + 20; v < y1; v += 20) s += '<line x1="' + l + '" x2="' + (W - r) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text x="0" y="' + (Y(v) + 4) + '">' + v + '</text>';
    s += '</g>';
    var first = +d[0].q.slice(0, 4), every = n > 95 ? 6 : 4;
    d.forEach(function(p, i){ var y = +p.q.slice(0, 4); if(/Q1$/.test(p.q) && (y - first) % every === (every === 6 ? 2 : 1)) s += '<text x="' + X(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + y + '</text>'; });
    var fc = d.slice(cut);
    var band = fc.map(function(p, i){ return (i ? 'L' : 'M') + X(cut + i) + ' ' + Y(p.hi == null ? p.v : p.hi); }).join('') + fc.slice().reverse().map(function(p, i){ return 'L' + X(cut + fc.length - 1 - i) + ' ' + Y(p.lo == null ? p.v : p.lo); }).join('') + 'Z';
    s += '<path class="band" d="' + band + '"/><path class="fc" d="' + path(fc, cut) + '"/>';
    s += '<path class="line" pathLength="1" d="' + path(d.slice(0, cut + 1), 0) + '"/>';
    s += '<circle class="dot" cx="' + X(cut) + '" cy="' + Y(d[cut].v) + '" r="5.5"/>';
    s += '<text class="dot-l" x="' + (X(cut) - 12) + '" y="' + (Y(d[cut].v) - 14) + '" text-anchor="end">Q2 2026 = 100</text>';
    s += '<text x="' + (W - r) + '" y="' + (Y(fc[fc.length - 1].hi || d[cut].v) - 8) + '" text-anchor="end">forecast to 2027</text>';
    svg.innerHTML = s;
  }

  /* a number box must not change when the page is scrolled with the mouse over it */
  document.addEventListener('wheel', function(e){
    var t = e.target; if(t && t.type === 'number' && document.activeElement === t) t.blur();
  }, {passive:true});

  /* Measuring. Every click on a link or a button is reported once, with its name and the part of the page it sits in.
     Events go to window.dataLayer, the list that Google Tag Manager and Google Analytics 4 read, so installing either
     one is enough to start counting. The campaign words in the address (utm_source and the rest) are kept for the visit
     and travel with every event, so a sign-up can be traced to the post that brought it.
     Add ?track=1 to any address to see the events as they fire. */
  var SRC = (function(){
    var q = new URLSearchParams(location.search), o = {}, has = false;
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){ var v = q.get(k); if(v){ o[k] = v.slice(0, 80); has = true; } });
    try { if(has) sessionStorage.setItem('dg_src', JSON.stringify(o)); else o = JSON.parse(sessionStorage.getItem('dg_src') || '{}'); } catch(e) {}
    return o;
  })();
  function track(name, data){
    var ev = {event: name}, k;
    for(k in SRC) ev[k] = SRC[k];
    for(k in (data || {})) if(data[k] !== '' && data[k] != null) ev[k] = data[k];
    (window.dataLayer = window.dataLayer || []).push(ev);
    document.dispatchEvent(new CustomEvent('dg:track', {detail: ev}));
  }
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('a,button'); if(!el) return;
    var sec = el.closest('section[id],.head,.menu,.dock,footer'), named = el.dataset.ev;
    track(named || 'click', {
      at: el.dataset.at || (sec ? (sec.id || sec.className.split(' ')[0] || sec.tagName.toLowerCase()) : ''),
      label: named ? '' : (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
      to: el.getAttribute('href') || ''
    });
  }, true);
  (function(){
    var on = false;
    try { if(new URLSearchParams(location.search).has('track')) sessionStorage.setItem('dg_tracklog', '1'); on = sessionStorage.getItem('dg_tracklog') === '1'; } catch(e) {}
    if(!on) return;
    var box = document.createElement('div'); box.className = 'tracklog'; box.innerHTML = '<b>Counted on this visit</b>';
    document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(box); });
    if(document.readyState !== 'loading') document.body.appendChild(box);
    document.addEventListener('dg:track', function(e){
      var d = e.detail, row = document.createElement('div'), extra = [];
      for(var k in d) if(k !== 'event') extra.push(k + ': ' + d[k]);
      row.textContent = d.event + (extra.length ? ' (' + extra.join(', ') + ')' : '');
      box.insertBefore(row, box.children[1] || null);
    });
  })();

  /* The account door. One control, the same on every page: the reason, an email box, then a 6-digit code.
     Whoever gives the code has an account, and the page lets them through. In this preview nothing is sent: any six
     digits pass, and "member" is remembered for the visit so the open pages can be seen. Add ?member=0 to an address
     to be a visitor again. On the live site "member" is Dealgrade's own session. */
  var member = false, doorN = 0;
  try {
    if(new URLSearchParams(location.search).get('member') === '0') sessionStorage.setItem('dg_member', '0');
    member = sessionStorage.getItem('dg_member') === '1';
  } catch(e) {}
  function door(o){
    var id = 'door' + (++doorN);
    return '<div class="door" data-next="' + esc(o.next) + '"' + (o.go ? ' data-go="' + esc(o.go) + '"' : '') + '>'
      + '<h2 class="h3">' + esc(o.title) + '</h2>' + (o.line ? '<p class="door-line">' + esc(o.line) + '</p>' : '')
      + '<form class="door-email" novalidate><label class="sr" for="' + id + 'e">Email</label><div class="row"><input class="input" id="' + id + 'e" type="email" name="email" placeholder="you@example.com" autocomplete="email" required><button class="btn btn-solid" type="submit">Send me a code</button></div></form>'
      + '<form class="door-code" novalidate hidden><label class="door-lab" for="' + id + 'c">Enter the code we sent you</label><div class="row"><input class="input num" id="' + id + 'c" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 digits" required><button class="btn btn-solid" type="submit">Continue</button></div>' + (PREVIEW ? '<small>In this preview no email is sent. Any six digits let you in.</small>' : '') + '</form>'
      + '<p class="door-fine">Free account. No phone number asked. <a href="login.html?next=' + encodeURIComponent(o.next) + '" data-ev="sign_in" data-at="door">I have an account</a></p></div>';
  }
  document.addEventListener('submit', function(e){
    var f = e.target, d = f.closest && f.closest('.door'); if(!d) return;
    e.preventDefault();
    if(f.classList.contains('door-email')){
      var em = f.elements.email;
      if(!em.value.trim() || !em.checkValidity()){ em.setAttribute('aria-invalid', 'true'); em.focus(); return; }
      var c = $('.door-code', d);
      $('.door-lab', c).textContent = 'Enter the code we sent to ' + em.value.trim();
      f.hidden = true; c.hidden = false;
      if(!reduce && c.animate) c.animate([{opacity: 0, transform: 'translateY(8px)'}, {opacity: 1, transform: 'none'}], {duration: 280, easing: EASE});
      c.elements.code.focus({preventScroll: true});
      track('sign_up_started', {at: d.dataset.next, method: 'email_code'});
    } else {
      var code = f.elements.code;
      if(!/^\d{6}$/.test(code.value.trim())){ code.setAttribute('aria-invalid', 'true'); code.focus(); return; }
      track('sign_up', {at: d.dataset.next, method: 'email_code'});
      try { sessionStorage.setItem('dg_member', '1'); } catch(err) {}
      if(d.dataset.go) location.href = d.dataset.go; else location.reload();
    }
  });
  /* a door is counted once, when it comes into view */
  var doorIO = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(en){ if(en.isIntersecting){ doorIO.unobserve(en.target); track('gate_shown', {at: en.target.dataset.next}); } });
  }, {threshold: .5}) : null;

  /* Bringing a door in, in one movement and with no jump. What the door replaces fades out while the page glides to
     where the door will sit. The door then rises in, and the page under it closes up instead of snapping shut.
     swapIn(out, into, html): `out` is what leaves (or null), `into` is the box that appears, `html` is what to put in
     it (or null to keep what it holds). A visitor who asked their device for less motion simply sees the door. */
  var EASE = 'cubic-bezier(.2,.7,.1,1)';
  function glideTo(y, ms){
    var root = document.documentElement, y0 = window.scrollY, t0 = null, off = false;
    y = Math.max(0, y);
    if(reduce || ms <= 0 || Math.abs(y - y0) < 2){ window.scrollTo(0, y); return; }
    /* a visitor who takes hold of the page keeps it */
    var stop = function(){ off = true; };
    addEventListener('wheel', stop, {passive: true, once: true});
    addEventListener('touchstart', stop, {passive: true, once: true});
    /* the page scrolls smoothly by itself; our own steps must not be smoothed a second time */
    root.style.scrollBehavior = 'auto';
    requestAnimationFrame(function tick(now){
      if(t0 === null) t0 = now;
      var p = off ? 1 : Math.min(1, (now - t0) / ms), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      if(!off) window.scrollTo(0, y0 + (y - y0) * e);
      if(p < 1){ requestAnimationFrame(tick); return; }
      root.style.scrollBehavior = '';
      removeEventListener('wheel', stop); removeEventListener('touchstart', stop);
    });
  }
  function swapIn(out, into, html){
    if(into.__busy) return; into.__busy = true;
    var hd = $('#head'), pad = (hd ? hd.offsetHeight : 72) + 16, leaving = out && !out.hidden;
    function fill(){
      if(html != null) into.innerHTML = html;
      into.hidden = false; watch(into);
    }
    function title(){ var t = $('.h3', into); if(t){ t.tabIndex = -1; t.focus({preventScroll: true}); } }
    function rise(delay){ into.animate([{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 420, delay: delay, easing: EASE, fill: 'backwards'}); }
    if(!leaving){
      /* nothing leaves: the door opens where it stands, and the page moves just enough to show all of it */
      fill(); title(); into.__busy = false;
      if(!reduce && into.animate) rise(0);
      var r = into.getBoundingClientRect(), dy = r.top < pad ? r.top - pad : r.bottom > innerHeight - 16 ? Math.min(r.top - pad, r.bottom - innerHeight + 16) : 0;
      if(dy) glideTo(scrollY + dy, 320);
      return;
    }
    /* The door sits where the top of the leaving part is. The page moves only if that spot is hidden or low on the
       screen, and the place to go is worked out before anything changes height. */
    var box = out.getBoundingClientRect(), top = box.top, h0 = out.offsetHeight;
    var y = Math.max(0, window.scrollY + top - pad), move = top < pad || top > innerHeight * .45;
    if(reduce || !out.animate){ out.hidden = true; fill(); title(); into.__busy = false; if(move) window.scrollTo(0, y); return; }
    if(move) glideTo(y, Math.min(520, 240 + Math.abs(top - pad) * .3));
    /* Where the two share one place on the page (the same grid cell), they cross-fade: the door is already rising
       while the other is still fading, so the screen is never empty. Where they do not, the old part leaves first. */
    fill();
    var b2 = into.getBoundingClientRect(), stacked = Math.abs(b2.top - top) < 2 && Math.abs(b2.left - box.left) < 2, ms = stacked ? 260 : 200;
    if(stacked){ title(); rise(70); } else into.hidden = true;
    out.style.pointerEvents = 'none';
    var fade = out.animate([{opacity: 1}, {opacity: 0}], {duration: ms, easing: stacked ? 'ease-in' : 'ease-out', fill: 'forwards'});
    setTimeout(function(){
      out.hidden = true; out.style.pointerEvents = ''; fade.cancel();
      if(!stacked){ into.hidden = false; title(); rise(0); }
      /* the box starts as tall as what it replaced and settles to its own height, so nothing below it jumps */
      var h1 = into.offsetHeight;
      if(h0 > h1 + 24) into.animate([{minHeight: h0 + 'px'}, {minHeight: h1 + 'px'}], {duration: 460, easing: EASE});
      into.__busy = false;
    }, ms);
  }

  window.DGS = {swapIn:swapIn, glideTo:glideTo, track:track, door:door, member:member, $:$, $$:$$, esc:esc, ARROW:ARROW, LABELS:LABELS, money:money, parseMoney:parseMoney, PF:PF, reduce:reduce, watch:watch, counts:counts, show:show, indexChart:indexChart};
  document.addEventListener('DOMContentLoaded', function(){ counts(document); watch(document); });
  if(document.readyState !== 'loading'){ counts(document); watch(document); }
})();
