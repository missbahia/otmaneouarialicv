
document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Navbar toggle (mobile)
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => navList.classList.toggle('open'));
    navList.addEventListener('click', (e) => {
      if (e.target.matches('a')) navList.classList.remove('open');
    });
  }

  // Smooth scroll is via CSS; ensure focus management for accessibility
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          // Allow CSS smooth scroll to do its job
          setTimeout(() => target.setAttribute('tabindex', '-1'), 0);
        }
      }
    });
  });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReduced) {
    revealEls.forEach(el => el.classList.add('show'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  }

  // Animated counters in hero stats
  const counters = document.querySelectorAll('.stat .num');
  const startCounter = (el) => {
    const end = parseInt(el.dataset.count || '0', 10);
    if (!Number.isFinite(end)) return;
    if (prefersReduced) { el.textContent = end; return; }
    const duration = 1200; // ms
    const start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - startTime) / duration);
      const value = Math.floor(start + (end - start) * easeOutCubic(p));
      el.textContent = value;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  if (counters.length) {
    if (prefersReduced) {
      counters.forEach(startCounter);
    } else {
      const ioCounters = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startCounter(entry.target);
            ioCounters.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(c => ioCounters.observe(c));
    }
  }

  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Contact form validation (client-side)
  const form = document.querySelector('.contact-form');
  if (form) {
    const fields = {
      name: form.querySelector('#name'),
      email: form.querySelector('#email'),
      message: form.querySelector('#message')
    };
    const errors = form.querySelectorAll('.error');

    const showError = (input, msg) => {
      const small = input.parentElement.querySelector('.error');
      if (small) small.textContent = msg || '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };

    const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const validate = () => {
      let ok = true;
      const nameVal = fields.name.value.trim();
      const emailVal = fields.email.value.trim();
      const msgVal = fields.message.value.trim();
      if (nameVal.length < 2) { showError(fields.name, 'Veuillez entrer au moins 2 caractères.'); ok = false; } else showError(fields.name);
      if (!validateEmail(emailVal)) { showError(fields.email, 'Veuillez entrer un email valide.'); ok = false; } else showError(fields.email);
      if (msgVal.length < 10) { showError(fields.message, 'Votre message doit contenir au moins 10 caractères.'); ok = false; } else showError(fields.message);
      return ok;
    };

    form.addEventListener('input', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      // lightweight per-field validation
      if (target.id === 'name' && target.value.trim().length >= 2) showError(target);
      if (target.id === 'email' && validateEmail(target.value.trim())) showError(target);
      if (target.id === 'message' && target.value.trim().length >= 10) showError(target);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validate()) {
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Envoi...'; }
        // Submit to FormSubmit
        form.submit();
      }
    });
  }
});

