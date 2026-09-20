'use strict';

// Native video controls own all pointer/drag events; gallery navigation never intercepts them.
const videos = Array.from(document.querySelectorAll('video'));
function playVideo(video) {
  const shell = video.closest('.video-shell');
  const error = shell.querySelector('.video-error');
  error.hidden = true;
  if (!video.dataset.loaded || video.error) {
    video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
    video.dataset.loaded = 'true';
    video.load();
  }
  shell.classList.add('is-loaded');
  video.muted = false;
  video.volume = 1;
  video.play().catch(reason => {
    if (reason.name === 'AbortError') return;
    shell.classList.remove('is-loaded');
    error.textContent = 'Playback could not start. Please try again.';
    error.hidden = false;
  });
}

videos.forEach(video => {
  const shell = video.closest('.video-shell');
  shell.querySelector('.video-play').addEventListener('click', () => playVideo(video));
  video.addEventListener('click', () => { if (!video.dataset.loaded) playVideo(video); });
  video.addEventListener('error', () => {
    shell.classList.remove('is-loaded');
    const error = shell.querySelector('.video-error');
    error.textContent = 'Video unavailable. Select play to retry.';
    error.hidden = false;
  });
});
document.addEventListener('play', event => {
  if (!(event.target instanceof HTMLVideoElement)) return;
  videos.forEach(video => { if (video !== event.target && !video.paused) video.pause(); });
}, true);

if ('IntersectionObserver' in window) {
  const posters = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const video = entry.target;
      video.poster = video.dataset.poster;
      posters.unobserve(video);
    });
  }, { rootMargin: '400px' });
  videos.filter(video => video.dataset.poster).forEach(video => posters.observe(video));
} else {
  videos.filter(video => video.dataset.poster).forEach(video => { video.poster = video.dataset.poster; });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-gallery]').forEach(gallery => {
  const track = gallery.querySelector('.gallery-track');
  const items = Array.from(track.children);
  const previous = gallery.querySelector('[data-direction="-1"]');
  const next = gallery.querySelector('[data-direction="1"]');
  const counter = gallery.querySelector('.gallery-counter');
  previous.setAttribute('aria-controls', track.id);
  next.setAttribute('aria-controls', track.id);
  function update() {
    const box = track.getBoundingClientRect();
    const visible = items.map((item, index) => ({ box: item.getBoundingClientRect(), index }))
      .filter(item => item.box.right > box.left + 3 && item.box.left < box.right - 3);
    if (visible.length) counter.textContent = (visible[0].index + 1) + '-' + (visible.at(-1).index + 1) + ' / ' + items.length;
    previous.disabled = track.scrollLeft < 3;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 3;
  }
  function navigate(direction) {
    const stride = items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
    const step = Math.max(1, Math.round(track.clientWidth / stride));
    const index = Math.round(track.scrollLeft / stride);
    track.scrollTo({ left: Math.max(0, (index + direction * step) * stride), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => navigate(-1));
  next.addEventListener('click', () => navigate(1));
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigate(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  track.addEventListener('scroll', update, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
  else window.addEventListener('resize', update, { passive: true });
  update();
});

const sections = Array.from(document.querySelectorAll('.article-section'));
const links = Array.from(document.querySelectorAll('.contents a[href]'));
let scheduled = false;
function markCurrentSection() {
  scheduled = false;
  let current = sections[0];
  sections.forEach(section => { if (section.getBoundingClientRect().top <= 160) current = section; });
  links.forEach(link => {
    if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(markCurrentSection); }
}, { passive: true });
markCurrentSection();

document.querySelector('.copy-citation').addEventListener('click', async () => {
  const code = document.querySelector('#citation-code');
  const status = document.querySelector('.copy-status');
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(code.textContent);
    } else {
      // Legacy fallback supports the project's plain-HTTP LAN preview.
      const field = document.createElement('textarea');
      field.value = code.textContent;
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand('copy');
      field.remove();
      document.querySelector('.copy-citation').focus();
      if (!copied) throw new Error('Clipboard unavailable');
    }
    status.textContent = 'Copied.';
  } catch (error) {
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Could not copy. Citation text selected.';
  }
});
