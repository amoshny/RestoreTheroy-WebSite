const quoteForm = document.getElementById('rt-quote-form');
const fields = document.getElementById('rt-quote-fields');
const booking = quoteForm.elements;
const draftLink = document.getElementById('rt-quote-draft');
const status = document.getElementById('rt-quote-status');
const submit = quoteForm.querySelector('button[type="submit"]');
const estimateAmount = document.getElementById('rt-estimate-amount');
const estimateDetail = document.getElementById('rt-estimate-detail');
const coverageStatus = document.getElementById('rt-zip-status');
const requestedService = new URLSearchParams(location.search).get('service');
let endpoint;
try {
    const address = new URL(window.restoreIntegrations?.booking?.endpoint);
    if (address.protocol === 'https:' && !address.username && !address.password) endpoint = address.href;
} catch { /* Keep the text option when delivery is not configured. */ }

rtPopulateVehicleSizes(booking.size);
for (const [id, service] of Object.entries(rtPricing.services)) {
    booking.service.add(new Option(service.name + ' · from $' + service.base, id));
}
if (Object.hasOwn(rtPricing.services, requestedService)) booking.service.value = requestedService;
const localDate = () => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());
booking.date.min = localDate();
submit.textContent = endpoint ? 'Request Booking' : 'Continue to Text';
document.getElementById('quote-delivery-help').textContent = endpoint
    ? 'Your date and time are preferences. Ace will follow up to confirm availability and your final quote.'
    : 'Continue to open a text draft. Tap Send in your messaging app to request your appointment, and attach photos if you like.';
fields.disabled = false;

function showEstimate() {
    const amount = rtStartingPrice(booking.service.value, booking.size.value);
    const ready = booking.service.value && booking.size.value && booking.condition.value;
    estimateAmount.textContent = !ready ? 'Choose a service, size and condition'
        : amount === null ? 'Individual quote required' : '$' + amount;
    estimateDetail.textContent = Number(booking.condition.value) >= 4
        ? 'Heavy buildup, stains or pet hair may need extra treatment. Ace will review your vehicle and agree any extra charge with you first.'
        : 'Starting estimate. Ace confirms the final price before work begins.';
    const zip = booking.zip.value;
    coverageStatus.textContent = /^[0-9]{5}$/.test(zip)
        ? (zip === '92131' ? '92131 is listed for Scripps Ranch. Ace will confirm your service location.'
            : 'Ace will check availability for this ZIP code.') : '';
}

let sending = false;
let lastDraft = -Infinity;
let requestId;

quoteForm.addEventListener('input', event => {
    event.target.setCustomValidity('');
    if (!sending) {
        draftLink.hidden = true;
        draftLink.removeAttribute('href');
        status.textContent = '';
    }
    showEstimate();
});
showEstimate();

quoteForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || performance.now() - lastDraft < 1200) return;
    if (!booking.customerName.value.trim()) booking.customerName.setCustomValidity('Please enter your first name.');
    const phone = booking.phone.value.trim();
    if (!/^\+?[0-9(). -]+$/.test(phone) || !/^1?[0-9]{10}$/.test(phone.replace(/\D/g, ''))) {
        booking.phone.setCustomValidity('Enter a 10-digit U.S. phone number, including the area code.');
    }
    booking.date.min = localDate();
    if (!quoteForm.reportValidity()) return;

    const request = Object.fromEntries([...new FormData(quoteForm)].map(([name, value]) => [name, value.trim()]));
    if (endpoint) {
        sending = true;
        fields.disabled = true;
        status.textContent = 'Sending your booking request…';
        requestId ??= crypto.randomUUID();
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...request, requestId}),
                signal: AbortSignal.timeout(12000)
            });
            const result = response.ok ? await response.json() : null;
            if (result?.ok !== true || typeof result.requestId !== 'string' || !result.requestId.trim()) throw Error();
            status.textContent = 'Booking request received. Ace will contact you to confirm your appointment and final quote.';
        } catch {
            status.textContent = 'Delivery could not be confirmed. Your details are still here. Retry or call Ace for help.';
            sending = false;
            fields.disabled = false;
            return;
        }
        if (typeof window.gtag === 'function') window.gtag('event', 'booking_request_submitted');
        else window.dataLayer?.push({event: 'booking_request_submitted'});
        return;
    }

    const message = [
        "Hi Ace, I’d like to book a mobile detail.",
        'Name: ' + request.customerName,
        'Phone: ' + request.phone,
        'Vehicle size: ' + rtPricing.vehicles[request.size].name,
        'Service: ' + rtPricing.services[request.service].name,
        'Condition: ' + request.condition,
        'ZIP: ' + request.zip,
        'Preferred appointment: ' + request.date + ' · ' + request.time,
    ];
    if (request.vehicle) message.push('Vehicle: ' + request.vehicle);
    if (request.email) message.push('Email: ' + request.email);
    if (request.notes) message.push('Notes: ' + request.notes);
    lastDraft = performance.now();
    draftLink.href = rtSmsHref(message.join('\n'));
    draftLink.hidden = false;
    status.textContent = 'Your text draft is ready. Tap Send in your messaging app to send it to Ace.';
    draftLink.click();
});
