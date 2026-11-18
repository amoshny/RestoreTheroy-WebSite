// Public integration settings only. Never put API tokens, passwords or mail-service keys here.
// Optional widgets and callbacks stay empty until separately connected.
window.restoreIntegrations = Object.freeze({
    reviews: Object.freeze({ trustindexWidgetId: '', rating: '5.0', count: 63, verifiedOn: 'Nov 17, 2026' }),
    booking: Object.freeze({
        endpoint: '',
        // Owner confirmed activation and real test-email receipt on Nov 18, 2026.
        formsubmit: Object.freeze({
            endpoint: 'https://formsubmit.co/ajax/arsenij.moshko@gmail.com',
            verified: true
        })
    }),
    promotion: Object.freeze({ title: '', description: '', service: '', delayMs: 10000 }),
    callback: Object.freeze({ endpoint: '' })
});
