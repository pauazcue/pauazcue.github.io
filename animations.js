(function() {
  'use strict';

  // ── IntersectionObserver para fade-in ──────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  // Aplicar .reveal a los elementos automáticamente
  function setupReveal() {
    // Títulos
    document.querySelectorAll('h1, h2').forEach((el, i) => {
      el.classList.add('reveal');
    });

    // Párrafos y leads
    document.querySelectorAll('.case-lead, .case-section p, .hero-bajada p, .hero-intro').forEach(el => {
      el.classList.add('reveal', 'reveal--delay-1');
    });

    // Quotes
    document.querySelectorAll('.quote-block').forEach(el => {
      el.classList.add('reveal', 'reveal--slow', 'reveal--delay-1');
    });

    // Imágenes
    document.querySelectorAll('.img-full, .img-wide, .img-hero-split, .hero-photo').forEach(el => {
      el.classList.add('reveal', 'reveal--image');
    });

    // Steps individuales con delay escalonado
    document.querySelectorAll('.step').forEach((el, i) => {
      el.classList.add('reveal');
      const delay = Math.min(i % 5, 4);
      if (delay > 0) el.classList.add(`reveal--delay-${delay}`);
    });

    // Impact cards
    document.querySelectorAll('.impact-card, .stat').forEach((el, i) => {
      el.classList.add('reveal');
      const delay = Math.min(i % 4, 3) + 1;
      el.classList.add(`reveal--delay-${delay}`);
    });

    // Meta del header del caso
    document.querySelectorAll('.case-meta-item').forEach((el, i) => {
      el.classList.add('reveal');
      if (i > 0) el.classList.add(`reveal--delay-${Math.min(i, 4)}`);
    });

    // Cards del portfolio
    document.querySelectorAll('.portfolio-card').forEach((el, i) => {
      el.classList.add('reveal');
      const delay = (i % 2) + 1;
      el.classList.add(`reveal--delay-${delay}`);
    });

    // Observar todos
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // ── Contadores animados ────────────────────────────────────
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function setupCounters() {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-target]').forEach(el => {
      counterObserver.observe(el);
    });
  }

  // ── Init ───────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupReveal();
      setupCounters();
    });
  } else {
    setupReveal();
    setupCounters();
  }

})();
