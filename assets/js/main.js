document.addEventListener("DOMContentLoaded", function() {
    /*==================== DARK LIGHT THEME (DIPINDAHKAN KE ATAS) ====================*/
    const themeButton = document.getElementById("theme-button");
    const darkTheme = "dark-theme";
    const iconTheme = "uil-sun";

    // Cek tema yang dipilih sebelumnya dari localStorage
    const selectedTheme = localStorage.getItem("selected-theme");
    const selectedIcon = localStorage.getItem("selected-icon");

    // Fungsi untuk mendapatkan tema saat ini
    const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? "dark" : "light";
    const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? "uil-moon" : "uil-sun";

    // Terapkan tema jika ada pilihan sebelumnya
    if (selectedTheme) {
        document.body.classList[selectedTheme === "dark" ? "add" : "remove"](darkTheme);
        themeButton.classList[selectedIcon === "uil-moon" ? "add" : "remove"](iconTheme);
    } 
    // Jika tidak ada pilihan sebelumnya, cek preferensi sistem
    else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        localStorage.setItem("selected-theme", "dark");
        localStorage.setItem("selected-icon", "uil-moon");
        document.body.classList.add(darkTheme);
        themeButton.classList.add(iconTheme);
    }

    // Aktifkan/nonaktifkan tema saat tombol diklik
    themeButton.addEventListener("click", () => {
        document.body.classList.toggle(darkTheme);
        themeButton.classList.toggle(iconTheme);
        localStorage.setItem("selected-theme", getCurrentTheme());
        localStorage.setItem("selected-icon", getCurrentIcon());
    });

    /*==================== MENU SHOW Y HIDDEN ====================*/
    const navMenu = document.getElementById("nav-menu"),
        navToggle = document.getElementById("nav-toggle"),
        navClose = document.getElementById("nav-close");

    /*===== MENU SHOW =====*/
    if (navToggle) {
        navToggle.addEventListener("click", () => {
            navMenu.classList.add("show-menu");
        });
    }

    /*===== MENU HIDDEN =====*/
    if (navClose) {
        navClose.addEventListener("click", () => {
            navMenu.classList.remove("show-menu");
        });
    }

    /*==================== REMOVE MENU MOBILE ====================*/
    const navLink = document.querySelectorAll(".nav__link");

    function linkAction() {
        navMenu.classList.remove("show-menu");
    }
    navLink.forEach((n) => n.addEventListener("click", linkAction));

    /*==================== QUALIFICATION TABS ====================*/
    const tabs = document.querySelectorAll("[data-target]"),
        tabContents = document.querySelectorAll("[data-content]");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = document.querySelector(tab.dataset.target);

            tabContents.forEach((tabContent) => {
                tabContent.classList.remove("qualification__active");
            });
            target.classList.add("qualification__active");

            tabs.forEach((tab) => {
                tab.classList.remove("qualification__active");
            });
            tab.classList.add("qualification__active");
        });
    });

    /*==================== SERVICES MODAL ====================*/
    const modalViews = document.querySelectorAll(".services__modal"),
        modalBtns = document.querySelectorAll(".services__button"),
        modalCloses = document.querySelectorAll(".services__modal-close");

    let modal = function(modalClick) {
        modalViews[modalClick].classList.add("active-modal");
        document.body.classList.add("disable-scroll");
    };

    modalBtns.forEach((modalBtn, i) => {
        modalBtn.addEventListener("click", () => {
            modal(i);
        });
    });

    modalCloses.forEach((modalClose) => {
        modalClose.addEventListener("click", () => {
            modalViews.forEach((modalView) => {
                modalView.classList.remove("active-modal");
                document.body.classList.remove("disable-scroll");
            });
        });
    });

    /*==================== PORTFOLIO SWIPER ====================*/
    try {
        let swiper = new Swiper(".portfolio__container", {
            cssMode: true,
            loop: true,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
        });
    } catch (e) {
        console.error("Swiper initialization failed:", e);
    }


    /*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
    const sections = document.querySelectorAll("section[id]");

    function scrollActive() {
        const scrollY = window.pageYOffset;

        sections.forEach((current) => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 50;
            let sectionId = current.getAttribute("id");

            const link = document.querySelector(".nav__menu a[href*=" + sectionId + "]");
            if (link) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    link.classList.add("active-link");
                } else {
                    link.classList.remove("active-link");
                }
            }
        });
    }
    window.addEventListener("scroll", scrollActive);

    /*==================== CHANGE BACKGROUND HEADER ====================*/
    function scrollHeader() {
        const nav = document.getElementById("header");
        if (this.scrollY >= 80) nav.classList.add("scroll-header");
        else nav.classList.remove("scroll-header");
    }
    window.addEventListener("scroll", scrollHeader);

    /*==================== SHOW SCROLL UP ====================*/
    function scrollUp() {
        const scrollUp = document.getElementById("scroll-up");
        if (this.scrollY >= 560) scrollUp.classList.add("show-scroll");
        else scrollUp.classList.remove("show-scroll");
    }
    window.addEventListener("scroll", scrollUp);
});