// Run with NODE_PATH pointing to the installed Playwright package directory; local server required.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || undefined});try{
for(const width of [390,1440]){
const ctx=await b.newContext({viewport:{width,height:880}}),p=await ctx.newPage(),errors=[],payloads=[];p.on('pageerror',e=>errors.push(e.message));
await p.route('https://**/*',r=>{if(r.request().url().includes('formsubmit.co/ajax/')){payloads.push(r.request().postDataJSON());return r.fulfill({json:payloads.length===1?{success:false}:{success:true}})}return r.abort()});
const base='http://127.0.0.1:8000';await p.goto(base+'/?gclid=TEST_ONLY_NOT_A_REAL_CLICK&utm_source=google&utm_medium=cpc');
assert.equal(await p.evaluate(()=>rtLeadTracking.canMeasure()),false);await p.evaluate(()=>rtLeadTracking.setConsent(true));
await p.goto(base+'/essential-detail/');await p.goto(base+'/request-a-quote/?service=essential');
const fill=async()=>{await p.locator('#quote-size').selectOption('mid-suv');await p.locator('#quote-condition').selectOption('3');await p.locator('#quote-zip').fill('92131');await p.locator('#quote-name').fill('LOCAL TEST ONLY');await p.locator('#quote-phone').fill('8585550101')};await fill();
await p.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('a[href^="sms:"]'))e.preventDefault()},true));
await p.locator('button[value="sms"]').click();const sms=decodeURIComponent(await p.locator('#rt-quote-draft').getAttribute('href'));assert.match(sms,/Reference: [a-f0-9-]{36}/);assert.ok(!sms.includes('TEST_ONLY_NOT_A_REAL_CLICK'));assert.equal(payloads.length,0);await p.waitForTimeout(1500);
await p.locator('#rt-booking-submit').click();await p.getByText('Delivery could not be confirmed.',{exact:false}).waitFor();assert.equal(await p.evaluate(()=>dataLayer.filter(x=>x.event==='booking_request_submitted').length),0);
const firstId=payloads[0].requestId;assert.ok(sms.includes(firstId));assert.equal(payloads[0].attribution_gclid,'TEST_ONLY_NOT_A_REAL_CLICK');
await p.reload();await fill();await p.locator('#rt-booking-submit').click();await p.locator('#rt-quote-form').evaluate(f=>{f.requestSubmit();f.requestSubmit()});await p.getByText('Request received!',{exact:false}).waitFor();assert.equal(payloads.length,2);assert.equal(payloads[1].requestId,firstId);
let events=await p.evaluate(()=>dataLayer.filter(x=>x.event==='booking_request_submitted'));assert.equal(events.length,1);assert.equal(events[0].lead_id,firstId);assert.ok(!JSON.stringify(events).includes('8585550101'));
await p.reload();await fill();await p.locator('#rt-booking-submit').click();await p.getByText('This request has already been received.',{exact:false}).waitFor();assert.equal(payloads.length,2);
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),width);assert.deepEqual(errors,[]);
// Denied consent still allows normal email delivery, without attribution or measurement event.
await p.evaluate(()=>rtLeadTracking.setConsent(false));await p.reload();await fill();await p.locator('#quote-name').fill('SECOND LOCAL TEST');await p.locator('#rt-booking-submit').click();await p.getByText('Request received!',{exact:false}).waitFor();assert.ok(!Object.keys(payloads[2]).some(k=>k.startsWith('attribution_')));assert.equal(await p.evaluate(()=>dataLayer.filter(x=>x.event==='booking_request_submitted').length),0);
console.log(width+'px passed: consent, navigation, SMS reference, failure/reload/retry, duplicate suppression, accepted-only event, email without consent');await ctx.close();
}}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
