// Optional measurement choices. These controls never block booking, phone or SMS.
(() => {
    const tracking = window.rtLeadTracking;
    if (!tracking || document.getElementById('rt-privacy-choices')) return;
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/consent-controls.css?v=pr28-review';
    document.head.append(style);
    const panel = document.createElement('section');
    panel.id = 'rt-privacy-choices';
    panel.setAttribute('aria-labelledby', 'rt-privacy-title');
    panel.hidden = true;
    panel.innerHTML = `<div class="rt-privacy-inner"><h2 id="rt-privacy-title" tabindex="-1">Optional measurement</h2>
<p>Allow us to measure which ads bring inquiries? Your choice does not affect booking, calls or texts. <a href="/privacy/#privacy-storage">Privacy details</a></p>
<p class="rt-privacy-timing">If you allow after leaving your arrival page, we may no longer be able to link that visit to an ad.</p>
<p class="rt-privacy-state" aria-live="polite"></p>
<div class="rt-privacy-actions"><button type="button" data-choice="allow">Allow measurement</button><button type="button" data-choice="deny">No thanks</button><button type="button" data-choice="close">Close</button></div></div>`;
    // Normal document flow: does not cover the sticky call bar, forms or lightbox.
    document.body.insertBefore(panel, document.body.firstChild);
    const openButton = document.createElement('button');
    openButton.type = 'button';
    openButton.className = 'rt-privacy-open';
    openButton.textContent = 'Privacy choices';
    openButton.setAttribute('aria-controls', panel.id);
    openButton.setAttribute('aria-expanded', 'false');
    (document.querySelector('footer') || document.body).append(openButton);
    let returnFocus = null;
    const state = panel.querySelector('.rt-privacy-state');
    const allow = panel.querySelector('[data-choice="allow"]');
    const deny = panel.querySelector('[data-choice="deny"]');
    function refresh() {
        const choice = tracking.consentState();
        allow.disabled = choice === 'gpc';
        deny.textContent = choice === 'granted' ? 'Turn off measurement' : 'No thanks';
        state.textContent = choice === 'gpc' ? 'Global Privacy Control is on. Optional measurement stays off.'
            : choice === 'granted' ? 'Optional measurement is allowed. You can turn it off here at any time.'
            : 'Optional measurement is off.';
    }
    function open(manual) {
        refresh();
        returnFocus = manual ? document.activeElement : null;
        panel.hidden = false;
        openButton.setAttribute('aria-expanded', 'true');
        if (manual) panel.querySelector('h2').focus();
    }
    function close() {
        panel.hidden = true;
        openButton.setAttribute('aria-expanded', 'false');
        if (returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
        else if (panel.contains(document.activeElement)) {
            // Keep keyboard focus usable without scrolling to the footer.
            const next = document.querySelector('header a, main a, main button');
            next?.focus({preventScroll: true});
        }
    }
    openButton.addEventListener('click', () => open(true));
    panel.addEventListener('click', event => {
        const action = event.target.closest('[data-choice]')?.dataset.choice;
        if (!action) return;
        if (action !== 'close') tracking.setConsent(action === 'allow');
        close();
    });
    panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
    window.addEventListener('rt-consent-change', refresh);
    if (tracking.consentState() === 'unknown') open(false);
})();
