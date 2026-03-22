// ========== NAVBAR SCROLL EFFECT ==========
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ========== MOBILE NAV TOGGLE ==========
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = navToggle.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.className = 'ph ph-x';
        document.body.style.overflow = 'hidden';
    } else {
        icon.className = 'ph ph-list';
        document.body.style.overflow = '';
    }
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.querySelector('i').className = 'ph ph-list';
        document.body.style.overflow = '';
    });
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = navbar.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========== INTERSECTION OBSERVER — ANIMATE ON SCROLL ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animatable elements
document.querySelectorAll('.problem-card, .service-card, .project-card, .project-card.compact, .process-step, .stack-category, .cert-group, .diff-card, .about-card, .proof-item, .projects-duo').forEach(el => {
    el.classList.add('animate-target');
    observer.observe(el);
});

// ========== ACTIVE NAV LINK HIGHLIGHT ==========
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ========== LANGUAGE TOGGLE ==========
const langToggle = document.getElementById('langToggle');
const translations = {
    es: {
        'nav-problemas': 'Problemas',
        'nav-servicios': 'Servicios',
        'nav-proyectos': 'Proyectos',
        'nav-stack': 'Stack',
        'nav-sobre-mi': 'Sobre mí',
        'nav-cta': 'Agendar consulta',
        'hero-title': 'Elimino el caos operativo de tu empresa con <span class="text-gradient">sistemas digitales</span> que funcionan desde el día uno',
        'hero-subtitle': 'Diseño e implemento soluciones con Microsoft Power Platform que reemplazan procesos manuales, hojas de Excel compartidas y aprobaciones por correo, por sistemas integrados con automatización, datos en tiempo real y control real sobre las operaciones.',
        'hero-cta-primary': '<i class="ph ph-calendar-check"></i> Agenda una consulta de diagnóstico',
        'hero-cta-secondary': '<i class="ph ph-folder-open"></i> Ver proyectos',
        'cta-title': '¿Listo para dejar de operar en modo manual?',
        'cta-subtitle': 'Agenda una consulta de diagnóstico sin costo. En 30 minutos revisamos tu proceso más crítico y te digo con honestidad si puedo ayudarte y cómo.',
        'cta-button': '<i class="ph ph-calendar-check"></i> Agendar consulta de diagnóstico',
        'cta-note': 'Sin compromiso. Sin pitch de ventas. Solo una conversación para entender tu situación y ver si puedo ayudarte.'
    },
    en: {
        'nav-problemas': 'Problems',
        'nav-servicios': 'Services',
        'nav-proyectos': 'Projects',
        'nav-stack': 'Stack',
        'nav-sobre-mi': 'About',
        'nav-cta': 'Book a call',
        'hero-title': 'I eliminate operational chaos from your business with <span class="text-gradient">digital systems</span> that work from day one',
        'hero-subtitle': 'I design and implement solutions with Microsoft Power Platform that replace manual processes, shared spreadsheets and email approvals with integrated systems featuring automation, real-time data, and real operational control.',
        'hero-cta-primary': '<i class="ph ph-calendar-check"></i> Book a diagnostic call',
        'hero-cta-secondary': '<i class="ph ph-folder-open"></i> View projects',
        'cta-title': 'Ready to stop operating in manual mode?',
        'cta-subtitle': 'Book a free 30-minute diagnostic call. We\'ll review your most critical process and I\'ll tell you honestly if I can help and how.',
        'cta-button': '<i class="ph ph-calendar-check"></i> Book a diagnostic call',
        'cta-note': 'No commitment. No sales pitch. Just a conversation to understand your situation and see if I can help.'
    }
};

if (langToggle) {
    langToggle.addEventListener('click', (e) => {
        const clicked = e.target.closest('.lang-option');
        if (!clicked) return;
        const lang = clicked.dataset.lang;
        document.querySelectorAll('.lang-option').forEach(opt => opt.classList.remove('active'));
        clicked.classList.add('active');
        document.documentElement.lang = lang;
        // Apply translations to elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });
    });
}

// ========== COUNTER ANIMATION ==========
function animateCounters() {
    const counters = document.querySelectorAll('.proof-number');
    counters.forEach(counter => {
        const target = counter.innerText;
        const numericTarget = parseInt(target);
        if (isNaN(numericTarget)) return;

        const suffix = target.replace(/[0-9]/g, '');
        let current = 0;
        const increment = Math.ceil(numericTarget / 30);
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericTarget) {
                current = numericTarget;
                clearInterval(timer);
            }
            counter.innerText = current + suffix;
        }, 40);
    });
}

// Trigger counter animation when proof bar is visible
const proofBar = document.querySelector('.proof-bar');
if (proofBar) {
    const proofObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                proofObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    proofObserver.observe(proofBar);
}
