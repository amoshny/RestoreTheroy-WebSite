// Use the site's configured Google tag. Contact data stays out of events.
window.rtTrack = function (eventName, parameters = {}) {
    if (!window.rtLeadTracking?.canMeasure()) return;
    try {
        if (typeof window.gtag === 'function') window.gtag('event', eventName, parameters);
        else (window.dataLayer ||= []).push({event: eventName, ...parameters});
    } catch { /* Measurement must not interrupt customer actions. */ }
};

document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const placement = link.closest('header, nav, section, footer, .rt-mobile-call-dock')?.id || 'page';
    if (link.protocol === 'tel:' || link.protocol === 'sms:') {
        window.rtTrack(link.protocol === 'tel:' ? 'click_to_call' : 'sms_initiated', {link_placement: placement});
    } else if (link.origin === location.origin && link.pathname === '/request-a-quote/') {
        const service = new URL(link.href).searchParams.get('service');
        const parameters = {destination: 'detail_request', link_placement: placement};
        if (['interior-only', 'essential', 'deep-clean', 'full-detail-polish'].includes(service)) parameters.service = service;
        window.rtTrack('cta_click', parameters);
    }
});

const rtBookingForm = document.getElementById('rt-quote-form');
rtBookingForm?.addEventListener('input', () => window.rtTrack('booking_form_started'), {once: true});
const servicePage = document.querySelector('[data-service-schema]');
if (servicePage) window.rtTrack('service_page_view', {service: servicePage.dataset.serviceSchema});
