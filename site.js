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
      + '<div class="head-r"><a class="signin" href="login.html">Sign in</a><a class="btn btn-solid btn-sm" href="valuate.html">Value my property</a>'
      + '<button class="burger" type="button" aria-label="Open the menu" aria-expanded="false" aria-controls="menu"><span><i></i><i></i></span></button></div></div>';
    var menu = document.createElement('div');
    menu.className = 'menu'; menu.id = 'menu';
    menu.innerHTML = '<nav aria-label="Dealgrade, all pages">' + NAV.map(function(n, i){ return '<a href="' + n[1] + '" style="--i:' + i + '"' + (n[0] === page ? ' aria-current="page"' : '') + '>' + (n[0] === 'legal' ? 'Legal guide' : n[2]) + '<span>' + n[3] + '</span></a>'; }).join('') + '</nav>'
      + '<div class="menu-foot"><a class="btn btn-solid" href="valuate.html">Value my property ' + ARROW + '</a><a class="btn btn-line" href="login.html">Sign in</a><a class="btn btn-line" href="signup.html">Create your account</a></div>';
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
      + '<nav aria-label="All pages"><a href="valuate.html">Valuation</a><a href="listings.html">Listings</a><a href="projects.html">New projects</a><a href="listings.html#distress">Distress sales</a><a href="login.html?next=sell">List a property</a><a href="map.html">Map</a><a href="prices.html">Prices</a><a href="legal.html">Legal guide</a><a href="login.html">Sign in</a><a href="signup.html">Create your account</a></nav></div>'
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

  window.DGS = {$:$, $$:$$, esc:esc, ARROW:ARROW, LABELS:LABELS, money:money, parseMoney:parseMoney, PF:PF, reduce:reduce, watch:watch, counts:counts, show:show, indexChart:indexChart};
  document.addEventListener('DOMContentLoaded', function(){ counts(document); watch(document); });
  if(document.readyState !== 'loading'){ counts(document); watch(document); }
})();
