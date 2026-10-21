/* Day Pharma V27.2 - refined elegant ampoule fall with softer drift and subtle settling. */
(() => {
  'use strict';
  const story = document.querySelector('[data-ampoule-story]');
  if (!story) return;
  const hero = story.querySelector('.ampoule-hero');
  const header = document.querySelector('.site-header');
  const layers = [...story.querySelectorAll('.ampoule-piece')].map((el, index) => ({
    el,
    index,
    start: +el.dataset.start,
    duration: +el.dataset.duration,
    angle: +el.dataset.angle,
    drift: +el.dataset.drift
  }));
  const ticks = [...story.querySelectorAll('.ampoule-ticks i')];
  const hint = story.querySelector('.ampoule-scroll-hint');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const shortLandscape = matchMedia('(max-height: 450px) and (orientation: landscape)');
  const clamp = (x, low = 0, high = 1) => Math.max(low, Math.min(high, x));
  const smooth = t => t * t * (3 - 2 * t);
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeOutQuint = t => 1 - Math.pow(1 - t, 5);
  const easeInCubic = t => t * t * t;
  const easeOutBackSoft = t => {
    const c1 = 1.08, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  let enabled = false, loaded = false, inView = false;
  let pending = 0, needsMeasure = true, metrics = null, displayed = null, lastTime = 0;

  function measure() {
    const sticky = story.querySelector('.ampoule-stage');
    const offset = header?.getBoundingClientRect().height || 0;
    metrics = {
      start: story.getBoundingClientRect().top + window.scrollY - offset,
      travel: Math.max(1, story.offsetHeight - sticky.offsetHeight),
      heroWidth: hero.clientWidth,
      heroHeight: hero.clientHeight,
      height: sticky.offsetHeight
    };
    needsMeasure = false;
  }

  function pieceOffsets(layer, q) {
    const fallPhase = clamp(q / 0.82);
    const settlePhase = clamp((q - 0.70) / 0.30);
    const fall = easeOutQuint(fallPhase);
    const settle = easeOutBackSoft(settlePhase);
    const blend = q < 0.70 ? fall : Math.min(1.025, 0.88 + settle * 0.145);

    const flightY = metrics.heroHeight * (1.12 + layer.index * 0.07);
    const arcSide = (layer.index % 2 === 0 ? 1 : -1);
    const baseX = arcSide * layer.drift * (0.28 + layer.index * 0.025);
    const arcLift = Math.sin(Math.min(1, q) * Math.PI) * arcSide * (16 + layer.index * 3);
    const dx = baseX * (1 - easeOutCubic(fallPhase)) + arcLift * (1 - smooth(Math.min(1, q * 1.1)));

    const settleBob = settlePhase > 0 ? Math.sin(settlePhase * Math.PI * 1.08) * (1 - settlePhase) * (7 - layer.index * 0.45) : 0;
    const dy = -flightY * (1 - blend) + settleBob;

    const swing = Math.sin(q * Math.PI * 1.65 + layer.index * 0.46) * (1 - smooth(q)) * 5.4;
    const tiltBase = layer.angle * (1 - easeOutCubic(Math.min(1, q * 1.05)));
    const settleTilt = settlePhase > 0 ? Math.sin(settlePhase * Math.PI * 1.25) * (1 - settlePhase) * 3.1 : 0;
    const tilt = tiltBase + swing + settleTilt;

    const scale = 0.955 + 0.045 * easeOutCubic(q);
    const opacity = q > 0 ? clamp(q / 0.09) : 0;
    return { dx, dy, tilt, scale, opacity };
  }

  function render(now) {
    pending = 0;
    if (!enabled || document.hidden) return;
    if (needsMeasure || !metrics) measure();
    const target = clamp((window.scrollY - metrics.start) / metrics.travel);
    const dt = clamp(now - (lastTime || now - 16), 1, 64);
    lastTime = now;
    if (displayed === null || !inView) displayed = target;
    displayed += (target - displayed) * (1 - Math.exp(-dt / 72));
    if (Math.abs(target - displayed) < .00008) displayed = target;
    const p = displayed;
    let count = 0;

    layers.forEach((layer) => {
      const q = clamp((p - layer.start) / layer.duration);
      const state = pieceOffsets(layer, q);
      layer.el.style.transform = `translate3d(${state.dx.toFixed(2)}px, ${state.dy.toFixed(2)}px, 0) rotate(${state.tilt.toFixed(2)}deg) scale(${state.scale.toFixed(4)})`;
      layer.el.style.opacity = String(state.opacity.toFixed(4));
      if (q >= .999) count++;
    });

    ticks.forEach((tick, i) => tick.classList.toggle('is-settled', i < count));
    story.classList.toggle('is-complete', p >= .93);
    story.dataset.progress = p.toFixed(4);
    const text = count === 5 ? 'Composição final pronta.' : 'Role para acompanhar';
    if (hint && hint.textContent !== text) hint.textContent = text;
    if (displayed !== target && inView) requestFrame();
  }

  function requestFrame() {
    if (!pending && enabled && !document.hidden) pending = requestAnimationFrame(render);
  }
  function refresh() { needsMeasure = true; requestFrame(); }
  function setMode() {
    const shouldEnable = loaded && !reduce.matches && !shortLandscape.matches && CSS.supports('position', 'sticky');
    if (enabled !== shouldEnable) {
      enabled = shouldEnable;
      story.classList.toggle('is-motion-ready', enabled);
      displayed = null;
      lastTime = 0;
      if (!enabled) {
        cancelAnimationFrame(pending);
        pending = 0;
        story.classList.remove('is-in-view', 'is-complete');
        story.dataset.progress = '1';
      }
    }
    refresh();
  }
  function imageReady(img) {
    if (img.complete && img.naturalWidth) return Promise.resolve();
    if (typeof img.decode === 'function') return img.decode();
    return new Promise((resolve, reject) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', reject, { once: true });
    });
  }

  Promise.all([...story.querySelectorAll('img')].map(imageReady))
    .then(() => { loaded = true; setMode(); })
    .catch(() => { loaded = false; setMode(); });

  window.addEventListener('scroll', () => {
    if (!enabled) return;
    if (inView || !metrics || Math.abs(window.scrollY - metrics.start) < metrics.travel + metrics.height) requestFrame();
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      story.classList.toggle('is-in-view', inView && enabled);
      if (inView) refresh();
    }, { rootMargin: '120px 0px', threshold: 0 });
    observer.observe(story);
  } else {
    inView = true;
  }

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(refresh);
    observer.observe(hero);
    observer.observe(document.body);
    if (header) observer.observe(header);
  }

  [reduce, shortLandscape].forEach(query => {
    if (query.addEventListener) query.addEventListener('change', setMode);
    else query.addListener(setMode);
  });
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('pageshow', refresh);
  window.addEventListener('load', refresh, { once: true });
  window.visualViewport?.addEventListener('resize', refresh, { passive: true });
  document.fonts?.ready.then(refresh);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(pending);
      pending = 0;
    } else {
      lastTime = 0;
      refresh();
    }
  });
})();
