document.addEventListener("DOMContentLoaded", () => {
    // 1. Auto-update the footer copyright year
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("portfolio-track");
    if (!track) return;
    const slides = Array.from(track.querySelectorAll(".portfolio-slide"));
    const controls = document.querySelector(".portfolio-controls");
    const dots = Array.from(controls.querySelectorAll("[data-slide]"));
    const arrows = Array.from(controls.querySelectorAll("[data-direction]"));
    const status = document.getElementById("portfolio-status");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let scheduled = false;
    function update() {
        current = slides.reduce((nearest, slide, index) =>
            Math.abs(slide.offsetLeft - slides[0].offsetLeft - track.scrollLeft) <
            Math.abs(slides[nearest].offsetLeft - slides[0].offsetLeft - track.scrollLeft) ? index : nearest, 0);
        dots.forEach((dot, index) => {
            if (index === current) dot.setAttribute("aria-current", "true");
            else dot.removeAttribute("aria-current");
        });
        arrows.forEach(button => {
            button.disabled = Number(button.dataset.direction) < 0 ? current === 0 : current === slides.length - 1;
        });
        const message = "Project " + (current + 1) + " of " + slides.length + ": " + slides[current].querySelector("h3").textContent;
        if (status.textContent !== message) status.textContent = message;
    }
    function goTo(index) {
        const destination = Math.max(0, Math.min(slides.length - 1, index));
        track.scrollTo({
            left: slides[destination].offsetLeft - slides[0].offsetLeft,
            behavior: reducedMotion.matches ? "auto" : "smooth"
        });
    }
    controls.hidden = false;
    dots.forEach(dot => dot.addEventListener("click", () => goTo(Number(dot.dataset.slide))));
    arrows.forEach(button => button.addEventListener("click", () => goTo(current + Number(button.dataset.direction))));
    track.addEventListener("keydown", event => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(current + (event.key === "ArrowRight" ? 1 : -1));
        }
    });
    track.addEventListener("scroll", () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => { update(); scheduled = false; });
    }, { passive: true });
    window.addEventListener("resize", () => {
        track.scrollTo({ left: slides[current].offsetLeft - slides[0].offsetLeft, behavior: "instant" });
        update();
    });
    update();
});

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("service-area-map");
    if (!container || !window.L) return;
    const areas = [
        { name: "Point Loma", location: [32.728, -117.235] },
        { name: "Pacific Beach", location: [32.800, -117.240] },
        { name: "La Jolla", location: [32.847, -117.274] },
        { name: "UTC", location: [32.868, -117.211] },
        { name: "Del Mar", location: [32.959, -117.265] },
        { name: "Solana Beach", location: [32.991, -117.271] }
    ];
    container.replaceChildren();
    const map = L.map(container, { scrollWheelZoom: false, zoomSnap: 0.25 });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    areas.forEach(area => {
        L.circleMarker(area.location, {
            radius: 10, color: "#fff", weight: 3,
            fillColor: "#15803d", fillOpacity: 1
        }).addTo(map).bindTooltip(area.name, {
            permanent: true, direction: area.name === "UTC" ? "right" : "left",
            offset: [area.name === "UTC" ? 12 : -12, 0],
            className: "service-area-label"
        });
    });
    const fit = () => map.fitBounds(areas.map(area => area.location), {
        paddingTopLeft: [105, 35], paddingBottomRight: [65, 35], maxZoom: 12
    });
    fit();
    map.on("resize", fit);
});
