/* Accessible navigation, lightweight video playback and honest form previews. */
(() => {
  'use strict';
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, {once:true}) : fn();
  ready(() => {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.menu-toggle');
    const drawer = document.getElementById('mobile-menu');
    const backdrop = document.querySelector('.menu-backdrop');
    const dropdown = document.querySelector('.nav-dropdown');
    let returnFocus = null;
    const setOpen = (open) => {
      if (!toggle || !drawer) return;
      if (open) returnFocus = document.activeElement;
      drawer.hidden = !open;
      backdrop.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      document.body.classList.toggle('menu-open', open);
      if (open) drawer.querySelector('a')?.focus();
      else if (returnFocus instanceof HTMLElement) returnFocus.focus();
    };
    toggle?.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    backdrop?.addEventListener('click', () => setOpen(false));
    drawer?.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { setOpen(false); if (dropdown) dropdown.open = false; }
      if (e.key === 'Tab' && drawer && !drawer.hidden) {
        const all = [toggle, ...drawer.querySelectorAll('a,button')];
        const first = all[0], last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', () => { if (innerWidth > 1024 && drawer && !drawer.hidden) setOpen(false); });
    document.addEventListener('click', e => { if (dropdown && !dropdown.contains(e.target)) dropdown.open = false; });
    const reflectScroll = () => header?.classList.toggle('scrolled', scrollY > 30);
    window.addEventListener('scroll', reflectScroll, {passive:true}); reflectScroll();

    // All three video assets remain silent, unfiltered and independently loaded.
    const videos = [...document.querySelectorAll('.film-hero video')];
    videos.forEach(video => { video.muted = true; video.defaultMuted = true; });
    const play = video => { if (!document.hidden) video.play().catch(() => {}); };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        entry.target.dataset.inView = String(entry.isIntersecting);
        if (entry.isIntersecting) play(entry.target); else entry.target.pause();
      }), {threshold:0.02});
      videos.forEach(video => observer.observe(video));
    } else videos.forEach(play);
    document.addEventListener('visibilitychange', () => videos.forEach(video => {
      if (document.hidden) video.pause(); else if (video.dataset.inView !== 'false') play(video);
    }));

    document.querySelectorAll('form[data-kind]').forEach(initForm);
  });

  function initForm(form) {
    const kind = form.dataset.kind;
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('[type=submit]');
    const upload = form.querySelector('[data-upload]');
    const fileInput = form.querySelector('input[type=file]');
    const fileStatus = form.querySelector('.file-status');
    let fileError = '';
    const accents = s => s; // Source is ASCII; readable Portuguese via Unicode escapes.
    const validateFiles = () => {
      if (!fileInput) return true;
      const files = [...fileInput.files];
      const max = Number(fileInput.dataset.limit || 10) * 1024 * 1024;
      const accepted = kind === 'curriculo' ? /\.(pdf|doc|docx)$/i : /\.(pdf|png|jpe?g)$/i;
      const allowedMimes = kind === 'curriculo'
        ? ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        : ['application/pdf','image/jpeg','image/png'];
      fileError = '';
      if (files.length > (kind === 'curriculo' ? 1 : 15)) fileError = 'Quantidade de arquivos acima do limite.';
      else if (files.some(f => !accepted.test(f.name) || (f.type && !allowedMimes.includes(f.type)))) fileError = 'Formato de arquivo n\u00e3o aceito. Confira os formatos indicados.';
      else if (files.some(f => !f.size || f.size > max)) fileError = 'Arquivo vazio ou maior que o limite informado.';
      fileInput.setCustomValidity(fileError);
      if (fileStatus) {
        fileStatus.classList.toggle('error', Boolean(fileError));
        fileStatus.textContent = fileError || (files.length
          ? files.map(f => `${f.name} (${(f.size/1024/1024).toFixed(2).replace('.',',')} MB)`).join('\n')
          : 'Nenhum arquivo selecionado');
      }
      return !fileError;
    };
    fileInput?.addEventListener('change', validateFiles);
    if (upload && fileInput) {
      ['dragenter','dragover'].forEach(t => upload.addEventListener(t, e => {e.preventDefault(); upload.classList.add('is-dragging');}));
      ['dragleave','drop'].forEach(t => upload.addEventListener(t, e => {e.preventDefault(); upload.classList.remove('is-dragging');}));
      upload.addEventListener('drop', e => {
        try {
          const transfer = new DataTransfer();
          [...e.dataTransfer.files].forEach(file => transfer.items.add(file));
          fileInput.files = transfer.files;
          validateFiles();
        } catch (_) { fileStatus.textContent = 'Use o bot\u00e3o para selecionar o arquivo neste navegador.'; }
      });
    }
    submit.disabled = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      status.textContent = '';
      validateFiles();
      const phone = form.querySelector('[name=telefone]');
      if (phone) {
        const digits = phone.value.replace(/\D/g,'');
        phone.setCustomValidity(digits.length && (digits.length < 10 || digits.length > 13) ? 'Informe um telefone com DDD.' : '');
      }
      const cep = form.querySelector('[name=cep]');
      if (cep) cep.setCustomValidity(cep.value.replace(/\D/g,'').length !== 8 ? 'Informe um CEP com oito d\u00edgitos.' : '');
      if (!form.reportValidity()) { status.textContent = fileError || 'Confira os campos obrigat\u00f3rios antes de continuar.'; return; }
      if (kind === 'curriculo' && !form.querySelector('[name=areas]:checked')) { status.textContent = 'Selecione pelo menos uma \u00e1rea de interesse.'; return; }
      const endpoint = window.DAYPHARMA_CONFIG?.endpoints?.[kind] || '';
      if (!endpoint) {
        status.textContent = 'Dados conferidos. Nenhuma informa\u00e7\u00e3o ou anexo foi enviado.\nO envio direto depende da integra\u00e7\u00e3o do novo site. Para atendimento real, use os canais oficiais indicados nesta p\u00e1gina.';
        return;
      }
      let url;
      try {url = new URL(endpoint, location.href);} catch (_) {status.textContent = 'O canal de envio ainda n\u00e3o est\u00e1 configurado.';return;}
      if (location.protocol === 'file:' || url.protocol !== 'https:') {status.textContent='Envio dispon\u00edvel somente em uma conex\u00e3o HTTPS configurada.';return;}
      submit.disabled = true;
      status.textContent = 'Enviando...';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);
      try {
        const response = await fetch(url.href, {method:'POST',body:new FormData(form),credentials:'same-origin',signal:controller.signal});
        if (!response.ok) throw new Error('HTTP '+response.status);
        const result = await response.json();
        if (result.ok !== true || typeof result.protocol !== 'string' || !result.protocol.trim()) throw new Error('No server confirmation');
        status.textContent = 'Recebimento confirmado. Protocolo: '+result.protocol;
        form.reset(); validateFiles();
      } catch (_) {
        status.textContent = 'N\u00e3o foi poss\u00edvel confirmar o recebimento. N\u00e3o considere a solicita\u00e7\u00e3o enviada. Entre em contato com a equipe.';
      } finally { clearTimeout(timer); submit.disabled = false; }
    });
    form.querySelectorAll('input').forEach(input => input.addEventListener('input', () => {
      if (input.type !== 'file') input.setCustomValidity('');
    }));
  }
})();
