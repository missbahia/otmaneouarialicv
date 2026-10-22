
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



  // Galerie Mes projets : filtres, flèches et points de navigation
  const projectsTrack = document.getElementById('projectsTrack');
  const projectFilters = document.getElementById('projectFilters');
  const projectDots = document.getElementById('projectDots');
  const projectPrev = document.querySelector('.project-prev');
  const projectNext = document.querySelector('.project-next');

  if (projectsTrack && projectFilters && projectDots && projectPrev && projectNext) {
    // Remplace les exemples par tes propres projets et fichiers dans assets/projects/.
    // Formats conseillés : JPG/PNG/WebP pour images, MP4 pour vidéos.
    const projects = [
      {
        title: 'Caisse Calculator — Subway',
        category: 'Applications',
        description: 'Application de calcul de caisse et de gestion des billets, pièces et opérations quotidiennes.',
        media: 'assets/projects/caisse-calculator.mp4',
        mediaType: 'video',
        link: ''
      },
      {
        title: 'Site web & interface utilisateur',
        category: 'Web',
        description: 'Conception d’une interface web moderne, responsive et adaptée aux besoins du projet.',
        media: 'assets/projects/site-web.jpg',
        mediaType: 'image',
        link: ''
      },
      {
        title: 'Automatisation & scripts',
        category: 'Automatisation',
        description: 'Automatisation de tâches répétitives afin de gagner du temps et d’améliorer l’efficacité.',
        media: 'assets/projects/automatisation.mp4',
        mediaType: 'video',
        link: ''
      },
      {
        title: 'Marketing digital & design',
        category: 'Marketing',
        description: 'Création de contenus visuels et de solutions numériques pour des projets marketing.',
        media: 'assets/projects/marketing.jpg',
        mediaType: 'image',
        link: ''
      }
    ];

    let activeProjectFilter = 'Tous';
    let currentProjectIndex = 0;
    let filteredProjects = projects.slice();

    const escapeProjectHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));

    const renderProjectMedia = (project) => {
      const media = escapeProjectHTML(project.media);
      const title = escapeProjectHTML(project.title);
      if (project.mediaType === 'video') {
        return `<video controls playsinline preload="metadata" aria-label="Vidéo du projet ${title}">
          <source src="${media}" type="video/mp4">
          Votre navigateur ne prend pas en charge la vidéo.
        </video><div class="project-media-fallback" hidden>Ajoute le fichier : ${media}</div>`;
      }
      return `<img src="${media}" alt="Capture du projet ${title}" loading="lazy">
        <div class="project-media-fallback" hidden>Ajoute l’image : ${media}</div>`;
    };

    const updateProjectSlide = (animate = true) => {
      projectsTrack.querySelectorAll('video').forEach((video) => video.pause());
      projectsTrack.style.transition = animate ? '' : 'none';
      projectsTrack.style.transform = `translateX(-${currentProjectIndex * 100}%)`;
      projectDots.querySelectorAll('.project-dot').forEach((dot, index) => {
        const selected = index === currentProjectIndex;
        dot.classList.toggle('active', selected);
        dot.setAttribute('aria-current', String(selected));
      });
      if (!animate) requestAnimationFrame(() => { projectsTrack.style.transition = ''; });
    };

    const goToProject = (index) => {
      if (!filteredProjects.length) return;
      currentProjectIndex = (index + filteredProjects.length) % filteredProjects.length;
      updateProjectSlide();
    };

    const renderProjects = () => {
      filteredProjects = projects.filter((project) =>
        activeProjectFilter === 'Tous' || project.category === activeProjectFilter
      );
      currentProjectIndex = 0;

      if (!filteredProjects.length) {
        projectsTrack.innerHTML = '<div class="project-empty">Aucun projet dans cette catégorie pour le moment.</div>';
      } else {
        projectsTrack.innerHTML = filteredProjects.map((project, index) => {
          const title = escapeProjectHTML(project.title);
          const category = escapeProjectHTML(project.category);
          const description = escapeProjectHTML(project.description);
          const link = typeof project.link === 'string' ? project.link.trim() : '';
          const safeLink = /^https?:\/\/\S+$/i.test(link)
            ? `<div class="project-actions"><a class="project-link" href="${escapeProjectHTML(link)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square"></i> Voir le projet</a></div>`
            : '';
          return `<article class="project-slide" aria-label="Projet ${index + 1}">
            <div class="project-card">
              <div class="project-media"><span class="project-media-label"><i class="fa-solid fa-folder-open"></i> ${category}</span>${renderProjectMedia(project)}</div>
              <div class="project-info"><span class="project-category">${category}</span><h3>${title}</h3><p>${description}</p>${safeLink}</div>
            </div></article>`;
        }).join('');
      }

      projectDots.innerHTML = filteredProjects.map((project, index) =>
        `<button class="project-dot ${index === 0 ? 'active' : ''}" type="button" data-index="${index}" aria-label="Afficher le projet ${index + 1}" aria-current="${index === 0}"></button>`
      ).join('');

      projectFilters.querySelectorAll('.project-filter').forEach((button) => {
        const selected = button.dataset.filter === activeProjectFilter;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      projectPrev.disabled = filteredProjects.length < 2;
      projectNext.disabled = filteredProjects.length < 2;

      // Message clair si une image ou une vidéo n’a pas encore été ajoutée.
      projectsTrack.querySelectorAll('.project-media img').forEach((img) => {
        const showFallback = () => {
          const fallback = img.nextElementSibling;
          img.hidden = true;
          if (fallback) { fallback.hidden = false; fallback.style.display = 'grid'; }
        };
        img.addEventListener('error', showFallback, { once: true });
        if (img.complete && img.naturalWidth === 0) showFallback();
      });
      projectsTrack.querySelectorAll('.project-media video').forEach((video) => {
        video.addEventListener('error', () => {
          const fallback = video.nextElementSibling;
          video.hidden = true;
          if (fallback) { fallback.hidden = false; fallback.style.display = 'grid'; }
        }, { once: true });
      });
      updateProjectSlide(false);
    };

    projectFilters.addEventListener('click', (event) => {
      const button = event.target.closest('.project-filter');
      if (!button) return;
      activeProjectFilter = button.dataset.filter;
      renderProjects();
    });
    projectPrev.addEventListener('click', () => goToProject(currentProjectIndex - 1));
    projectNext.addEventListener('click', () => goToProject(currentProjectIndex + 1));
    projectDots.addEventListener('click', (event) => {
      const button = event.target.closest('.project-dot');
      if (button) goToProject(Number(button.dataset.index));
    });
    projectsTrack.closest('.projects-carousel').addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); goToProject(currentProjectIndex - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); goToProject(currentProjectIndex + 1); }
    });
    renderProjects();
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

