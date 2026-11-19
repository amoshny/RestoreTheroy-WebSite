const quoteForm = document.getElementById('rt-quote-form');
const fields = document.getElementById('rt-quote-fields');
const booking = quoteForm.elements;
const draftLink = document.getElementById('rt-quote-draft');
const status = document.getElementById('rt-quote-status');
const submit = document.getElementById('rt-booking-submit');
const estimateAmount = document.getElementById('rt-estimate-amount');
const estimateDetail = document.getElementById('rt-estimate-detail');
const coverageStatus = document.getElementById('rt-zip-status');
const bookingConfig = window.restoreIntegrations?.booking || {};
let endpoint;
let provider = 'custom';
try {
    let configured = bookingConfig.endpoint;
    if (!configured && bookingConfig.formsubmit?.verified) {
        configured = bookingConfig.formsubmit.endpoint;
        provider = 'formsubmit';
    }
    const address = new URL(configured);
    if (address.protocol === 'https:' && !address.username && !address.password) endpoint = address.href;
} catch { /* The visible text option stays available until delivery is configured. */ }

rtPopulateVehicleSizes(booking.size);
for (const [id, service] of Object.entries(rtPricing.services)) {
    booking.service.add(new Option(service.name + ' · from $' + service.base, id));
}
const requestedService = new URLSearchParams(location.search).get('service');
if (Object.hasOwn(rtPricing.services, requestedService)) booking.service.value = requestedService;
// Keep the neighborhood selected in the area hub without adding another required field.
let requestedAreaName = '';
const requestedArea = new URLSearchParams(location.search).get('area');
if (requestedArea && /^[a-z0-9-]{1,50}$/.test(requestedArea)) {
    fetch('/service-areas.json').then(response => response.ok ? response.json() : [])
        .then(areas => {
            const area = Array.isArray(areas) && areas.find(item => item.slug === requestedArea);
            if (!area) return;
            requestedAreaName = area.name;
            const notice = document.getElementById('rt-requested-area');
            notice.textContent = 'Requested area: ' + area.name + '. Ace will confirm the exact location.';
            notice.hidden = false;
        }).catch(() => { /* A ZIP can still be entered if the area lookup is unavailable. */ });
}
const localDate = () => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());
booking.date.min = localDate();
submit.disabled = !endpoint;
document.getElementById('rt-delivery-notice').textContent = endpoint
    ? 'Send your request online. Ace will confirm the final quote and appointment with you.'
    : 'Online requests are temporarily unavailable. You can send these details by text or call Ace.';
document.getElementById('quote-delivery-help').textContent =
    'Photos help with stains and heavy buildup. You can send them directly to Ace in your messaging app.';
fields.disabled = false;

function showEstimate() {
    const ready = booking.service.value && booking.size.value && booking.condition.value;
    const amount = rtStartingPrice(booking.service.value, booking.size.value);
    estimateAmount.textContent = !ready ? 'Choose a service, size and condition'
        : amount === null ? 'Individual quote required' : '$' + amount;
    estimateDetail.textContent = Number(booking.condition.value) >= 4
        ? 'Heavy buildup, stains or pet hair may need extra treatment. Ace will review your vehicle and agree any extra charge with you first.'
        : 'Starting estimate. Ace confirms the final price before work begins.';
    const zip = booking.zip.value;
    coverageStatus.textContent = /^[0-9]{5}$/.test(zip)
        ? (zip === '92131' ? '92131 is listed for Scripps Ranch. Ace will confirm the exact service location.'
            : 'Ace will check coverage for this ZIP before confirming the appointment.') : '';
}

let phase = 'editing';
let lastDraft = -Infinity;
let requestId;
let retryRequest;
const unlock = () => {
    phase = 'editing';
    fields.disabled = false;
    submit.disabled = !endpoint;
    quoteForm.removeAttribute('aria-busy');
    submit.textContent = 'Request Booking';
};
quoteForm.addEventListener('input', event => {
    if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
    if (phase !== 'editing') return;
    requestId = undefined;
    retryRequest = undefined;
    draftLink.hidden = true;
    draftLink.removeAttribute('href');
    status.textContent = '';
    showEstimate();
});
showEstimate();

quoteForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (phase !== 'editing' || performance.now() - lastDraft < 1200) return;
    if (booking.website.value) return;
    const byText = event.submitter?.value === 'sms';
    if (!byText && !endpoint) {
        status.textContent = 'Please use Text These Details or call Ace. Online delivery is not connected yet.';
        return;
    }
    if (!booking.customerName.value.trim()) booking.customerName.setCustomValidity('Please enter your first name.');
    const phone = booking.phone.value.trim();
    if (!/^\+?[0-9(). -]+$/.test(phone) || !/^1?[0-9]{10}$/.test(phone.replace(/\D/g, ''))) {
        booking.phone.setCustomValidity('Enter a 10-digit U.S. phone number, including the area code.');
    }
    booking.date.min = localDate();
    if (!quoteForm.reportValidity()) return;
    const request = Object.fromEntries([...new FormData(quoteForm)].map(([name, value]) => [name, value.trim()]));
    delete request.website;
    delete request.delivery;
    if (requestedAreaName) request.requestedArea = requestedAreaName;
    if (!Object.hasOwn(rtPricing.services, request.service) || !Object.hasOwn(rtPricing.vehicles, request.size)) return;

    if (byText) {
        const message = [
            "Hi Ace, I’d like to request a mobile detail.",
            'Name: ' + request.customerName,
            'Phone: ' + request.phone,
            'Vehicle size: ' + rtPricing.vehicles[request.size].name,
            'Service: ' + rtPricing.services[request.service].name,
            'Condition: ' + request.condition,
            'ZIP: ' + request.zip,
            'Preferred appointment: ' + request.date + ' · ' + request.time,
        ];
        if (request.vehicle) message.push('Vehicle: ' + request.vehicle);
        if (request.requestedArea) message.push('Requested area: ' + request.requestedArea);
        if (request.email) message.push('Email: ' + request.email);
        if (request.notes) message.push('Notes: ' + request.notes);
        lastDraft = performance.now();
        draftLink.href = rtSmsHref(message.join('\n'));
        draftLink.hidden = false;
        status.textContent = 'Your text draft is ready. Add photos if you like and tap Send in your messaging app. If it doesn’t open, use Reopen the text draft or call Ace.';
        draftLink.click();
        return;
    }

    phase = 'sending';
    fields.disabled = true;
    quoteForm.setAttribute('aria-busy', 'true');
    submit.textContent = 'Sending…';
    status.textContent = 'Sending your booking request…';
    requestId ??= crypto.randomUUID();
    retryRequest ??= {...request, requestId};
    const amount = rtStartingPrice(request.service, request.size);
    let payload = retryRequest;
    if (provider === 'formsubmit') {
        payload = {
            ...retryRequest,
            service: rtPricing.services[request.service].name,
            size: rtPricing.vehicles[request.size].name,
            starting_estimate: amount === null ? 'Individual quote required' : '$' + amount,
            _subject: 'Restore Theory · Booking request ' + requestId,
            _template: 'table',
            _url: 'https://restoretheory.net/request-a-quote/',
            _honey: '',
        };
    }
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(15000),
        });
        const result = response.ok ? await response.json() : null;
        const accepted = provider === 'formsubmit'
            ? (result?.success === true || result?.success === 'true') && !/activat|confirm your email/i.test(result?.message || '')
            : result?.ok === true && typeof result.requestId === 'string' && result.requestId.trim();
        if (!accepted) throw Error();
    } catch {
        unlock();
        status.textContent = 'Delivery could not be confirmed. Your details are still here. Retry with the same request reference, text these details, or call Ace.';
        status.focus({preventScroll: true});
        return;
    }
    phase = 'accepted';
    quoteForm.removeAttribute('aria-busy');
    submit.textContent = 'Request Received';
    status.textContent = 'Booking request received. Ace will contact you to confirm your appointment and final quote.';
    status.focus({preventScroll: true});
    window.rtTrack?.('booking_request_submitted', {service: request.service});
});
