/* CHIVEIO COOL TECH — comportamento do site (tema fica em theme.js) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CFG = window.SITE_CONFIG || {};

  /* ---------- Configuração (contactos) ---------- */
  $$('[data-cfg]').forEach(function (el) { var v = CFG[el.dataset.cfg]; if (v) el.textContent = v; });
  var wa = String(CFG.whatsapp || '').replace(/\D/g, '');
  function waLink(text) { return 'https://wa.me/' + wa + '?text=' + encodeURIComponent(text || CFG.whatsappMessage || ''); }
  $$('[data-href]').forEach(function (a) {
    var k = a.dataset.href;
    if (k === 'tel') a.href = 'tel:' + String(CFG.phone || '').replace(/[^\d+]/g, '');
    else if (k === 'mail') a.href = 'mailto:' + (CFG.email || '');
    else if (k === 'whatsapp') a.href = waLink();
    else if (CFG.social && CFG.social[k]) a.href = CFG.social[k];
  });
  var hours = $('#hours');
  if (hours && CFG.hours) CFG.hours.forEach(function (h) { var li = document.createElement('li'); li.textContent = h; hours.appendChild(li); });
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Preloader ---------- */
  var pre = $('#preloader'), t0 = performance.now();
  function hidePre() {
    if (!pre || pre.dataset.done) return;
    pre.dataset.done = '1';
    setTimeout(function () {
      pre.classList.add('hide');
      document.body.classList.remove('is-loading');
      setTimeout(function () { if (pre.parentNode) pre.parentNode.removeChild(pre); }, 800);
    }, Math.max(0, 1300 - (performance.now() - t0)));
  }
  if (document.readyState === 'complete') hidePre(); else window.addEventListener('load', hidePre);
  setTimeout(hidePre, 3000);

  /* ---------- Navegação ---------- */
  var header = $('#header'), nav = $('#nav'), menuBtn = $('#menuBtn');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Abrir menu'); }
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  var links = $$('a', nav);
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { secObs.observe(s); });
  }

  /* ---------- Animações de entrada ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var rObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rObs.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (r) { rObs.observe(r); });
  } else reveals.forEach(function (r) { r.classList.add('in'); });

  var steps = $('#steps');
  if (steps) {
    if ('IntersectionObserver' in window) {
      var sObs = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { steps.classList.add('go'); sObs.disconnect(); } }, { threshold: .35 });
      sObs.observe(steps);
    } else steps.classList.add('go');
  }

  /* ---------- Flocos de neve discretos ---------- */
  var snow = $('.snow');
  if (snow && !reduce) {
    var n = window.innerWidth < 640 ? 7 : 14;
    for (var i = 0; i < n; i++) {
      var f = document.createElement('span'), s = 10 + Math.random() * 14;
      f.className = 'flake';
      f.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + s + 'px;height:' + s + 'px;animation-duration:' + (14 + Math.random() * 16) + 's;animation-delay:-' + (Math.random() * 24) + 's;--dx:' + (Math.random() * 120 - 60) + 'px;opacity:' + (.25 + Math.random() * .35);
      snow.appendChild(f);
    }
  }

  /* ---------- Temperatura animada (ecrã do aparelho + indicador) ---------- */
  var acTemp = $('#acTemp'), chipTemp = $('#chipTemp'), tempBar = $('#tempBar');
  function setTemp(t) {
    if (acTemp) acTemp.textContent = t;
    if (chipTemp) chipTemp.textContent = t;
    if (tempBar) tempBar.style.width = Math.round((32 - t) / 10 * 100) + '%';
  }
  if (acTemp && !reduce) {
    var temp = 30, hold = 0;
    setTemp(temp);
    setInterval(function () {
      if (hold > 0) { hold--; return; }
      if (temp > 22) { temp--; setTemp(temp); if (temp === 22) hold = 7; } else { temp = 30; setTemp(temp); }
    }, 700);
  } else setTemp(22);

  /* ---------- Partículas de ar frio (canvas) ---------- */
  var cvs = $('#airCanvas');
  if (cvs && cvs.getContext && !reduce) {
    var ctx = cvs.getContext('2d'), W = 560, H = 520;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cvs.width = W * dpr; cvs.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var ps = [], running = false, last = 0, MAX = window.innerWidth < 640 ? 60 : 110;
    function spawn() {
      var x = 110 + Math.random() * 340;
      ps.push({ x: x, y: 170, vx: (Math.random() - .5) * .4 + (x - 280) * .0014, vy: .7 + Math.random() * 1.1,
        r: .9 + Math.random() * 2.4, life: 0, max: 130 + Math.random() * 140, ph: Math.random() * 6.28, amp: .15 + Math.random() * .5 });
    }
    function frame(ts) {
      if (!running) return;
      requestAnimationFrame(frame);
      var dt = Math.min((ts - last) / 16.67, 3); last = ts;
      ctx.clearRect(0, 0, W, H);
      if (ps.length < MAX) { var k = Math.random() < .9 * dt ? 1 : 0; if (k) { spawn(); if (Math.random() < .6) spawn(); } }
      for (var i = ps.length - 1; i >= 0; i--) {
        var p = ps[i];
        p.life += dt; p.ph += .045 * dt;
        p.x += (p.vx + Math.sin(p.ph) * p.amp) * dt; p.y += p.vy * dt; p.vy += .004 * dt;
        var t = p.life / p.max;
        if (t >= 1 || p.y > H) { ps.splice(i, 1); continue; }
        var a = Math.sin(Math.PI * t) * .85;
        ctx.beginPath(); ctx.fillStyle = 'rgba(56,189,248,' + a + ')'; ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
        if (p.r > 2) { ctx.strokeStyle = 'rgba(255,255,255,' + (a * .7) + ')'; ctx.lineWidth = .8; ctx.stroke(); }
      }
    }
    function start() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
    function stop() { running = false; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es[0].isIntersecting && !document.hidden ? start() : stop(); }, { threshold: .05 }).observe(cvs);
    } else start();
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
  }

  /* ---------- Serviço pré-selecionado a partir dos cartões ---------- */
  var form = $('#bookingForm');
  $$('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () { var s = $('#f-service'); if (s) { s.value = a.dataset.service; clearErr('service'); updatePrice(); } });
  });

  /* ---------- Formulário de agendamento ---------- */
  if (!form) return;
  var loadedAt = Date.now();
  var SERVICES = { 'preventiva-simples': 'Manutenção preventiva simples', 'preventiva-geral': 'Manutenção preventiva geral' };
  var PRICES = { 'preventiva-simples': 6000, 'preventiva-geral': 12000 };
  var TIMES = { 'manha': 'Manhã (08h–12h)', 'tarde': 'Tarde (12h–17h)', 'fim-tarde': 'Fim da tarde (17h–19h)' };
  function todayStr() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  var dateInput = $('#f-date'); dateInput.min = todayStr();

  var rules = {
    name: function (v) { return v.trim().length >= 3 || 'Indique o seu nome completo.'; },
    phone: function (v) { return (/^[+()\d\s.\-]{7,20}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 7) || 'Indique um número de telefone válido.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Indique um e-mail válido.'; },
    address: function (v) { return v.trim().length >= 5 || 'Indique a localização ou endereço do serviço.'; },
    service: function (v) { return !!SERVICES[v] || 'Escolha o tipo de serviço.'; },
    quantity: function (v) { var n = Number(v); return (v !== '' && Number.isInteger(n) && n >= 1 && n <= 200) || 'Indique a quantidade (1 a 200).'; },
    date: function (v) { return !v ? 'Escolha a data pretendida.' : (v >= todayStr() || 'A data não pode estar no passado.'); },
    time: function (v) { return !!TIMES[v] || 'Escolha o horário preferencial.'; },
    notes: function () { return true; },
    consent: function (v, el) { return el.checked || 'É necessário autorizar o contacto.'; }
  };
  function field(n) { return form.elements[n]; }
  function showErr(n, msg) { var el = field(n), p = $('#err-' + n); if (p) p.textContent = msg; if (el) el.setAttribute('aria-invalid', 'true'); }
  function clearErr(n) { var el = field(n), p = $('#err-' + n); if (p) p.textContent = ''; if (el) el.removeAttribute('aria-invalid'); }
  function check(n) { var el = field(n), r = rules[n](el.value, el); if (r === true) { clearErr(n); return true; } showErr(n, r); return false; }
  Object.keys(rules).forEach(function (n) {
    var el = field(n); if (!el) return;
    el.addEventListener('blur', function () { check(n); });
    el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', function () { if (el.getAttribute('aria-invalid')) check(n); });
  });
  var notes = $('#f-notes'), count = $('#f-count');
  notes.addEventListener('input', function () { count.textContent = notes.value.length + ' / 1500'; });

  var formErr = $('#formErr'), submitBtn = $('#submitBtn'), success = $('#success');
  function setFormErr(msg) { formErr.textContent = msg; formErr.hidden = !msg; }
  function formatKz(value) { return value.toLocaleString('pt-AO') + ' Kz'; }
  function updatePrice() {
    var service = field('service').value, quantity = Number(field('quantity').value) || 0;
    var unitPrice = PRICES[service], estimate = $('#priceEstimate');
    if (!unitPrice || quantity < 1) {
      estimate.textContent = 'Selecione a modalidade e a quantidade para ver o total estimado.';
      return;
    }
    estimate.textContent = formatKz(unitPrice) + ' por aparelho · Total estimado para ' + quantity + (quantity === 1 ? ' aparelho: ' : ' aparelhos: ') + formatKz(unitPrice * quantity);
  }
  field('service').addEventListener('change', updatePrice);
  field('quantity').addEventListener('input', updatePrice);

  function renderSummary(d, ref) {
    $('#sumRef').textContent = ref;
    var dl = $('#summary'); dl.textContent = '';
    var dateTxt = new Date(d.date + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var rows = [['Nome', d.name], ['Empresa', d.company], ['Telefone', d.phone], ['E-mail', d.email], ['Local', d.address],
      ['Serviço', SERVICES[d.service]], ['Aparelhos', d.quantity + (d.brand ? ' · ' + d.brand : '')],
      ['Preço por aparelho', formatKz(PRICES[d.service])], ['Total estimado', formatKz(PRICES[d.service] * d.quantity)],
      ['Data pretendida', dateTxt], ['Horário', TIMES[d.time]], ['Observações', d.notes], ['Consentimento', 'Autorizou o contacto'], ['Estado', 'Pendente de confirmação']];
    var txt = ['Pedido de agendamento ' + ref];
    rows.forEach(function (r) {
      if (!r[1]) return;
      var dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = r[0]; dd.textContent = r[1]; dl.appendChild(dt); dl.appendChild(dd);
      txt.push(r[0] + ': ' + r[1]);
    });
    var w = $('[data-href="whatsapp-summary"]');
    var message = 'Olá! Gostaria de solicitar um agendamento na Chiveio Cool Tech.\n\n' + txt.join('\n');
    if (w) w.href = waLink(message);
    return waLink(message);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault(); setFormErr('');
    var firstBad = null;
    Object.keys(rules).forEach(function (n) { if (!check(n) && !firstBad) firstBad = field(n); });
    if (firstBad) { firstBad.focus(); return; }

    var data = {
      name: field('name').value.trim(), company: field('company').value.trim(), phone: field('phone').value.trim(),
      email: field('email').value.trim(), address: field('address').value.trim(), service: field('service').value,
      quantity: Number(field('quantity').value), brand: field('brand').value.trim(), date: field('date').value,
      time: field('time').value, notes: field('notes').value.trim(), consent: true
    };
    var reference = 'CCT-' + Date.now().toString().slice(-8);
    var whatsappUrl = renderSummary(data, reference);

    submitBtn.classList.add('is-sending'); submitBtn.disabled = true;
    form.hidden = true; success.hidden = false; success.focus();
    success.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    submitBtn.classList.remove('is-sending'); submitBtn.disabled = false;
  });

  $('#newBtn').addEventListener('click', function () {
    form.reset(); count.textContent = '0 / 1500'; field('quantity').value = 1; loadedAt = Date.now();
    updatePrice();
    Object.keys(rules).forEach(clearErr); setFormErr('');
    success.hidden = true; form.hidden = false; $('#agendamento').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  $('#printBtn').addEventListener('click', function () { window.print(); });
})();
