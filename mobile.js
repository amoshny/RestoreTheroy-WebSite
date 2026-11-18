const mobileLayout = matchMedia('(max-width: 700px)');
const smsLinks = [...document.querySelectorAll('a[href="sms:8588882707"], a[href="sms:+18588882707"]')];
const appleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const smsSeparator = appleMobile ? '&' : '?';
const quoteMessage = "Hi Ace, I'd like a quote for my vehicle.\nVehicle model: \nZIP code: \nI’ll attach a few photos.";
const areaMessage = "Hi Ace, do you serve my ZIP code? ";

function rtSmsHref(message) {
    return 'sms:+18588882707' + smsSeparator + 'body=' + encodeURIComponent(message);
}

function updateSmsLinks() {
    for (const link of smsLinks) {
        const message = link.classList.contains('rt-area-call') ? areaMessage : quoteMessage;
        link.href = link.dataset.smsBody
            ? rtSmsHref(link.dataset.smsBody)
            : mobileLayout.matches ? rtSmsHref(message) : 'sms:+18588882707';
    }
}

updateSmsLinks();
mobileLayout.addEventListener('change', updateSmsLinks);

const quoteDock = document.querySelector('.rt-mobile-call-dock');
const heroActions = document.querySelector('.rt-hero-actions');
const header = document.querySelector('.rt-nav');
function updateDock() {
    quoteDock.hidden = !mobileLayout.matches ||
        heroActions.getBoundingClientRect().bottom > header.getBoundingClientRect().bottom;
}

if (quoteDock && heroActions && header) {
    updateDock();
    window.addEventListener('scroll', updateDock, { passive: true });
    window.addEventListener('resize', updateDock);
    mobileLayout.addEventListener('change', updateDock);
    new ResizeObserver(updateDock).observe(heroActions);
}

