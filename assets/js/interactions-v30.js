(() => {
  'use strict';

  const ready = fn => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, {once:true})
    : fn();

  ready(() => {
    initTripleImageCarousels();
    initMoleculeField();
  });

  function initTripleImageCarousels() {
    const candidates = [...document.querySelectorAll('.gallery, .service-grid, .editorial-grid, .address-grid')];
    candidates.forEach(track => {
      const slides = [...track.children].filter(el => el.matches('figure, article, a, div'));
      if (slides.length !== 3 || !slides.every(slide => slide.querySelector('img'))) return;
      if (track.dataset.carouselReady === 'true') return;

      track.dataset.carouselReady = 'true';
      track.classList.add('triple-image-carousel');
      track.setAttribute('tabindex', '0');
      track.setAttribute('role', 'region');
      track.setAttribute('aria-roledescription', 'carrossel');
      track.setAttribute('aria-label', 'Galeria interativa com três imagens');

      const shell = document.createElement('div');
      shell.className = 'carousel-shell';
      track.parentNode.insertBefore(shell, track);
      shell.appendChild(track);

      const controls = document.createElement('div');
      controls.className = 'carousel-controls';
      controls.innerHTML = `
        <span class="carousel-progress" aria-live="polite">01 / 03</span>
        <div class="carousel-timer" aria-hidden="true"><i></i></div>
        <button class="carousel-button carousel-prev" type="button" aria-label="Imagem anterior">←</button>
        <button class="carousel-button carousel-next" type="button" aria-label="Próxima imagem">→</button>`;
      shell.appendChild(controls);

      const prev = controls.querySelector('.carousel-prev');
      const next = controls.querySelector('.carousel-next');
      const progress = controls.querySelector('.carousel-progress');
      const timerBar = controls.querySelector('.carousel-timer i');
      const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let index = 0;
      let autoTimer = 0;
      let resumeTimer = 0;
      let dragging = false;
      let startX = 0;
      let startScroll = 0;
      let pointerId = null;

      const setProgress = () => {
        const width = Math.max(1, track.clientWidth);
        index = Math.max(0, Math.min(2, Math.round(track.scrollLeft / width)));
        progress.textContent = `0${index + 1} / 03`;
      };

      const goTo = (nextIndex, behavior = 'smooth') => {
        index = (nextIndex + 3) % 3;
        track.scrollTo({left: index * track.clientWidth, behavior});
        window.setTimeout(setProgress, behavior === 'smooth' ? 320 : 0);
      };

      const go = direction => {
        goTo(index + direction);
        restartAuto(6500);
      };

      const resetTimerBar = () => {
        if (!timerBar || reduceMotion) return;
        timerBar.style.animation = 'none';
        void timerBar.offsetWidth;
        timerBar.style.animation = 'carouselCountdown 5s linear forwards';
      };

      const stopAuto = () => {
        clearInterval(autoTimer);
        clearTimeout(resumeTimer);
        autoTimer = 0;
        if (timerBar) timerBar.style.animationPlayState = 'paused';
      };

      const startAuto = () => {
        if (reduceMotion || document.hidden) return;
        clearInterval(autoTimer);
        resetTimerBar();
        autoTimer = window.setInterval(() => {
          goTo(index + 1);
          resetTimerBar();
        }, 5000);
      };

      const restartAuto = (delay = 1400) => {
        stopAuto();
        resumeTimer = window.setTimeout(startAuto, delay);
      };

      prev.addEventListener('click', () => go(-1));
      next.addEventListener('click', () => go(1));
      track.addEventListener('scroll', () => requestAnimationFrame(setProgress), {passive:true});
      track.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
      });

      // Native touch swiping remains enabled. Pointer dragging adds desktop mouse drag.
      track.addEventListener('pointerdown', event => {
        if (event.pointerType === 'touch') return;
        dragging = true;
        pointerId = event.pointerId;
        startX = event.clientX;
        startScroll = track.scrollLeft;
        track.classList.add('is-dragging');
        track.setPointerCapture?.(pointerId);
        stopAuto();
      });
      track.addEventListener('pointermove', event => {
        if (!dragging || event.pointerId !== pointerId) return;
        const dx = event.clientX - startX;
        track.scrollLeft = startScroll - dx;
      });
      const endDrag = event => {
        if (!dragging || (event?.pointerId != null && event.pointerId !== pointerId)) return;
        dragging = false;
        track.classList.remove('is-dragging');
        try { track.releasePointerCapture?.(pointerId); } catch (_) {}
        pointerId = null;
        const width = Math.max(1, track.clientWidth);
        const target = Math.max(0, Math.min(2, Math.round(track.scrollLeft / width)));
        goTo(target);
        restartAuto(1800);
      };
      track.addEventListener('pointerup', endDrag);
      track.addEventListener('pointercancel', endDrag);
      track.addEventListener('mouseleave', () => { if (!dragging) restartAuto(1200); });
      track.addEventListener('mouseenter', stopAuto);
      track.addEventListener('focusin', stopAuto);
      track.addEventListener('focusout', () => restartAuto(1200));
      track.addEventListener('touchstart', stopAuto, {passive:true});
      track.addEventListener('touchend', () => restartAuto(1800), {passive:true});

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAuto(); else restartAuto(600);
      });
      window.addEventListener('resize', () => {
        track.scrollLeft = index * track.clientWidth;
        setProgress();
      }, {passive:true});

      setProgress();
      startAuto();
    });
  }

  
