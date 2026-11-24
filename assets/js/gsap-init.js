/* ==========================================================
   GSAP ENHANCEMENT LAYER
   - Judul hero muncul per kata
   - Avatar & judul section reveal saat scroll
   - Aman jika CDN gagal / prefers-reduced-motion aktif
   ========================================================== */
(function () {
    'use strict';

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Tanpa GSAP atau dengan reduced-motion: biarkan halaman apa adanya.
    if (!gsap || reducedMotion) return;
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);

    /* ---------------- JUDUL PER KATA ---------------- */
    function splitHero(animate) {
        document.querySelectorAll('.home__title > span').forEach((span) => {
            const text = (span.textContent || '').replace(/\s+/g, ' ').trim();
            if (!text) return;
            span.innerHTML = text.split(' ')
                .filter(Boolean)
                .map((word) => '<span class="gsap-word">' + escapeHtml(word) + '</span>')
                .join(' ');
        });

        if (!animate) return;
        gsap.fromTo('.home__title .gsap-word',
            { y: 28, opacity: 0, rotateX: -35 },
            {
                y: 0,
                opacity: 1,
                rotateX: 0,
                duration: 0.75,
                ease: 'back.out(1.5)',
                stagger: 0.1,
                delay: 0.15,
                clearProps: 'transform,opacity'
            });
    }

    // Tombol ID/EN mengubah textContent, jadi pecah kata lagi setelah toggling.
    const langBtn = document.querySelector('#lang-btn');
    if (langBtn) {
        langBtn.addEventListener('click', () => window.setTimeout(() => splitHero(false), 0));
    }

    /* ---------------- TUNGGU LOADER SELESAI ---------------- */
    function whenLoaderDone(callback) {
        const loader = document.querySelector('#loader');
        if (!loader || loader.classList.contains('is-hidden')) {
            callback();
            return;
        }
        const observer = new MutationObserver(() => {
            if (loader.classList.contains('is-hidden')) {
                observer.disconnect();
                callback();
            }
        });
        observer.observe(loader, { attributes: true, attributeFilter: ['class'] });
    }

    /* ---------------- NETRALISASI REVEAL BAWAAN ---------------- */
    // Elemen yang akan dianimasikan GSAP tidak perlu animasi CSS + IO ganda.
    function neutralize(selector) {
        document.querySelectorAll(selector).forEach((el) => el.classList.add('is-visible'));
    }
    neutralize('.sec-head');
    neutralize('.project');
    neutralize('.home__avatar');

    /* ---------------- REVEAL SAAT SCROLL ---------------- */
    document.querySelectorAll('.sec-head .sec-title').forEach((title) => {
        gsap.from(title, {
            y: 26,
            opacity: 0,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: ScrollTrigger ? {
                trigger: title,
                start: 'top 88%',
                once: true
            } : undefined
        });
    });

    const projects = document.querySelectorAll('.project');
    if (projects.length) {
        gsap.from(projects, {
            y: 42,
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: ScrollTrigger ? {
                trigger: '.projects__grid',
                start: 'top 85%',
                once: true
            } : undefined
        });
    }

    whenLoaderDone(() => {
        splitHero(true);
        gsap.from('.avatar-frame', {
            scale: 0.86,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.4)'
        });
        gsap.from('.home__avatar .avatar-tag, .home__avatar .avatar-hint', {
            y: 12,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.35
        });
    });
})();
