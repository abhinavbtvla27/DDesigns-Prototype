(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- footer year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- mobile menu ---------- */
  var toggle = $('#navToggle'), links = $('#navLinks');
  function closeMenu() { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('a', links).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- scroll spy: nav link colour follows the section on screen ---------- */
  var sections = ['home', 'projects', 'about', 'services', 'contact'].map(function (id) { return document.getElementById(id); });
  var navLinks = $$('a', links);
  var current = '';
  function spy() {
    var line = window.scrollY + document.documentElement.clientHeight * 0.35 + 0; // reading line
    var active = sections[0].id;
    sections.forEach(function (s) { if (s.offsetTop <= line) active = s.id; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) active = 'contact';
    if (active === current) return;
    current = active;
    navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + active); });
  }
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  spy();

  /* ---------- counting numbers: once, when they come into view ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(el) {
    var target = +el.dataset.count, suffix = el.dataset.suffix || '', dur = 1400, start = null;
    if (reduce) { el.textContent = target + suffix; return; }
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * ease(p)) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var nums = $$('.stat__num');
  if ('IntersectionObserver' in window) {
    var statsIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { nums.forEach(countUp); obs.disconnect(); }
      });
    }, { threshold: 0.45 });
    statsIO.observe($('#stats'));
  } else { nums.forEach(countUp); }

  /* ---------- testimonials: continuous slow drift to the left ---------- */
  var reviews = [
    ['Homeowner · Architecture', 'They listened to every idea we had and turned it into a home that feels exactly like us.'],
    ['Homeowner · Interior Design', 'The kitchen is the heart of our house now. Beautiful finish and no surprises on cost.'],
    ['Homeowner · Construction', 'From the first sketch to the day we got the keys, the team kept us informed at every step.'],
    ['Homeowner · Space Planning', 'Our plot was small, yet the layout they planned makes every room feel open and bright.'],
    ['Homeowner · Architecture', 'Warm, honest and professional. They finished on time and the quality speaks for itself.'],
    ['Homeowner · Interior Design', 'The wooden details and lighting in our living room get compliments from every guest.'],
    ['Homeowner · Construction', 'Their guidance on site saved us from costly mistakes. We always felt supported.'],
    ['Homeowner · Architecture', 'We recommend D-Designs to every friend planning a home. A calm and happy experience.']
  ];
  var user = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
  function card(r) {
    return '<article class="review"><div class="review__top"><div class="avatar">' + user + '</div>' +
      '<div class="review__who"><b>Client Name</b><small>' + r[0] + '</small></div></div>' +
      '<div class="stars" aria-label="5 out of 5 stars">★★★★★</div><p>' + r[1] + '</p></article>';
  }
  var html = reviews.map(card).join('');
  $('#marqueeTrack').innerHTML = html + html; // doubled so the loop is seamless

  /* ---------- projects filter with sliding pill ---------- */
  var filter = $('#filter'), pill = $('#filterPill'), btns = $$('button', filter), groups = $$('.group');
  function movePill(btn) {
    pill.style.left = btn.offsetLeft + 'px';
    pill.style.width = btn.offsetWidth + 'px';
  }
  var copy = {
    all: ['OUR PROJECTS', 'Spaces our clients love living in', 'A look at the homes and interiors we have designed, from first sketch to the final finishing touch.'],
    exterior: ['EXTERIOR AND ARCHITECTURE', 'Homes that welcome you in', 'Architecture shaped around light, climate and the way your family lives, from the first sketch to the final facade.'],
    interior: ['INTERIOR DESIGN', 'Interiors made for everyday living', 'Kitchens, living spaces and details designed to feel warm, calm and completely yours.']
  };
  var phead = $('#phead');
  function swapHead(val) {
    phead.classList.add('is-hiding');
    setTimeout(function () {
      $('#pEyebrow').textContent = copy[val][0]; $('#pTitle').textContent = copy[val][1]; $('#pLead').textContent = copy[val][2];
      phead.classList.remove('is-hiding');
    }, 220);
  }
  function applyFilter(val) {
    swapHead(val);
    groups.forEach(function (g) {
      var show = val === 'all' || g.dataset.group === val;
      if (show) {
        g.hidden = false;
        requestAnimationFrame(function () { requestAnimationFrame(function () { g.classList.remove('is-hiding'); }); });
      } else {
        g.classList.add('is-hiding');
        setTimeout(function () { if (g.classList.contains('is-hiding')) g.hidden = true; }, 350);
      }
    });
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', x === b); });
      movePill(b);
      applyFilter(b.dataset.filter);
    });
  });
  function initPill() { movePill($('.is-active', filter)); }
  window.addEventListener('resize', initPill);
  window.addEventListener('load', initPill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(initPill);
  initPill();

  /* ---------- project lightbox ---------- */
  var lb = $('#lightbox'), lbImg = $('img', lb);
  $$('.proj').forEach(function (p) {
    p.addEventListener('click', function () {
      lbImg.src = p.dataset.src; lbImg.alt = $('h4', p).textContent; lb.hidden = false;
    });
  });
  lb.addEventListener('click', function () { lb.hidden = true; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.hidden = true; });

  /* ---------- consultation form -> WhatsApp (no server needed) ---------- */
  var WHATSAPP = '919946999153';
  var form = $('#consultForm'), note = $('#formNote'), dateInput = $('#dateInput');
  dateInput.min = new Date().toISOString().split('T')[0];
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fName = form.elements['name'], fPhone = form.elements['phone'];
    var name = fName.value.trim(), phone = fPhone.value.trim(), ok = true;
    [fName, fPhone].forEach(function (f) { f.classList.remove('is-error'); });
    if (!name) { fName.classList.add('is-error'); ok = false; }
    if (!/^[+\d][\d\s-]{7,}$/.test(phone)) { fPhone.classList.add('is-error'); ok = false; }
    if (!ok) { note.className = 'form__note'; note.textContent = 'Please enter your name and a valid phone number.'; return; }
    var topics = $$('input[name=topic]:checked', form).map(function (c) { return c.value; }).join(', ');
    var lines = ['Hello D-Designs, I would like to book a free consultation.',
      'Name: ' + name, 'Phone: ' + phone];
    if (form.email.value) lines.push('Email: ' + form.email.value);
    if (form.date.value) lines.push('Preferred date: ' + form.date.value);
    if (form.time.value) lines.push('Preferred time: ' + form.time.value);
    if (topics) lines.push('Interested in: ' + topics);
    if (form.notes.value.trim()) lines.push('Notes: ' + form.notes.value.trim());
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    note.className = 'form__note ok';
    note.textContent = 'Thank you, ' + name.split(' ')[0] + '! Send the message in WhatsApp and we will confirm your slot.';
    form.reset();
  });

  /* ---------- gentle reveal on scroll ---------- */
  var revealEls = $$('.card, .proj, .pillar, .form, .reach, .cta, .about__copy, .about__photo');
  revealEls.forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else { revealEls.forEach(function (el) { el.classList.add('in'); }); }
})();
