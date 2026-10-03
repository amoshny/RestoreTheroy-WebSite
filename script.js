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
