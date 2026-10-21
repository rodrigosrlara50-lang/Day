(() => {
  'use strict';
  const KEY = 'daypharma_intro_seen_video_v1';
  const intro = document.querySelector('[data-site-intro]');
  if (!intro) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (_) {}
  if (reduce || seen) {
    intro.hidden = true;
    return;
  }

  const video = intro.querySelector('[data-intro-video]');
  const skip = intro.querySelector('[data-intro-skip]');
  let finished = false;

  document.documentElement.classList.add('intro-active');
  document.body?.classList.add('intro-active');

  function finish(){
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem(KEY, '1'); } catch (_) {}
    intro.classList.add('is-ending');
    document.documentElement.classList.remove('intro-active');
    document.body?.classList.remove('intro-active');
    setTimeout(() => {
      intro.classList.add('is-done');
      intro.hidden = true;
      try { video?.pause(); } catch (_) {}
      document.querySelector('.film-hero video')?.play?.().catch(()=>{});
    }, 430);
  }

  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.addEventListener('ended', finish, { once:true });
    video.addEventListener('error', finish, { once:true });
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => finish());
    }
  } else {
    finish();
  }

  skip?.addEventListener('click', finish, { once:true });
  ['wheel','touchstart','keydown'].forEach(type => window.addEventListener(type, finish, { once:true, passive:true }));
})();
