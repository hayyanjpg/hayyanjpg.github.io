/* ==========================================================
   KOMOREBI PATH — scrollytelling engine
   Vanilla JS + GSAP ScrollTrigger + Canvas particles
   ========================================================== */
(function () {
    'use strict';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const sections = Array.from(document.querySelectorAll('.story'));
    const skies = Array.from(document.querySelectorAll('.sky-layer'));
    const dots = Array.from(document.querySelectorAll('.path-dot'));
    const hint = document.querySelector('.scroll-hint');
    const stepNow = document.getElementById('stepNow');

    let activeIndex = 0;

    /* ---------------- NAVIGATION ---------------- */
    document.querySelectorAll('[data-goto]').forEach((el) => {
        el.addEventListener('click', (event) => {
            const target = document.getElementById(el.dataset.goto);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        });
    });

    /* ---------------- ACTIVE SECTION ---------------- */
    function setActive(index) {
        if (index === activeIndex && dots[index]?.classList.contains('is-active')) return;
        activeIndex = index;
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
        if (stepNow) stepNow.textContent = String(index + 1).padStart(2, '0');
        skies.forEach((sky, i) => sky.classList.toggle('is-active', i === index));
        setParticleMode(index);
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const index = sections.indexOf(entry.target);
                if (index !== -1) setActive(index);
            });
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
        sections.forEach((section) => observer.observe(section));
    }

    /* ---------------- SCROLL HINT ---------------- */
    window.addEventListener('scroll', () => {
        if (!hint) return;
        hint.classList.toggle('is-hidden', (window.scrollY || window.pageYOffset) > 120);
    }, { passive: true });

    /* ---------------- GSAP CHOREOGRAPHY ---------------- */
    if (gsap && !reduced) {
        if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

        // Crossfade langit mengikuti section aktif.
        sections.forEach((section, index) => {
            if (!ScrollTrigger) return;
            ScrollTrigger.create({
                trigger: section,
                start: 'top 55%',
                end: 'bottom 55%',
                onEnter: () => setActive(index),
                onEnterBack: () => setActive(index)
            });
        });

        // Parallax tiap lapisan SVG.
        sections.forEach((section) => {
            const layers = section.querySelectorAll('[data-depth]');
            layers.forEach((layer) => {
                const depth = Number(layer.dataset.depth) || 0;
                const config = {
                    y: -depth * 260,
                    ease: 'none'
                };
                if (ScrollTrigger) {
                    config.scrollTrigger = {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    };
                }
                gsap.to(layer, config);
            });
        });

        // Konten masuk saat section disentuh.
        sections.forEach((section) => {
            const items = section.querySelectorAll('[data-reveal]');
            if (!items.length) return;
            const animate = () => gsap.fromTo(items,
                { y: 38, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.85,
                    ease: 'power3.out',
                    stagger: 0.1,
                    clearProps: 'opacity,transform'
                });
            if (!ScrollTrigger) {
                animate();
                return;
            }
            ScrollTrigger.create({
                trigger: section,
                start: 'top 70%',
                once: true,
                onEnter: animate
            });
        });

        // Sedikit gerak pada progress bar lentera.
        if (ScrollTrigger) {
            gsap.fromTo('.timeline__line',
                { scaleY: 0 },
                {
                    scaleY: 1,
                    ease: 'none',
                    transformOrigin: 'top center',
                    scrollTrigger: { trigger: '#golden', start: 'top 70%', end: 'bottom 80%', scrub: 0.4 }
                });
        }
    }

    /* ---------------- CANVAS PARTICLES ---------------- */
    const canvas = document.getElementById('particles');
    const ctx = canvas ? canvas.getContext('2d') : null;

    const particleModes = [
        { color: '255,236,196', shape: 'dot', vx: [-.12, .18], vy: [-.35, -.1], size: [1, 3.2], alpha: [.2, .7], glow: true },
        { color: '110,175,120', shape: 'leaf', vx: [-.45, .25], vy: [.25, .6], size: [3, 7], alpha: [.3, .75], spin: true },
        { color: '255,255,245', shape: 'dot', vx: [-.2, .2], vy: [-.18, .16], size: [1, 2.6], alpha: [.15, .55] },
        { color: '255,214,126', shape: 'dot', vx: [-.3, .3], vy: [-.28, -.05], size: [1.4, 3.6], alpha: [.25, .75], glow: true },
        { color: '255,226,138', shape: 'dot', vx: [-.28, .28], vy: [-.16, .16], size: [1.6, 3.2], alpha: [.3, 1], glow: true, blink: true }
    ];

    let width = 0;
    let height = 0;
    let particles = [];
    let currentMode = 0;
    let rafId = null;

    const random = (min, max) => min + Math.random() * (max - min);

    function resizeCanvas() {
        if (!canvas || !ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = width < 700 ? 26 : 58;
        particles = Array.from({ length: count }, () => makeParticle(currentMode, true));
        if (reduced) drawParticles(0);
    }

    function makeParticle(modeIndex, anywhere) {
        const mode = particleModes[modeIndex];
        return {
            x: Math.random() * width,
            y: anywhere ? Math.random() * height : height + random(0, 60),
            vx: random(mode.vx[0], mode.vx[1]),
            vy: random(mode.vy[0], mode.vy[1]),
            size: random(mode.size[0], mode.size[1]),
            alpha: random(mode.alpha[0], mode.alpha[1]),
            phase: Math.random() * Math.PI * 2,
            rot: Math.random() * Math.PI * 2,
            spin: random(-.02, .02)
        };
    }

    function setParticleMode(index) {
        if (index === currentMode || !ctx) return;
        currentMode = index;
        particles = particles.map(() => makeParticle(index, true));
        if (reduced) drawParticles(0);
    }

    function drawParticles(time) {
        if (!ctx) return;
        const mode = particleModes[currentMode];
        ctx.clearRect(0, 0, width, height);

        particles.forEach((p) => {
            if (!reduced) {
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.spin;
                if (p.y < -20) { p.y = height + 20; p.x = Math.random() * width; }
                if (p.y > height + 20) { p.y = -20; p.x = Math.random() * width; }
                if (p.x < -20) p.x = width + 20;
                if (p.x > width + 20) p.x = -20;
            }

            let alpha = p.alpha;
            if (mode.blink) alpha *= 0.45 + 0.55 * Math.sin(time * 0.003 + p.phase) ** 2;

            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            ctx.fillStyle = 'rgb(' + mode.color + ')';
            if (mode.glow) {
                ctx.shadowColor = 'rgba(' + mode.color + ',.9)';
                ctx.shadowBlur = 12;
            }

            if (mode.shape === 'leaf') {
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size * 0.34, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
    }

    function loop(time) {
        drawParticles(time);
        rafId = window.requestAnimationFrame(loop);
    }

    if (ctx) {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas, { passive: true });
        if (!reduced) rafId = window.requestAnimationFrame(loop);
        document.addEventListener('visibilitychange', () => {
            if (!reduced) return;
            // Reduced-motion: tidak perlu loop sama sekali.
        });
        if (reduced) void rafId;
    }
})();
