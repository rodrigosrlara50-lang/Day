(() => {
  'use strict';
  document.documentElement.classList.add('js-v32');
  const ready = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, {once:true}) : fn();
  ready(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealTargets = [...document.querySelectorAll('.section > .container, .page-hero .hero-grid, .statement, .callout, .portal-panel, .award, .address-card, .editorial-card, .testimonial-card, .info-card, .route-grid > div')];
    revealTargets.forEach((el, i) => {
      el.classList.add('v32-reveal');
      el.style.setProperty('--v32-delay', `${Math.min(i % 4, 3) * 55}ms`);
    });
    document.querySelectorAll('.split-image,.service-card,.editorial-card>img,.gallery figure,.address-card>img').forEach(el => {
      const target = el.matches('img') ? el.parentElement : el;
      target?.classList.add('v32-hover-image');
    });
    document.querySelectorAll('.section-head h2,.copy h2,.page-hero h1,.statement h1').forEach(el => el.classList.add('v32-heading-accent'));


    const videoHero = document.querySelector('.about-film--hero');
    if (document.body.classList.contains('video-hero-page') && videoHero) {
      let heroHeaderTicking = false;
      const updateVideoHeader = () => {
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 88;
        const heroBottom = videoHero.offsetTop + videoHero.offsetHeight;
        document.body.classList.toggle('header-after-video', window.scrollY >= Math.max(0, heroBottom - headerHeight));
      };
      const onHeroHeaderScroll = () => {
        if (heroHeaderTicking) return;
        heroHeaderTicking = true;
        requestAnimationFrame(() => {
          updateVideoHeader();
          heroHeaderTicking = false;
        });
      };
      updateVideoHeader();
      window.addEventListener('scroll', onHeroHeaderScroll, { passive: true });
      window.addEventListener('resize', updateVideoHeader, { passive: true });
    }

    const deliveryTicker = document.querySelector('.delivery-ticker');
    if (deliveryTicker) {
      const track = deliveryTicker.querySelector('.delivery-ticker__track');
      const groups = track ? [...track.querySelectorAll('.delivery-ticker__group')] : [];
      if (track && groups.length) {
        const sourceGroup = groups[0];
        const desiredGroups = 6;
        while (track.querySelectorAll('.delivery-ticker__group').length < desiredGroups) {
          const clone = sourceGroup.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          track.appendChild(clone);
        }
        const setTickerLoopDistance = () => {
          const firstGroup = track.querySelector('.delivery-ticker__group');
          if (!firstGroup) return;
          const distance = Math.ceil(firstGroup.getBoundingClientRect().width);
          track.style.setProperty('--ticker-loop-distance', `${distance}px`);
        };
        setTickerLoopDistance();
        window.addEventListener('resize', setTickerLoopDistance, { passive: true });
      }

      const toggleTicker = () => {
        document.body.classList.toggle('has-delivery-ticker', window.scrollY > 18);
      };
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          toggleTicker();
          ticking = false;
        });
      };
      toggleTicker();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    const setVisible = el => { el.classList.add('is-visible'); };
    if (reduce || !('IntersectionObserver' in window)) {
      revealTargets.forEach(setVisible);
      document.querySelectorAll('.v32-heading-accent').forEach(setVisible);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setVisible(entry.target);
        observer.unobserve(entry.target);
      });
    }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});
    [...revealTargets, ...document.querySelectorAll('.v32-heading-accent')].forEach(el => observer.observe(el));
  });
})();
