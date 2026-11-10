/* Home page. Every figure here is a real one from dealgrade.co (sales data to 7 July 2026). */
(function(){
  var S = window.DGS, $ = S.$, $$ = S.$$, esc = S.esc, reduce = S.reduce;
  var DG = window.DG || {cards:[], index:[], areas:[], grades:[]};

  /* The grade instrument. The home, its estimate, range and margin are real (a 1 bed in Al Barsha, graded C at AED 1.80M).
     Dealgrade's grade weighs the gap against the estimate's margin of error. The four cut-offs below are the best fit to
     all 399 projects Dealgrade has graded (they place 342 of them correctly), so the letter a visitor sees while dragging
     is close to what Dealgrade would give, and Dealgrade can replace CUT with its own rule. */
  (function(){
    var wrap = $('#trackWrap'); if(!wrap) return;
    var MIN = 1350000, MAX = 2450000, EST = 1770000, LO = 1670000, HI = 2040000, ASK = 1800000, MARGIN = .10;
    var CUT = [-1.34, -.47, .39, 1.17].map(function(z){ return EST * (1 + z * MARGIN); });
    var L = ['A','B','C','D','F'];
    var track = $('#track'), handle = $('#handle'), bubble = $('#bubble'), reel = $('#reel'), lab = $('#lab'), gap = $('#gap'), zones = $('#zones'), zb = $$('#zones button');
    var pct = function(v){ return (v - MIN) / (MAX - MIN) * 100; };
    var money = function(v){ return 'AED ' + (v / 1e6).toFixed(2) + 'M'; };
    var edges = [MIN].concat(CUT, [MAX]);
    $('#range').style.left = pct(LO) + '%'; $('#range').style.width = (pct(HI) - pct(LO)) + '%';
    $('#est').style.left = pct(EST) + '%';
    zones.style.gridTemplateColumns = edges.slice(1).map(function(e, i){ return (pct(e) - pct(edges[i])).toFixed(2) + 'fr'; }).join(' ');
    var val = ASK, last = -1, auto = null;
    function set(v){
      val = Math.max(MIN, Math.min(MAX, Math.round(v / 10000) * 10000));
      var g = 0; while(g < 4 && val >= CUT[g]) g++;
      var p = pct(val), d = (val - EST) / EST * 100;
      handle.style.left = p + '%';
      bubble.style.left = Math.max(14, Math.min(86, p)) + '%';
      bubble.textContent = 'Asking ' + money(val);
      gap.textContent = g === 2 ? 'About the same as the estimate' : Math.abs(d).toFixed(1) + '% ' + (d > 0 ? 'above' : 'below') + ' the estimate';
      if(g !== last){
        last = g;
        reel.style.transform = 'translateY(' + (-g * 20) + '%)';
        lab.textContent = S.LABELS[L[g]];
        zb.forEach(function(b, i){ b.setAttribute('aria-pressed', i === g); });
      }
      handle.setAttribute('aria-valuenow', val);
      handle.setAttribute('aria-valuetext', money(val) + ', grade ' + L[g]);
    }
    function glide(to, dur){
      stop();
      var from = val, t0 = performance.now();
      (function tick(now){
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3.2);
        set(from + (to - from) * e);
        auto = p < 1 ? requestAnimationFrame(tick) : null;
      })(t0);
    }
    function stop(){ if(auto){ cancelAnimationFrame(auto); auto = null; } }
    function fromX(x){ var r = track.getBoundingClientRect(); set(MIN + (x - r.left) / r.width * (MAX - MIN)); }
    /* With a mouse, press anywhere on the track and drag. With a finger, only the dot starts a drag, so scrolling the page
       past the card never moves the price by accident. A tap on the track still moves the price there. */
    var down = false, touched = false;
    wrap.addEventListener('pointerdown', function(e){
      if(e.target.closest('button')) return;
      var onHandle = e.target === handle || handle.contains(e.target);
      if(e.pointerType === 'touch' && !onHandle) return;
      if(!onHandle && !e.target.closest('.track')) return;
      stop(); touched = true; down = true;
      try { wrap.setPointerCapture(e.pointerId); } catch(err) {}
      fromX(e.clientX); e.preventDefault();
    });
    wrap.addEventListener('pointermove', function(e){ if(down) fromX(e.clientX); });
    var up = function(){ down = false; };
    wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
    track.addEventListener('click', function(e){
      if(e.target === handle || handle.contains(e.target)) return;
      touched = true; var r = track.getBoundingClientRect(), to = MIN + (e.clientX - r.left) / r.width * (MAX - MIN);
      if(reduce) set(to); else glide(Math.max(MIN, Math.min(MAX, to)), 450);
    });
    handle.addEventListener('keydown', function(e){
      var step = e.shiftKey ? 50000 : 10000, k = e.key;
      if(k === 'ArrowRight' || k === 'ArrowUp'){ stop(); set(val + step); e.preventDefault(); }
      else if(k === 'ArrowLeft' || k === 'ArrowDown'){ stop(); set(val - step); e.preventDefault(); }
      else if(k === 'Home'){ stop(); set(MIN); e.preventDefault(); }
      else if(k === 'End'){ stop(); set(MAX); e.preventDefault(); }
    });
    /* a letter jumps the price to the middle of that grade (to the real asking price for C) */
    zb.forEach(function(b, i){ b.addEventListener('click', function(){ touched = true; var to = i === 2 ? ASK : (edges[i] + edges[i + 1]) / 2; if(reduce) set(to); else glide(to, 700); }); });
    handle.addEventListener('keydown', function(){ touched = true; });
    if(reduce){ set(ASK); return; }
    /* opening: the price comes down from far above the range and settles on the real asking price,
       unless the visitor has already taken hold of it */
    set(2380000);
    setTimeout(function(){ if(!touched) glide(ASK, 2400); }, 900);
  })();

  /* how a grade is worked out: on a laptop the sheet follows the step in view */
  (function(){
    var sheet = $('#sheet'), steps = $$('.step'); if(!sheet) return;
    if(reduce || !('IntersectionObserver' in window)){ sheet.dataset.step = '3'; steps.forEach(function(s){ s.classList.add('on'); }); return; }
    var so = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        sheet.dataset.step = e.target.dataset.step;
        steps.forEach(function(s){ s.classList.toggle('on', s === e.target); });
      });
    }, {rootMargin:'-48% 0px -48% 0px', threshold:0});
    steps.forEach(function(s){ so.observe(s); });
  })();

  /* marketplace wall: real projects with their grades */
  (function(){
    var wall = $('#wall'); if(!wall || !DG.cards.length) return;
    var card = function(c){
      var same = /about/.test(c.gap), id = c.url.split('/').pop();
      return '<a class="card" href="project.html?id=' + id + '"><div class="card-t"><h3>' + esc(c.name) + '</h3><span class="badge ' + c.grade + '" aria-label="Deal grade ' + c.grade + '">' + c.grade + '</span></div>'
        + '<p class="pl">' + esc(c.place) + ' · ' + esc(c.dev) + '</p>'
        + '<div class="pr"><span>Asking<b class="num">' + esc(c.ask) + '</b></span><span>Estimate<b class="num">' + esc(c.est) + '</b></span></div>'
        + '<p class="dl' + (same ? ' same' : '') + '">' + esc(c.home.split(',')[0]) + ' · ' + (same ? 'about the same' : esc(c.gap.replace(/^[-−+]/, '').replace('cheaper', 'below estimate').replace('dearer', 'above estimate'))) + ' · ' + esc(c.sales) + '</p></a>';
    };
    var half = Math.ceil(DG.cards.length / 2), a = DG.cards.slice(0, half), b = DG.cards.slice(half);
    var col = function(list, cls){ var h = list.map(card).join(''); return '<div class="col ' + cls + '">' + h + (reduce ? '' : h.replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ')) + '</div>'; };
    wall.innerHTML = col(a, 'a') + col(b, 'b');
  })();

  /* search in plain words */
  (function(){
    var box = $('#ask'); if(!box) return;
    var typed = $('#typed'), rows = $$('#sets dt, #sets dd'), text = typed.textContent;
    if(reduce){ rows.forEach(function(r){ r.classList.add('show'); }); return; }
    typed.textContent = '';
    box.__in = function(){
      var i = 0;
      setTimeout(function type(){
        typed.textContent = text.slice(0, ++i);
        if(i < text.length) setTimeout(type, 38 + Math.random() * 40);
        else rows.forEach(function(r, n){ setTimeout(function(){ r.classList.add('show'); }, 350 + Math.floor(n / 2) * 260); });
      }, 500);
    };
  })();

  /* grades across the graded projects */
  (function(){
    var el = $('#dist'); if(!el || !DG.grades.length) return;
    var max = Math.max.apply(null, DG.grades.map(function(g){ return g.n; }));
    el.innerHTML = DG.grades.map(function(g, i){
      return '<a class="bar" href="projects.html?grade=' + g.g + '"><span class="badge ' + g.g + '">' + g.g + '</span><div><div class="meta"><span>' + S.LABELS[g.g] + '</span><b class="num">' + g.n + ' projects</b></div><div class="rail"><div class="fill" style="width:' + (g.n / max * 100).toFixed(1) + '%;background:var(--g' + g.g + ');--d:' + (i * 110) + 'ms"></div></div></div></a>';
    }).join('') + '<p class="note">399 graded projects, and 205 of them are graded D or F. Counted on Dealgrade\'s new-project pages, 10 November 2026.</p>';
  })();

  /* price index and busiest areas */
  (function(){
    var svg = $('#chart'); if(svg && DG.index.length) S.indexChart(svg, DG.index);
    var tb = $('#areas'); if(!tb) return;
    tb.innerHTML = DG.areas.map(function(a){
      return '<tr><td>' + esc(a.name) + '</td><td class="num">' + a.sales.toLocaleString('en-US') + '</td><td class="num">AED ' + a.sqm.toLocaleString('en-US') + '</td><td class="num">' + S.money(a.price) + '</td><td class="num ' + (a.yoy < 0 ? 'dn' : 'up') + '">' + (a.yoy > 0 ? '+' : a.yoy < 0 ? '−' : '') + Math.abs(a.yoy).toFixed(1) + '%</td></tr>';
    }).join('');
  })();

  /* phone action bar, and the closing photo drifting with the scroll */
  (function(){
    var dock = $('#dock'), cta = $('#heroCta');
    if(dock && cta && 'IntersectionObserver' in window){
      document.body.classList.add('has-dock');
      new IntersectionObserver(function(es){ dock.classList.toggle('show', !es[0].isIntersecting && scrollY > 200); }, {threshold:0}).observe(cta);
    }
    var sec = $('#close'), img = $('#closeImg'); if(reduce || !sec) return;
    var tick = false;
    addEventListener('scroll', function(){
      if(tick) return; tick = true;
      requestAnimationFrame(function(){
        var r = sec.getBoundingClientRect(), p = (innerHeight - r.top) / (innerHeight + r.height);
        if(p > -.1 && p < 1.1) img.style.transform = 'translate3d(0,' + ((p - .5) * -9).toFixed(2) + '%,0) scale(1.06)';
        tick = false;
      });
    }, {passive:true});
  })();
})();
