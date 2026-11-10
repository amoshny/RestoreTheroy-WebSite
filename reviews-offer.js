document.addEventListener('DOMContentLoaded', () => {
    const config = window.restoreIntegrations || {};
    const track = document.getElementById('rt-saved-reviews-track');
    const cards = [...track.querySelectorAll('.review-card')];
    const controls = document.querySelector('.rt-saved-reviews-controls');
    const mobile = matchMedia('(max-width: 700px)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const readButtons = cards.map(card => card.querySelector('.rt-review-read-more'));
    track.classList.add('rt-reviews-enhanced');

    function updateReviews() {
        const stride = cards[1].offsetLeft - cards[0].offsetLeft;
        const index = mobile.matches ? Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / stride))) : 0;
        controls.hidden = !mobile.matches;
        controls.querySelector('[data-review-direction="-1"]').disabled = index === 0;
        controls.querySelector('[data-review-direction="1"]').disabled = index === cards.length - 1;
        document.getElementById('rt-saved-review-count').textContent = `${index + 1} / ${cards.length}`;

    }
    function reviewGo(index) {
        const stride = cards[1].offsetLeft - cards[0].offsetLeft;
        track.scrollTo({ left: Math.max(0, Math.min(cards.length - 1, index)) * stride, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
    controls.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
        const stride = cards[1].offsetLeft - cards[0].offsetLeft;
        reviewGo(Math.round(track.scrollLeft / stride) + Number(button.dataset.reviewDirection));
    }));
    track.addEventListener('keydown', event => {
        if (!mobile.matches || event.target !== track) return;
        const stride = cards[1].offsetLeft - cards[0].offsetLeft;
        const index = Math.round(track.scrollLeft / stride);
        const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: cards.length - 1 }[event.key];
        if (next !== undefined) { event.preventDefault(); reviewGo(next); }
    });
    track.addEventListener('scroll', updateReviews, { passive: true });
    new ResizeObserver(updateReviews).observe(track);
    mobile.addEventListener('change', () => { track.scrollTo({ left: 0, behavior: 'instant' }); updateReviews(); });
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
    updateReviews();

    // No Trustindex requests are made until a real public widget ID is supplied.
    const widgetId = config.reviews?.trustindexWidgetId || '';
    if (/^[a-zA-Z0-9_-]{5,100}$/.test(widgetId)) {
        const slot = document.getElementById('rt-trustindex');
        const fallback = document.getElementById('rt-reviews-fallback');
        const savedRating = document.getElementById('rt-saved-review-rating');
        new IntersectionObserver((entries, observer) => {
            if (!entries.some(entry => entry.isIntersecting)) return;
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
                fallback.hidden = true;
                savedRating.hidden = true;
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

    const dialog = document.getElementById('rt-first-detail-offer');
    const intro = document.getElementById('rt-offer-intro');
    const callbackPanel = document.getElementById('rt-callback-panel');
    const form = document.getElementById('rt-callback-form');
    const submit = document.getElementById('rt-callback-submit');
    const status = document.getElementById('rt-callback-status');
    const phone = document.getElementById('rt-callback-phone');
    const availability = document.getElementById('rt-callback-availability');
    const dismissedKey = 'rt-first-detail-dismissed-until-v1';
    const shownKey = 'rt-first-detail-shown-v1';
    const cooldown = 7 * 24 * 60 * 60 * 1000;
    let returnFocus = null, shownThisPage = false, activeElapsed = 0;
    let lastTick = performance.now(), timer;
    const read = (storage, key) => { try { return window[storage].getItem(key); } catch { return null; } };
    const write = (storage, key, value) => { try { window[storage].setItem(key, value); } catch { /* Storage may be disabled; the current-page guard still applies. */ } };
    const eligible = () => !shownThisPage && read('sessionStorage', shownKey) !== '1' && Number(read('localStorage', dismissedKey) || 0) <= Date.now();
    function obstructed() {
        if (document.querySelector('dialog[open], .rt-mobile-menu[open]')) return true;
        if ([...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].some(el => el.getClientRects().length)) return true;
        if (document.activeElement?.matches('input, textarea, select, [contenteditable="true"]')) return true;
        return [...document.forms].some(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
        });
    }
    function setPanel(callback) {
        intro.hidden = callback;
        callbackPanel.hidden = !callback;
        dialog.setAttribute('aria-labelledby', callback ? 'rt-callback-title' : 'rt-offer-title');
        dialog.scrollTop = 0;
    }
    function openOffer(trigger) {
        if (obstructed()) return;
        returnFocus = trigger || document.activeElement;
        shownThisPage = true;
        write('sessionStorage', shownKey, '1');
        clearInterval(timer);
        setPanel(false);
        dialog.showModal();
        document.body.classList.add('rt-offer-open');
        dialog.querySelector('.rt-offer-close').focus({ preventScroll: true });
    }
    document.querySelectorAll('[data-open-offer]').forEach(button => button.addEventListener('click', () => openOffer(button)));
    dialog.addEventListener('keydown', event => {
        if (event.key !== 'Tab') return;
        const focusable = [...dialog.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
            .filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    dialog.querySelector('.rt-offer-close').addEventListener('click', () => dialog.close());
    document.getElementById('rt-open-callback').addEventListener('click', () => {
        setPanel(true);
        document.getElementById('rt-callback-title').focus({ preventScroll: true });
    });
    document.getElementById('rt-offer-back').addEventListener('click', () => {
        setPanel(false);
        document.getElementById('rt-open-callback').focus({ preventScroll: true });
    });
    dialog.addEventListener('close', () => {
        document.body.classList.remove('rt-offer-open');
        write('localStorage', dismissedKey, String(Date.now() + cooldown));
        if (returnFocus?.isConnected && returnFocus !== document.body) returnFocus.focus({ preventScroll: true });
    });
    dialog.querySelectorAll('a[href^="tel:"]').forEach(link => link.addEventListener('click', () => {
        write('localStorage', dismissedKey, String(Date.now() + cooldown));
    }));
    // Count only visible, focused browsing time. Menus, viewers and forms pause the countdown.
    const resetTick = () => { lastTick = performance.now(); };
    document.addEventListener('visibilitychange', resetTick);
    window.addEventListener('focus', resetTick);
    window.addEventListener('blur', resetTick);
    if (eligible()) timer = setInterval(() => {
        const now = performance.now(), elapsed = Math.min(1000, now - lastTick);
        lastTick = now;
        if (!eligible()) { clearInterval(timer); return; }
        if (document.visibilityState !== 'visible' || !document.hasFocus() || obstructed()) return;
        activeElapsed += elapsed;
        if (activeElapsed >= 30000) openOffer();
    }, 250);

    // A public endpoint must accept JSON POST requests and explicitly return { "ok": true }.
    let endpoint = '';
    try {
        const candidate = new URL(config.callback?.endpoint || '', location.href);
        if (config.callback?.endpoint && candidate.protocol === 'https:') endpoint = candidate.href;
    } catch { /* Keep submission disabled for invalid or missing configuration. */ }
    if (endpoint) {
        document.getElementById('rt-open-callback').hidden = false;
        submit.disabled = false;
        availability.textContent = 'Leave your details and I’ll call you about your first detail.';
    }
    phone.addEventListener('input', () => phone.setCustomValidity(''));
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!endpoint || form.dataset.sending === 'true') return;
        const digits = phone.value.replace(/\D/g, '');
        phone.setCustomValidity(/^\+?[\d\s().-]+$/.test(phone.value.trim()) && digits.length >= 10 && digits.length <= 15 ? '' : 'Enter a valid phone number, including the area code.');
        if (!form.reportValidity()) return;
        const values = new FormData(form);
        const name = String(values.get('name') || '').trim();
        const nameField = document.getElementById('rt-callback-name');
        nameField.setCustomValidity(name ? '' : 'Enter your name.');
        if (!form.reportValidity()) return;
        form.dataset.sending = 'true';
        submit.disabled = true;
        submit.textContent = 'Sending…';
        status.textContent = 'Sending your callback request…';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        try {
            const response = await fetch(endpoint, {
                method: 'POST', credentials: 'omit', signal: controller.signal,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ name, phone: phone.value.trim(), email: String(values.get('email') || '').trim(), offer: 'first-detail-10-percent', source: 'restoretheory.net' })
            });
            const result = await response.json();
            if (!response.ok || result.ok !== true) throw new Error('Unconfirmed request');
            status.textContent = 'Your callback request was received. Thank you.';
            form.reset();
        } catch {
            status.textContent = 'We couldn’t confirm your request. Please call (858) 888-2707. Your details have not been cleared.';
        } finally {
            clearTimeout(timeout);
            delete form.dataset.sending;
            submit.disabled = false;
            submit.textContent = 'Request Callback';
        }
    });
    document.getElementById('rt-callback-name').addEventListener('input', event => event.target.setCustomValidity(''));
});
