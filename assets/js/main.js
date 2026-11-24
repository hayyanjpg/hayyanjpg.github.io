/* ==========================================================
   HAYYAN.EXE — ARCADE PORTFOLIO ENGINE
   ========================================================== */
(function () {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    /* ---------------- LOADER ---------------- */
    const loader = $('#loader');
    const loaderFill = $('#loader-fill');
    const loaderPercent = $('#loader-percent');
    const loaderText = $('#loader-text');

    function finishLoader() {
        if (!loader || loader.classList.contains('is-hidden')) return;
        let value = 100;
        loaderFill.style.width = '100%';
        loaderPercent.textContent = '100%';
        loaderText.textContent = 'READY!';
        window.setTimeout(() => loader.classList.add('is-hidden'), reducedMotion ? 0 : 260);
        return value;
    }

    function runLoader() {
        if (!loader) return;
        if (reducedMotion) { finishLoader(); return; }
        const stages = ['LOADING ASSETS...', 'BOOTING SYSTEM...', 'EQUIPPING SKILLS...', 'READY!'];
        let progress = 0;
        const timer = window.setInterval(() => {
            progress = Math.min(100, progress + Math.floor(Math.random() * 14) + 6);
            loaderFill.style.width = progress + '%';
            loaderPercent.textContent = String(progress).padStart(2, '0') + '%';
            loaderText.textContent = stages[Math.min(stages.length - 1, Math.floor(progress / 26))];
            if (progress >= 100) {
                window.clearInterval(timer);
                finishLoader();
            }
        }, 90);
    }

    window.addEventListener('load', () => window.setTimeout(finishLoader, 900));
    runLoader();
    window.setTimeout(finishLoader, 2200);

    /* ---------------- LANGUAGE ---------------- */
    const langBtn = $('#lang-btn');
    const typeTarget = $('#typewriter');
    const words = {
        id: ['AI ENGINEER', 'FULL-STACK DEV', 'RAG & LLM', 'FASTAPI + REACT'],
        en: ['AI ENGINEER', 'FULL-STACK DEV', 'RAG & LLM', 'FASTAPI + REACT']
    };
    let lang = localStorage.getItem('hyy-lang') === 'en' ? 'en' : 'id';
    let typeTimer = null;

    function applyLanguage() {
        document.documentElement.lang = lang === 'id' ? 'id' : 'en';
        if (langBtn) langBtn.textContent = lang.toUpperCase();
        $$('[data-id]').forEach((el) => {
            const translated = el.getAttribute(lang === 'id' ? 'data-id' : 'data-en');
            if (translated !== null) el.textContent = translated;
        });
        startTypewriter();
    }

    function startTypewriter() {
        if (!typeTarget) return;
        if (typeTimer) window.clearTimeout(typeTimer);
        const list = words[lang];
        if (reducedMotion) {
            typeTarget.textContent = list[0];
            return;
        }
        let wordIndex = 0;
        let charIndex = 0;
        let erasing = false;

        function tick() {
            const word = list[wordIndex];
            if (erasing) {
                charIndex -= 1;
                typeTarget.textContent = word.slice(0, Math.max(0, charIndex));
                if (charIndex <= 0) {
                    erasing = false;
                    wordIndex = (wordIndex + 1) % list.length;
                    typeTimer = window.setTimeout(tick, 320);
                    return;
                }
                typeTimer = window.setTimeout(tick, 45);
            } else {
                charIndex += 1;
                typeTarget.textContent = word.slice(0, charIndex);
                if (charIndex >= word.length) {
                    erasing = true;
                    typeTimer = window.setTimeout(tick, 1500);
                    return;
                }
                typeTimer = window.setTimeout(tick, 85);
            }
        }
        typeTarget.textContent = '';
        typeTimer = window.setTimeout(tick, 400);
    }

    if (langBtn) {
        langBtn.addEventListener('click', () => {
            lang = lang === 'id' ? 'en' : 'id';
            localStorage.setItem('hyy-lang', lang);
            applyLanguage();
        });
    }

    /* ---------------- THEME ---------------- */
    const themeBtn = $('#theme-btn');
    function applyTheme() {
        const theme = localStorage.getItem('hyy-theme') === 'light' ? 'light' : 'dark';
        document.body.dataset.theme = theme;
        if (themeBtn) themeBtn.textContent = theme === 'dark' ? '☀' : '☾';
    }
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('hyy-theme', next);
            applyTheme();
        });
    }

    /* ---------------- MOBILE NAV ---------------- */
    const navToggle = $('#nav-toggle');
    const navLinks = $$('.nav__link');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const open = document.body.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', String(open));
        });
    }
    navLinks.forEach((link) => link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }));

    /* ---------------- SKILL BARS ---------------- */
    $$('.bar').forEach((bar) => {
        const level = Math.max(0, Math.min(5, Number(bar.dataset.level) || 0));
        for (let i = 0; i < 5; i += 1) {
            const cell = document.createElement('span');
            if (i < level) cell.classList.add('on');
            bar.appendChild(cell);
        }
    });

    /* ---------------- REVEAL ON SCROLL ---------------- */
    const revealItems = $$('.reveal');
    revealItems.forEach((item, i) => {
        item.style.transitionDelay = (Math.min(i % 6, 5) * 60) + 'ms';
    });

    if ('IntersectionObserver' in window && !reducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -40px 0px', threshold: .08 });
        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    /* ---------------- STAT COUNTERS ---------------- */
    function animateStat(el) {
        const target = Number(el.dataset.target) || 0;
        const decimal = Number(el.dataset.decimal) || 0;
        if (reducedMotion) {
            el.textContent = target.toFixed(decimal);
            return;
        }
        const duration = 1400;
        const start = performance.now();
        function frame(now) {
            const ratio = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - ratio, 3);
            el.textContent = (target * eased).toFixed(decimal);
            if (ratio < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    const stats = $$('.stat__num');
    if ('IntersectionObserver' in window) {
        const statObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateStat(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: .5 });
        stats.forEach((stat) => statObserver.observe(stat));
    } else {
        stats.forEach(animateStat);
    }

    /* ---------------- ACTIVE NAV + TO TOP ---------------- */
    const sections = $$('main section[id]');
    const toTop = $('#to-top');
    let ticking = false;

    function onScroll() {
        const scrollY = window.scrollY || window.pageYOffset;
        const offset = scrollY + 140;
        let activeId = sections.length ? sections[0].id : '';
        sections.forEach((section) => {
            if (section.offsetTop <= offset) activeId = section.id;
        });
        navLinks.forEach((link) => {
            link.classList.toggle('active-link', link.getAttribute('href') === '#' + activeId);
        });
        if (toTop) toTop.classList.toggle('is-shown', scrollY > 500);
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    /* ---------------- MODALS ---------------- */
    let openModalEl = null;

    function openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.add('is-open');
        openModalEl = modal;
        document.body.style.overflow = 'hidden';
        const closeBtn = $('[data-close-modal]', modal);
        if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
        if (!openModalEl) return;
        openModalEl.classList.remove('is-open');
        openModalEl = null;
        document.body.style.overflow = '';
    }

    $$('[data-modal]').forEach((btn) => {
        btn.addEventListener('click', () => openModal(btn.dataset.modal));
    });
    $$('[data-close-modal]').forEach((btn) => btn.addEventListener('click', closeModal));
    $$('.modal').forEach((modal) => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal();
    });

    /* ---------------- INIT ---------------- */
    applyTheme();
    applyLanguage();
    onScroll();
})();
