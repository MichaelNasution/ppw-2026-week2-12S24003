/**
 * animations.js — Interactive Motion Controller (Powered by Anime.js v4)
 * Mengelola >80% interaksi mikro, transisi state, 3D tilt, dan scroll-reveal
 * dengan tetap menghormati preferensi aksesibilitas (prefers-reduced-motion).
 */
const AppAnimations = {
  isReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  hasAnime() {
    return typeof window.anime !== 'undefined' && typeof window.anime.animate === 'function';
  },

  /**
   * Inisialisasi seluruh animasi statis & observer saat halaman siap
   */
  init() {
    if (!this.hasAnime() || this.isReducedMotion()) return;

    this.initHeroEntrance();
    this.initAmbientMotion();
    this.init3DTiltCard();
    this.initScrollReveal();
    this.initMicroInteractions();
    this.initModalSpringHooks();
    this.initNavbarScrollEffect();
  },

  /**
   * 1. Staggered Hero Reveal & Animated Metrics Counter
   */
  initHeroEntrance() {
    const { animate, stagger } = window.anime;

    const heroItems = document.querySelectorAll('.hero-anim-item');
    if (heroItems.length) {
      animate(heroItems, {
        opacity: [0, 1],
        translateY: [28, 0],
        duration: 850,
        delay: stagger(95, { start: 80 }),
        ease: 'outExpo'
      });
    }

    const heroCard = document.querySelector('.hero-anim-card');
    if (heroCard) {
      animate(heroCard, {
        opacity: [0, 1],
        translateY: [36, 0],
        scale: [0.94, 1],
        duration: 950,
        delay: 260,
        ease: 'outExpo'
      });
    }

    this.animateCounters();
  },

  /**
   * Animasi angka metrik pada Hero Section
   */
  animateCounters() {
    if (!this.hasAnime() || this.isReducedMotion()) return;
    const { animate } = window.anime;

    document.querySelectorAll('.metric-number[data-count-target]').forEach((el) => {
      const targetVal = parseInt(el.getAttribute('data-count-target'), 10);
      if (isNaN(targetVal)) return;
      const suffix = el.textContent.includes('+') ? '+' : '';
      const counterObj = { val: 0 };

      animate(counterObj, {
        val: targetVal,
        duration: 1400,
        delay: 350,
        ease: 'outQuart',
        onUpdate: () => {
          el.textContent = Math.round(counterObj.val) + suffix;
        }
      });
    });
  },

  /**
   * 2. Ambient Orbs & Pulsing Status Indicators
   */
  initAmbientMotion() {
    const { animate } = window.anime;

    const dots = document.querySelectorAll('.status-pulse-dot');
    if (dots.length) {
      animate(dots, {
        scale: [1, 1.32],
        opacity: [1, 0.65],
        duration: 1200,
        loop: true,
        alternate: true,
        ease: 'inOutSine'
      });
    }

    const orb1 = document.querySelector('.ambient-orb.orb-1');
    const orb2 = document.querySelector('.ambient-orb.orb-2');
    if (orb1) {
      animate(orb1, {
        translateX: [0, -35],
        translateY: [0, 25],
        scale: [1, 1.08],
        duration: 6000,
        loop: true,
        alternate: true,
        ease: 'inOutSine'
      });
    }
    if (orb2) {
      animate(orb2, {
        translateX: [0, 40],
        translateY: [0, -30],
        scale: [1, 1.1],
        duration: 7200,
        loop: true,
        alternate: true,
        ease: 'inOutSine'
      });
    }
  },

  /**
   * 3. 3D Cursor Tilt Parallax pada Hero Vitals Card
   */
  init3DTiltCard() {
    const { animate } = window.anime;
    const wrapper = document.getElementById('heroTiltCard');
    if (!wrapper) return;

    const card = wrapper.querySelector('.vitals-glass-card');
    const corners = wrapper.querySelectorAll('.viewfinder-corner');
    if (!card) return;

    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6.5;
      const rotateY = ((x - centerX) / centerX) * 6.5;

      animate(card, {
        rotateX,
        rotateY,
        translateY: -4,
        duration: 280,
        ease: 'outQuad'
      });
    });

    wrapper.addEventListener('mouseenter', () => {
      if (corners.length) {
        animate(corners, {
          scale: [1, 1.18],
          duration: 320,
          ease: 'outBack'
        });
      }
    });

    wrapper.addEventListener('mouseleave', () => {
      animate(card, {
        rotateX: 0,
        rotateY: 0,
        translateY: 0,
        duration: 650,
        ease: 'outElastic(1, .6)'
      });
      if (corners.length) {
        animate(corners, {
          scale: 1,
          duration: 350,
          ease: 'outQuad'
        });
      }
    });
  },

  /**
   * 4. Scroll-Triggered Stagger Animations (Riwayat, Pipeline, Keahlian, Form)
   */
  initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    const { animate, stagger } = window.anime;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;

        if (target.classList.contains('history-table-card')) {
          const rows = target.querySelectorAll('.history-row');
          animate(rows, {
            opacity: [0, 1],
            translateX: [-24, 0],
            duration: 650,
            delay: stagger(80),
            ease: 'outCubic'
          });
        } else if (target.id === 'workflowPipeline') {
          const steps = target.querySelectorAll('.pipeline-step');
          const badges = target.querySelectorAll('.step-index');
          animate(steps, {
            opacity: [0, 1],
            translateY: [28, 0],
            scale: [0.95, 1],
            duration: 680,
            delay: stagger(110),
            ease: 'outBack'
          });
          animate(badges, {
            scale: [0.6, 1.12, 1],
            duration: 750,
            delay: stagger(110, { start: 160 }),
            ease: 'outElastic(1, .6)'
          });
        } else if (target.classList.contains('section-skills')) {
          const cards = target.querySelectorAll('.skill-category-card');
          animate(cards, {
            opacity: [0, 1],
            translateY: [32, 0],
            duration: 720,
            delay: stagger(120),
            ease: 'outExpo'
          });
        } else if (target.classList.contains('section-contact')) {
          const panels = target.querySelectorAll('.service-preview-panel, .contact-form-modern');
          animate(panels, {
            opacity: [0, 1],
            translateY: [28, 0],
            duration: 750,
            delay: stagger(140),
            ease: 'outExpo'
          });
        }

        obs.unobserve(target);
      });
    }, { threshold: 0.16 });

    const tableCard = document.querySelector('.history-table-card');
    const pipeline = document.getElementById('workflowPipeline');
    const skillsSec = document.querySelector('.section-skills');
    const contactSec = document.querySelector('.section-contact');

    [tableCard, pipeline, skillsSec, contactSec].forEach((el) => {
      if (el) observer.observe(el);
    });
  },

  /**
   * 5. Micro-Interactions pada Tombol Magnetic, Skill Chips, Pipeline Steps & Form
   */
  initMicroInteractions() {
    const { animate } = window.anime;

    // Magnetic CTA Buttons
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.18;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
        animate(btn, {
          translateX: dx,
          translateY: dy,
          duration: 200,
          ease: 'outQuad'
        });
      });

      btn.addEventListener('mouseleave', () => {
        animate(btn, {
          translateX: 0,
          translateY: 0,
          duration: 500,
          ease: 'outElastic(1, .5)'
        });
      });
    });

    // Interactive Bounce pada Skill Chips (Delegated)
    document.addEventListener('mouseover', (e) => {
      const chip = e.target.closest('.skill-interactive-chip, .custom-skill-badge');
      if (chip && !chip.dataset.animating) {
        chip.dataset.animating = '1';
        animate(chip, {
          translateY: [0, -4, 0],
          scale: [1, 1.06, 1],
          duration: 420,
          ease: 'outBack',
          onComplete: () => {
            delete chip.dataset.animating;
          }
        });
      }
    });

    // Pipeline Step Hover Lift
    document.querySelectorAll('.pipeline-step').forEach((step) => {
      const idx = step.querySelector('.step-index');
      step.addEventListener('mouseenter', () => {
        animate(step, { translateY: -6, duration: 260, ease: 'outQuad' });
        if (idx) animate(idx, { scale: 1.12, rotate: -6, duration: 280, ease: 'outBack' });
      });
      step.addEventListener('mouseleave', () => {
        animate(step, { translateY: 0, duration: 350, ease: 'outQuad' });
        if (idx) animate(idx, { scale: 1, rotate: 0, duration: 320, ease: 'outQuad' });
      });
    });

    // Form Input Focus Micro-Pulse
    const form = document.getElementById('consultationForm');
    if (form) {
      form.addEventListener('focusin', (e) => {
        const wrap = e.target.closest('.form-floating, .input-group');
        if (wrap) {
          animate(wrap, {
            scale: [0.99, 1],
            duration: 260,
            ease: 'outQuad'
          });
        }
      });
    }
  },

  /**
   * 6. Animasi Stagger & Hover Fisika pada Kartu Proyek Dinamis
   */
  animateProjectCards() {
    if (!this.hasAnime() || this.isReducedMotion()) return;
    const { animate, stagger } = window.anime;

    const cards = document.querySelectorAll('#projectGrid .project-card');
    if (!cards.length) return;

    animate(cards, {
      opacity: [0, 1],
      translateY: [32, 0],
      scale: [0.95, 1],
      duration: 620,
      delay: stagger(90),
      ease: 'outExpo'
    });

    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        animate(card, {
          translateY: -7,
          duration: 260,
          ease: 'outQuad'
        });
      });

      card.addEventListener('mouseleave', () => {
        animate(card, {
          translateY: 0,
          duration: 420,
          ease: 'outElastic(1, .65)'
        });
      });
    });
  },

  /**
   * 7. Animasi Klik Pill Filter Kategori
   */
  animateFilterButton(btnEl) {
    if (!this.hasAnime() || this.isReducedMotion() || !btnEl) return;
    window.anime.animate(btnEl, {
      scale: [0.9, 1.07, 1],
      duration: 380,
      ease: 'outBack'
    });
  },

  /**
   * 8. Animasi Transisi Kartu Preview Layanan Saat Dropdown Berubah
   */
  animateServicePreview() {
    if (!this.hasAnime() || this.isReducedMotion()) return;
    const { animate, stagger } = window.anime;

    const card = document.getElementById('selectedServicePreview');
    if (card) {
      animate(card, {
        opacity: [0.45, 1],
        translateY: [10, 0],
        scale: [0.98, 1],
        duration: 420,
        ease: 'outExpo'
      });

      const items = card.querySelectorAll('.service-feature-list li');
      if (items.length) {
        animate(items, {
          opacity: [0, 1],
          translateX: [-14, 0],
          duration: 380,
          delay: stagger(65, { start: 60 }),
          ease: 'outQuad'
        });
      }
    }
  },

  /**
   * 9. Hook Animasi Spring saat Universal Modal & Order History Modal Dibuka
   */
  initModalSpringHooks() {
    const { animate } = window.anime;
    ['universalProjectModal', 'orderHistoryModal'].forEach((id) => {
      const modalEl = document.getElementById(id);
      if (!modalEl) return;

      modalEl.addEventListener('show.bs.modal', () => {
        const content = modalEl.querySelector('.custom-modal-content');
        if (content) {
          animate(content, {
            opacity: [0, 1],
            scale: [0.88, 1],
            translateY: [24, 0],
            duration: 480,
            ease: 'outBack'
          });
        }
      });
    });
  },

  /**
   * 10. Animasi Bump pada Counter Badge Pesanan di Navbar
   */
  animateOrderBadgeBump() {
    if (!this.hasAnime() || this.isReducedMotion()) return;
    const { animate } = window.anime;

    const wrapper = document.getElementById('orderBadgeWrapper');
    const pill = document.getElementById('orderBadge');

    if (wrapper) {
      animate(wrapper, {
        scale: [1, 1.14, 1],
        duration: 520,
        ease: 'outElastic(1, .5)'
      });
    }
    if (pill) {
      animate(pill, {
        scale: [0.7, 1.35, 1],
        duration: 550,
        ease: 'outElastic(1, .5)'
      });
    }
  },

  /**
   * 11. Animasi Shake saat Validasi Form Gagal
   */
  animateFormInvalidShake(formEl) {
    if (!this.hasAnime() || this.isReducedMotion() || !formEl) return;
    window.anime.animate(formEl, {
      translateX: [0, -10, 10, -7, 7, -3, 3, 0],
      duration: 480,
      ease: 'inOutSine'
    });
  },

  /**
   * 12. Animasi Toast Notification Masuk
   */
  animateToastShow(toastEl) {
    if (!this.hasAnime() || this.isReducedMotion() || !toastEl) return;
    window.anime.animate(toastEl, {
      translateX: [50, 0],
      scale: [0.92, 1],
      duration: 460,
      ease: 'outBack'
    });
  },

  /**
   * 13. Active Nav Link Highlight saat Scroll
   */
  initNavbarScrollEffect() {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.site-header .nav-link');
    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 140;
      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { passive: true });
  }
};

