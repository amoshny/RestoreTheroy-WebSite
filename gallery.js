/* Category order, photograph sources and dimensions are maintained in gallery-data.js. */
document.addEventListener('DOMContentLoaded', () => {
    const data = window.restoreGalleryData;
    if (!data) return;
    const tabs = Array.from(document.querySelectorAll('.rt-gallery-tabs [role="tab"]'));
    const mobile = matchMedia('(max-width: 700px)');
    const states = new Map();
    let activeKey = 'exterior';
    const dialog = document.querySelector('.rt-lightbox');
    const viewerImage = dialog.querySelector('img');
    const viewerCount = document.getElementById('rt-lightbox-count');
    const viewerCaption = document.getElementById('rt-lightbox-caption');
    const viewerPrev = dialog.querySelector('.rt-lightbox-prev');
    const viewerNext = dialog.querySelector('.rt-lightbox-next');
    let viewerPhotos = [], viewerIndex = 0, returnFocus, savedPage;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

    function showPhoto(index) {
        viewerIndex = Math.max(0, Math.min(index, viewerPhotos.length - 1));
        const photo = viewerPhotos[viewerIndex];
        viewerImage.src = photo.large;
        viewerImage.alt = photo.label;
        viewerImage.width = photo.width;
        viewerImage.height = photo.height;
        viewerCaption.textContent = photo.label;
        viewerCount.textContent = `${viewerIndex + 1} / ${viewerPhotos.length}`;
        viewerPrev.disabled = viewerIndex === 0;
        viewerNext.disabled = viewerIndex === viewerPhotos.length - 1;
    }
    function openViewer(key, index, trigger) {
        viewerPhotos = data[key].photos || data[key].pairs.flatMap(pair => pair.photos);
        returnFocus = trigger;
        savedPage = { x: scrollX, y: scrollY };
        showPhoto(index);
        dialog.showModal();
        document.body.classList.add('rt-viewer-open');
    }
    function makePhoto(photo, key, index) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'rt-shot';
        button.setAttribute('aria-label', `Enlarge ${photo.label}`);
        button.style.setProperty('--photo-ratio', (photo.previewWidth || photo.width) / (photo.previewHeight || photo.height));
        button.style.setProperty('--photo-position', photo.position || '50% 50%');
        const img = document.createElement('img');
        img.width = photo.previewWidth || photo.width;
        img.height = photo.previewHeight || photo.height;
        img.alt = photo.label;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.dataset.preview = photo.preview;
        button.append(img);
        button.addEventListener('click', () => openViewer(key, index, button));
        return button;
    }
    const visibleCount = state => state.key === 'comparison' || mobile.matches ? 1 : 2;
    const lastIndex = state => Math.max(0, state.slides.length - visibleCount(state));
    const stride = state => state.slides.length > 1 ? state.slides[1].offsetLeft - state.slides[0].offsetLeft : state.track.clientWidth;
    function loadNearby(state) {
        const start = Math.max(0, state.index - 1);
        const end = Math.min(state.slides.length - 1, state.index + visibleCount(state));
        for (let i = start; i <= end; i++) {
            state.slides[i].querySelectorAll('img').forEach(img => {
                if (!img.hasAttribute('src')) img.src = img.dataset.preview;
            });
        }
    }
    function update(state) {
        state.index = Math.max(0, Math.min(lastIndex(state), Math.round(state.track.scrollLeft / (stride(state) || 1))));
        const first = state.index + 1;
        const count = visibleCount(state);
        state.count.textContent = `${count > 1 ? `${first}–${Math.min(first + count - 1, state.slides.length)}` : first} / ${state.slides.length}`;
        state.prev.disabled = state.index === 0;
        state.next.disabled = state.index === lastIndex(state);
        loadNearby(state);
    }
    function goTo(state, index, animate = true) {
        const destination = Math.max(0, Math.min(lastIndex(state), index));
        // Assign the next preview before motion starts, without fetching large images.
        const oldIndex = state.index;
        state.index = destination;
        loadNearby(state);
        state.index = oldIndex;
        state.track.scrollTo({ left: destination * stride(state), behavior: animate && !reduceMotion.matches ? 'smooth' : 'instant' });
        if (!animate || reduceMotion.matches) update(state);
    }
    function buildCategory(key) {
        if (states.has(key)) return states.get(key);
        const panel = document.querySelector(`[data-category="${key}"]`);
        const track = document.createElement('div');
        track.className = 'rt-category-track';
        track.id = `${key}-track`;
        track.tabIndex = 0;
        track.setAttribute('role', 'region');
        track.setAttribute('aria-roledescription', 'carousel');
        track.setAttribute('aria-label', `${data[key].label}. Swipe or use the arrow keys.`);
        const entries = data[key].pairs || data[key].photos;
        const slides = entries.map((entry, index) => {
            const slide = document.createElement('div');
            slide.className = 'rt-category-slide';
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', `${index + 1} of ${entries.length}: ${entry.label}`);
            if (key === 'comparison') {
                slide.classList.add('rt-comparison-slide');
                entry.photos.forEach((photo, photoIndex) => {
                    const wrap = document.createElement('div');
                    wrap.className = 'rt-comparison-photo';
                    const label = document.createElement('span');
                    label.className = 'rt-compare-label' + (photoIndex ? ' is-after' : '');
                    label.textContent = photo.state;
                    wrap.append(label, makePhoto(photo, key, index * 2 + photoIndex));
                    slide.append(wrap);
                });
                const pairCaption = document.createElement('p');
                pairCaption.className = 'rt-pair-caption';
                pairCaption.textContent = entry.label;
                slide.append(pairCaption);
            } else {
                const caption = document.createElement('p');
                caption.className = 'rt-shot-caption';
                caption.textContent = entry.label;
                slide.append(makePhoto(entry, key, index), caption);
            }
            track.append(slide);
            return slide;
        });
        const controls = document.createElement('div');
        controls.className = 'rt-category-controls';
        function arrow(direction) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = direction < 0 ? '←' : '→';
            button.setAttribute('aria-label', `${direction < 0 ? 'Previous' : 'Next'} ${key === 'comparison' ? 'comparison pair' : data[key].label.toLowerCase() + ' photos'}`);
            button.setAttribute('aria-controls', track.id);
            button.dataset.direction = direction;
            return button;
        }
        const prev = arrow(-1), next = arrow(1);
        const count = document.createElement('span');
        count.className = 'rt-category-count';
        count.setAttribute('aria-live', 'polite');
        count.setAttribute('aria-atomic', 'true');
        controls.append(prev, count, next);
        const hint = document.createElement('p');
        hint.className = 'rt-category-hint';
        hint.textContent = 'Swipe or use the arrows · Tap a photo to enlarge';
        panel.append(track, controls, hint);
        const state = { key, panel, track, slides, prev, next, count, index: 0 };
        states.set(key, state);
        prev.addEventListener('click', () => goTo(state, state.index - visibleCount(state)));
        next.addEventListener('click', () => goTo(state, state.index + visibleCount(state)));
        track.addEventListener('keydown', event => {
            // A focused photograph keeps Enter/Space for opening the viewer.
            let target;
            if (event.key === 'ArrowRight') target = state.index + visibleCount(state);
            if (event.key === 'ArrowLeft') target = state.index - visibleCount(state);
            if (event.key === 'Home') target = 0;
            if (event.key === 'End') target = lastIndex(state);
            if (target !== undefined) { event.preventDefault(); goTo(state, target); }
        });
        let scheduled = false;
        track.addEventListener('scroll', () => {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(() => { update(state); scheduled = false; });
        }, { passive: true });
        return state;
    }
    function selectTab(tab) {
        activeKey = tab.id.replace('-tab', '');
        tabs.forEach(item => {
            const active = item === tab;
            item.setAttribute('aria-selected', String(active));
            item.tabIndex = active ? 0 : -1;
            document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
        });
        const state = buildCategory(activeKey);
        goTo(state, state.index, false);
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(tab));
        tab.addEventListener('keydown', event => {
            let next;
            if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
            if (event.key === 'ArrowLeft') next = tabs[(index + tabs.length - 1) % tabs.length];
            if (event.key === 'Home') next = tabs[0];
            if (event.key === 'End') next = tabs[tabs.length - 1];
            if (next) { event.preventDefault(); selectTab(next); next.focus(); }
        });
    });
    selectTab(tabs[0]);
    let resizeFrame;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            const state = states.get(activeKey);
            goTo(state, state.index, false);
        });
    });
    viewerPrev.addEventListener('click', () => showPhoto(viewerIndex - 1));
    viewerNext.addEventListener('click', () => showPhoto(viewerIndex + 1));
    dialog.querySelector('.rt-lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault(); showPhoto(viewerIndex + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });
    dialog.addEventListener('close', () => {
        document.body.classList.remove('rt-viewer-open');
        viewerImage.removeAttribute('src');
        if (returnFocus) returnFocus.focus({ preventScroll: true });
        if (savedPage) window.scrollTo({ left: savedPage.x, top: savedPage.y, behavior: 'instant' });
    });
    const stage = dialog.querySelector('.rt-lightbox-stage');
    let touchStart;
    stage.addEventListener('touchstart', event => {
        touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    }, { passive: true });
    stage.addEventListener('touchmove', event => { if (event.touches.length > 1) touchStart = null; }, { passive: true });
    stage.addEventListener('touchend', event => {
        if (!touchStart || event.touches.length) return;
        const dx = event.changedTouches[0].clientX - touchStart.x;
        const dy = event.changedTouches[0].clientY - touchStart.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) showPhoto(viewerIndex + (dx < 0 ? 1 : -1));
        touchStart = null;
    }, { passive: true });
    stage.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
});
