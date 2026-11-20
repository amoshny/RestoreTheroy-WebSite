// Public review snapshot, centrally maintained in integrations.js. No live-sync claim.
document.addEventListener('DOMContentLoaded', () => {
    const reviews = window.restoreIntegrations?.reviews;
    if (!reviews?.verifiedOn) return;
    for (const label of document.querySelectorAll('[data-review-snapshot]')) {
        label.textContent = reviews.count + ' reviews as of ' + reviews.verifiedOn;
    }
    for (const label of document.querySelectorAll('[data-review-count]')) label.textContent = reviews.count;
    for (const label of document.querySelectorAll('[data-review-rating]')) label.textContent = reviews.rating;
});
