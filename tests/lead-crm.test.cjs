const {test}=require('node:test'),a=require('node:assert/strict');
const {rtSafeCell,rtEnvelope,rtLeadRow,rtStatusDates,rtExportCandidate}=require('../tracking/apps-script/lead-core.js');
const id='df674a79-faca-4047-928d-847635d52db2';
const sample={version:1,requestId:id,createdAt:'2026-11-21T18:00:00Z',customerName:'LOCAL TEST',phone:'8585550101',service:'essential',attribution_gclid:'TEST_ONLY_ID',measurementAllowed:true,testLead:true};
const decode=s=>Buffer.from(s,'base64').toString('utf8');
test('versioned email transport Unicode round trip and malformed/ambiguous rejection',()=>{
 const data={...sample,notes:'Test café ✓'};const enc=Buffer.from(JSON.stringify(data)).toString('base64');a.deepEqual(rtEnvelope('<td>RTP1:'+enc+'</td>',decode),data);
 a.throws(()=>rtEnvelope('Old email without envelope',decode));a.throws(()=>rtEnvelope('RTP1:'+enc+' RTP1:'+Buffer.from(JSON.stringify({...data,phone:'different'})).toString('base64'),decode));
});
test('new rows are unqualified/unknown, formula-safe and never infer Ads from UTM',()=>{
 const row=rtLeadRow({...sample,customerName:'=IMPORTXML("bad")',attribution_utm_source:'google'},new Date());a.equal(row[15],'New');a.equal(row[8],'Unknown');a.equal(row[22],false);a.equal(row[2][0],"'");a.equal(rtSafeCell('+1555'),"'+1555");
});
test('qualification timestamp once; booked/paid cannot fabricate qualification',()=>{
 const row=rtLeadRow(sample,new Date('2026-11-21T18:00:00Z')),t=new Date('2026-11-21T18:30:00Z');
 const q=rtStatusDates('Qualified',row,t);const b=rtStatusDates('Booked',q,new Date('2026-11-21T19:00:00Z'));const p=rtStatusDates('Paid',b,new Date());a.equal(p[16],t);a.equal(rtStatusDates('Qualified',p,new Date())[16],t);a.equal(rtStatusDates('Paid',row,t)[16],'');a.throws(()=>rtStatusDates('Fake',row,t));
});
test('export requires manual quality, verified origin, measurement, valid time and no tests',()=>{
 let r=rtLeadRow(sample,new Date('2026-11-21T18:00:00Z'));r=rtStatusDates('Qualified',r,new Date('2026-11-21T18:30:00Z'));r[22]=true;a.equal(rtExportCandidate(r).reason,'Test lead');r[24]=false;
 const c=rtExportCandidate(r);a.equal(c.orderId,'rt-qualified-'+id);a.equal(c.gclid,'TEST_ONLY_ID');a.equal(rtExportCandidate(rtStatusDates('Paid',r,new Date())).orderId,c.orderId);
 r[23]=false;a.ok(rtExportCandidate(r).reason);r[23]=true;r[22]=false;a.ok(rtExportCandidate(r).reason);r[22]=true;r[12]='';r[13]='BRAID_ONLY';a.match(rtExportCandidate(r).reason,/BRAID/);
});
