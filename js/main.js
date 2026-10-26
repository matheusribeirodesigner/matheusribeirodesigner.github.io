// Matheus Ribeiro — Portfólio
// Motion ported 1:1 from the approved Claude Design prototype (GSAP + ScrollTrigger).
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (hasFinePointer) document.body.classList.add('has-fine-pointer');

  const els = {
    header: $('#header'),
    headerLine: $('#headerLine'),
    logo: $('#logo'),
    progressBar: $('#progressBar'),
    menuBtn: $('#menuBtn'),
    bar1: $('#bar1'), bar2: $('#bar2'), bar3: $('#bar3'),
    menuPanel: $('#menuPanel'),
    hero: $('.hero'),
    heroContent: $('#heroContent'),
    heroLight: $('#heroLight'),
    iconWrap: $('#iconWrap'),
    heroIcon: $('#heroIcon'),
    eyebrow: $('#eyebrow'),
    line1: $('#line1'), line2: $('#line2'),
    heroPara: $('#heroPara'),
    scrollCue: $('#scrollCue'),
    sobre: $('#sobre'),
    sobreEyebrow: $('#sobreEyebrow'),
    sobreImgWrap: $('#sobreImgWrap'),
    sobreGlow: $('#sobreGlow'),
    sobreImgClip: $('#sobreImgClip'),
    sobreImg: $('#sobreImg'),
    sobreHeadline: $('#sobreHeadline'),
    sobrePara: $('#sobrePara'),
    sobreDot: $('#sobreDot'),
    backToTop: $('#backToTop'),
    backToTopArrow: $('#backToTopArrow'),
    cursorDot: $('#cursorDot'),
  };

  let backToTopVisible = false;
  let headerScrolled = false;
  const headerAnim = { blur: 0, bgAlpha: 0 };

  // ---------- Scroll progress + header + back-to-top ----------
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (els.progressBar) els.progressBar.style.width = Math.min(100, Math.max(0, pct)) + '%';

    const showBackToTop = window.scrollY > window.innerHeight * 0.9;
    if (showBackToTop !== backToTopVisible) {
      backToTopVisible = showBackToTop;
      const el = els.backToTop;
      if (el) {
        if (typeof gsap !== 'undefined' && !reduced) {
          gsap.to(el, { opacity: showBackToTop ? 1 : 0, y: showBackToTop ? 0 : 12, duration: 0.4, ease: 'power2.out' });
        } else {
          el.style.opacity = showBackToTop ? '1' : '0';
          el.style.transform = showBackToTop ? 'translateY(0)' : 'translateY(12px)';
        }
        el.style.pointerEvents = showBackToTop ? 'auto' : 'none';
      }
    }

    const scrolled = window.scrollY > 40;
    if (scrolled !== headerScrolled) {
      headerScrolled = scrolled;
      if (!menuOpen) setHeaderChrome(scrolled);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Cursor dot ----------
  if (hasFinePointer && els.cursorDot) {
    window.addEventListener('mousemove', (e) => {
      els.cursorDot.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`;
    }, { passive: true });
  }

  // ---------- Back to top ----------
  if (els.backToTop) {
    els.backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
    if (typeof gsap !== 'undefined') {
      els.backToTop.addEventListener('mouseenter', () => {
        gsap.to(els.backToTopArrow, { y: -3, scale: 1.1, duration: 0.35, ease: 'power2.out' });
        gsap.to(els.backToTop, { borderColor: '#9333ea', duration: 0.35, ease: 'power2.out' });
      });
      els.backToTop.addEventListener('mouseleave', () => {
        gsap.to(els.backToTopArrow, { y: 0, scale: 1, duration: 0.35, ease: 'power2.out' });
        gsap.to(els.backToTop, { borderColor: '#3a3a3e', duration: 0.35, ease: 'power2.out' });
      });
    }
  }

  // ---------- Fullscreen menu ----------
  let menuOpen = false;
  let menuTl = null;

  function setupMenuTimeline() {
    if (typeof gsap === 'undefined' || !els.menuBtn || !els.menuPanel) return;
    const { bar1, bar2, bar3, menuPanel } = els;
    const links = $$('[data-menu-link]', menuPanel);

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
    tl.to(bar1, { y: 6, rotation: 45, duration: 0.5 }, 0)
      .to(bar3, { y: -6, rotation: -45, duration: 0.5 }, 0)
      .to(bar2, { opacity: 0, duration: 0.25 }, 0)
      .to(menuPanel, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power4.inOut' }, 0.05)
      .to(links, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.07 }, 0.28);
    tl.eventCallback('onStart', () => { menuPanel.style.pointerEvents = 'auto'; });
    tl.eventCallback('onReverseComplete', () => { menuPanel.style.pointerEvents = 'none'; });
    menuTl = tl;

    const setLine = (link, active, fast) => {
      const line = link.querySelector('[data-menu-line]');
      gsap.to(line, { scaleX: active ? 1 : 0, duration: fast ? 0.45 : 0.6, ease: 'power3.inOut' });
    };
    let activeMenuLink = null;

    links.forEach((link) => {
      const text = link.querySelector('[data-menu-text]');
      link.addEventListener('mouseenter', () => {
        gsap.to(text, { x: 14, letterSpacing: '0.015em', duration: 0.45, ease: 'power3.out' });
        gsap.to(link, { color: '#f4f3f1', duration: 0.3 });
        setLine(link, true, true);
        links.forEach((other) => {
          if (other === link) return;
          gsap.to(other, { opacity: 0.55, duration: 0.4, ease: 'power2.out' });
          if (other !== activeMenuLink) setLine(other, false, true);
        });
      });
      link.addEventListener('mouseleave', () => {
        gsap.to(text, { x: 0, letterSpacing: '-0.01em', duration: 0.45, ease: 'power3.out' });
        if (link !== activeMenuLink) setLine(link, false, true);
        links.forEach((other) => gsap.to(other, { opacity: 1, duration: 0.4, ease: 'power2.out' }));
        if (activeMenuLink) setLine(activeMenuLink, true, true);
      });
    });

    // Scroll-spy
    const sectionEls = links.map((l) => document.querySelector(l.getAttribute('href')));
    const spyObserver = new IntersectionObserver((entries) => {
      if (window.scrollY < 10) return;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = sectionEls.indexOf(entry.target);
        if (idx === -1) return;
        const link = links[idx];
        if (link === activeMenuLink) return;
        if (activeMenuLink) setLine(activeMenuLink, false);
        activeMenuLink = link;
        setLine(link, true);
      });
    }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
    sectionEls.forEach((el) => { if (el) spyObserver.observe(el); });

    // Idle hover on closed hamburger
    els.menuBtn.addEventListener('mouseenter', () => {
      if (menuOpen) return;
      gsap.to(bar1, { x: -2, duration: 0.4, ease: 'power2.out' });
      gsap.to(bar3, { x: 2, duration: 0.4, ease: 'power2.out' });
    });
    els.menuBtn.addEventListener('mouseleave', () => {
      gsap.to([bar1, bar3], { x: 0, duration: 0.4, ease: 'power2.out' });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOpen) toggleMenu();
    });
  }

  function setHeaderChrome(scrolled) {
    const canAnimate = typeof gsap !== 'undefined' && !document.hidden;
    if (canAnimate && els.header) {
      gsap.to(headerAnim, {
        blur: scrolled ? 14 : 0,
        bgAlpha: scrolled ? 0.55 : 0,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: () => {
          if (els.header) {
            els.header.style.background = `rgba(5,5,6,${headerAnim.bgAlpha})`;
            els.header.style.backdropFilter = `blur(${headerAnim.blur}px)`;
            els.header.style.webkitBackdropFilter = `blur(${headerAnim.blur}px)`;
          }
        },
      });
      if (els.headerLine) gsap.to(els.headerLine, { opacity: scrolled ? 1 : 0, duration: 0.5, ease: 'power2.out' });
    } else if (els.header) {
      els.header.style.background = scrolled ? 'rgba(5,5,6,0.55)' : 'rgba(5,5,6,0)';
      els.header.style.backdropFilter = scrolled ? 'blur(14px)' : 'blur(0px)';
      els.header.style.webkitBackdropFilter = scrolled ? 'blur(14px)' : 'blur(0px)';
      if (els.headerLine) els.headerLine.style.opacity = scrolled ? '1' : '0';
    }
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
    els.menuBtn.setAttribute('aria-expanded', String(menuOpen));
    els.menuPanel.setAttribute('aria-hidden', String(!menuOpen));
    // The fullscreen menu overlay sits below the header in z-index (so the
    // close button stays clickable), which means the header's own painted
    // background — opaque once scrolled — would otherwise sit on top of the
    // menu's nav links. Force it transparent while the menu is open, then
    // restore whatever the scroll position calls for on close.
    setHeaderChrome(menuOpen ? false : headerScrolled);
    if (!menuTl) return;
    if (reduced) {
      menuTl.progress(menuOpen ? 1 : 0);
      els.menuPanel.style.pointerEvents = menuOpen ? 'auto' : 'none';
    } else if (menuOpen) {
      menuTl.play();
    } else {
      menuTl.reverse();
    }
  }
  if (els.menuBtn) els.menuBtn.addEventListener('click', toggleMenu);
  $$('[data-menu-link]').forEach((link) => link.addEventListener('click', () => { if (menuOpen) toggleMenu(); }));

  // ---------- Hero + global motion setup ----------
  function setupHeroMotion() {
    if (typeof gsap === 'undefined' || !els.hero) return;
    setupMenuTimeline();
    setupSobreMotion();

    if (reduced) {
      gsap.set([els.logo, els.eyebrow, els.line1, els.line2, els.heroPara, els.scrollCue], { opacity: 1, y: 0, clearProps: 'transform' });
      if (els.iconWrap) gsap.set(els.iconWrap, { opacity: 0.92, xPercent: 0, yPercent: -50, rotation: -5, scale: 1 });
      setupReveals();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(false);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.set([els.line1, els.line2], { y: '110%' })
      .set([els.logo, els.eyebrow, els.heroPara, els.scrollCue], { opacity: 0 })
      .set(els.logo, { y: -8 })
      .set(els.eyebrow, { y: 10 })
      .set(els.heroPara, { y: 16 })
      .to(els.logo, { opacity: 1, y: 0, duration: 1.1 }, 0.1)
      .to(els.eyebrow, { opacity: 1, y: 0, duration: 0.9 }, 0.35)
      .to(els.line1, { y: '0%', duration: 1.1 }, 0.5)
      .to(els.line2, { y: '0%', duration: 1.1 }, 0.62)
      .to(els.heroPara, { opacity: 1, y: 0, duration: 0.9 }, 0.95)
      .to(els.scrollCue, { opacity: 1, y: 0, duration: 0.8 }, 1.15);

    setupCardInteractions();

    if (els.iconWrap) {
      gsap.set(els.iconWrap, { yPercent: -50, rotation: -5, xPercent: 8, scale: 0.92, opacity: 0 });
      tl.to(els.iconWrap, { opacity: 0.92, xPercent: 0, scale: 1, duration: 1.6, ease: 'power3.out' }, 0.2);
      tl.call(() => {
        gsap.to(els.iconWrap, { yPercent: -50 - 2.2, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
    }

    tl.call(() => {
      ScrollTrigger.create({
        trigger: els.hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
        animation: gsap.timeline()
          .to(els.heroContent, { y: -60, scale: 0.985, opacity: 0.55, ease: 'none' }, 0)
          .to(els.iconWrap, { y: -60, scale: 0.985, opacity: 0.55, ease: 'none' }, 0)
          .to(els.scrollCue, { opacity: 0, y: 10, ease: 'none' }, 0),
      });
    });

    setupReveals();

    // Ambient light
    if (els.heroLight) {
      const xTo = gsap.quickTo(els.heroLight, 'x', { duration: 3.2, ease: 'sine.out' });
      const yTo = gsap.quickTo(els.heroLight, 'y', { duration: 3.2, ease: 'sine.out' });
      const MAX_OFFSET = 25;
      const iconXTo = els.heroIcon ? gsap.quickTo(els.heroIcon, 'x', { duration: 1.9, ease: 'power2.out' }) : null;
      const iconYTo = els.heroIcon ? gsap.quickTo(els.heroIcon, 'y', { duration: 1.9, ease: 'power2.out' }) : null;
      const ICON_MAX_OFFSET = 16;

      if (hasFinePointer) {
        window.addEventListener('mousemove', (e) => {
          const rect = els.hero.getBoundingClientRect();
          const inView = rect.bottom > 0 && rect.top < window.innerHeight;
          if (!inView) return;
          const relX = (e.clientX / window.innerWidth - 0.5) * 2 * MAX_OFFSET;
          const relY = (e.clientY / window.innerHeight - 0.5) * 2 * MAX_OFFSET;
          xTo(relX); yTo(relY);
          if (iconXTo) {
            iconXTo(-(e.clientX / window.innerWidth - 0.5) * 2 * ICON_MAX_OFFSET);
            iconYTo(-(e.clientY / window.innerHeight - 0.5) * 2 * ICON_MAX_OFFSET);
          }
        }, { passive: true });
        window.addEventListener('mouseleave', () => { xTo(0); yTo(0); if (iconXTo) { iconXTo(0); iconYTo(0); } }, { passive: true });
      } else {
        gsap.to(els.heroLight, { x: MAX_OFFSET * 0.6, y: -MAX_OFFSET * 0.6, duration: 22, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      }
    }
  }

  // ---------- Card interactions (image parallax on hover) ----------
  function setupCardInteractions() {
    if (reduced || !hasFinePointer) return;
    $$('.project-card').forEach((card) => {
      const media = card.querySelector('.project-card__media img, .project-card__media video');
      if (!media) return;
      const xTo = gsap.quickTo(media, 'x', { duration: 0.7, ease: 'power3.out' });
      const yTo = gsap.quickTo(media, 'y', { duration: 0.7, ease: 'power3.out' });
      card.addEventListener('mouseenter', () => gsap.to(media, { scale: 1.06, duration: 0.7, ease: 'power3.out' }));
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        xTo(((e.clientX - r.left) / r.width - 0.5) * 16);
        yTo(((e.clientY - r.top) / r.height - 0.5) * 16);
      });
      card.addEventListener('mouseleave', () => gsap.to(media, { scale: 1, x: 0, y: 0, duration: 0.8, ease: 'power3.out' }));
    });
  }

  // ---------- Sobre scrubbed timeline ----------
  function setupSobreMotion() {
    if (typeof gsap === 'undefined') return;
    const { sobre, sobreEyebrow, sobreImgWrap, sobreGlow, sobreImgClip, sobreImg, sobreHeadline, sobrePara, sobreDot } = els;
    if (!sobre || !sobreImgWrap || !sobreImgClip || !sobreHeadline || !sobreEyebrow || !sobrePara || !sobreDot || !sobreGlow || !sobreImg) return;

    if (reduced) {
      gsap.set([sobreEyebrow, sobrePara, sobreDot], { opacity: 1, y: 0, scale: 1, clearProps: 'transform' });
      gsap.set(sobreImgClip, { clipPath: 'inset(0% 0 0% 0)' });
      gsap.set(sobreHeadline, { y: 0, opacity: 1 });
      return;
    }

    const tl = gsap.timeline({ scrollTrigger: { trigger: sobre, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    tl.fromTo(sobreEyebrow, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.08 }, 0)
      .to(sobreEyebrow, { opacity: 0, y: -10, duration: 0.08 }, 0.88)
      .fromTo(sobreImgClip, { clipPath: 'inset(0% 0 100% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.15, ease: 'none' }, 0.03)
      .fromTo(sobreImgWrap, { y: 50 }, { y: -40, duration: 1, ease: 'none' }, 0)
      .to(sobreImgWrap, { opacity: 0, duration: 0.1 }, 0.86)
      .fromTo(sobreHeadline, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.14, ease: 'none' }, 0.12)
      .to(sobreHeadline, { y: -40, opacity: 0, duration: 0.12, ease: 'none' }, 0.82)
      .fromTo(sobrePara, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.1 }, 0.3)
      .to(sobrePara, { opacity: 0, y: -16, duration: 0.1 }, 0.8)
      .fromTo(sobreDot, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.08 }, 0.4)
      .to(sobreDot, { opacity: 0, scale: 0, duration: 0.08 }, 0.78);
    ScrollTrigger.refresh();

    const safetyScroll = () => {
      const r = sobre.getBoundingClientRect();
      const centered = r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4;
      if (centered && getComputedStyle(sobreHeadline).opacity === '0' && tl.scrollTrigger && tl.scrollTrigger.progress === 0) {
        gsap.set([sobreEyebrow, sobreHeadline, sobrePara, sobreDot], { opacity: 1, y: 0, clearProps: 'transform' });
        gsap.set(sobreImgClip, { clipPath: 'inset(0% 0 0% 0)' });
        gsap.set(sobreImgWrap, { opacity: 1 });
      }
    };
    window.addEventListener('scroll', safetyScroll, { passive: true });

    if (hasFinePointer) {
      sobreImgClip.addEventListener('mouseenter', () => {
        gsap.to(sobreImg, { scale: 1.05, duration: 0.7, ease: 'power3.out' });
        gsap.to(sobreGlow, { opacity: 1.4, scale: 1.08, duration: 0.7, ease: 'power3.out' });
      });
      sobreImgClip.addEventListener('mouseleave', () => {
        gsap.to(sobreImg, { scale: 1, duration: 0.7, ease: 'power3.out' });
        gsap.to(sobreGlow, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' });
      });
    }
  }

  // ---------- Generic reveal-on-scroll ----------
  function setupReveals() {
    const revealItems = $$('[data-reveal]');
    if (revealItems.length) {
      revealItems.forEach((el) => {
        const delay = el.getAttribute('data-delay');
        const delayCss = delay ? `${delay}ms` : '0s';
        el.style.transition = `opacity 0.8s ease ${delayCss}, transform 0.8s ease ${delayCss}`;
      });
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.style.opacity = entry.isIntersecting ? '1' : '0';
          entry.target.style.transform = entry.isIntersecting ? 'translateY(0)' : 'translateY(26px)';
        });
      }, { threshold: 0.15 });
      revealItems.forEach((el) => io.observe(el));
    }

    const ctaEl = $('[data-reveal-cta]');
    if (ctaEl) {
      ctaEl.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      ctaEl.style.opacity = '0';
      ctaEl.style.transform = 'translateY(26px)';
      let pulsed = false;
      const ctaIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.style.opacity = entry.isIntersecting ? '1' : '0';
          entry.target.style.transform = entry.isIntersecting ? 'translateY(0)' : 'translateY(26px)';
          if (entry.isIntersecting && !pulsed && typeof gsap !== 'undefined') {
            pulsed = true;
            gsap.fromTo(ctaEl, { scale: 1 }, { scale: 1.02, duration: 0.6, delay: 0.5, ease: 'power2.inOut', yoyo: true, repeat: 1 });
          }
        });
      }, { threshold: 0.15 });
      ctaIo.observe(ctaEl);
    }
  }

  // =====================================================================
  // Trabalho — projects as cases, each with its own image/video gallery.
  // One card per project (not per image); click opens a fullscreen modal
  // gallery. Data below only references real, curated assets — nothing
  // invented; projects with no material yet stay as placeholders.
  // =====================================================================
  // Grid thumbnails are a fixed 3:2 frame (see .project-card__media in
  // style.css) — the layout defines the crop, not the file. Native
  // proportion is only restored inside the case/modal (projectImages
  // below feeds the modal directly from the original files).
  const PROJECTS = {
    branding: [
      { slug: 'id-logo-matheus-ribeiro', title: 'ID Logo Matheus Ribeiro', category: 'Branding, Identidade & Direção de Arte', tags: 'Branding · Identidade pessoal', count: 1 },
      { slug: 'brilho-de-natal-kv', title: 'Brilho de Natal — Key Visual', category: 'Branding, Identidade & Direção de Arte', tags: 'Key Visual · Identidade de campanha', count: 1, focus: 'center 10%' },
      { slug: 'uptown-10-anos-branding', title: 'Uptown 10 Anos', category: 'Branding, Identidade & Direção de Arte', tags: 'Branding · Identidade Visual · Aplicações de marca', count: 6 },
      { slug: 'mundial-de-clubes-arena', title: 'Mundial de Clubes — Arena Uptown', category: 'Branding, Identidade & Direção de Arte', tags: 'Key Visual · Campanha', count: 4, focus: 'center 25%' },
    ],
    eventos: [
      // Campanhas/ativações primeiro (mais dinâmicas visualmente), depois o
      // conjunto de canecas & tirantes agrupado no final.
      { slug: 'kpop-day', title: 'K-pop Day', category: 'Design para Eventos', count: 5 },
      { slug: 'festival-de-inverno', title: 'Festival de Inverno', category: 'Design para Eventos', count: 2, focus: 'center 15%' },
      { slug: 'brilho-de-natal-neve', title: 'Brilho de Natal — Era uma vez na neve', category: 'Design para Eventos', count: 1, focus: 'center 12%' },
      { slug: 'samba-no-baixo', title: 'Samba no Baixo', category: 'Design para Eventos', count: 2, focus: 'center 10%' },
      { slug: 'o-som-dos-nossos-talentos', title: 'O Som dos Nossos Talentos', category: 'Design para Eventos', count: 3 },
      { slug: 'csa-canecas-tirantes', title: 'CSA 2026 — Canecas & Tirantes', category: 'Design para Eventos', count: 3 },
      { slug: 'clinicou-110', title: 'Clinicou 110 — Canecas & Tirantes', category: 'Design para Eventos', count: 5 },
      { slug: 'escola-parque', title: 'Escola Parque — Canecas & Tirantes', category: 'Design para Eventos', count: 4 },
      { slug: 'pio-xi', title: 'PIO XI — Canecas & Tirantes', category: 'Design para Eventos', count: 2 },
      { slug: 'olimpo-300', title: '300 Olimpo — CCC 2026', category: 'Design para Eventos', count: 2 },
    ],
    social: [
      { slug: 'uptown-10-anos-social', title: 'Uptown 10 Anos', category: 'Social Media & Digital', count: 2 },
      { slug: 'csa-kalango-20', title: 'CSA — Kalango 2.0', category: 'Social Media & Digital', count: 9 },
      { slug: 'csa-ultimo-santo', title: 'CSA — O Último Santo', category: 'Social Media & Digital', count: 5 },
      { slug: 'gaba-wellness-club', title: 'GABA Wellness Club', category: 'Social Media & Digital', count: 17 },
      { slug: 'gaba-week', title: 'GABA Week', category: 'Social Media & Digital', count: 4 },
      { slug: 'cruzeiro-kalango-2026', title: 'Cruzeiro 2026 — Kalango', category: 'Social Media & Digital', tags: 'Social Media · Save the Date', count: 5 },
    ],
    motion: [
      { slug: 'vinheta-copa-do-mundo', title: 'Vinheta — Copa do Mundo', category: 'Motion Design', count: 1, video: true },
      { slug: 'mapa-animado-rj', title: 'Mapa Animado — Rio de Janeiro', category: 'Motion Design', count: 1, video: true, focus: 'center 8%' },
      { slug: 'telao-uff', title: 'Telão — UFF', category: 'Motion Design', count: 1, video: true },
      { slug: 'uptown-10-anos-painel-led', title: 'Uptown 10 Anos — Painel de LED', category: 'Motion Design', tags: 'Painel de LED · Telão', count: 2, video: true },
      { slug: 'brilho-de-natal-painel-led', title: 'Brilho de Natal — Painel de LED', category: 'Motion Design', tags: 'Painel de LED · Telão', count: 2, video: true },
      { slug: 'pascoa-painel-led', title: 'Páscoa — Painel de LED', category: 'Motion Design', tags: 'Painel de LED · Telão · Pirulito', count: 2, video: true },
      { slug: 'samba-no-baixo-painel-led', title: 'Samba no Baixo — Painel de LED', category: 'Motion Design', tags: 'Painel de LED', count: 1, video: true },
      { slug: 'festa-de-15-anos-painel-led', title: 'Festa de 15 Anos — Painel de LED', category: 'Motion Design', tags: 'Painel de LED', count: 2, video: true },
    ],
    print: [
      { slug: 'uptown-10-anos-impressos', title: 'Uptown 10 Anos', category: 'Impressos & Grande Formato', tags: 'Outdoor · Testeira · Checking de instalação', count: 4 },
      { slug: 'brilho-de-natal-grande-formato', title: 'Brilho de Natal — Grande Formato', category: 'Impressos & Grande Formato', tags: 'Outdoor · Vitrine · Totens', count: 4 },
      { slug: 'kpop-day-outdoor', title: 'K-pop Day — Outdoor', category: 'Impressos & Grande Formato', tags: 'Outdoor', count: 1 },
      { slug: 'playcity-sinalizacao', title: 'Playcity — Sinalização de Parque', category: 'Impressos & Grande Formato', tags: 'Sinalização · Totens · Grande Formato', count: 5 },
      { slug: 'rock-na-calcada-brindes', title: 'Rock na Calçada — Brindes', category: 'Impressos & Grande Formato', tags: 'Brindes · Adesivos', count: 1 },
    ],
    web: [
      { slug: 'spw', title: 'SPW', category: 'Web & Landing Pages', count: 1 },
      { slug: 'site-playcity', title: 'Site Playcity', category: 'Web & Landing Pages', count: 1 },
    ],
    ia: [
      { slug: 'clinicou-brasao', title: 'Brasão — Clinicou Med Estácio (IA)', category: 'IA para Criação Visual & Vídeos', count: 1, video: true },
      { slug: 'ufrj-ia', title: 'UFRJ (IA)', category: 'IA para Criação Visual & Vídeos', count: 1, video: true },
      { slug: 'estacio-ia', title: 'Estácio (IA)', category: 'IA para Criação Visual & Vídeos', count: 1, video: true },
      { slug: 'vinheta-uff-med', title: 'Vinheta — UFF Med 26.1 (IA)', category: 'IA para Criação Visual & Vídeos', count: 1, video: true },
    ],
  };

  function projectImages(project) {
    if (!project.slug) return [];
    const ext = project.video ? 'mp4' : 'jpg';
    return Array.from({ length: project.count }, (_, i) => `assets/projects/${project.slug}/${String(i + 1).padStart(2, '0')}.${ext}`);
  }

  function renderProjectGrids() {
    $$('.project-grid').forEach((grid) => {
      const category = grid.getAttribute('data-category');
      const projects = PROJECTS[category] || [];
      grid.innerHTML = projects.map((project, i) => {
        if (project.placeholder) {
          return `<div class="project-card" aria-hidden="true">
            <div class="project-card__media">
              <div class="placeholder-slot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                <span>${project.placeholder}</span>
              </div>
            </div>
          </div>`;
        }
        const images = projectImages(project);
        const cover = images[0];
        const playIcon = project.video
          ? `<div class="project-card__play"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l10-5.5-10-5.5z"/></svg></div>`
          : '';
        const focusStyle = project.focus ? ` style="object-position: ${project.focus}"` : '';
        const media = project.video
          ? `<video src="${cover}" muted loop playsinline preload="none" data-video-card controlsList="nodownload" disablePictureInPicture${focusStyle}></video>`
          : `<img src="${cover}" alt="${project.title} — ${project.category}" loading="lazy" draggable="false"${focusStyle}>`;
        return `<button type="button" class="project-card" data-category="${category}" data-project-index="${i}" aria-haspopup="dialog">
          <div class="project-card__media">
            ${media}
            <div class="project-card__scrim"></div>
            ${playIcon}
            <div class="project-card__info">
              <span class="project-card__title">${project.title}</span>
              <span class="project-card__count">${images.length} peça${images.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </button>`;
      }).join('');
    });
  }

  // ---------- Project sliders: categories with more than 3 projects get a
  // horizontal, page-snapped strip with nav controls below it (never on
  // top of the thumbnails). Categories with 3 or fewer stay a plain static
  // grid — no slider chrome shown needlessly. ----------
  function setupProjectSliders() {
    $$('.project-grid').forEach((grid) => {
      const cards = $$('.project-card', grid);
      if (cards.length <= 3) return;

      grid.classList.add('project-grid--slider');
      grid.setAttribute('tabindex', '0');

      const nav = document.createElement('div');
      nav.className = 'project-slider-nav';
      nav.innerHTML = `
        <button type="button" class="project-slider-nav__btn" data-slider-prev aria-label="Projetos anteriores">
          <svg viewBox="0 0 16 16" fill="none"><path d="M10 2L4 8l6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="project-slider-nav__counter" data-slider-counter>01 / 01</span>
        <button type="button" class="project-slider-nav__btn" data-slider-next aria-label="Próximos projetos">
          <svg viewBox="0 0 16 16" fill="none"><path d="M6 2l6 6-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>`;
      const track = document.createElement('div');
      track.className = 'project-slider-track';
      track.innerHTML = `<div class="project-slider-track__thumb" data-slider-thumb></div>`;

      grid.insertAdjacentElement('afterend', track);
      grid.insertAdjacentElement('afterend', nav);

      const prevBtn = nav.querySelector('[data-slider-prev]');
      const nextBtn = nav.querySelector('[data-slider-next]');
      const counterEl = nav.querySelector('[data-slider-counter]');
      const thumb = track.querySelector('[data-slider-thumb]');

      // One "page" = however many cards actually fit per viewport width at the
      // current breakpoint, measured from the real rendered card + gap size
      // (not clientWidth/scrollWidth division, which drifts by a gap-width
      // once items span more than one row of pages).
      const pageStep = () => {
        const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
        const cardWidth = cards[0].getBoundingClientRect().width;
        const step = cardWidth + gap;
        const perPage = Math.max(1, Math.round(grid.clientWidth / step));
        return { step, perPage };
      };

      // Current page index accounts for the final page landing short of a
      // full pageStep when it holds fewer than `perPage` cards (native
      // scrollLeft then clamps to `max`, not to a page-aligned multiple).
      const getState = () => {
        const { step, perPage } = pageStep();
        const max = grid.scrollWidth - grid.clientWidth;
        const totalPages = Math.max(1, Math.ceil(cards.length / perPage));
        const atEnd = max > 0 && grid.scrollLeft >= max - 4;
        const currentPage = atEnd ? totalPages - 1 : (max > 0 ? Math.min(totalPages - 1, Math.round(grid.scrollLeft / (perPage * step))) : 0);
        return { step, perPage, max, totalPages, currentPage };
      };

      const update = () => {
        const { totalPages, currentPage, max } = getState();
        counterEl.textContent = `${String(currentPage + 1).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`;
        thumb.style.width = `${100 / totalPages}%`;
        thumb.style.left = `${(currentPage / Math.max(1, totalPages - 1)) * (100 - 100 / totalPages)}%`;
        prevBtn.disabled = grid.scrollLeft <= 4;
        nextBtn.disabled = grid.scrollLeft >= max - 4;
      };

      const goToPage = (delta) => {
        const { step, perPage, max, totalPages, currentPage } = getState();
        const target = Math.max(0, Math.min(totalPages - 1, currentPage + delta));
        grid.scrollTo({ left: Math.min(max, target * perPage * step), behavior: reduced ? 'instant' : 'smooth' });
      };
      prevBtn.addEventListener('click', () => goToPage(-1));
      nextBtn.addEventListener('click', () => goToPage(1));
      grid.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goToPage(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goToPage(1); }
      });

      let scrollTicking = false;
      grid.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => { update(); scrollTicking = false; });
      }, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  // ---------- Gallery modal ----------
  function setupGalleryModal() {
    const modal = $('#projectModal');
    if (!modal) return;
    const backdrop = $('#modalBackdrop');
    const mediaEl = $('#modalMedia');
    const infoEl = $('#modalInfo');
    const categoryEl = $('#modalCategory');
    const titleEl = $('#modalTitle');
    const tagsEl = $('#modalTags');
    const counterEl = $('#modalCounter');
    const closeBtn = $('#modalClose');
    const prevBtn = $('#modalPrev');
    const nextBtn = $('#modalNext');

    let currentProject = null;
    let currentImages = [];
    let currentIndex = 0;
    let isOpen = false;
    let isAnimating = false;

    function renderMedia() {
      const src = currentImages[currentIndex];
      mediaEl.innerHTML = currentProject.video
        ? `<video src="${src}" controls playsinline autoplay controlsList="nodownload noremoteplayback" disablePictureInPicture></video>`
        : `<img src="${src}" alt="${currentProject.title} — imagem ${currentIndex + 1}" draggable="false">`;
      titleEl.textContent = currentProject.title;
      categoryEl.textContent = currentProject.category;
      tagsEl.textContent = currentProject.tags || '';
      tagsEl.style.display = currentProject.tags ? '' : 'none';
      counterEl.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(currentImages.length).padStart(2, '0')}`;
    }

    function openModal(project) {
      if (isAnimating) return;
      currentProject = project;
      currentImages = projectImages(project);
      currentIndex = 0;
      isOpen = true;
      isAnimating = true;
      document.body.classList.add('modal-open');
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      renderMedia();

      if (reduced || typeof gsap === 'undefined') {
        gsap && gsap.set([backdrop, mediaEl, infoEl, closeBtn, prevBtn, nextBtn], { opacity: 1, clearProps: 'transform' });
        isAnimating = false;
        return;
      }
      gsap.set(mediaEl, { scale: 0.9, opacity: 0 });
      gsap.set(infoEl, { y: 12, opacity: 0 });
      gsap.set([closeBtn, prevBtn, nextBtn], { opacity: 0 });
      const tl = gsap.timeline({ onComplete: () => { isAnimating = false; } });
      tl.to(backdrop, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
        .to(mediaEl, { scale: 1, opacity: 1, duration: 0.55, ease: 'power3.out' }, 0.12)
        .to(infoEl, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.32)
        .to([closeBtn, prevBtn, nextBtn], { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.4);
    }

    function closeModal() {
      if (!isOpen || isAnimating) return;
      isAnimating = true;
      const finish = () => {
        isOpen = false;
        isAnimating = false;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        mediaEl.innerHTML = '';
      };
      if (reduced || typeof gsap === 'undefined') { finish(); return; }
      const tl = gsap.timeline({ onComplete: finish });
      tl.to([closeBtn, prevBtn, nextBtn], { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0)
        .to(infoEl, { y: 12, opacity: 0, duration: 0.25, ease: 'power2.in' }, 0)
        .to(mediaEl, { scale: 0.92, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.05)
        .to(backdrop, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.1);
    }

    function go(delta) {
      if (!isOpen || currentImages.length < 2) return;
      currentIndex = (currentIndex + delta + currentImages.length) % currentImages.length;
      if (reduced || typeof gsap === 'undefined') { renderMedia(); return; }
      gsap.to(mediaEl, {
        opacity: 0, x: delta > 0 ? -24 : 24, duration: 0.2, ease: 'power2.in',
        onComplete: () => {
          renderMedia();
          gsap.fromTo(mediaEl, { opacity: 0, x: delta > 0 ? 24 : -24 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
        },
      });
    }

    $$('.project-card[data-category]').forEach((card) => {
      card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        const index = Number(card.getAttribute('data-project-index'));
        const project = PROJECTS[category][index];
        openModal(project);
      });
    });

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));

    window.addEventListener('keydown', (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });

    // Touch swipe (mobile)
    const stage = $('.project-modal__stage');
    let touchStartX = 0;
    stage.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  // ---------- Project cards: staggered entrance per grid (row by row) ----------
  function setupProjectCardReveals() {
    $$('.project-grid').forEach((grid) => {
      const cards = $$('.project-card', grid);
      if (!cards.length) return;
      if (typeof gsap !== 'undefined' && !reduced) {
        gsap.set(cards, { opacity: 0, y: 24 });
      } else {
        cards.forEach((c) => {
          c.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          c.style.opacity = '0';
          c.style.transform = 'translateY(24px)';
        });
      }
      let revealed = false;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || revealed) return;
          revealed = true;
          if (typeof gsap !== 'undefined' && !reduced) {
            gsap.to(cards, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06 });
          } else {
            cards.forEach((c) => { c.style.opacity = '1'; c.style.transform = 'translateY(0)'; });
          }
          io.disconnect();
        });
      }, { threshold: 0.1 });
      io.observe(grid);
    });
  }

  // ---------- Motion Design video cards: play only while in view ----------
  function setupVideoCards() {
    const cards = $$('[data-video-card]').map((v) => v.closest('.project-card__media') || v.parentElement);
    if (!cards.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector('video');
        if (!video) return;
        if (entry.isIntersecting) {
          if (video.preload === 'none') video.preload = 'metadata';
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.35 });
    cards.forEach((card) => io.observe(card));
  }

  // ---------- Contact form: mailto ----------
  const contactForm = $('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const name = data.get('name') || '';
      const email = data.get('email') || '';
      const company = data.get('company') || '';
      const type = data.get('type') || '';
      const message = data.get('message') || '';
      const body = `Nome: ${name}\nE-mail: ${email}\nEmpresa/Marca: ${company}\nTipo de projeto: ${type}\n\n${message}`;
      const mailto = `mailto:matheus.r.c.2000@gmail.com?subject=${encodeURIComponent('Novo projeto — ' + name)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    });
  }

  // ---------- Portfolio image protection ----------
  // A casual deterrent, not real DRM: blocks right-click "save image"/drag-out
  // and the video controls' native download button on project media. Scoped
  // to project cards + the case modal only — the rest of the site (text,
  // links, contact form) keeps normal browser behavior.
  function setupImageProtection() {
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.project-card__media, .project-modal__media')) e.preventDefault();
    });
    document.addEventListener('dragstart', (e) => {
      if (e.target.closest('.project-card__media, .project-modal__media')) e.preventDefault();
    });
  }

  // ---------- Boot ----------
  renderProjectGrids();
  setupProjectSliders();
  setupGalleryModal();
  setupImageProtection();

  function waitForGsapAndSetup(attempt = 0) {
    const ready = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && els.hero;
    if (ready) { setupHeroMotion(); setupVideoCards(); setupProjectCardReveals(); return; }
    if (attempt > 100) { setupReveals(); setupVideoCards(); setupProjectCardReveals(); return; }
    setTimeout(() => waitForGsapAndSetup(attempt + 1), 100);
  }
  waitForGsapAndSetup();
})();
