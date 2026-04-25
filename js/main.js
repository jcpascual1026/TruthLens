// Mobile Navigation
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const header = document.querySelector('.site-header');

    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
    }

    function openNav() {
        mainNav.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    navToggle?.addEventListener('click', () => {
        if (mainNav.classList.contains('open')) {
            closeNav();
        } else {
            openNav();
        }
    });

    overlay.addEventListener('click', closeNav);

    // Close nav on link click (mobile)
    mainNav?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeNav();
            }
        });
    });

    // Header scroll shadow
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });

    // Scroll Animations
    const animateElements = document.querySelectorAll('.feature-item, .step-card, .team-card, .about-card, .hero-copy, .hero-visual');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach((el, index) => {
        el.style.transitionDelay = `${index * 80}ms`;
        observer.observe(el);
    });
});

