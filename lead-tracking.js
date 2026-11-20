// Consent-gated attribution; no customer contact fields are stored here.
(() => {
    'use strict';
    const consentKey = 'rt.ads-consent.v1';
    const attributionKey = 'rt.attribution.v1';
    const leadKey = 'rt.lead.v1';
    const keys = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'];
    const read = (storage, key) => { try { return JSON.parse(window[storage].getItem(key)); } catch { return null; } };
    const write = (storage, key, value) => { try { window[storage].setItem(key, JSON.stringify(value)); } catch { /* Private browsing must not block requests. */ } };
    const remove = (storage, key) => { try { window[storage].removeItem(key); } catch { /* Storage may be blocked. */ } };
    const gpc = () => navigator.globalPrivacyControl === true;
    let savedConsent = read('localStorage', consentKey);
    const validConsent = () => typeof savedConsent?.granted === 'boolean' && Number.isFinite(savedConsent.at) && savedConsent.at <= Date.now() && Date.now() - savedConsent.at < 180 * 86400000;
    let allowed = !gpc() && validConsent() && savedConsent.granted;
    const consentState = () => gpc() ? 'gpc' : allowed ? 'granted' : validConsent() ? 'denied' : 'unknown';
    let attribution = null;
    let lead = read('sessionStorage', leadKey);
    let loaded = false;
    const ttl = Math.min(90, Math.max(1, Number(window.rtTrackingConfig?.attributionDays) || 30)) * 86400000;
    const valid = record => record && Number.isFinite(record.capturedAt) && record.capturedAt <= Date.now() && Date.now() - record.capturedAt < ttl;
    function capture() {
        if (!allowed || gpc()) return null;
        const params = new URLSearchParams(location.search);
        const values = {};
        for (const key of keys) {
            const value = params.get(key);
            // Ignore oversized, control-character and malformed identifiers. Never save the full URL.
            if (value && value.length <= 200 && !/[\x00-\x1f\x7f]/.test(value) && (key.startsWith('utm_') || /^[A-Za-z0-9._~-]+$/.test(value))) values[key] = value;
        }
        if (Object.keys(values).length) {
            attribution = {...values, capturedAt: Date.now()};
            write('localStorage', attributionKey, attribution);
        } else {
            const stored = read('localStorage', attributionKey);
            attribution = valid(stored) ? stored : null;
            if (!attribution) remove('localStorage', attributionKey);
        }
        return attribution;
    }
    function googleConsent(command, granted) {
        // No enhanced user data or remarketing permission is inferred from measurement consent.
        const state = {ad_storage: granted ? 'granted' : 'denied', analytics_storage: granted ? 'granted' : 'denied', ad_user_data: 'denied', ad_personalization: 'denied'};
        function enqueue() { (window.dataLayer ||= []).push(arguments); }
        enqueue('consent', command, state);
    }
    googleConsent('default', false);
    function loadTag() {
        const id = window.rtTrackingConfig?.gtmId;
        if (!allowed || gpc() || loaded || !/^GTM-[A-Z0-9]+$/.test(id || '')) return;
        // Never install a second Google tag/container alongside an existing installation.
        if (window.google_tag_manager || typeof window.gtag === 'function' || document.querySelector('script[src*="googletagmanager.com/"], script[src*="google-analytics.com/"]')) return;
        loaded = true;
        googleConsent('update', true);
        (window.dataLayer ||= []).push({'gtm.start': Date.now(), event: 'gtm.js'});
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtm.js?id=' + id;
        document.head.append(script);
    }
    function setConsent(granted) {
        allowed = granted === true && !gpc();
        savedConsent = {granted: allowed, at: Date.now()};
        write('localStorage', consentKey, savedConsent);
        googleConsent('update', allowed);
        if (allowed) { capture(); loadTag(); }
        else {
            attribution = null;
            remove('localStorage', attributionKey);
            if (lead) { lead.attribution = null; write('sessionStorage', leadKey, lead); }
            // Notify an already loaded container; its consent settings must also be configured.
            (window.dataLayer ||= []).push({event: 'rt_consent_revoked'});
            // Do not reload and erase a partly filled inquiry. GTM tags must require
            // granted storage consent; our event sender is stopped immediately.
            // Previously loaded Google code may send consent-state pings.
            // On the next navigation, no container is loaded while denied.
        }
        window.dispatchEvent(new Event('rt-consent-change'));
    }
    window.rtLeadTracking = Object.freeze({
        setConsent,
        consentState,
        canMeasure: () => allowed && !gpc(),
        async prepare(request) {
            const bytes = new TextEncoder().encode(JSON.stringify(Object.keys(request).sort().map(key => [key, request[key]])));
            const digest = await crypto.subtle.digest('SHA-256', bytes);
            const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
            if (!lead || lead.fingerprint !== fingerprint || !valid({capturedAt: lead.createdAt})) {
                lead = {requestId: crypto.randomUUID(), fingerprint, createdAt: Date.now(), accepted: false, attribution: allowed && valid(attribution) ? {...attribution} : null};
            }
            if (!allowed || gpc()) lead.attribution = null;
            else if (!lead.accepted && !lead.attribution && valid(attribution)) lead.attribution = {...attribution};
            write('sessionStorage', leadKey, lead);
            return {requestId: lead.requestId, createdAt: new Date(lead.createdAt).toISOString(), accepted: lead.accepted, attribution: lead.attribution};
        },
        accept(id) {
            if (!lead || lead.requestId !== id || lead.accepted) return false;
            lead.accepted = true;
            write('sessionStorage', leadKey, lead);
            return true;
        }
    });
    if (allowed) { capture(); loadTag(); }
    else {
        remove('localStorage', attributionKey);
        if (lead) { lead.attribution = null; write('sessionStorage', leadKey, lead); }
    }
    // Controls are local and independent of any external tag/container.
    const controls = document.createElement('script');
    controls.src = '/consent-controls.js?v=pr28-review';
    document.head.append(controls);
})();
