const {test}=require('node:test'),a=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../tracking/apps-script');
const source=fs.readFileSync(path.join(root,'lead-core.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'Code.gs'),'utf8');
const id='df674a79-faca-4047-928d-847635d52db2';
const lead={version:1,requestId:id,createdAt:'2026-11-21T18:00:00Z',customerName:'TECHNICAL TEST',phone:'8585550101',service:'essential',measurementAllowed:false,testLead:true};
const body='<td>RTP1:'+Buffer.from(JSON.stringify(lead)).toString('base64')+'</td>';
function runtime(){return vm.createContext({console,PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'submissions@formsubmit.co'})},Utilities:{base64Decode:s=>[...Buffer.from(s,'base64')],base64DecodeWebSafe:s=>[...Buffer.from(s,'base64url')],newBlob:bytes=>({getDataAsString:()=>Buffer.from(bytes).toString('utf8')})}});}
function mail(data,auth='mx.google.com; dkim=pass header.i=@formsubmit.co; spf=pass'){return {payload:{headers:[{name:'From',value:'FormSubmit <submissions@formsubmit.co>'},{name:'Subject',value:'Restore Theory Booking request '+id},{name:'Authentication-Results',value:auth}],parts:[{mimeType:'text/html',body:{data}}]}};}
test('Apps Script decoded Byte[] and REST unpadded base64url both parse the same actual-format envelope',()=>{
 const c=runtime();vm.runInContext(source,c);
 for(const data of [[...Buffer.from(body)].map(x=>x>127?x-256:x),Buffer.from(body).toString('base64url')])a.equal(c.rtParseMail_(mail(data)).requestId,id);
 a.equal(c.rtMimeText_({body:{data:[...Buffer.from('café ✓')]}})[0],'café ✓');
});
test('inbox parser rejects untrusted authentication and mismatched subject reference',()=>{
 const c=runtime();vm.runInContext(source,c);a.throws(()=>c.rtParseMail_(mail([...Buffer.from(body)],'dkim=pass header.i=@formsubmit.co;')),/AUTH_REVIEW_REQUIRED/);
 const m=mail([...Buffer.from(body)]);m.payload.headers[1].value='Booking request another';a.throws(()=>c.rtParseMail_(m),/REFERENCE_MISMATCH/);
});
test('runtime register appends New/Test exactly once and never invents quality or payment',()=>{
 const c=runtime();vm.runInContext(source,c);const rows=[],logs=[];c.rtLog_=(...x)=>logs.push(x);const s={appendRow:r=>rows.push(r)},ids=new Set();
 a.equal(c.rtRegister_(s,ids,lead,new Date()),true);a.equal(c.rtRegister_(s,ids,lead,new Date()),false);a.equal(rows.length,1);a.equal(logs.length,1);a.equal(rows[0][15],'New');a.equal(rows[0][16],'');a.equal(rows[0][18],'');a.equal(rows[0][23],false);a.equal(rows[0][24],true);
});
