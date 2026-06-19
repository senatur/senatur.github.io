/* ============================================================
   Mohammad — Portfolio interactions
   Vanilla JS, no dependencies
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar scroll state + active link + progress ---------- */
  const navbar = document.getElementById('navbar');
  const scrollBar = document.getElementById('scrollBar');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = navLinks
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  function onScroll() {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 40);

    // progress bar
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollBar) scrollBar.style.width = docH > 0 ? (y / docH) * 100 + '%' : '0%';

    // active link
    let current = sections[0] ? sections[0].id : 'home';
    const offset = window.innerHeight * 0.35;
    sections.forEach((sec) => {
      if (sec.getBoundingClientRect().top <= offset) current = sec.id;
    });
    navLinks.forEach((l) =>
      l.classList.toggle('active', l.getAttribute('href') === '#' + current)
    );

    updateTimeline();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navLinks');
  function closeMenu() {
    if (!navMenu) return;
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* ---------- Smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // small stagger for grouped items
            setTimeout(() => el.classList.add('visible'), Math.min(i * 60, 240));
            // progress + counters trigger
            if (el.querySelector('.progress-fill')) fillProgress(el);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  function fillProgress(scope) {
    scope.querySelectorAll('.progress-fill').forEach((bar) => {
      const pct = bar.getAttribute('data-fill');
      requestAnimationFrame(() => (bar.style.width = pct + '%'));
    });
  }
  // ensure progress bars also fill if revealed elsewhere
  document.querySelectorAll('.progress-row').forEach((row) => {
    if ('IntersectionObserver' in window && !prefersReduced) {
      const o = new IntersectionObserver((ents) => {
        ents.forEach((en) => { if (en.isIntersecting) { fillProgress(row); o.disconnect(); } });
      }, { threshold: 0.4 });
      o.observe(row);
    } else { fillProgress(row); }
  });

  /* ---------- Count-up numbers ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  function toFa(n) { return String(n).replace(/[0-9]/g, (d) => FA_DIGITS[+d]); }

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const fa = el.getAttribute('data-fa') === 'true';
    const fmt = (n) => (fa ? toFa(n) : String(n));
    if (prefersReduced) { el.textContent = fmt(target); return; }
    const dur = 1400;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach((c) => {
      const v = c.getAttribute('data-count');
      c.textContent = c.getAttribute('data-fa') === 'true' ? toFa(v) : v;
    });
  }

  /* ---------- Timeline progress ---------- */
  const timeline = document.querySelector('.timeline');
  const timelineProgress = document.getElementById('timelineProgress');
  const tlItems = Array.from(document.querySelectorAll('.tl-item'));
  function updateTimeline() {
    if (!timeline || !timelineProgress) return;
    const rect = timeline.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height;
    const scrolled = Math.min(Math.max(vh * 0.5 - rect.top, 0), total);
    timelineProgress.style.height = (scrolled / total) * 100 + '%';
    const mid = vh * 0.6;
    tlItems.forEach((item) => {
      const r = item.getBoundingClientRect();
      item.classList.toggle('active', r.top < mid);
    });
  }

  /* ---------- Parallax background ---------- */
  const grid = document.querySelector('.bg-grid');
  const fogA = document.querySelector('.fog-a');
  const fogB = document.querySelector('.fog-b');
  if (!prefersReduced) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (grid) grid.style.transform =
        `perspective(420px) rotateX(58deg) translateY(${y * 0.12}px)`;
      if (fogA) fogA.style.transform = `translateY(${y * 0.06}px)`;
      if (fogB) fogB.style.transform = `translateY(${-y * 0.05}px)`;
    }, { passive: true });
  }

  /* ---------- Terminal typing ---------- */
  const termBody = document.getElementById('terminalBody');
  const script = [
    { cmd: 'whoami', out: 'دانشجوی لینوکس و امنیت سایبری' },
    { cmd: 'current_focus', out: 'لینوکس | شبکه | امنیت سایبری' },
    { cmd: 'status', out: 'در حال یادگیری و ساخت پروژه' },
    { cmd: 'mission', out: 'از لینوکس تا تست نفوذ؛ در مسیر ساخت مهارت‌های واقعی.' },
  ];

  function makeLine(html) {
    const div = document.createElement('div');
    div.className = 't-line';
    div.innerHTML = html;
    return div;
  }

  async function typeText(node, text, speed) {
    for (let i = 0; i < text.length; i++) {
      node.textContent += text[i];
      await wait(speed);
    }
  }
  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

  async function runTerminal() {
    if (!termBody) return;
    const cursor = document.createElement('span');
    cursor.className = 't-cursor';

    if (prefersReduced) {
      script.forEach((s) => {
        termBody.appendChild(makeLine(`<span class="t-prompt">&gt; </span><span class="t-cmd">${s.cmd}</span>`));
        termBody.appendChild(makeLine(`<span class="t-out">${s.out}</span>`));
      });
      termBody.appendChild(makeLine('<span class="t-prompt">&gt; </span>')).appendChild(cursor);
      return;
    }

    await wait(600);
    for (const step of script) {
      // command line
      const cmdLine = makeLine('<span class="t-prompt">&gt; </span>');
      const cmdSpan = document.createElement('span');
      cmdSpan.className = 't-cmd';
      cmdLine.appendChild(cmdSpan);
      cmdLine.appendChild(cursor);
      termBody.appendChild(cmdLine);
      await typeText(cmdSpan, step.cmd, 70);
      await wait(380);
      // output line
      const outLine = makeLine('');
      const outSpan = document.createElement('span');
      outSpan.className = 't-out';
      outLine.appendChild(outSpan);
      termBody.appendChild(outLine);
      cmdLine.removeChild(cursor);
      await typeText(outSpan, step.out, 28);
      await wait(650);
    }
    // final prompt with blinking cursor, then loop
    const last = makeLine('<span class="t-prompt">&gt; </span>');
    last.appendChild(cursor);
    termBody.appendChild(last);

    await wait(7000);
    termBody.innerHTML = '';
    runTerminal();
  }
  runTerminal();

  /* ---------- Particle canvas ---------- */
  const canvas = document.getElementById('particles');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    let w, h, particles, raf;
    const COUNT = () => Math.min(70, Math.floor(window.innerWidth / 22));

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function makeParticles() {
      particles = [];
      const n = COUNT();
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.8 + 0.4,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -(Math.random() * 0.35 + 0.08),
          a: Math.random() * 0.5 + 0.2,
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${Math.floor(20 + p.a * 30)}, 51, ${p.a})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255,26,26,0.8)';
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    resize();
    makeParticles();
    draw();
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { resize(); makeParticles(); }, 200);
    });
    // pause when tab hidden to save CPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { draw(); }
    });
  }

  /* initial paint */
  onScroll();
})();
