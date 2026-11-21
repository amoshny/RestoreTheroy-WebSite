// Dependency-free logic tests; no external tags, email or conversions are sent.
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),{webcrypto}=require('node:crypto');
const source=fs.readFileSync('lead-tracking.js','utf8');
function setup({url='',local=new Map(),session=new Map(),gpc=false,blocked=false,id='',existing=false}={}) {
 const storage=m=>({getItem:k=>{if(blocked)throw Error();return m.get(k)||null},setItem:(k,v)=>{if(blocked)throw Error();m.set(k,v)},removeItem:k=>m.delete(k)});
 const scripts=[],w={dispatchEvent:()=>{},rtTrackingConfig:{gtmId:id},localStorage:storage(local),sessionStorage:storage(session)};
 const c={window:w,navigator:{globalPrivacyControl:gpc},location:{search:url,reload(){}},document:{querySelector:()=>existing?{}:null,createElement:()=>({}),head:{append:s=>s.src?.startsWith('https://') && scripts.push(s)}},URLSearchParams,TextEncoder,crypto:webcrypto,Date,Event};vm.runInNewContext(source,c);return {api:w.rtLeadTracking,w,scripts,local,session};
}
test('default denied, GPC override and grant/revoke',async()=>{
 let x=setup({url:'?gclid=TEST_ONLY&unknown=secret'});assert.equal(x.api.canMeasure(),false);assert.equal((await x.api.prepare({name:'Test'})).attribution,null);assert.equal(x.scripts.length,0);
 x.api.setConsent(true);let a=await x.api.prepare({name:'Different'});assert.equal(a.attribution.gclid,'TEST_ONLY');assert.equal(a.attribution.unknown,undefined);
 x.api.setConsent(false);assert.equal((await x.api.prepare({name:'Different'})).attribution,null);assert.equal(x.local.has('rt.attribution.v1'),false);
 x=setup({gpc:true,url:'?gclid=TEST_ONLY'});x.api.setConsent(true);assert.equal(x.api.canMeasure(),false);
});
test('navigation, fresh campaign replacement, expiry and validation',async()=>{
 let a=setup({url:'?gclid=TEST_ONLY&gbraid=TEST_B&wbraid=TEST_W&utm_source=google&utm_medium=cpc&utm_campaign=demo'});a.api.setConsent(true);
 let b=setup({local:a.local,url:''});assert.equal((await b.api.prepare({service:'test'})).attribution.gclid,'TEST_ONLY');
 b=setup({local:a.local,url:'?utm_source=newsletter&utm_medium=email'});let r=await b.api.prepare({service:'test'});assert.equal(r.attribution.gclid,undefined);assert.equal(r.attribution.utm_source,'newsletter');
 a.local.set('rt.attribution.v1',JSON.stringify({gclid:'expired',capturedAt:Date.now()-31*86400000}));b=setup({local:a.local});assert.equal((await b.api.prepare({})).attribution,null);
 b=setup({local:a.local,url:'?gclid=%3Cscript%3E&utm_source=%00bad'});assert.equal((await b.api.prepare({})).attribution,null);
});
test('stable lead across reload/retry, acceptance once, new data new identity',async()=>{
 let a=setup(),one=await a.api.prepare({phone:'8585550101',service:'essential'});
 let b=setup({session:a.session});let two=await b.api.prepare({service:'essential',phone:'8585550101'});assert.equal(one.requestId,two.requestId);assert.equal(b.api.accept(two.requestId),true);assert.equal(b.api.accept(two.requestId),false);
 b=setup({session:a.session});assert.equal((await b.api.prepare({phone:'8585550101',service:'essential'})).accepted,true);assert.notEqual((await b.api.prepare({phone:'8585550101',service:'deep-clean'})).requestId,two.requestId);assert.ok(![...a.session.values()].join('').includes('8585550101'));
});
test('blocked storage keeps identity in memory and does not break requests',async()=>{const a=setup({blocked:true});const one=await a.api.prepare({test:1});assert.equal((await a.api.prepare({test:1})).requestId,one.requestId)});
test('empty/invalid GTM ID no request; valid ID once after consent; existing tag skipped',()=>{
 for(const id of ['', 'not-a-container']){const a=setup({id});a.api.setConsent(true);assert.equal(a.scripts.length,0)}
 const a=setup({id:'GTM-TESTONLY'});assert.equal(a.scripts.length,0);a.api.setConsent(true);a.api.setConsent(true);assert.equal(a.scripts.length,1);
 const b=setup({id:'GTM-TESTONLY',existing:true});b.api.setConsent(true);assert.equal(b.scripts.length,0);
});

test('late consent after untagged navigation cannot recover discarded click; no pre-consent storage', async()=>{
 const a=setup({url:'?gclid=TEST_LATE&utm_source=google'});
 assert.equal(a.api.consentState(),'unknown');assert.equal(a.local.has('rt.attribution.v1'),false);assert.equal(a.session.has('rt.attribution.v1'),false);
 const b=setup({local:a.local,session:a.session,url:''});b.api.setConsent(true);
 assert.equal((await b.api.prepare({test:1})).attribution,null);
});
test('grant on arrival preserves click across navigation; decline persists and revoke leaves identity', async()=>{
 const a=setup({url:'?gclid=TEST_FIRST'});const before=await a.api.prepare({test:1});a.api.setConsent(true);
 const after=await a.api.prepare({test:1});assert.equal(after.requestId,before.requestId);assert.equal(after.attribution.gclid,'TEST_FIRST');
 const b=setup({local:a.local,session:a.session});assert.equal((await b.api.prepare({test:1})).attribution.gclid,'TEST_FIRST');
 b.api.setConsent(false);const c=setup({local:a.local,session:a.session});assert.equal(c.api.consentState(),'denied');assert.equal((await c.api.prepare({test:1})).attribution,null);
});