function initMoleculeField() {
    const stage = document.querySelector('[data-molecule-stage]');
    const canvas = stage?.querySelector('[data-molecule-canvas]');
    if (!stage || !canvas) return;

    const ctx = canvas.getContext('2d');
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: -9999, y: -9999, active: false };
    let dpr = 1;
    let width = 1;
    let height = 1;
    let strands = [];
    let dust = [];
    let raf = 0;
    let inView = true;
    let rotation = 0;
    let lastTime = 0;
    let breakProgress = 0;

    function makeScene() {
      strands = [];
      dust = [];

      const rows = Math.max(42, Math.min(60, Math.round(height / 17)));
      const centerX = width * 0.57;
      const top = height * 0.11;
      const bottom = height * 0.89;
      const radius = Math.min(width * 0.12, 96);
      const perspective = Math.min(width * 0.06, 42);
      const nodeRadius = Math.max(2.8, Math.min(5.1, width * 0.0046));

      for (let i = 0; i < rows; i++) {
        const t = rows === 1 ? 0 : i / (rows - 1);
        const y = top + (bottom - top) * t;
        const phase = t * Math.PI * 3.25;
        const explodeMag = width * (0.08 + (i % 4) * 0.017);
        const explodeTilt = (i % 2 === 0 ? 1 : -1) * (height * 0.02 + i * 1.2);

        strands.push({
          baseY: y,
          phase,
          radius,
          perspective,
          nodeRadius,
          explodeLeft: { x: -explodeMag, y: -explodeTilt },
          explodeRight: { x: explodeMag, y: explodeTilt },
          wiggle: Math.random() * Math.PI * 2
        });
      }

      const count = 0;
      for (let i = 0; i < count; i++) {
        const p = {
          baseX: Math.random() * width,
          baseY: Math.random() * height,
          r: Math.random() * 2.2 + 0.45,
          alpha: Math.random() * 0.18 + 0.05,
          blur: Math.random() > 0.82 ? 4 + Math.random() * 8 : 0,
          seed: Math.random() * Math.PI * 2
        };
        dust.push(p);
      }
    }

    function resize() {
      const rect = stage.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(360, rect.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeScene();
      draw(performance.now());
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function getRepulsion(x, y) {
      if (!pointer.active) return { x: 0, y: 0 };
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const dist = Math.hypot(dx, dy) || 1;
      const radius = Math.min(180, width * 0.19);
      if (dist >= radius) return { x: 0, y: 0 };
      const force = Math.pow(1 - dist / radius, 1.7) * (20 + 52 * breakProgress);
      return { x: (dx / dist) * force, y: (dy / dist) * force };
    }

    function getSceneNodes(now) {
      const centerX = width * 0.57;
      const nodes = [];
      const bonds = [];

      strands.forEach((row, index) => {
        const angle = row.phase + rotation;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const leftCoreX = centerX + cos * row.radius;
        const rightCoreX = centerX - cos * row.radius;
        const depthOffset = sin * row.perspective;
        const y = row.baseY + depthOffset * 0.34;
        const rungLift = sin * 4.5;
        const wobble = reduceMotion ? 0 : Math.sin(now * 0.0011 + row.wiggle) * 1.1;

        const breakEase = breakProgress * breakProgress * (3 - 2 * breakProgress);
        const leftTargetX = leftCoreX + row.explodeLeft.x * breakEase;
        const leftTargetY = y + rungLift + row.explodeLeft.y * breakEase + wobble;
        const rightTargetX = rightCoreX + row.explodeRight.x * breakEase;
        const rightTargetY = y - rungLift + row.explodeRight.y * breakEase - wobble;

        const leftRepel = getRepulsion(leftTargetX, leftTargetY);
        const rightRepel = getRepulsion(rightTargetX, rightTargetY);

        const leftNode = {
          x: leftTargetX + leftRepel.x,
          y: leftTargetY + leftRepel.y,
          r: row.nodeRadius * (sin > 0 ? 1.12 : 0.92),
          z: sin,
          side: 'left'
        };
        const rightNode = {
          x: rightTargetX + rightRepel.x,
          y: rightTargetY + rightRepel.y,
          r: row.nodeRadius * (sin < 0 ? 1.12 : 0.92),
          z: -sin,
          side: 'right'
        };

        nodes.push(leftNode, rightNode);
        bonds.push({ a: leftNode, b: rightNode, alpha: 0.62 - breakEase * 0.48, front: sin > 0 });

        if (index < strands.length - 1) {
          const next = strands[index + 1];
          const nextAngle = next.phase + rotation;
          const nextCos = Math.cos(nextAngle);
          const nextSin = Math.sin(nextAngle);
          const nextY = next.baseY + nextSin * next.perspective * 0.34;
          const nextBreak = breakEase;

          const nextLeft = {
            x: centerX + nextCos * next.radius + next.explodeLeft.x * nextBreak,
            y: nextY + nextSin * 4.5 + next.explodeLeft.y * nextBreak,
          };
          const nextRight = {
            x: centerX - nextCos * next.radius + next.explodeRight.x * nextBreak,
            y: nextY - nextSin * 4.5 + next.explodeRight.y * nextBreak,
          };

          const nextLeftRepel = getRepulsion(nextLeft.x, nextLeft.y);
          const nextRightRepel = getRepulsion(nextRight.x, nextRight.y);

          bonds.push({
            a: leftNode,
            b: { x: nextLeft.x + nextLeftRepel.x, y: nextLeft.y + nextLeftRepel.y },
            alpha: 0.2 - breakEase * 0.14,
            front: sin > 0
          });
          bonds.push({
            a: rightNode,
            b: { x: nextRight.x + nextRightRepel.x, y: nextRight.y + nextRightRepel.y },
            alpha: 0.2 - breakEase * 0.14,
            front: sin < 0
          });
        }
      });

      return { nodes, bonds };
    }

    function update(now) {
      if (!lastTime) lastTime = now;
      const delta = Math.min(32, now - lastTime);
      lastTime = now;
      if (!reduceMotion) rotation += delta * 0.00115;
      const targetBreak = pointer.active ? 1 : 0;
      breakProgress = lerp(breakProgress, targetBreak, pointer.active ? 0.11 : 0.08);
    }

    function draw(now) {
      raf = 0;
      update(now);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#f6f3ed';
      ctx.fillRect(0, 0, width, height);

      dust.forEach(p => {
        let px = p.baseX;
        let py = p.baseY;
        if (!reduceMotion) {
          px += Math.sin(now * 0.00032 + p.seed) * 2.2;
          py += Math.cos(now * 0.00027 + p.seed) * 1.8;
        }
        const repel = getRepulsion(px, py);
        px += repel.x * 0.28;
        py += repel.y * 0.28;
        ctx.save();
        if (p.blur) ctx.filter = `blur(${p.blur}px)`;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#20201e';
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      const scene = getSceneNodes(now);
      const backBonds = scene.bonds.filter(b => !b.front);
      const frontBonds = scene.bonds.filter(b => b.front);
      const sortedNodes = [...scene.nodes].sort((a, b) => a.z - b.z);

      function strokeBondSet(items, colorBase) {
        items.forEach(bond => {
          if (bond.alpha <= 0.015) return;
          ctx.lineWidth = bond.front ? Math.max(1.2, width * 0.00145) : Math.max(0.8, width * 0.00105);
          ctx.lineCap = 'round';
          ctx.strokeStyle = `rgba(${colorBase}, ${Math.max(0, bond.alpha)})`;
          ctx.beginPath();
          ctx.moveTo(bond.a.x, bond.a.y);
          ctx.lineTo(bond.b.x, bond.b.y);
          ctx.stroke();
        });
      }

      strokeBondSet(backBonds, '28,28,27');
      strokeBondSet(frontBonds, '18,18,17');

      sortedNodes.forEach(node => {
        const frontness = (node.z + 1) * 0.5;
        const shadow = 2 + frontness * 8;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.13)';
        ctx.shadowBlur = shadow;
        ctx.fillStyle = node.z > 0 ? '#151515' : '#323230';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (inView) raf = requestAnimationFrame(draw);
    }

    function setPointer(event) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
      if (!raf) raf = requestAnimationFrame(draw);
    }

    function clearPointer() {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
      if (!raf) raf = requestAnimationFrame(draw);
    }

    stage.addEventListener('pointermove', setPointer, { passive: true });
    stage.addEventListener('pointerenter', setPointer, { passive: true });
    stage.addEventListener('pointerleave', clearPointer);
    stage.addEventListener('pointerdown', setPointer, { passive: true });
    stage.addEventListener('pointerup', () => {
      if (matchMedia('(hover: none)').matches) clearPointer();
    }, { passive: true });
    stage.addEventListener('focusin', () => {
      pointer.active = true;
      pointer.x = width * 0.57;
      pointer.y = height * 0.5;
    });
    stage.addEventListener('focusout', clearPointer);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !raf) raf = requestAnimationFrame(draw);
        if (!inView && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      }, { rootMargin: '120px' }).observe(stage);
    }

    new ResizeObserver(resize).observe(stage);
    resize();
  }
})();
