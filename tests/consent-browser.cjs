const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || undefined});
 try {for(const width of [320,390,1440]) {
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',r=>r.abort());
  const base='http://127.0.0.1:8000';
  await page.goto(base+'/?gclid=TEST_LATE_ONLY&utm_source=google');
  await page.locator('#rt-privacy-choices:not([hidden])').waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('rt.attribution.v1')),null);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
  // Follow an actual ordinary link, without accepting. No link decoration or storage rescue.
  await page.locator('.rt-care-paths a[href="/essential-detail/"]').click();
  await page.locator('[data-choice="allow"]').click();
  assert.equal(await page.evaluate(()=>rtLeadTracking.canMeasure()),true);
  assert.equal(await page.evaluate(()=>localStorage.getItem('rt.attribution.v1')),null);
  // Revoke through footer controls without losing form inputs or reloading.
  await page.goto(base+'/request-a-quote/');
  await page.locator('#quote-name').fill('UNSENT LOCAL DRAFT');
  await page.locator('.rt-privacy-open').click();
  assert.equal(await page.locator('#rt-privacy-title').evaluate(e=>e===document.activeElement),true);
  await page.locator('[data-choice="deny"]').click();
  assert.equal(await page.locator('#quote-name').inputValue(),'UNSENT LOCAL DRAFT');
  assert.equal(await page.locator('.rt-privacy-open').evaluate(e=>e===document.activeElement),true);
  assert.equal(await page.evaluate(()=>rtLeadTracking.canMeasure()),false);
  await page.reload();assert.equal(await page.locator('#rt-privacy-choices').isHidden(),true);
  await page.locator('.rt-privacy-open').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#rt-privacy-choices').isHidden(),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
  assert.deepEqual(errors,[]);await context.close();
  // Accept on landing; then service -> form retains attribution.
  const c=await browser.newContext({viewport:{width,height:900}}),p=await c.newPage();await p.route('https://**/*',r=>r.abort());
  await p.goto(base+'/?gclid=TEST_ACCEPT_ONLY');await p.locator('[data-choice="allow"]').click();
  await p.goto(base+'/essential-detail/');await p.goto(base+'/request-a-quote/');
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('rt.attribution.v1')).gclid),'TEST_ACCEPT_ONLY');
  await c.close();
  console.log(width+'px consent UI passed: late grant, early grant, no pre-consent storage, revoke/draft retention, persisted decline, Escape/focus, no overflow');
 }
 const c=await browser.newContext();await c.addInitScript(()=>Object.defineProperty(navigator,'globalPrivacyControl',{get:()=>true}));
 const p=await c.newPage();await p.route('https://**/*',r=>r.abort());await p.goto('http://127.0.0.1:8000/?gclid=TEST_GPC');
 await p.locator('.rt-privacy-open').click();assert.equal(await p.locator('[data-choice="allow"]').isDisabled(),true);assert.equal(await p.evaluate(()=>rtLeadTracking.canMeasure()),false);assert.equal(await p.evaluate(()=>localStorage.getItem('rt.attribution.v1')),null);await c.close();console.log('GPC UI passed');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
