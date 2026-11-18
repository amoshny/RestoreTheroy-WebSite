// Public integration settings only. Never put API tokens, passwords or mail-service keys here.
// Leave empty until the owner supplies their widget and a real, verified callback endpoint.
window.restoreIntegrations = Object.freeze({
    reviews: Object.freeze({ trustindexWidgetId: '', rating: '5.0', count: 63, verifiedOn: 'Nov 17, 2026' }),
    booking: Object.freeze({
        endpoint: '',
        // Enable only after the owner confirms a real end-to-end email test.
        formsubmit: Object.freeze({
            endpoint: 'https://formsubmit.co/ajax/arsenij.moshko@gmail.com',
            verified: false
        })
    }),
    promotion: Object.freeze({ title: '', description: '', service: '', delayMs: 10000 }),
    callback: Object.freeze({ endpoint: '' })
});
