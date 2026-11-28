document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('rt-pgh-site');
  // The owner does not offer paint polishing; hide retired legacy links.
  for (const link of document.querySelectorAll('a[href^="/full-detail-polish/"]')) link.remove();
  const hero = document.querySelector('.rt-hero');
  if (hero) {
    const ticker = document.createElement('div');
    ticker.className = 'rt-pgh-ticker';
    ticker.setAttribute('aria-label', 'Interior detailing, exterior hand detail, mobile service, owner operated');
    ticker.innerHTML = '<div aria-hidden="true"><span>INTERIOR DETAILING</span><b>✦</b><span>EXTERIOR HAND DETAIL</span><b>✦</b><span>I COME TO YOU</span><b>✦</b><span>OWNER OPERATED</span><b>✦</b><span>INTERIOR DETAILING</span><b>✦</b><span>EXTERIOR HAND DETAIL</span><b>✦</b><span>I COME TO YOU</span><b>✦</b></div>';
    hero.after(ticker);
  }
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  const section = document.createElement('section');
  section.className = 'rt-pgh-compare-wrap';
  section.setAttribute('aria-labelledby', 'rt-pgh-compare-title');
  const comparisons = [
    { label: 'Mercedes cabin before & after', description: 'earlier collaborative Mercedes interior', combined: '/images/results/pgh-5.webp' },
    { label: 'BMW interior before & after', description: 'earlier collaborative BMW interior', combined: '/images/results/pgh-6.webp' },
    { label: 'Brown leather cabin before & after', description: 'earlier collaborative brown leather cabin', combined: '/images/results/pgh-3.webp' },
    { label: 'Range Rover exterior detail', description: 'Range Rover exterior detailing', before: '/images/portfolio/normalized/range-rover-before.jpg', after: '/images/portfolio/normalized/range-rover-after.jpg', casePath: '/results/range-rover-exterior-detail/' },
    { label: 'Lincoln cargo area clean', description: 'Lincoln cargo area cleaning', before: '/images/portfolio/normalized/lincoln-cargo-before.jpg', after: '/images/portfolio/normalized/lincoln-cargo-after.jpg' },
    { label: 'Lincoln rear cabin deep clean', description: 'Lincoln rear cabin deep cleaning', before: '/images/portfolio/normalized/lincoln-rear-before.jpg', after: '/images/portfolio/normalized/lincoln-rear-after.jpg', casePath: '/results/lincoln-rear-seat-deep-clean/' }
  ];
  const cards = comparisons.map(item => `
      <figure class="rt-pgh-project-card">
        <div class="rt-pgh-split" ${item.before ? 'data-pair="true"' : ''} role="slider" tabindex="0" aria-label="Compare ${item.description} before and after" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="50 percent before photo" aria-orientation="horizontal" style="${item.before ? `--compare-before:url('${item.before}');--compare-after:url('${item.after}')` : `--compare-image:url('${item.combined}')`}">
          <div class="rt-pgh-split-after" aria-hidden="true"></div><div class="rt-pgh-split-before" aria-hidden="true"></div><div class="rt-pgh-compare-line" aria-hidden="true"></div><span class="rt-pgh-before-label">BEFORE</span><span class="rt-pgh-after-label">AFTER</span>
        </div><figcaption>${item.casePath ? `<a href="${item.casePath}">${item.label}</a>` : item.label}</figcaption>
      </figure>`).join('');
  section.innerHTML = `
    <div class="rt-pgh-compare-head">
      <p class="rt-section-kicker">01 — REAL RESULTS</p>
      <h2 id="rt-pgh-compare-title">DRAG TO SEE THE DIFFERENCE.</h2>
      <p>Real before and after photos. Drag each divider or use the arrow keys to inspect the change.</p>
    </div>
    <div class="rt-pgh-compare-grid">${cards}
    </div>
    <p class="rt-pgh-collab-note">The first three comparisons are from earlier collaborative detailing work with PGH Detailing and are shown with permission. The lower three show Restore Theory work.</p>`;
  gallery.before(section);
  for (const slider of section.querySelectorAll('[role="slider"]')) {
    let position = 50;
    const update = value => {
      position = Math.max(0, Math.min(100, value));
      slider.style.setProperty('--compare-position', position + '%');
      slider.setAttribute('aria-valuenow', String(Math.round(position)));
      slider.setAttribute('aria-valuetext', `${Math.round(position)} percent before photo`);
    };
    const move = event => {
      const bounds = slider.getBoundingClientRect();
      update((event.clientX - bounds.left) / bounds.width * 100);
    };
    slider.addEventListener('pointerdown', event => {
      slider.setPointerCapture(event.pointerId);
      move(event);
    });
    slider.addEventListener('pointermove', event => {
      if (slider.hasPointerCapture(event.pointerId)) move(event);
    });
    slider.addEventListener('keydown', event => {
      let next = position;
      if (event.key === 'ArrowLeft') next -= 5;
      else if (event.key === 'ArrowRight') next += 5;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = 100;
      else return;
      event.preventDefault();
      update(next);
    });
  }

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.rt-services-heading,.rt-results-heading,.rt-reviews-heading,.rt-pgh-compare-head');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: .08 });
    for (const target of targets) { target.classList.add('rt-pgh-reveal'); observer.observe(target); }
  }
});
