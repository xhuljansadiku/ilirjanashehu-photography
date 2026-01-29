// Close navbar after click on mobile
document.querySelectorAll('#navC .nav-link, #navC .btn').forEach(el => {
  el.addEventListener('click', () => {
    const navCollapse = document.getElementById('navC');
    const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navCollapse, { toggle: false });
    bsCollapse.hide();
  });
});

// Close navbar when clicking OUTSIDE (mobile)
document.addEventListener('click', (event) => {
  const navCollapse = document.getElementById('navC');
  const toggler = document.querySelector('.navbar-toggler');
  if (!navCollapse || !toggler) return;

  const isOpen = navCollapse.classList.contains('show');
  if (!isOpen) return;

  const clickedInsideNav = navCollapse.contains(event.target);
  const clickedOnToggler = toggler.contains(event.target);

  if (!clickedInsideNav && !clickedOnToggler) {
    const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navCollapse, { toggle: false });
    bsCollapse.hide();
  }
});

// Navbar scroll style + BackToTop
const nav = document.getElementById('mainNav');
const backTop = document.getElementById('backToTop');

const onScroll = () => {
  nav?.classList.toggle('scrolled', window.scrollY > 10);
  if (backTop) backTop.classList.toggle('d-none', window.scrollY < 300);
};
document.addEventListener('scroll', onScroll);
onScroll();

backTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Portfolio filter (re-usable)
const filterButtons = document.querySelectorAll('.filter-btn');
const folioItems = document.querySelectorAll('#folioGrid .folio');

function applyFilter(filterValue) {
  // update active button if exists
  filterButtons.forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.filter-btn[data-filter="${filterValue}"]`);
  if (btn) btn.classList.add('active');

  folioItems.forEach(it => {
    const show = (filterValue === 'all') || (it.dataset.category === filterValue);
    it.style.display = show ? '' : 'none';
  });
}

// click buttons
filterButtons.forEach(btn => btn.addEventListener('click', () => {
  applyFilter(btn.dataset.filter);
}));

// Services -> Portfolio (scroll + filter)
document.querySelectorAll('.service-link[data-filter]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    const filterValue = link.dataset.filter || 'all';
    const portfolioSection = document.getElementById('portfolio');

    // apply filter first (so user sees correct set immediately)
    applyFilter(filterValue);

    // smooth scroll to portfolio
    portfolioSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // optional: update hash
    history.replaceState(null, '', '#portfolio');
  });
});


/* LIGHTBOX GALLERY (Responsive + Prev/Next + Swipe + Keyboard) ------------------ */
(() => {
  const modalEl = document.getElementById('lightbox');
  const imgEl = document.getElementById('lightboxImage');
  const counterEl = document.getElementById('lightboxCounter');

  if (!modalEl || !imgEl) return;

  const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl, { keyboard: true });

  const prevBtn = modalEl.querySelector('.lightbox-prev');
  const nextBtn = modalEl.querySelector('.lightbox-next');

  let currentIndex = 0;

  // get only visible items (after filter)
  const getVisibleLinks = () => {
    const all = Array.from(document.querySelectorAll('#folioGrid .folio-card[data-image]'));
    return all.filter(a => a.offsetParent !== null); // visible in layout
  };

  const setImage = (links, index) => {
    const safeIndex = (index + links.length) % links.length;
    currentIndex = safeIndex;

    const link = links[currentIndex];
    const url = link.getAttribute('data-image') || link.getAttribute('href') || '';
    imgEl.src = url;

    const label = link.querySelector('.folio-badge')?.textContent?.trim();
    imgEl.alt = label ? `Preview - ${label}` : 'Preview';

    if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${links.length}`;

    // disable nav if only 1
    const single = links.length <= 1;
    if (prevBtn) prevBtn.style.display = single ? 'none' : '';
    if (nextBtn) nextBtn.style.display = single ? 'none' : '';
  };

  const openAt = (index) => {
    const links = getVisibleLinks();
    if (!links.length) return;

    setImage(links, index);
    bsModal.show();
  };

  // Intercept clicks on folio items and open our gallery
  document.addEventListener('click', (e) => {
    const a = e.target.closest('#folioGrid .folio-card[data-image]');
    if (!a) return;

    e.preventDefault();

    const links = getVisibleLinks();
    const idx = links.indexOf(a);
    openAt(idx >= 0 ? idx : 0);
  });

  // Prev/Next actions
  const goPrev = () => {
    const links = getVisibleLinks();
    if (links.length <= 1) return;
    setImage(links, currentIndex - 1);
  };

  const goNext = () => {
    const links = getVisibleLinks();
    if (links.length <= 1) return;
    setImage(links, currentIndex + 1);
  };

  prevBtn?.addEventListener('click', goPrev);
  nextBtn?.addEventListener('click', goNext);

  // Keyboard navigation while modal is open
  const onKeyDown = (ev) => {
    if (!modalEl.classList.contains('show')) return;

    if (ev.key === 'ArrowLeft') goPrev();
    if (ev.key === 'ArrowRight') goNext();
    // ESC handled by Bootstrap, but ok even if left
  };

  document.addEventListener('keydown', onKeyDown);

  // Swipe on mobile
  let startX = 0;
  let startY = 0;
  let isTouching = false;

  modalEl.addEventListener('touchstart', (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    isTouching = true;
    startX = t.clientX;
    startY = t.clientY;
  }, { passive: true });

  modalEl.addEventListener('touchend', (e) => {
    if (!isTouching) return;
    isTouching = false;

    const t = e.changedTouches?.[0];
    if (!t) return;

    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // avoid triggering on vertical scroll
    if (Math.abs(dy) > 60) return;

    if (dx > 70) goPrev();
    if (dx < -70) goNext();
  }, { passive: true });

  // Safety: clear src on close (prevents “flash” on next open)
  modalEl.addEventListener('hidden.bs.modal', () => {
    imgEl.src = '';
    if (counterEl) counterEl.textContent = '';
  });
})();


document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 10);



// End of script.js
