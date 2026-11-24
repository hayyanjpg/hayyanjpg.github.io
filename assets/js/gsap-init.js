/* ==========================================================
   GSAP CHOREOGRAPHY — NOIR SKIN
   - Judul (hero + tiap section): huruf jatuh per kata
   - Kartu masuk berurutan, parallax foto, progress bar scroll
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

    /* ---------------- JUDUL: HURUF JATUH PER KATA ---------------- */
    function buildTitle(el) {
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!text) return;
        el.innerHTML = text.split(' ').filter(Boolean).map((word) => {
            const chars = Array.from(word)
                .map((char) => '<span class="gsap-char">' + escapeHtml(char) + '</span>')
                .join('');
            return '<span class="gsap-word">' + chars + '</span>';
        }).join(' ');
    }

    function dropTitle(el, delay) {
        const timeline = gsap.timeline({ delay: delay || 0 });
        el.querySelectorAll('.gsap-word').forEach((word, wordIndex) => {
            const chars = word.querySelectorAll('.gsap-char');
            if (!chars.length) return;
            timeline.from(chars, {
                yPercent: -130,
                duration: 0.8,
                ease: 'bounce.out',
                stagger: 0.045
            }, wordIndex * 0.24);
        });
        return timeline;
    }

    const heroTitle = document.querySelector('.home__title');
    const sectionTitleStates = [];

    function titleTrigger(state) {
        if (!ScrollTrigger) {
            state.revealed = true;
            dropTitle(state.el, 0);
            return null;
        }
        return ScrollTrigger.create({
            trigger: state.el,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                state.revealed = true;
                dropTitle(state.el, 0);
            }
        });
    }

    document.querySelectorAll('.sec-title').forEach((el) => {
        const state = { el: el, revealed: false, trigger: null };
        buildTitle(el);
        state.trigger = titleTrigger(state);
        sectionTitleStates.push(state);
    });

    function refreshTitles() {
        if (heroTitle) {
            buildTitle(heroTitle);
            dropTitle(heroTitle, 0);
        }
        sectionTitleStates.forEach((state) => {
            buildTitle(state.el);
            if (state.trigger) state.trigger.kill();
            if (state.revealed) dropTitle(state.el, 0);
            else state.trigger = titleTrigger(state);
        });
    }

    // Tombol ID/EN mengubah textContent, jadi judul dipecah dan dimainkan ulang.
    const langBtn = document.querySelector('#lang-btn');
    if (langBtn) langBtn.addEventListener('click', () => window.setTimeout(refreshTitles, 0));

    /* ---------------- NETRALISASI REVEAL BAWAAN ---------------- */
    // GSAP mengambil alih semua animasi masuk supaya tidak dobel dengan IO.
    // Transisi CSS harus dimatikan: transition-delay bawaan main.js bisa
    // menahan nilai inline yang ditulis GSAP tiap frame.
    document.querySelectorAll('.reveal').forEach((el) => {
        el.style.transition = 'none';
        el.classList.add('is-visible');
    });

    /* ---------------- KARTU MASUK BERURUTAN ---------------- */
    const groups = [
        { items: '.skills__grid .skill', trigger: '.skills__grid' },
        { items: '.quests .quest', trigger: '.quests' },
        { items: '.projects__grid .project', trigger: '.projects__grid' },
        { items: '.certs__grid .cert', trigger: '.certs__grid' },
        { items: '.contact__cards .contact__card', trigger: '.contact__cards' }
    ];

    // NOTE: tween dibuat di dalam onEnter, bukan lewat opsi `scrollTrigger`
    // pada gsap.from(). Jika tidak, `once: true` akan meng-kill tween bersama
    // trigger-nya dan elemen nyangkut di opacity 0.
    function revealOnScroll(trigger, start, animate) {
        if (!ScrollTrigger) {
            animate();
            return;
        }
        ScrollTrigger.create({
            trigger: trigger,
            start: start,
            once: true,
            onEnter: animate
        });
    }

    groups.forEach((group) => {
        const items = document.querySelectorAll(group.items);
        if (!items.length) return;
        revealOnScroll(group.trigger, 'top 86%', () => {
            gsap.fromTo(items,
                { y: 34, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.75,
                    ease: 'power3.out',
                    stagger: 0.1,
                    clearProps: 'opacity,transform'
                });
        });
    });

    /* ---------------- TEKS TENTANG & STAT ---------------- */
    const about = document.querySelector('.about__text');
    if (about) {
        revealOnScroll('.about__grid', 'top 82%', () => {
            gsap.fromTo(about,
                { y: 26, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.75,
                    ease: 'power3.out',
                    clearProps: 'opacity,transform'
                });
        });
    }

    const stats = document.querySelectorAll('.stat');
    if (stats.length) {
        revealOnScroll('.stats', 'top 90%', () => {
            gsap.fromTo(stats,
                { y: 20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.12,
                    ease: 'power2.out',
                    clearProps: 'opacity,transform'
                });
        });
    }

    /* ---------------- PARALLAX ---------------- */
    if (ScrollTrigger) {
        const aboutPhoto = document.querySelector('.about__photo img');
        if (aboutPhoto) {
            gsap.fromTo(aboutPhoto,
                { yPercent: -5, scale: 1.12 },
                {
                    yPercent: 5,
                    scale: 1.12,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.about__photo',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.6
                    }
                });
        }

        const avatar = document.querySelector('.home__avatar');
        if (avatar) {
            gsap.to(avatar, {
                yPercent: 7,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.home',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }
    }

    /* ---------------- SCROLL PROGRESS ---------------- */
    if (ScrollTrigger) {
        const progress = document.createElement('div');
        progress.className = 'scroll-progress';
        progress.setAttribute('aria-hidden', 'true');
        progress.innerHTML = '<span></span>';
        document.body.appendChild(progress);
        gsap.fromTo(progress.firstElementChild,
            { scaleX: 0 },
            {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: { start: 0, end: 'max', scrub: 0.25 }
            });
    }

    /* ---------------- TUNGGU LOADER HILANG BENAR ---------------- */
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

    whenLoaderDone(() => {
        // Loader butuh ~450ms untuk fade-out; tunggu supaya jatuhnya terlihat jelas.
        const wait = document.querySelector('#loader') ? 480 : 0;
        window.setTimeout(() => {
            if (heroTitle) {
                buildTitle(heroTitle);
                dropTitle(heroTitle, 0);
            }
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
        }, wait);
    });
})();
