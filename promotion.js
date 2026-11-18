const rtPromo = window.restoreIntegrations?.promotion;
const rtPromoDialog = document.getElementById('rt-configured-offer');
if (rtPromoDialog && rtPromo?.title && rtPromo.description && Object.hasOwn(rtPricing.services, rtPromo.service)) {
    const sessionKey = 'rt-offer:' + rtPromo.title + ':' + rtPromo.service;
    let shown = false;
    const previousFocus = () => document.activeElement;
    let returnFocus;
    rtPromoDialog.querySelector('h2').textContent = rtPromo.title;
    rtPromoDialog.querySelector('.rt-offer-copy').textContent = rtPromo.description;
    rtPromoDialog.querySelector('a').href = '/request-a-quote/?service=' + encodeURIComponent(rtPromo.service);
    rtPromoDialog.querySelector('button').addEventListener('click', () => rtPromoDialog.close());
    rtPromoDialog.addEventListener('close', () => returnFocus?.focus({preventScroll: true}));
    function showPromo() {
        try { if (sessionStorage.getItem(sessionKey)) return; } catch { /* Keep the in-page guard. */ }
        if (shown) return;
        if (document.hidden || document.querySelector('dialog[open], .rt-mobile-menu[open]')) {
            window.setTimeout(showPromo, 2000);
            return;
        }
        shown = true;
        returnFocus = previousFocus();
        try { sessionStorage.setItem(sessionKey, '1'); } catch { /* Keep the in-page guard. */ }
        rtPromoDialog.showModal();
    }
    window.setTimeout(showPromo, rtPromo.delayMs);
}
