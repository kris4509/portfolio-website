document.addEventListener('DOMContentLoaded', () => {
  // ===== Theme Management =====
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    html.classList.toggle('dark', savedTheme === 'dark');
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.classList.add('dark');
  }

  themeToggle?.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
  });

  // ===== Mobile Menu =====
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function closeMenu() {
    mobileMenu?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    menuBtn?.classList.remove('active');
    document.body.style.overflow = '';
  }

  menuBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) { closeMenu(); }
    else {
      mobileMenu.classList.add('open');
      mobileOverlay.classList.add('open');
      menuBtn.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  mobileOverlay?.addEventListener('click', closeMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // ===== Navbar Scroll Effect =====
  const navbar = document.getElementById('navbar');
  function handleNavScroll() {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
  }
  window.addEventListener('scroll', handleNavScroll);
  handleNavScroll();

  // ===== Active Nav Link =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav);

  // ===== Scroll Reveal (Intersection Observer) =====
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // ===== Typewriter Effect =====
  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    const texts = ['Web Developer', 'CS Student', 'Problem Solver', 'Tech Enthusiast'];
    let textIdx = 0, charIdx = 0, isDeleting = false;

    function type() {
      const current = texts[textIdx];
      if (isDeleting) {
        charIdx--;
        typewriterEl.textContent = current.substring(0, charIdx);
      } else {
        charIdx++;
        typewriterEl.textContent = current.substring(0, charIdx);
      }

      let speed = isDeleting ? 50 : 100;
      if (!isDeleting && charIdx === current.length) {
        speed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        textIdx = (textIdx + 1) % texts.length;
        speed = 500;
      }
      setTimeout(type, speed);
    }
    setTimeout(type, 1000);
  }

  // ===== Skill Progress Bars =====
  const skillBars = document.querySelectorAll('.skill-progress-bar');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        target.style.width = target.dataset.progress + '%';
        skillObserver.unobserve(target);
      }
    });
  }, { threshold: 0.5 });
  skillBars.forEach(bar => skillObserver.observe(bar));

  // ===== Counter Animation =====
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const increment = Math.ceil(target / 60);
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = current + suffix;
        }, 30);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  // ===== Back to Top =====
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 500);
  });
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== Contact Form =====
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<svg class="inline w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Sending...`;
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = `<svg class="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Message Sent!`;
      btn.classList.remove('from-purple-600', 'to-cyan-500');
      btn.classList.add('from-green-500', 'to-emerald-500');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove('from-green-500', 'to-emerald-500');
        btn.classList.add('from-purple-600', 'to-cyan-500');
        form.reset();
      }, 3000);
    }, 1500);
  });

  // ===== Smooth Scroll for Anchor Links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  });
});
