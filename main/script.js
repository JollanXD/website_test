/* =========================================================
   JOLLAN — interactions
   ========================================================= */

(() => {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- boot sequence ---------------- */
  const bootScreen = document.getElementById('boot-screen');
  const bootLines = document.getElementById('boot-lines');
  const bootBar = document.querySelector('#boot-bar i');
  const bootTear = document.getElementById('boot-tear');
  const heroLogo = document.querySelector('.glitch-wrap');
  const heroSupport = document.querySelectorAll('.hero-support-fade');
  const threadSvg = document.getElementById('thread-lines');

  const bootScript = [
    { text: 'BOOT...', cls: 'ok' },
    { text: 'LOADING...', cls: 'ok' },
    { text: 'CALIBRATING...', cls: 'ok' },
    { text: 'SEARCHING IDENTITY...', cls: '' },
    { text: '404 — NOT FOUND', cls: 'err' },
    { text: 'REBUILDING FROM FRAGMENTS...', cls: '' },
  ];

  function finishBoot() {
    if (bootBar) bootBar.style.width = '100%';
    if (bootTear) {
      bootTear.classList.add('tear');
    }
    setTimeout(() => {
      bootScreen && bootScreen.classList.add('boot-done');
      document.body.classList.remove('is-booting');

      // hero logo "birth" glitch-in
      if (heroLogo) {
        heroLogo.classList.remove('emerge-pending');
        heroLogo.classList.add('emerge-in');
      }
      heroSupport.forEach((el, i) => {
        setTimeout(() => el.classList.add('in'), 500 + i * 160);
      });
      if (threadSvg) threadSvg.classList.add('draw');
    }, 260);
  }

  function runBoot() {
    if (!bootLines || !bootScreen) { document.body.classList.remove('is-booting'); return; }

    if (reduceMotion) {
      // skip typewriter theatrics, just fade out quickly
      bootScreen.classList.add('boot-done');
      document.body.classList.remove('is-booting');
      if (heroLogo) { heroLogo.classList.remove('emerge-pending'); heroLogo.style.opacity = 1; heroLogo.style.filter = 'none'; heroLogo.style.transform = 'none'; }
      heroSupport.forEach((el) => el.classList.add('in'));
      if (threadSvg) threadSvg.classList.add('draw');
      return;
    }

    let lineIndex = 0;
    if (bootBar) bootBar.style.width = '92%';

    function typeLine() {
      if (lineIndex >= bootScript.length) {
        setTimeout(finishBoot, 260);
        return;
      }
      const { text, cls } = bootScript[lineIndex];
      const lineEl = document.createElement('div');
      if (cls) lineEl.classList.add(cls);
      bootLines.appendChild(lineEl);

      let charIndex = 0;
      const speed = 14 + Math.random() * 10;

      const typer = setInterval(() => {
        lineEl.textContent = text.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex >= text.length) {
          clearInterval(typer);
          lineIndex++;
          setTimeout(typeLine, 160);
        }
      }, speed);
    }

    setTimeout(typeLine, 200);
  }

  runBoot();

  /* ---------------- scroll parallax ---------------- */
  if (!reduceMotion) {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      parallaxEls.forEach((el) => {
        const factor = parseFloat(el.getAttribute('data-parallax')) || 0;
        el.style.transform = `translateY(${scrollY * factor}px)`;
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });
  }

  /* ---------------- scramble text reveal ---------------- */
  const scrambleChars = '!<>-_\\/[]{}—=+*^?#01';

  function scrambleReveal(el) {
    if (el.dataset.scrambled === 'done') return;
    el.dataset.scrambled = 'done';
    el.classList.add('scramble-in');

    // scramble only the plain text nodes, keep the red "/" span intact
    const spans = el.querySelectorAll('span');
    const skip = new Set(Array.from(spans));

    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const original = node.textContent;
      if (!original.trim()) return;

      const wrapper = document.createElement('span');
      wrapper.textContent = original;
      node.replaceWith(wrapper);

      if (reduceMotion) return;

      let frame = 0;
      const totalFrames = 16;
      const finalText = original;

      const iv = setInterval(() => {
        frame++;
        let out = '';
        for (let i = 0; i < finalText.length; i++) {
          const ch = finalText[i];
          if (ch === ' ') { out += ' '; continue; }
          const revealPoint = (i / finalText.length) * totalFrames;
          out += frame > revealPoint
            ? ch
            : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }
        wrapper.textContent = out;
        if (frame >= totalFrames) {
          clearInterval(iv);
          wrapper.textContent = finalText;
        }
      }, 35);
    });
  }

  const scrambleTargets = document.querySelectorAll('[data-scramble]');
  if ('IntersectionObserver' in window && scrambleTargets.length) {
    const scrambleIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          scrambleReveal(entry.target);
          scrambleIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    scrambleTargets.forEach((el) => scrambleIO.observe(el));
  } else {
    scrambleTargets.forEach((el) => el.classList.add('scramble-in'));
  }

  /* ---------------- custom cursor ---------------- */
  if (!isTouch) {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverTargets = document.querySelectorAll('a, button, .proj-card, .skill-row');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ---------------- hero logo flicker ---------------- */
  const glitchWrap = document.querySelector('.glitch-wrap');
  if (glitchWrap) {
    setInterval(() => {
      if (Math.random() > 0.85) {
        glitchWrap.style.opacity = (0.55 + Math.random() * 0.2).toFixed(2);
        setTimeout(() => { glitchWrap.style.opacity = 1; }, 70 + Math.random() * 90);
      }
    }, 1400);
  }

  /* ---------------- occasional full-screen glitch pulse ---------------- */
  const noiseLayer = document.querySelector('.noise-layer');
  if (noiseLayer) {
    setInterval(() => {
      if (Math.random() > 0.8) {
        noiseLayer.style.opacity = '0.14';
        setTimeout(() => { noiseLayer.style.opacity = '0.05'; }, 90);
      }
    }, 2600);
  }

  /* ---------------- reveal on scroll ---------------- */
  const revealTargets = document.querySelectorAll('.proj-card, .skill-row');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.transition = 'opacity .6s ease, transform .6s ease';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      io.observe(el);
    });
  }

  /* ---------------- keyboard glitch trigger for project cards ---------------- */
  document.querySelectorAll('.proj-card').forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        card.classList.add('kb-glitch');
        setTimeout(() => card.classList.remove('kb-glitch'), 500);
      }
    });
  });
})();
