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
    const status = document.getElementById('map-status');
    // Approximate representative points only; numbers match the visible list.
    const areas = [
        { name: 'Black Mountain Ranch', location: [33.015, -117.160] },
        { name: 'Carmel Valley', location: [32.953, -117.231] },
        { name: 'Del Mar', location: [32.959, -117.265] },
        { name: 'La Jolla', location: [32.847, -117.274] },
        { name: 'Mira Mesa', location: [32.918, -117.139] },
        { name: 'Miramar', location: [32.886, -117.145] },
        { name: 'Pacific Beach', location: [32.800, -117.240] },
        { name: 'Point Loma', location: [32.728, -117.235] },
        { name: 'Poway', location: [32.963, -117.036] },
        { name: 'Rancho Bernardo', location: [33.023, -117.078] },
        { name: 'Rancho Peñasquitos', location: [32.971, -117.118] },
        { name: 'Serra Mesa', location: [32.800, -117.135] },
        { name: 'Solana Beach', location: [32.991, -117.271] },
        { name: 'Sorrento Valley', location: [32.902, -117.207] },
        { name: 'Torrey Highlands', location: [32.967, -117.162] },
        { name: 'Clairemont', location: [32.824, -117.200] }
    ];
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
        tiles.addTo(map);
        areas.forEach((area, index) => L.marker(area.location, {
            icon: L.divIcon({
                className: 'rt-service-marker',
                html: '<span>' + (index + 1) + '</span>',
                iconSize: [25, 25], iconAnchor: [12.5, 12.5]
            }),
            title: (index + 1) + '. ' + area.name,
            alt: (index + 1) + '. ' + area.name,
            interactive: true, keyboard: true, autoPanOnFocus: false
        }).addTo(map).bindPopup(area.name, { autoPan: true, autoPanPadding: [20, 20], closeButton: true }));
        const fit = () => map.fitBounds(areas.map(area => area.location), {
            padding: [32, 32], maxZoom: 12, animate: false
        });
        fit();
        map.on('resize popupclose', fit);
        new ResizeObserver(() => map.invalidateSize({ animate: false })).observe(container);
        container.dataset.mapState = 'ready';
    }
    const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); initMap(); }
    }, { rootMargin: '250px' });
    observer.observe(container);
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

// Tabs reflect the existing package categories; disclosure lists use native details.
document.addEventListener('DOMContentLoaded', () => {
    const tabs = Array.from(document.querySelectorAll('.rt-service-tabs [role="tab"]'));
    const select = tab => tabs.forEach(item => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
        document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', event => {
            let next;
            if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
            if (event.key === 'ArrowLeft') next = tabs[(index + tabs.length - 1) % tabs.length];
            if (event.key === 'Home') next = tabs[0];
            if (event.key === 'End') next = tabs[tabs.length - 1];
            if (next) { event.preventDefault(); select(next); next.focus(); }
        });
    });
});
