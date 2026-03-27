/* =============================================
   CUSTOM CURSOR
============================================= */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
  cursor.classList.add('visible');
  cursorDot.classList.add('visible');
});

document.addEventListener('mouseleave', () => {
  cursor.classList.remove('visible');
  cursorDot.classList.remove('visible');
});

// Smooth lagging cursor ring
function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.12;
  cursorY += (mouseY - cursorY) * 0.12;
  cursor.style.left = cursorX + 'px';
  cursor.style.top  = cursorY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Grow on interactive elements
document.querySelectorAll('a, button, .project-card, .exp-card, .screenshot').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('active'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
});

/* =============================================
   SCROLL PROGRESS BAR
============================================= */
const progressBar = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

/* =============================================
   NAV: scroll class + active section highlight
============================================= */
const nav     = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);

  // Hide scroll hint after scrolling
  const hint = document.getElementById('scrollHint');
  if (hint) hint.style.opacity = window.scrollY > 80 ? '0' : '1';
}, { passive: true });

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', active);
      });
    }
  });
}, { threshold: 0.45 });

sections.forEach(s => sectionObserver.observe(s));

/* =============================================
   HAMBURGER MENU
============================================= */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open');
});

navLinksEl.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
  });
});

/* =============================================
   HERO CANVAS — Particle field
============================================= */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  const COUNT   = 70;
  const MAX_DIST = 130;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.5 + 0.5,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, makeParticle);
  }

  let mx = -9999, my = -9999;
  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  });
  canvas.parentElement.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(167,139,250,${(1 - dist / MAX_DIST) * 0.18})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Mouse attraction lines
      const dx = particles[i].x - mx;
      const dy = particles[i].y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MAX_DIST * 1.4) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mx, my);
        ctx.strokeStyle = `rgba(244,114,182,${(1 - dist / (MAX_DIST * 1.4)) * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(167,139,250,0.55)';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', init);
})();

/* =============================================
   SCROLL ANIMATIONS — fade-up with stagger
============================================= */
const fadeEls = document.querySelectorAll(
  '.exp-card, .project-card, .about-text, .about-education, .timeline-item, .section-title, .section-label'
);

fadeEls.forEach(el => el.classList.add('fade-up'));

// Assign stagger index within sibling groups
document.querySelectorAll('.exp-list, .projects-grid, .timeline').forEach(group => {
  [...group.children].forEach((child, idx) => {
    child.style.transitionDelay = `${idx * 0.1}s`;
  });
});

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

fadeEls.forEach(el => fadeObserver.observe(el));

/* =============================================
   SKILL TAGS — staggered reveal
============================================= */
const skillsRow = document.querySelector('.skills-row');
const tags = document.querySelectorAll('.skill-tag');

const tagsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      tags.forEach((tag, i) => {
        setTimeout(() => tag.classList.add('revealed'), i * 60);
      });
      tagsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

if (skillsRow) tagsObserver.observe(skillsRow);

/* =============================================
   PROJECT CARDS — 3D tilt on mouse move
============================================= */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1), border-color 0.25s, box-shadow 0.25s';
    setTimeout(() => card.style.transition = '', 500);
  });
});

/* =============================================
   MAGNETIC BUTTONS
============================================= */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) * 0.3;
    const y = (e.clientY - rect.top  - rect.height / 2) * 0.3;
    btn.style.transform = `translate(${x}px, ${y}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    btn.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
    setTimeout(() => btn.style.transition = '', 400);
  });
});

/* =============================================
   MODAL
============================================= */
function openModal(id) {
  const overlay = document.getElementById(`modal-${id}`);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Make screenshots in this modal clickable for lightbox
  overlay.querySelectorAll('.screenshot').forEach((img, i) => {
    img.style.cursor = 'zoom-in';
    img.onclick = (e) => {
      e.stopPropagation();
      openLightbox(overlay.querySelectorAll('.screenshot'), i);
    };
  });
}

function closeModal(id) {
  const overlay = document.getElementById(`modal-${id}`);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  const video = overlay.querySelector('video');
  if (video) video.pause();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(el => {
      closeModal(el.id.replace('modal-', ''));
    });
    closeLightbox();
  }
});

/* =============================================
   LIGHTBOX
============================================= */
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
let lbImages = [];
let lbIndex  = 0;

function openLightbox(imgs, index) {
  lbImages = Array.from(imgs);
  lbIndex  = index;
  lightboxImg.src = lbImages[lbIndex].src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  updateLightboxNav();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  if (!document.querySelector('.modal-overlay.open')) {
    document.body.style.overflow = '';
  }
}

function lightboxNav(dir, e) {
  if (e) e.stopPropagation();
  lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = lbImages[lbIndex].src;
    lightboxImg.style.opacity = '1';
    updateLightboxNav();
  }, 150);
}

function updateLightboxNav() {
  const prev = document.querySelector('.lightbox-prev');
  const next = document.querySelector('.lightbox-next');
  if (prev) prev.style.display = lbImages.length > 1 ? '' : 'none';
  if (next) next.style.display = lbImages.length > 1 ? '' : 'none';
}

// Keyboard nav in lightbox
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight') lightboxNav(1, null);
  if (e.key === 'ArrowLeft')  lightboxNav(-1, null);
});
