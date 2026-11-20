document.addEventListener('DOMContentLoaded', () => {
    const config = window.restoreIntegrations || {};
    const track = document.getElementById('rt-saved-reviews-track');
    if (!track) return;
    const cards = [...track.querySelectorAll('.review-card')];
    const controls = document.querySelector('.rt-saved-reviews-controls');
    const mobile = matchMedia('(max-width: 700px)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const readButtons = cards.map(card => card.querySelector('.rt-review-read-more'));
    track.classList.add('rt-reviews-enhanced');

    const reviewCount = document.getElementById('rt-saved-review-count');
    const previous = controls.querySelector('[data-review-direction="-1"]');
    const next = controls.querySelector('[data-review-direction="1"]');
    const visibleCount = () => mobile.matches ? 1 : 2;
    const lastIndex = () => Math.max(0, cards.length - visibleCount());
    const stride = () => cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
    const currentIndex = () => Math.max(0, Math.min(lastIndex(), Math.round(track.scrollLeft / (stride() || 1))));
    function updateReviews() {
        const index = currentIndex();
        const first = index + 1, last = Math.min(cards.length, index + visibleCount());
        controls.hidden = lastIndex() === 0;
        previous.disabled = index === 0;
        next.disabled = index === lastIndex();
        const label = `${first === last ? first : `${first}–${last}`} / ${cards.length}`;
        if (reviewCount.textContent !== label) reviewCount.textContent = label;
    }
    function reviewGo(index) {
        const position = Math.max(0, Math.min(lastIndex(), index));
        track.scrollTo({ left: position * stride(), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
    previous.addEventListener('click', () => reviewGo(currentIndex() - 1));
    next.addEventListener('click', () => reviewGo(currentIndex() + 1));
    track.addEventListener('keydown', event => {
        if (event.target !== track) return;
        const index = currentIndex();
        const target = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: lastIndex() }[event.key];
        if (target !== undefined) { event.preventDefault(); reviewGo(target); }
    });
    track.addEventListener('scroll', updateReviews, { passive: true });
    new ResizeObserver(updateReviews).observe(track);
    function syncReviewLayout() {
        if (mobile.matches) track.removeAttribute('tabindex');
        else track.tabIndex = 0;
        track.setAttribute('aria-label', mobile.matches ? 'Selected customer reviews' : 'Customer reviews. Use the arrow keys or swipe.');
        track.scrollTo({ left: 0, behavior: 'instant' });
        updateReviews();
    }
    mobile.addEventListener('change', syncReviewLayout);
    readButtons.forEach((button, i) => {
        const excerpt = cards[i].querySelector('.rt-review-excerpt');
        const original = cards[i].querySelector('.rt-review-original');
        if (!excerpt || !original) return;
        button.hidden = false;
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') !== 'true';
            button.setAttribute('aria-expanded', String(expanded));
            button.textContent = expanded ? 'Read less' : 'Read more';
            excerpt.hidden = expanded;
            original.hidden = !expanded;
        });
    });
    syncReviewLayout();

    // No Trustindex requests are made until a real public widget ID is supplied.
    const widgetId = config.reviews?.trustindexWidgetId || '';
    if (/^[a-zA-Z0-9_-]{5,100}$/.test(widgetId)) {
        const slot = document.getElementById('rt-trustindex');
        const fallback = document.getElementById('rt-reviews-fallback');
        const savedRating = document.getElementById('rt-saved-review-rating');
        const syncWidgetLayout = () => {
            const showWidget = !mobile.matches && slot.dataset.state === 'ready';
            slot.hidden = !showWidget;
            fallback.hidden = showWidget;
            savedRating.hidden = showWidget;
        };
        mobile.addEventListener('change', () => {
            if (slot.dataset.state !== 'loading') syncWidgetLayout();
        });
        new IntersectionObserver((entries, observer) => {
            if (mobile.matches || !entries.some(entry => entry.isIntersecting)) return;
            observer.disconnect();
            slot.hidden = false;
            slot.dataset.state = 'loading';
            let timeout;
            const fail = () => {
                clearTimeout(timeout);
                monitor.disconnect();
                slot.hidden = true;
                slot.dataset.state = 'unavailable';
                fallback.hidden = false;
                savedRating.hidden = false;
            };
            const monitor = new MutationObserver(() => {
                // Hide the saved fallback only after real review content has been rendered.
                if (!slot.querySelector('.ti-review-item, .ti-review-content, [data-review-id]')) return;
                clearTimeout(timeout);
                monitor.disconnect();
                slot.dataset.state = 'ready';
                syncWidgetLayout();
            });
            monitor.observe(slot, { childList: true, subtree: true });
            const script = document.createElement('script');
            script.src = 'https://cdn.trustindex.io/loader.js?' + encodeURIComponent(widgetId);
            script.async = true;
            script.defer = true;
            script.onerror = fail;
            timeout = setTimeout(fail, 15000);
            slot.append(script);
        }, { rootMargin: '250px' }).observe(slot.parentElement);
    }
});
