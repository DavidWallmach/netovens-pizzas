// @ts-nocheck
/* eslint-disable */
// Motor de la animación de la pizza (se dibuja en SVG y avanza con el scroll).
// Lo usa pizza-hero.tsx. Devuelve una función para limpiar todo al desmontar.

export function startPizza(root: HTMLElement): () => void {
  var $ = function (id) { return root.querySelector('#' + id) };
  var clamp = function (v, a, b) { a = a || 0; b = b == null ? 1 : b; return Math.min(b, Math.max(a, v)) };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a)) };
  var eo = function (t) { return 1 - Math.pow(1 - t, 3) };
  var eb = function (t) { var c = 1.70158, k = c + 1; return 1 + k * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) };
  var NS = 'http://www.w3.org/2000/svg';
  function mk(tag, at, parent) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e }
  function grp(parent, at) { return mk('g', at || {}, parent) }
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
  function blobPts(seed, amp, n) { var R = rng(seed), pts = []; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2, r = 1 + amp * (R() * 2 - 1); pts.push([Math.cos(a) * r, Math.sin(a) * r]) } return pts }
  function smooth(pts, s) {
    s = s || 1; var n = pts.length;
    function P(i) { var p = pts[((i % n) + n) % n]; return [p[0] * s, p[1] * s] }
    var f = function (v) { return v.toFixed(3) };
    var p0 = P(0), d = 'M' + f(p0[0]) + ' ' + f(p0[1]);
    for (var i = 0; i < n; i++) {
      var a = P(i - 1), b = P(i), c = P(i + 1), e = P(i + 2);
      var c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6], c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
      d += 'C' + f(c1[0]) + ' ' + f(c1[1]) + ' ' + f(c2[0]) + ' ' + f(c2[1]) + ' ' + f(c[0]) + ' ' + f(c[1]);
    }
    return d + 'Z';
  }
  var GA = Math.PI * (3 - Math.sqrt(5));
  function spread(n, off, rmax) { var o = []; for (var i = 0; i < n; i++) { var r = 20 + (rmax - 20) * Math.sqrt((i + .5) / n), a = i * GA + off; o.push([120 + r * Math.cos(a), 120 + r * Math.sin(a)]) } return o }
  function place(g, x, y, r) {
    if (r < 0.4) { g.setAttribute('display', 'none'); return }
    g.removeAttribute('display');
    g.setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + r + ')');
  }

  /* limpia por si React monta el componente dos veces (modo desarrollo) */
  ['pz', 'flames', 'flour', 'strings', 'steam'].forEach(function (id) { var n = $(id); if (n) n.innerHTML = '' });
  var oldClip = $('dClip'); if (oldClip) oldClip.remove();
  var ticksEl = root.querySelector('.nvp-ticks'); ticksEl.innerHTML = '';

  var pz = $('pz'), R = rng(77);

  /* ---------- MASA ---------- */
  var doughF = grp(pz, { filter: 'url(#fGrain)' });
  var doughG = grp(doughF);
  var dpts = blobPts(11, .035, 16);
  mk('path', { d: smooth(dpts, 1), fill: 'url(#gDough)' }, doughG);
  var crustG = grp(doughG);
  mk('path', { d: smooth(dpts, 1) + smooth(dpts, .86), 'fill-rule': 'evenodd', fill: '#E8BC6A' }, crustG);
  mk('path', { d: smooth(dpts, .985) + smooth(dpts, .93), 'fill-rule': 'evenodd', fill: '#F7DB9C', opacity: .55 }, crustG);
  mk('path', { d: smooth(dpts, .86) + smooth(dpts, .8), 'fill-rule': 'evenodd', fill: '#B98532', opacity: .45 }, crustG);
  for (var i = 0; i < 14; i++) {
    var ang = i / 14 * Math.PI * 2 + R() * .3;
    mk('ellipse', {
      cx: (Math.cos(ang) * .915).toFixed(3), cy: (Math.sin(ang) * .915).toFixed(3), rx: (.05 + R() * .04).toFixed(3), ry: .03,
      fill: '#FCE8B6', opacity: .5, transform: 'rotate(' + (ang * 180 / Math.PI + 90).toFixed(1) + ' ' + (Math.cos(ang) * .915).toFixed(3) + ' ' + (Math.sin(ang) * .915).toFixed(3) + ')'
    }, crustG);
  }
  var ballHi = mk('circle', { r: 1, fill: 'url(#gBall)' }, doughG);

  /* ---------- SALSA ---------- */
  var sauceG = grp(pz);
  mk('path', { d: smooth(blobPts(21, .03, 14), 1), fill: 'url(#gSauce)' }, sauceG);
  function spiral(phase, col, op, w) {
    var d = ''; for (var t = 0; t <= 1.001; t += .02) { var a = phase + t * Math.PI * 2 * 2.4, rr = .08 + .78 * t; d += (t === 0 ? 'M' : 'L') + (Math.cos(a) * rr).toFixed(3) + ' ' + (Math.sin(a) * rr).toFixed(3) }
    mk('path', { d: d, fill: 'none', stroke: col, 'stroke-opacity': op, 'stroke-width': w, 'stroke-linecap': 'round' }, sauceG);
  }
  spiral(0, '#F5806A', .3, .04); spiral(Math.PI, '#7E1009', .35, .05);
  mk('ellipse', { cx: -.3, cy: -.36, rx: .42, ry: .17, fill: 'url(#gGloss)', opacity: .55, transform: 'rotate(-30 -.3 -.36)' }, sauceG);

  /* ---------- QUESO ---------- */
  var cheeseF = grp(pz, { filter: 'url(#fGrain2)' });
  var patches = [];
  var pdef = [[0, 0, 36]];
  for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 + .2; pdef.push([Math.cos(a) * 46, Math.sin(a) * 46, 30]) }
  pdef.forEach(function (d, i) {
    var g = grp(cheeseF);
    mk('path', { d: smooth(blobPts(30 + i, .08, 12), 1), fill: i % 2 ? 'url(#gChA)' : 'url(#gChB)', stroke: '#D6A745', 'stroke-opacity': .5, 'stroke-width': .035 }, g);
    patches.push({ g: g, x: 120 + d[0], y: 120 + d[1], r: d[2], a: .41 + i * .011, b: .5 + i * .011 });
  });
  var bubG = grp(pz), bubs = [];
  spread(14, .7, 68).forEach(function (p, i) {
    var g = grp(bubG);
    mk('circle', { r: 1, fill: 'url(#gBub)' }, g);
    mk('circle', { cx: -.3, cy: -.3, r: .35, fill: '#F4D58A', opacity: .7 }, g);
    bubs.push({ g: g, x: p[0], y: p[1], s: 2.4 + (i % 4) * 1.1 });
  });

  /* ---------- INGREDIENTES ---------- */
  var tops = grp(pz, { filter: 'url(#fShadow)' }), pieces = [];
  function addPiece(kind, x, y, a, b) {
    var g = grp(tops, { opacity: 0 }), extra = {};
    if (kind === 'pep') {
      var s = .9 + R() * .22, inner = grp(g, { transform: 'rotate(' + Math.round(R() * 360) + ') scale(' + s.toFixed(2) + ')' });
      var pp = blobPts(Math.round(R() * 1000), .05, 10);
      mk('path', { d: smooth(pp, 11), fill: 'url(#gPep)' }, inner);
      mk('path', { d: smooth(pp, 10.2), fill: 'none', stroke: '#4D0C06', 'stroke-width': 1.2, 'stroke-opacity': .5 }, inner);
      extra.rim = mk('path', { d: smooth(pp, 10.6), fill: 'none', stroke: '#1F0402', 'stroke-width': 2.2, opacity: 0 }, inner);
      for (var k = 0; k < 6; k++) { var ra = R() * Math.PI * 2, rr = R() * 7; mk('circle', { cx: (Math.cos(ra) * rr).toFixed(2), cy: (Math.sin(ra) * rr).toFixed(2), r: (.8 + R() * .7).toFixed(2), fill: '#6F110A', opacity: .55 }, inner) }
      for (var k = 0; k < 3; k++) { var ra = R() * Math.PI * 2, rr = R() * 6.5; mk('circle', { cx: (Math.cos(ra) * rr).toFixed(2), cy: (Math.sin(ra) * rr).toFixed(2), r: (1 + R() * .8).toFixed(2), fill: '#EE9A78', opacity: .3 }, inner) }
      extra.gloss = mk('ellipse', { cx: -3, cy: -3.4, rx: 3.8, ry: 1.8, fill: '#FFD9AA', opacity: .1, transform: 'rotate(-35 -3 -3.4)' }, inner);
    } else if (kind === 'oli') {
      var inner = grp(g);
      mk('path', { d: 'M-5.4 0a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0ZM-2.4 0a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0Z', 'fill-rule': 'evenodd', fill: 'url(#gOli)' }, inner);
      mk('path', { d: 'M-4 -2.6A4.8 4.8 0 0 1 1 -4.6', fill: 'none', stroke: '#fff', 'stroke-opacity': .3, 'stroke-width': .9, 'stroke-linecap': 'round' }, inner);
    } else if (kind === 'jal') {
      var inner = grp(g, { transform: 'rotate(' + Math.round(R() * 360) + ')' });
      mk('circle', { r: 6.8, fill: 'url(#gJal)', stroke: '#4F7A17', 'stroke-width': 1.1 }, inner);
      mk('circle', { r: 4.6, fill: '#CFE88A', stroke: '#E6F3B5', 'stroke-width': .7 }, inner);
      for (var k = 0; k < 6; k++) { var ra = k * 1.05 + .3, rr = 1.2 + R() * 1.6; mk('ellipse', { cx: (Math.cos(ra) * rr).toFixed(2), cy: (Math.sin(ra) * rr).toFixed(2), rx: .9, ry: .55, fill: '#F7F9D0', transform: 'rotate(' + (ra * 57).toFixed(0) + ' ' + (Math.cos(ra) * rr).toFixed(2) + ' ' + (Math.sin(ra) * rr).toFixed(2) + ')' }, inner) }
    } else {
      var inner = grp(g, { transform: 'rotate(' + Math.round(R() * 360) + ') scale(.85)' });
      mk('path', { d: 'M0 0C-6-4-6-13 0-18C6-13 6-4 0 0Z', fill: 'url(#gLeaf)' }, inner);
      mk('path', { d: 'M0 -1L0 -15', stroke: '#B4E59B', 'stroke-width': .7, 'stroke-linecap': 'round' }, inner);
      mk('path', { d: 'M0 -6L-3 -9M0 -6L3 -9M0 -10L-2.2 -12.4M0 -10L2.2 -12.4', stroke: '#B4E59B', 'stroke-width': .45, 'stroke-linecap': 'round', fill: 'none' }, inner);
    }
    pieces.push({ g: g, x: x, y: y, a: a, b: b, kind: kind, extra: extra });
  }
  spread(8, .3, 72).forEach(function (p, i) { addPiece('pep', p[0], p[1], .55 + i * .012, .62 + i * .012) });
  spread(6, 1.9, 70).forEach(function (p, i) { addPiece('oli', p[0], p[1], .62 + i * .01, .69 + i * .01) });
  spread(6, 3.6, 70).forEach(function (p, i) { addPiece('jal', p[0], p[1], .66 + i * .01, .73 + i * .01) });
  spread(5, 2.4, 58).forEach(function (p, i) { addPiece('leaf', p[0], p[1], .87 + i * .008, .92 + i * .008) });

  /* ---------- HORNEADO ---------- */
  var dClip = mk('clipPath', { id: 'dClip' }, pz.parentNode);
  mk('path', { d: smooth(dpts, 97), transform: 'translate(120 120)' }, dClip);
  var bakeG = grp(pz, { 'clip-path': 'url(#dClip)' });
  var ovBlot = mk('circle', { cx: 120, cy: 120, r: 110, fill: '#000', filter: 'url(#fBlotch)', opacity: 0 }, bakeG);
  var ovVig = mk('circle', { cx: 120, cy: 120, r: 100, fill: 'url(#gVig)', opacity: 0 }, bakeG);
  var charG = grp(bakeG, { opacity: 0 });
  for (var i = 0; i < 14; i++) {
    var a = R() * Math.PI * 2, rr = 89 + R() * 4, sz = 3 + R() * 3.5;
    mk('circle', { cx: (120 + Math.cos(a) * rr).toFixed(1), cy: (120 + Math.sin(a) * rr).toFixed(1), r: sz.toFixed(1), fill: 'url(#gChar)', opacity: (.45 + R() * .55).toFixed(2) }, charG);
  }

  /* ---------- HARINA, LLAMAS, VAPOR, HILOS ---------- */
  var flour = []; for (var i = 0; i < 16; i++) flour.push(mk('circle', { r: .8 + (i % 3) * .4, opacity: 0 }, $('flour')));
  var flames = [60, 90, 120, 150, 180].map(function (x, i) {
    var g = mk('g', {}, $('flames'));
    mk('path', { d: 'M0 0C-10-10-8-24 0-40 3-26 12-20 9-8 7-2 4 0 0 0Z', fill: '#FF7A00', 'class': 'nvp-fl', style: 'animation-delay:' + (i * .15) + 's' }, g);
    mk('path', { d: 'M0 0C-5-5-4-12 0-20 2-13 6-10 4-4Z', fill: '#FCD800', 'class': 'nvp-fl', style: 'animation-delay:' + (i * .15) + 's' }, g);
    return { g: g, x: x, s: .8 + ((i * 37) % 5) / 10 };
  });
  [[90, 100, 16, 9], [125, 80, 18, 10], [155, 105, 15, 8], [110, 120, 14, 8]].forEach(function (s, i) {
    mk('ellipse', { cx: s[0], cy: s[1], rx: s[2], ry: s[3], 'class': 'nvp-st', style: 'animation-delay:' + (i * .8) + 's' }, $('steam'));
  });
  var strings = [];
  [[0, 40], [0, 62], [0, 84], [0, 104], [1, 44], [1, 70], [1, 96]].forEach(function (d) {
    var x0, y0; if (d[0] === 0) { x0 = 120; y0 = d[1] } else { x0 = 120 + d[1] * .7071; y0 = 120 - d[1] * .7071 }
    strings.push({ el: mk('path', { d: 'M0 0', opacity: 0 }, $('strings')), x: x0, y: y0 });
  });

  /* ---------- PASOS ---------- */
  var steps = [].slice.call(root.querySelectorAll('.nvp-step'));
  var B = [0, .12, .27, .41, .55, .74, .88];
  var tickEls = [];
  for (var t = 0; t < 6; t++) tickEls.push(ticksEl.appendChild(document.createElement('i')));
  var tickLabel = ticksEl.appendChild(document.createElement('span'));
  var lastActive = -1;
  var lines = [].slice.call($('lines').children);
  var bar = root.querySelector('.nvp-bar');

  function render(p) {
    var e1 = eo(seg(p, .10, .27)), intro = eb(seg(p, 0, .07));
    var r = (30 + 68 * e1) * intro;
    var b = eo(seg(p, .74, .86));
    place(doughG, 120, 120, r);
    crustG.setAttribute('opacity', e1);
    ballHi.setAttribute('opacity', 1 - e1);
    $('board').setAttribute('opacity', .35 + .65 * seg(p, 0, .05));
    var shd = $('shd'); shd.setAttribute('rx', Math.max(0, r + 3)); shd.setAttribute('ry', Math.max(0, r + 3));
    place(sauceG, 120, 120, 82 * eo(seg(p, .27, .40)));
    patches.forEach(function (q) { place(q.g, q.x, q.y, q.r * eo(seg(p, q.a, q.b))) });
    bubs.forEach(function (q) { place(q.g, q.x, q.y, q.s * b) });
    for (var i = 0; i < flour.length; i++) {
      var a = i * Math.PI * 2 / 16 + .2, d = (50 + e1 * 52) * (.8 + .2 * ((i % 3) / 2));
      flour[i].setAttribute('cx', 120 + Math.cos(a) * d); flour[i].setAttribute('cy', 120 + Math.sin(a) * d);
      flour[i].setAttribute('opacity', Math.sin(Math.PI * e1) * .8);
    }
    pieces.forEach(function (q) {
      var t = seg(p, q.a, q.b), e = eb(t);
      q.g.setAttribute('opacity', clamp(t * 4));
      q.g.setAttribute('transform', 'translate(' + q.x + ' ' + (q.y - 70 * (1 - eo(t))) + ') scale(' + (.4 + .6 * e) + ') rotate(' + ((1 - t) * 40) + ')');
      if (q.kind === 'pep') { q.extra.rim.setAttribute('opacity', b * .8); q.extra.gloss.setAttribute('opacity', .1 + b * .5) }
    });
    ovBlot.setAttribute('opacity', b * .55);
    ovVig.setAttribute('opacity', b);
    charG.setAttribute('opacity', b);
    $('glow').setAttribute('opacity', b * .85);
    flames.forEach(function (f) { f.g.setAttribute('transform', 'translate(' + f.x + ' 266) scale(' + (f.s * b * 1.3) + ')'); f.g.setAttribute('opacity', b) });
    var c = eo(seg(p, .88, .93)), l = eo(seg(p, .93, 1));
    lines.forEach(function (ln) { ln.setAttribute('stroke-dashoffset', 196 * (1 - c)) });
    $('lines').setAttribute('opacity', 1 - l);
    $('main').setAttribute('clip-path', l > 0 ? 'url(#cutOut)' : 'none');
    var sl = $('slice'), dx = l * 30 * .3827, dy = -l * 30 * .9239;
    sl.style.display = l > 0 ? '' : 'none';
    sl.setAttribute('transform', 'translate(' + dx + ' ' + dy + ')');
    strings.forEach(function (s) {
      if (l <= 0) { s.el.setAttribute('opacity', 0); return }
      var x1 = s.x + dx, y1 = s.y + dy, mx = (s.x + x1) / 2, my = (s.y + y1) / 2 + 9 * l;
      s.el.setAttribute('d', 'M' + s.x.toFixed(1) + ' ' + s.y.toFixed(1) + 'Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + x1.toFixed(1) + ' ' + y1.toFixed(1));
      s.el.setAttribute('stroke-width', (2.6 * (1 - .78 * l)).toFixed(2));
      s.el.setAttribute('opacity', (seg(l, 0, .12) * (1 - .85 * seg(l, .55, 1))).toFixed(2));
    });
    $('steam').setAttribute('opacity', (b * .22 + l * .4).toFixed(2));
    bar.style.transform = 'scaleX(' + p + ')';
    var act = 0; for (var k = 0; k < B.length; k++) if (p >= B[k]) act = k;
    if (act !== lastActive) {
      lastActive = act;
      steps.forEach(function (s, i) { var on = i === act; s.classList.toggle('on', on); s.inert = !on });
      tickEls.forEach(function (el, i) { el.classList.toggle('on', act >= i + 1) });
      tickLabel.textContent = act > 0 ? 'Paso ' + act + ' de 6' : '';
    }
  }

  var story = root.querySelector('.nvp-story');
  var target = 0, cur = 0, last = -1, raf = 0, dead = false;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function measure() {
    var s = story.getBoundingClientRect();
    target = clamp(-s.top / (s.height - innerHeight));
  }
  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', measure);
  (function loop() {
    if (dead) return;
    cur += (target - cur) * (reduce ? 1 : .14);
    if (Math.abs(target - cur) < .0003) cur = target;
    if (Math.abs(cur - last) > 1e-5) { render(cur); last = cur }
    raf = requestAnimationFrame(loop);
  })();
  measure();
  cur = target;

  return function stop() {
    dead = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', measure);
    window.removeEventListener('resize', measure);
  };
}
