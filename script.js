document.addEventListener("DOMContentLoaded", () => {
    // 1. Auto-update the footer copyright year
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Keep in-page destinations clear of the sticky header and respect reduced motion.
    const header = document.querySelector('.rt-nav');
    const updateHeaderOffset = () => document.documentElement.style.setProperty('--rt-header-offset', Math.ceil(header.getBoundingClientRect().height + 12) + 'px');
    updateHeaderOffset();
    new ResizeObserver(updateHeaderOffset).observe(header);
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            const id = anchor.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (!target) return;
            event.preventDefault();
            if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
            target.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        });
    });
});

// The existing Leaflet map loads tiles only when the service-area section approaches.
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('service-area-map');
    if (!container) return;
    const mobile = matchMedia('(max-width: 700px)');
    const status = document.getElementById('map-status');
    const title = document.getElementById('rt-area-selection-title');
    const availability = document.querySelector('.rt-area-selection .rt-area-call');
    let activeArea;
    const areas = [...document.querySelectorAll('.rt-neighborhoods li[data-location]')].map(item => {
        const location = item.dataset.location.split(',').map(Number);
        const name = item.textContent.trim();
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = name;
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-controls', 'rt-area-selection');
        const area = { name, location, button, slug: item.dataset.area };
        button.addEventListener('click', () => selectArea(area));
        item.replaceChildren(button);
        return area;
    });

    function syncSelection() {
        for (const area of areas) {
            const active = area === activeArea;
            area.button.setAttribute('aria-pressed', String(active));
            const marker = area.marker?.getElement();
            marker?.classList.toggle('is-selected', active);
            marker?.setAttribute('aria-pressed', String(active));
        }
    }

    function selectArea(area) {
        activeArea = area;
        title.textContent = area.name;
        const guide = document.getElementById('rt-area-guide');
        if (guide) {
            guide.href = area.slug === 'poway' ? '/mobile-detailing-poway/' : area.slug === 'mira-mesa' ? '/mobile-detailing-mira-mesa/' : '/service-areas/#' + area.slug;
            guide.hidden = false;
        }
        const message = "Hi Ace, do you have availability for mobile detailing in " + area.name + "? My ZIP code is ";
        availability.dataset.smsBody = message;
        availability.href = rtSmsHref(message);
        syncSelection();
    }

    function initMap() {
        if (!window.L) { status.textContent = 'Map unavailable. All service neighborhoods are listed here.'; return; }
        container.replaceChildren();
        const map = L.map(container, {
            scrollWheelZoom: false, dragging: false, touchZoom: false,
            doubleClickZoom: false, boxZoom: false, keyboard: false,
            zoomControl: false, zoomSnap: .25, fadeAnimation: false
        });
        let loaded = 0, failed = 0;
        const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        tiles.on('tileload', () => {
            loaded++;
            container.dataset.mapState = 'loaded';
            status.textContent = 'Explore the neighborhoods I serve.';
        });
        tiles.on('tileerror', event => {
            event.tile.style.display = 'none';
            failed++;
            if (!loaded && failed >= 3) {
                container.dataset.mapState = 'unavailable';
                status.textContent = 'Map tiles are unavailable. See the neighborhood list for service coverage.';
            }
        });
        const fit = () => map.fitBounds(areas.map(area => area.location), {
            padding: [32, 32], maxZoom: 12, animate: false
        });
        fit();
        tiles.addTo(map);
        for (const area of areas) {
            area.marker = L.marker(area.location, {
                icon: L.divIcon({
                    className: 'rt-service-marker',
                    html: '<span aria-hidden="true"></span>',
                    iconSize: [25, 25], iconAnchor: [12.5, 12.5]
                }),
                title: area.name,
                alt: area.name,
                interactive: true, keyboard: true, autoPanOnFocus: false
            }).addTo(map).bindTooltip(area.name, { direction: 'top', offset: [0, -7] });
            const marker = area.marker.getElement();
            marker.setAttribute('aria-label', area.name);
            marker.setAttribute('aria-controls', 'rt-area-selection');
            area.marker.on('click', () => selectArea(area));
            marker.addEventListener('keydown', event => {
                if (event.key !== ' ' && event.key !== 'Enter') return;
                event.preventDefault();
                event.stopPropagation();
                selectArea(area);
            });
        }
        syncSelection();
        map.on('resize', fit);
        new ResizeObserver(() => map.invalidateSize({ animate: false })).observe(container);
        container.dataset.mapState = 'ready';
    }
    const toggle = document.querySelector('.rt-map-toggle');
    const mapFrame = document.getElementById('rt-coverage-map');
    let initialized = false;
    const canShowMap = () => !mobile.matches || mapFrame.classList.contains('rt-map-open');
    const observer = new IntersectionObserver(entries => {
        if (canShowMap() && entries.some(entry => entry.isIntersecting)) {
            initialized = true;
            observer.disconnect();
            initMap();
        }
    }, { rootMargin: '250px' });
    function observeMap() {
        if (initialized) return;
        if (canShowMap()) observer.observe(container);
        else observer.unobserve(container);
    }
    if (toggle) {
        toggle.hidden = false;
        toggle.addEventListener('click', () => {
            const open = mapFrame.classList.toggle('rt-map-open');
            toggle.setAttribute('aria-expanded', String(open));
            toggle.textContent = open ? 'Hide service area map' : 'Show service area map';
            observeMap();
        });
    }
    mobile.addEventListener('change', observeMap);
    observeMap();
});

// Close the mobile header menu after choosing a destination or pressing Escape.
document.addEventListener("DOMContentLoaded", () => {
    const menu = document.querySelector(".rt-mobile-menu");
    if (!menu) return;
    menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => { menu.open = false; }));
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && menu.open) {
            menu.open = false;
            menu.querySelector("summary").focus();
        }
    });
});

// Compare the same starting prices used by the booking form.
document.addEventListener('DOMContentLoaded', () => {
    const size = document.getElementById('rt-vehicle-size');
    if (!size || typeof rtPricing === 'undefined') return;
    const prices = document.querySelectorAll('#auto-detailing [data-starting-price]');
    const status = document.getElementById('rt-vehicle-estimate');
    rtPopulateVehicleSizes(size);
    const update = () => {
        for (const price of prices) {
            const amount = rtStartingPrice(price.dataset.startingPrice, size.value);
            price.textContent = amount === null ? 'Quote required' : '$' + amount;
            price.closest('.rt-package-price').classList.toggle('rt-individual-price', amount === null);
        }
        status.textContent = Number.isFinite(rtPricing.vehicles[size.value].factor)
            ? 'Starting prices for ' + rtPricing.vehicles[size.value].name + '.'
            : 'Text or book online and I’ll confirm pricing for this vehicle size.';
    };
    size.value = 'sedan';
    size.disabled = false;
    size.addEventListener('change', update);
    window.addEventListener('pageshow', update);
    update();
});
