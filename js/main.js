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

  // ===== Throttled scroll handler (single rAF loop for ALL scroll work) =====
  let scrollRAF = false;
  function onScroll() {
    if (!scrollRAF) {
      scrollRAF = true;
      requestAnimationFrame(() => {
        handleNavScroll();
        updateActiveNav();
        scrollRAF = false;
      });
    }
  }

  // ===== Navbar Scroll Effect =====
  const navbar = document.getElementById('navbar');
  function handleNavScroll() {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
  }

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

  window.addEventListener('scroll', onScroll, { passive: true });
  handleNavScroll();
  updateActiveNav();

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
  window.revealObserver = revealObserver; // expose for dynamically added cards

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

  // ===== Contact Form (Formspree) =====
  const FORMSPREE_URL = 'https://formspree.io/f/xgoqazod';
  const form = document.getElementById('contact-form');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;

    // Show loading state
    btn.disabled = true;
    btn.innerHTML = `<svg class="inline w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Sending...`;

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (response.ok) {
        // Success state
        btn.innerHTML = `<svg class="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Message Sent!`;
        btn.classList.remove('from-purple-600', 'to-cyan-500');
        btn.classList.add('from-green-500', 'to-emerald-500');
        form.reset();

        // Reset button after 4 seconds
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.disabled = false;
          btn.classList.remove('from-green-500', 'to-emerald-500');
          btn.classList.add('from-purple-600', 'to-cyan-500');
          lucide.createIcons();
        }, 4000);

      } else {
        throw new Error('Formspree returned an error');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      // Error state
      btn.innerHTML = `<svg class="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>Failed – Try Again`;
      btn.classList.remove('from-purple-600', 'to-cyan-500');
      btn.classList.add('from-red-500', 'to-rose-500');

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        btn.classList.remove('from-red-500', 'to-rose-500');
        btn.classList.add('from-purple-600', 'to-cyan-500');
        lucide.createIcons();
      }, 4000);
    }
  });

  // ===== Smooth Scroll for Anchor Links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ===== Built-in Assistant (client-side fallback) =====
  const info = {
    email:     "chrispermwash@gmail.com",
    github:    "github.com/kris4509",
    education: "Bachelor of Science in Computer Science at Egerton University, Kenya (2023 – 2027)",
    skills:    "Python, Flask, Java, HTML5, CSS3, Tailwind CSS, Bootstrap 5, JavaScript, MySQL, SQLAlchemy, SQL, Git and GitHub, Vercel, GitHub Pages, Linux and Terminal, REST APIs, and M-Pesa Daraja API",
    available: "open to freelance work, internships, remote gigs, AI training, data annotation, and entry-level tech roles",
    strengths: "quick learner, detail-oriented, self-motivated, good communicator, and a strong team collaborator",
    projects: [
      "Portfolio Website — a responsive personal portfolio with dark/light mode, AI chat widget, download CV button, certifications section, and a Formspree contact form, deployed on Vercel.",
      "UniFlow Exam Card System — a university web application where students digitally submit exam cards to their class rep for bulk printing and dean stamping, built with Python Flask, MySQL, Bootstrap 5, and M-Pesa Daraja API for payments.",
      "Bead Artwork Ecommerce Website — a frontend ecommerce site showcasing Kenyan handcrafted beadwork with a product catalog, WhatsApp ordering, and a lightbox gallery.",
      "Lecture Management and Scheduling System — a university scheduling system concept with venue management and timetable clash detection using Python and database design.",
      "Student Funds Management System — a concept for tracking student pocket money and financial records tailored to Kenyan schools.",
    ],
    certifications: "Certified JavaScript Developer, Certified Python Developer, Certified React Developer, Certified Cybersecurity Professional, and Certified Java Developer — all from W3Schools at Professional level in 2024.",
    tools: "Git and GitHub for version control, Vercel for hosting and CI/CD, GitHub Pages for static hosting, Linux terminal for command line work, REST API design and integration, and M-Pesa Daraja API for mobile payments.",
  };

  function builtInReply(message) {
    const msg = message.toLowerCase().trim();
    const has = (keywords) => keywords.some(k => msg.includes(k));

    if (has(["hi","hello","hey","good morning","good afternoon","howdy","greetings","what's up","wassup","hiya"]))
      return `Hi there! I am Chris's assistant. You can ask me about his skills, projects, education, availability, or how to get in touch. What would you like to know?`;

    if (has(["who is","about chris","tell me","introduce","background","yourself","describe","summary","overview","professional"]))
      return `Chris is a Computer Science student and web developer based in Nairobi, Kenya. He is studying for a ${info.education} and is ${info.available}.`;

    if (has(["skill","tech","stack","tools","proficient","expertise","technologies","know","python","javascript","flask","html","css","sql","git"]))
      return `Chris is proficient in ${info.skills}. He enjoys building full-stack web projects and is always picking up new tools quickly.`;

    if (has(["project","built","made","ecommerce","lecture","fund","portfolio","work","website","app","application","bead","scheduling","uniflow","exam","card","mpesa","m-pesa","payment"]))
      return `Chris has built ${info.projects.length} projects. ${info.projects[0]} He also built ${info.projects[1]} Additionally he made ${info.projects[2]}. Ask me about a specific project for more details!`;

    if (has(["uniflow","exam card","class rep","printing","stamp","dean","university app","student portal"]))
      return `UniFlow is one of Chris's most impressive projects. ${info.projects[1]} It solves a real university problem by going fully digital — no more physical trips to the class rep!`;

    if (has(["certif","w3school","javascript cert","python cert","react cert","java cert","cybersecurity cert","certified"]))
      return `Chris holds 5 W3Schools Professional certifications: ${info.certifications} You can view and verify each certificate in the Certifications section of his portfolio.`;

    if (has(["tool","platform","vercel","github page","linux","terminal","rest api","mpesa","daraja","hosting","deploy","ci/cd","kernel","shell"]))
      return `Beyond coding languages, Chris is experienced with developer tools including ${info.tools}`;

    if (has(["database","mysql","sql","sqlalchemy","orm","query","table","schema"]))
      return `Chris works with MySQL for relational database design and SQLAlchemy ORM for database abstraction in Python projects. He is comfortable writing SQL queries, designing schemas, and managing data relationships.`;

    if (has(["bootstrap","tailwind","framework","css framework","responsive","ui","design"]))
      return `Chris is proficient in both Bootstrap 5 and Tailwind CSS for building responsive, modern user interfaces. He has used Bootstrap in full-stack Flask apps and Tailwind in his portfolio and personal projects.`;

    if (has(["education","university","degree","study","egerton","school","college","student","course","major","bsc","curriculum"]))
      return `Chris is studying for a ${info.education}. His coursework covers Programming, Software Engineering, Database Systems, Data Structures, Algorithms, and Web Development.`;

    if (has(["contact","reach","email","get in touch","message","connect","talk","communicate","find","chrispermwash"]))
      return `You can reach Chris directly at ${info.email} or use the Contact section on this page to send him a message.`;

    if (has(["availab","hire","hiring","freelance","internship","remote","job","opportunity","open to","work with","looking for","recruit","gig"]))
      return `Yes! Chris is currently ${info.available}. If you have a matching opportunity, reach out at ${info.email} or use the contact form on this page.`;

    if (has(["github","code","repository","repo","source","open source","git hub"]))
      return `You can check out Chris's code on GitHub at ${info.github}. He has several projects there including his portfolio and ecommerce website.`;

    if (has(["location","where","country","kenya","nairobi","based","live","from","city"]))
      return `Chris is based in Nairobi, Kenya and is fully comfortable with remote work and online collaboration.`;

    if (has(["strength","soft skill","personality","trait","quality","attitude","character"]))
      return `Chris's key strengths include being a ${info.strengths}. He adapts quickly to new tools and environments.`;

    if (has(["experience","work history","career","professional","worked","past","history"]))
      return `Chris has been building web projects since 2022 as a freelance developer. He uses modern workflows including Git, GitHub, and Vercel deployments and is actively growing his professional experience.`;

    if (has(["speak","english","swahili","language","tongue","fluent","bilingual"]))
      return `Chris is fluent in both English and Swahili, which helps him communicate effectively across different audiences.`;

    if (has(["name","full name","surname","called","chrisper","mwangi","wambui"]))
      return `His full name is Chrisper Mwangi Wambui, but he goes by Chris. He is a Computer Science student and web developer based in Nairobi, Kenya.`;

    if (has(["ai","artificial intelligence","machine learning","chat","bot","assistant","gpt","gemini"]))
      return `Chris has a strong interest in AI systems and technologies. This very chat assistant on his portfolio is one example of his AI integration work!`;

    if (has(["thank","thanks","appreciate","great","awesome","nice","cool","excellent","perfect","wonderful"]))
      return `You are welcome! Feel free to ask me anything else about Chris.`;

    if (has(["bye","goodbye","see you","later","cya","take care","farewell"]))
      return `Goodbye! Come back anytime if you have more questions about Chris. Have a great day!`;

    return `Great question! I am trained on Chris's professional background. Try asking about his skills, projects, education, availability, contact details, GitHub, or location. For anything else, reach him at ${info.email}.`;
  }

  // ===== Chat Widget Logic =====
  const chatButton = document.getElementById('chat-widget-button');
  const chatWindow = document.getElementById('chat-widget-window');
  const chatClose = document.getElementById('chat-widget-close');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const chatSubmit = document.getElementById('chat-submit');

  let isChatOpen = false;

  const toggleChat = () => {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
      chatWindow.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
      chatWindow.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
      setTimeout(() => chatInput.focus(), 300);
    } else {
      chatWindow.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
      chatWindow.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
    }
  };

  chatButton?.addEventListener('click', toggleChat);
  chatClose?.addEventListener('click', toggleChat);

  // Strip markdown from AI responses
  const cleanMarkdown = (text) => text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const addMessage = (text, isUser = false) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
    const innerDiv = document.createElement('div');
    innerDiv.className = isUser
      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm p-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%]'
      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm p-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700 max-w-[85%]';
    const cleaned = isUser ? text : cleanMarkdown(text);
    innerDiv.innerHTML = cleaned.replace(/\n/g, '<br>');
    msgDiv.appendChild(innerDiv);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const showTyping = () => {
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = 'flex justify-start';
    msgDiv.innerHTML = `
      <div class="bg-white dark:bg-slate-800 text-slate-500 text-sm p-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-1">
        <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
        <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay:0.1s"></div>
        <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay:0.2s"></div>
      </div>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
  };

  const removeTyping = (id) => document.getElementById(id)?.remove();

  chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    chatInput.value = '';
    chatSubmit.disabled = true;
    const typingId = showTyping();

    // Try Gemini API first — fall back to built-in instantly if it fails
    let reply = null;
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        signal: AbortSignal.timeout(6000) // give Gemini 6 seconds max
      });
      if (response.ok) {
        const data = await response.json();
        if (data.reply) reply = data.reply;
      }
    } catch (_) {
      // Gemini failed or timed out — built-in takes over below
    }

    // If Gemini didn't deliver, use built-in assistant
    if (!reply) reply = builtInReply(message);

    removeTyping(typingId);
    addMessage(reply);
    chatSubmit.disabled = false;
  });

});


// ===== Certificate Lightbox =====
function openCert(imgSrc, title) {
  const modal = document.getElementById('cert-modal');
  document.getElementById('cert-modal-img').src = imgSrc;
  document.getElementById('cert-modal-title').textContent = title;
  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
}

function closeCert() {
  const modal = document.getElementById('cert-modal');
  modal.classList.add('opacity-0', 'pointer-events-none');
  modal.classList.remove('opacity-100', 'pointer-events-auto');
  document.body.style.overflow = '';
}

// Close with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCert();
});

// ===== Services Horizontal Scroll =====
const track = document.getElementById('services-track');
const dots  = document.querySelectorAll('.service-dot');
const cards = document.querySelectorAll('.service-card');

if (track && dots.length) {
  // Hide scrollbar visually
  track.style.msOverflowStyle  = 'none';
  track.style.scrollbarWidth   = 'none';

  const updateActive = () => {
    const scrollLeft  = track.scrollLeft;
    const cardWidth   = cards[0]?.offsetWidth + 24 || 300; // card + gap
    const activeIndex = Math.round(scrollLeft / cardWidth);

    // Update dots
    dots.forEach((dot, i) => {
      if (i === activeIndex) {
        dot.style.width          = '24px';
        dot.style.backgroundColor = 'rgb(139,92,246)';
      } else {
        dot.style.width          = '6px';
        dot.style.backgroundColor = '';
      }
    });

    // Scale active card
    cards.forEach((card, i) => {
      if (i === activeIndex) {
        card.style.transform = 'translateY(-8px) scale(1.03)';
        card.style.borderColor = '';
        card.style.boxShadow = '0 20px 60px rgba(139,92,246,0.25)';
      } else {
        card.style.transform = '';
        card.style.boxShadow = '';
      }
    });
  };

  track.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  // Arrow key support when hovering
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') track.scrollBy({ left: 300, behavior: 'smooth' });
    if (e.key === 'ArrowLeft')  track.scrollBy({ left: -300, behavior: 'smooth' });
  });

  // Click dot to scroll to card
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const cardWidth = cards[0]?.offsetWidth + 24 || 300;
      track.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
    });
    dot.style.cursor = 'pointer';
  });
}

// ===== Skills Tab Switcher =====
function switchSkillTab(tab) {
  const tabs   = ['languages', 'databases', 'tools'];
  const panels = ['languages', 'databases', 'tools'];

  tabs.forEach(t => {
    const btn = document.getElementById('tab-' + t);
    if (!btn) return;
    if (t === tab) {
      btn.classList.add('active-tab');
      btn.classList.remove('glass', 'text-slate-500', 'dark:text-slate-400', 'border-white/10');
    } else {
      btn.classList.remove('active-tab');
      btn.classList.add('glass', 'text-slate-500', 'border-white/10');
    }
  });

  panels.forEach(p => {
    const panel = document.getElementById('panel-' + p);
    if (!panel) return;
    if (p === tab) {
      panel.classList.remove('hidden');
      // Re-trigger animation
      panel.style.animation = 'none';
      panel.offsetHeight;
      panel.style.animation = '';
    } else {
      panel.classList.add('hidden');
    }
  });
}
// ===== Dynamic Projects Renderer =====
// Reads from admin dashboard localStorage and renders project cards
(function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const statusColors = {
    'Live':        'text-green-400 bg-green-400/10 border-green-400/20',
    'In Progress': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'Completed':   'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    'On Hold':     'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const defaultProjects = [
    { id:1, title:'Lecture Management & Scheduling System', desc:'A university scheduling system concept with venue management and timetable clash detection using Python and database design.', tech:['Python','Database Design','UML'], link:'', github:'', status:'Completed', image:'assets/images/project-lecture-new.png' },
    { id:2, title:'Venue Booking System', desc:'A dynamic booking system for managing venue reservations with availability tracking and scheduling features.', tech:['HTML','CSS','JavaScript','Python'], link:'', github:'', status:'Completed', image:'assets/images/project-booking-new.png' },
    { id:3, title:'Bead Artwork Ecommerce', desc:'A frontend ecommerce site showcasing Kenyan handcrafted beadwork with product catalog, WhatsApp ordering and lightbox gallery.', tech:['HTML','CSS','JavaScript'], link:'https://kris4509.github.io/bead-artwork-ecommerce-website/', github:'', status:'Live', image:'assets/images/project-ecommerce.png' },
    { id:4, title:'UniFlow — Exam Card System', desc:'A university web app where students digitally submit exam cards to their class rep for bulk printing and dean stamping.', tech:['Python','Flask','MySQL','Bootstrap 5','M-Pesa API','SQLAlchemy'], link:'', github:'https://github.com/kris4509/uniflow', status:'In Progress', image:'assets/images/project-uniflow.png' },
  ];

  let projects;
  try {
    const stored = localStorage.getItem('adm_projects');
    projects = stored ? JSON.parse(stored) : defaultProjects;
    if (!Array.isArray(projects) || projects.length === 0) projects = defaultProjects;
  } catch(e) {
    projects = defaultProjects;
  }

  grid.innerHTML = projects.map((p, i) => {
    const delay = ['', 'delay-100', 'delay-200', 'delay-300'][i % 4];
    const statusClass = statusColors[p.status] || statusColors['Completed'];
    const techBadges = p.tech.slice(0, 5).map(t =>
      `<span class="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">${t}</span>`
    ).join('');

    const imgBlock = p.image
      ? `<img src="${p.image}" alt="${p.title}" class="project-image w-full h-full object-cover">`
      : `<div class="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
           <span class="text-slate-500 text-sm font-mono">${p.title.slice(0,2).toUpperCase()}</span>
         </div>`;

    const liveBtn = p.link
      ? `<a href="${p.link}" target="_blank" class="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-xl text-center text-sm hover:opacity-90 transition-all">Live Demo</a>`
      : `<span class="flex-1 py-2.5 px-4 bg-white/5 text-slate-500 font-bold rounded-xl text-center text-sm cursor-not-allowed">No Live Demo</span>`;

    const repoBtn = p.github
      ? `<a href="${p.github}" target="_blank" class="py-2.5 px-4 glass text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm border border-white/10 hover:bg-white/10 transition-colors text-center">Repo</a>`
      : '';

    return `
      <div class="glass rounded-3xl project-card flex flex-col border border-white/10 reveal ${delay}">
        <div class="relative h-48 overflow-hidden rounded-t-3xl">
          ${imgBlock}
          <div class="absolute inset-0 bg-slate-900/60 opacity-0 project-overlay flex items-center justify-center gap-4 transition-all duration-300">
            ${p.link ? `<a href="${p.link}" target="_blank" class="p-3 bg-white/10 hover:bg-white/25 rounded-full text-white border border-white/20 transition-colors" title="View Live"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>` : ''}
            ${p.github ? `<a href="${p.github}" target="_blank" class="p-3 bg-white/10 hover:bg-white/25 rounded-full text-white border border-white/20 transition-colors" title="View Code"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg></a>` : ''}
          </div>
        </div>
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-purple-500 tracking-wider uppercase">Project</span>
              <span class="text-xs font-semibold px-2 py-1 rounded-full border ${statusClass}">${p.status}</span>
            </div>
            <h4 class="text-xl font-display font-bold mt-1">${p.title}</h4>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-3">${p.desc}</p>
            <div class="flex flex-wrap gap-2 mt-4">${techBadges}</div>
          </div>
          <div class="flex items-center gap-3 mt-6 pt-4 border-t border-slate-500/10 dark:border-white/5">
            ${liveBtn}
            ${repoBtn}
          </div>
        </div>
      </div>`;
  }).join('');

  // Re-run reveal observer on new cards
  if (window.revealObserver) {
    grid.querySelectorAll('.reveal').forEach(el => window.revealObserver.observe(el));
  }
})();

// ===== Portfolio Data Sync =====
// Reads ALL admin dashboard data from localStorage and updates the live portfolio
(function syncPortfolioFromAdmin() {
  // ── Load data ──
  let profile, skills;
  try {
    const sp = localStorage.getItem('adm_profile');
    const ss = localStorage.getItem('adm_skills');
    profile = sp ? JSON.parse(sp) : null;
    skills  = ss ? JSON.parse(ss) : null;
  } catch(e) { profile = null; skills = null; }

  // ── Sync Profile ──
  if (profile) {
    // Hero section
    const heroName = document.getElementById('hero-name');
    if (heroName) heroName.textContent = profile.name.split(' ')[0]; // first name only

    const heroBio = document.getElementById('hero-bio');
    if (heroBio && profile.bio) heroBio.textContent = profile.bio;

    const heroAvailText = document.getElementById('hero-avail-text');
    const heroAvailBadge = document.getElementById('hero-avail-badge');
    if (heroAvailText && heroAvailBadge) {
      heroAvailText.textContent = profile.available ? 'Available for Freelance & Internships' : 'Not Currently Available';
      heroAvailBadge.style.opacity = profile.available ? '1' : '0.5';
    }

    // Contact section
    const contactEmail = document.getElementById('contact-email');
    if (contactEmail) {
      contactEmail.textContent = profile.email;
      contactEmail.href = 'mailto:' + profile.email;
    }

    const contactLocation = document.getElementById('contact-location');
    if (contactLocation) contactLocation.textContent = profile.location;
  }

  // ── Sync Skills ──
  if (skills && Array.isArray(skills) && skills.length > 0) {
    const ringColors = {
      'HTML5':'#f97316','CSS3 & Tailwind':'#3b82f6','JavaScript':'#eab308',
      'Python & Flask':'#6366f1','Python':'#6366f1','Flask':'#6366f1',
      'Java':'#ef4444','Bootstrap 5':'#a855f7',
      'MySQL':'#f97316','SQLAlchemy ORM':'#a855f7','SQLAlchemy':'#a855f7','SQL':'#3b82f6',
      'Git & GitHub':'#94a3b8','Vercel':'#e2e8f0','GitHub Pages':'#a855f7',
      'Linux & Terminal':'#3b82f6','REST APIs':'#22c55e','M-Pesa Daraja API':'#10b981',
    };
    const defaultColor = '#7c3aed';

    function buildRingCard(s) {
      const color = ringColors[s.name] || defaultColor;
      const circumference = 201;
      const offset = circumference - (s.level / 100) * circumference;
      const hoverColor = color + '66';
      return `
        <div class="skill-ring-card flex flex-col items-center gap-3 glass p-5 rounded-3xl border border-white/10 hover:-translate-y-1 transition-all duration-300 group" style="--hover-border:${hoverColor}">
          <div class="relative w-20 h-20">
            <svg class="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" stroke-width="6" class="text-slate-200 dark:text-slate-700"/>
              <circle cx="40" cy="40" r="32" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"
                stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" class="skill-ring-fill transition-all duration-1000"/>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs font-bold" style="color:${color}">${s.level}%</span>
            </div>
          </div>
          <div class="text-center">
            <p class="font-bold text-sm">${s.name}</p>
            <p class="text-xs text-slate-500">${s.category}</p>
          </div>
        </div>`;
    }

    const langs = skills.filter(s => s.category === 'Languages');
    const dbs   = skills.filter(s => s.category === 'Databases');
    const tools = skills.filter(s => s.category === 'Tools');

    const panelLang = document.getElementById('panel-languages');
    const panelDb   = document.getElementById('panel-databases');
    const panelTool = document.getElementById('panel-tools');

    if (panelLang && langs.length) panelLang.innerHTML = langs.map(buildRingCard).join('');
    if (panelDb   && dbs.length)   panelDb.innerHTML   = dbs.map(buildRingCard).join('');
    if (panelTool && tools.length) panelTool.innerHTML = tools.map(buildRingCard).join('');
  }
})();