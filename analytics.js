// Use the site's configured Google tag. Contact data stays out of events.
window.rtTrack = function (eventName, parameters = {}) {
    try {
        if (typeof window.gtag === 'function') window.gtag('event', eventName, parameters);
        else (window.dataLayer ||= []).push({event: eventName, ...parameters});
    } catch { /* Measurement must not interrupt customer actions. */ }
};

document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="tel:"], a[href^="sms:"]');
    if (!link) return;
    window.rtTrack(link.protocol === 'tel:' ? 'click_to_call' : 'sms_initiated', {
        link_placement: link.closest('header, nav, section, footer, .rt-mobile-call-dock')?.id || 'page',
    });
});

const rtBookingForm = document.getElementById('rt-quote-form');
rtBookingForm?.addEventListener('input', () => window.rtTrack('booking_form_started'), {once: true});
const servicePage = document.querySelector('[data-service-schema]');
if (servicePage) window.rtTrack('service_page_view', {service: servicePage.dataset.serviceSchema});
