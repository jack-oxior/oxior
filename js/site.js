(function () {

    'use strict';

    /* =================================================
       1. MOBILE NAVIGATION
       ================================================= */

    const navToggle = document.querySelector('.oxior-nav-toggle');
    const navMenu = document.querySelector('.oxior-nav-menu');

    if (navToggle && navMenu) {

        function closeMenu() {
            navMenu.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }

        navToggle.addEventListener('click', function () {
            const isOpen = navMenu.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        /* Close menu when a link is clicked */
        navMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        /* Close menu when clicking outside */
        document.addEventListener('click', function (event) {
            if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
                closeMenu();
            }
        });

        /* Close with Escape */
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeMenu();
        });

        /* Reset when resizing up to desktop */
        window.addEventListener('resize', function () {
            if (window.innerWidth > 900) closeMenu();
        });
    }


    /* =================================================
       2. SERVICE TABS
       ================================================= */

    const serviceCards = document.querySelectorAll('.service-card');
    const serviceDetails = document.querySelectorAll('.service-detail');
    const mobileMQ = window.matchMedia('(max-width: 900px)');

    serviceCards.forEach(function (card) {
        card.addEventListener('click', function () {

            const key = card.dataset.service;
            if (!key) return;

            serviceCards.forEach(function (item) {
                item.classList.toggle('active', item === card);
            });

            serviceDetails.forEach(function (detail) {
                detail.classList.toggle('active', detail.dataset.detail === key);
            });

            /* On mobile the detail sits below the cards: bring it into view */
            if (mobileMQ.matches) {
                const active = document.querySelector('.service-detail.active');
                if (active) {
                    active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });
    });


    /* =================================================
       3. PROJECTS GALLERY
       (vertical on desktop, horizontal swipe on mobile -
        the IntersectionObserver works for both)
       ================================================= */

    const gallery = document.getElementById('projectsGallery');
    const thumb = document.getElementById('projectsScrollbarThumb');
    const counterNow = document.querySelector('.counter-current');
    const items = document.querySelectorAll('.project-item');

    /* Project scrollbar (desktop only; hidden on mobile) */
    if (gallery && thumb) {

        function updateScrollbar() {
            const scrollTop = gallery.scrollTop;
            const scrollMax = gallery.scrollHeight - gallery.clientHeight;
            const ratio = scrollMax > 0 ? scrollTop / scrollMax : 0;
            const travel = gallery.clientHeight - thumb.offsetHeight;
            thumb.style.top = (ratio * travel) + 'px';
        }

        gallery.addEventListener('scroll', updateScrollbar, { passive: true });
        window.addEventListener('resize', updateScrollbar);
        updateScrollbar();
    }

    /* Active project + counter */
    if (gallery && items.length) {

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {

                    const item = entry.target;
                    const index = Array.from(items).indexOf(item);

                    if (entry.isIntersecting && entry.intersectionRatio > 0.55) {

                        items.forEach(function (project) {
                            project.classList.remove('project-viewing');
                        });

                        item.classList.add('project-viewing');

                        if (counterNow) {
                            counterNow.textContent = String(index + 1).padStart(2, '0');
                        }
                    }
                });
            },
            {
                root: gallery,
                threshold: [0.55, 0.75]
            }
        );

        items.forEach(function (item) {
            observer.observe(item);
        });

        /* Mark the first project as active straight away */
        items[0].classList.add('project-viewing');
    }


    /* =================================================
       4. PROJECT IMAGE LOADING
       ================================================= */

    document.querySelectorAll('.project-image').forEach(function (img) {

        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function () {
                img.classList.add('loaded');
            });
            img.addEventListener('error', function () {
                img.classList.add('loaded');
            });
        }
    });


    /* =================================================
       5. ACCREDITATIONS CAROUSEL
       ================================================= */

    const carousel = document.getElementById('accreditationCarousel');
    const track = document.getElementById('accTrack');
    const dotsWrap = document.getElementById('accDots');

    if (carousel && track) {

        const accItems = Array.from(track.querySelectorAll('.acc-item'));
        const total = accItems.length;

        let current = 0;
        let autoplayId = null;

        /* Build dots */
        if (dotsWrap) {

            dotsWrap.innerHTML = '';

            accItems.forEach(function (_, index) {

                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'acc-dot';
                dot.setAttribute('aria-label', 'Show accreditation ' + (index + 1));

                dot.addEventListener('click', function () {
                    goTo(index);
                });

                dotsWrap.appendChild(dot);
            });
        }

        const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

        /* Render carousel */
        function render() {

            accItems.forEach(function (item, index) {

                item.classList.remove('is-active', 'is-prev', 'is-next', 'is-prev-2', 'is-next-2');

                const diff = (((index - current) % total) + total) % total;

                if (diff === 0) {
                    item.classList.add('is-active');
                } else if (diff === 1) {
                    item.classList.add('is-next');
                } else if (diff === total - 1) {
                    item.classList.add('is-prev');
                } else if (diff === 2) {
                    item.classList.add('is-next-2');
                } else if (diff === total - 2) {
                    item.classList.add('is-prev-2');
                }
            });

            dots.forEach(function (dot, index) {
                dot.classList.toggle('is-active', index === current);
            });
        }

        /* Controls */
        function goTo(index) {
            current = ((index % total) + total) % total;
            render();
            restartAutoplay();
        }

        function next() {
            goTo(current + 1);
        }

        function prev() {
            goTo(current - 1);
        }

        const prevBtn = carousel.querySelector('.acc-prev');
        const nextBtn = carousel.querySelector('.acc-next');

        if (prevBtn) prevBtn.addEventListener('click', prev);
        if (nextBtn) nextBtn.addEventListener('click', next);

        /* Card clicks */
        accItems.forEach(function (item, index) {

            item.addEventListener('click', function (event) {

                /* Active card: let the certificate link open */
                if (item.classList.contains('is-active')) return;

                /* Inactive card: rotate carousel instead */
                event.preventDefault();
                event.stopPropagation();
                goTo(index);
            });
        });

        /* Keyboard navigation */
        carousel.setAttribute('tabindex', '0');

        carousel.addEventListener('keydown', function (event) {

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                prev();
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                next();
            }
        });

        /* Touch / swipe (horizontal swipes only, so vertical page scroll is untouched) */
        let touchStartX = 0;
        let touchStartY = 0;

        carousel.addEventListener('touchstart', function (event) {
            touchStartX = event.changedTouches[0].screenX;
            touchStartY = event.changedTouches[0].screenY;
        }, { passive: true });

        carousel.addEventListener('touchend', function (event) {

            const dx = event.changedTouches[0].screenX - touchStartX;
            const dy = event.changedTouches[0].screenY - touchStartY;

            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                if (dx < 0) {
                    next();
                } else {
                    prev();
                }
            }
        }, { passive: true });

        /* Autoplay */
        function startAutoplay() {
            stopAutoplay();
            autoplayId = setInterval(next, 6500);
        }

        function stopAutoplay() {
            if (autoplayId) {
                clearInterval(autoplayId);
                autoplayId = null;
            }
        }

        function restartAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);

        /* Only autoplay while the carousel is on screen (saves battery on phones) */
        const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                if (reducedMotionMQ.matches) return;
                if (entries[0].isIntersecting) {
                    startAutoplay();
                } else {
                    stopAutoplay();
                }
            }, { threshold: 0.25 }).observe(carousel);
        } else if (!reducedMotionMQ.matches) {
            startAutoplay();
        }

        render();
    }


    /* =================================================
       6. STACKED SECTION SCROLL (desktop only)
       Each section pins while the next slides over it.
       Disabled at <= 900px and for reduced motion -
       the CSS in mobile.css switches to plain stacked blocks.
       ================================================= */

    const stackSections = Array.from(
        document.querySelectorAll('.page-wrapper > .page-section')
    );

    const stackReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stackDesktopMQ = window.matchMedia('(min-width: 901px)');

    function stackingActive() {
        return stackDesktopMQ.matches && !stackReducedMotion;
    }

    function clearStack() {
        stackSections.forEach(function (section) {
            section.style.removeProperty('top');
            section.style.removeProperty('--stack-y');
            section.style.removeProperty('--stack-scale');
            section.style.removeProperty('--stack-dim');
            section.classList.remove('is-covered');
        });
    }

    function initialiseStackedSections() {

        if (!stackSections.length || stackReducedMotion) return;

        let ticking = false;

        /* Pin each section when its BOTTOM reaches the viewport bottom,
           so tall sections can be read fully before the next one covers them. */
        function setStickyOffsets() {

            const vh = window.innerHeight;

            stackSections.forEach(function (section) {
                const overflow = section.offsetHeight - vh;
                section.style.top = (overflow > 0 ? -overflow : 0) + 'px';
            });
        }

        function updateStack() {

            ticking = false;

            if (!stackingActive()) return;

            const vh = window.innerHeight;

            stackSections.forEach(function (section, index) {

                const nextSection = stackSections[index + 1];

                /* Last section: nothing covers it */
                if (!nextSection) {
                    section.classList.remove('is-covered');
                    section.style.setProperty('--stack-y', '0px');
                    section.style.setProperty('--stack-scale', '1');
                    section.style.setProperty('--stack-dim', '0');
                    return;
                }

                const top = nextSection.getBoundingClientRect().top;

                /* 0 = next section still below the screen, 1 = fully covering */
                const progress = Math.max(0, Math.min(1, (vh - top) / vh));

                section.style.setProperty('--stack-y', (-35 * progress) + 'px');
                section.style.setProperty('--stack-scale', (1 - 0.035 * progress).toFixed(4));
                section.style.setProperty('--stack-dim', (0.55 * progress).toFixed(3));

                /* Once fully covered, remove it from view entirely */
                section.classList.toggle('is-covered', top <= 0);
            });
        }

        function requestStackUpdate() {
            if (ticking || !stackingActive()) return;
            ticking = true;
            window.requestAnimationFrame(updateStack);
        }

        function refresh() {
            if (!stackingActive()) {
                clearStack();
                return;
            }
            setStickyOffsets();
            requestStackUpdate();
        }

        window.addEventListener('scroll', requestStackUpdate, { passive: true });
        window.addEventListener('resize', refresh);
        window.addEventListener('load', refresh);

        /* Rotating a phone / resizing across the breakpoint */
        if (stackDesktopMQ.addEventListener) {
            stackDesktopMQ.addEventListener('change', refresh);
        } else if (stackDesktopMQ.addListener) {
            stackDesktopMQ.addListener(refresh);
        }

        /* Recalculate when section heights change (images loading, tabs switching) */
        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(refresh);
            stackSections.forEach(function (s) {
                ro.observe(s);
            });
        }

        refresh();
    }

    initialiseStackedSections();


    /* =================================================
       7. SMOOTH ANCHOR NAVIGATION
       Sticky sections report a shifted getBoundingClientRect(),
       so on desktop the target's natural position is computed
       from the heights of the sections before it instead.
       On mobile the sections are normal blocks, so the real
       position is used.
       ================================================= */

    function getNaturalTop(target) {

        const wrapper = document.querySelector('.page-wrapper');

        /* Not stacked (mobile, reduced motion, or outside the wrapper) */
        if (!wrapper || !stackingActive() || stackSections.indexOf(target) === -1) {
            return target.getBoundingClientRect().top + window.pageYOffset;
        }

        const wrapperRect = wrapper.getBoundingClientRect();
        let top = wrapperRect.top + window.pageYOffset;

        for (let i = 0; i < stackSections.length; i++) {

            const section = stackSections[i];
            const style = window.getComputedStyle(section);

            top += parseFloat(style.marginTop) || 0;

            if (section === target) break;

            top += section.offsetHeight + (parseFloat(style.marginBottom) || 0);
        }

        return top;
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {

        link.addEventListener('click', function (event) {

            const id = link.getAttribute('href');

            if (!id || id === '#') return;

            const target = document.querySelector(id);

            if (!target) return;

            event.preventDefault();

            const header = document.querySelector('.oxior-header');
            const navHeight = header ? header.offsetHeight : 0;

            window.scrollTo({
                top: Math.max(0, getNaturalTop(target) - navHeight),
                behavior: 'smooth'
            });
        });
    });

})();