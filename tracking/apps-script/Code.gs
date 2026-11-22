// Owner-owned private Apps Script. No public web endpoint and no Google Ads calls.
function rtBook_(){const id=PropertiesService.getScriptProperties().getProperty('LEADS_SHEET_ID');if(!id)throw Error('Set LEADS_SHEET_ID');return SpreadsheetApp.openById(id);}
function rtLog_(tab,id,code){rtBook_().getSheetByName(tab).appendRow([new Date(),String(id||'').slice(0,100),code]);}
function rtConfigure(){
 const p=PropertiesService.getScriptProperties();
 if(!p.getProperty('LEADS_SHEET_ID'))p.setProperty('LEADS_SHEET_ID',SpreadsheetApp.getActiveSpreadsheet().getId());
 if(!p.getProperty('VERIFIED_MAIL_SENDER'))p.setProperty('VERIFIED_MAIL_SENDER','submissions@formsubmit.co');
 if(!p.getProperty('IMPORT_ENABLED'))p.setProperty('IMPORT_ENABLED','false');
 const b=rtBook_(),s=b.getSheetByName('Leads');
 if(!s||JSON.stringify(s.getRange(1,1,1,25).getValues()[0])!==JSON.stringify(RT_HEADERS))throw Error('SHEET_SCHEMA_MISMATCH');
 b.setSpreadsheetTimeZone('America/Los_Angeles');
 s.getRange('B2:B').setNumberFormat('yyyy-mm-dd hh:mm:ss');['Q','R','S'].forEach(c=>s.getRange(c+'2:'+c).setNumberFormat('yyyy-mm-dd hh:mm:ss'));s.getRange('T2:T').setNumberFormat('$0.00');
 if(!s.getProtections(SpreadsheetApp.ProtectionType.RANGE).some(x=>x.getDescription()==='Automation timestamps'))s.getRange('Q:S').protect().setDescription('Automation timestamps').setWarningOnly(true);
 s.getRange('W1').setNote('Legacy checkbox: ignored by export. Automatic notification provenance and Google matching replace this manual flag.');s.hideColumns(23);
 s.getRange('X1').setNote('Recorded permission at submission. Honor subsequent withdrawal before export.');
}
function rtMimeBytes_(data){
 // Advanced Gmail returns decoded Byte[]; Gmail REST returns a base64url string.
 if(Array.isArray(data))return data;
 const text=String(data);return Utilities.base64DecodeWebSafe(text.padEnd(Math.ceil(text.length/4)*4,'='));
}
function rtMimeText_(part){let a=[];if(part.body?.data)a.push(Utilities.newBlob(rtMimeBytes_(part.body.data)).getDataAsString('UTF-8'));for(const x of part.parts||[])a=a.concat(rtMimeText_(x));return a;}
function rtParseMail_(m){
 const h=m.payload.headers||[],get=n=>(h.find(x=>x.name.toLowerCase()===n)||{}).value||'';
 const sender=PropertiesService.getScriptProperties().getProperty('VERIFIED_MAIL_SENDER');
 if(!/^[a-z0-9._+\-]+@[a-z0-9.\-]+$/i.test(sender||''))throw Error('INVALID_SENDER_CONFIG');
 const from=get('from').match(/<([^>]+)>/)?.[1]||get('from').trim();
 if(from.toLowerCase()!==sender.toLowerCase()||!get('subject').includes('Booking request'))return null;
 const auth=h.filter(x=>x.name.toLowerCase()==='authentication-results').map(x=>x.value).join(' '),domain=sender.split('@')[1].replace(/\./g,'\\.');
 if(!new RegExp('mx.google.com;[\\s\\S]*?dkim=pass[\\s\\S]*?header\\.(?:i=@|d=)'+domain+'(?:[\\s;]|$)','i').test(auth))throw Error('AUTH_REVIEW_REQUIRED');
 const x=rtEnvelope(rtMimeText_(m.payload).join('\n'),data=>Utilities.newBlob(Utilities.base64Decode(data)).getDataAsString('UTF-8'));
 if(!get('subject').includes(x.requestId))throw Error('REFERENCE_MISMATCH');return x;
}
function rtRegister_(s,ids,x,at){if(ids.has(x.requestId))return false;s.appendRow(rtLeadRow(x,at));ids.add(x.requestId);rtLog_('Journal',x.requestId,'REGISTERED_NEW');return true;}
function rtRegisteredLeadIds_(){const j=rtBook_().getSheetByName('Journal');return new Set(j.getLastRow()>1?j.getRange(2,2,j.getLastRow()-1,2).getValues().filter(r=>['REGISTERED_NEW','AUTHENTICATED_NOTIFICATION'].includes(r[1])).map(r=>r[0]):[]);}
function rtImportMail(){
 const p=PropertiesService.getScriptProperties();if(p.getProperty('IMPORT_ENABLED')!=='true')throw Error('IMPORT_DISABLED');
 const sender=p.getProperty('VERIFIED_MAIL_SENDER');if(!/^[a-z0-9._+\-]+@[a-z0-9.\-]+$/i.test(sender||''))throw Error('INVALID_SENDER_CONFIG');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
 const b=rtBook_(),s=b.getSheetByName('Leads'),ids=new Set(s.getLastRow()>1?s.getRange(2,1,s.getLastRow()-1,1).getValues().flat():[]);
 const registered=rtRegisteredLeadIds_();
 const errors=b.getSheetByName('Errors'),reviewCodes=['AUTH_REVIEW_REQUIRED','ENVELOPE_MISSING','ENVELOPE_AMBIGUOUS','INVALID_LEAD','INVALID_FIELDS','REFERENCE_MISMATCH'];
 const reviewed=new Set(errors.getLastRow()>1?errors.getRange(2,2,errors.getLastRow()-1,2).getValues().filter(r=>reviewCodes.includes(r[1])).map(r=>r[0]):[]);
 const start=Math.floor(Date.now()/1000),cursor=p.getProperty('MAIL_SCAN_UNTIL'),after=cursor?Number(cursor)-86400:start-7*86400;
 let token,failed=false;
 do{
 const list=Gmail.Users.Messages.list('me',{q:'from:'+sender+' subject:"Booking request" after:'+after,maxResults:50,pageToken:token});
 for(const item of list.messages||[]){if(reviewed.has(item.id))continue;try{
 const m=Gmail.Users.Messages.get('me',item.id,{format:'full'}),x=rtParseMail_(m);if(x){rtRegister_(s,ids,x,new Date(Number(m.internalDate)));if(!registered.has(x.requestId)){rtLog_('Journal',x.requestId,'AUTHENTICATED_NOTIFICATION');registered.add(x.requestId);}}
 }catch(e){
 const permanent=['AUTH_REVIEW_REQUIRED','ENVELOPE_MISSING','ENVELOPE_AMBIGUOUS','INVALID_LEAD','INVALID_FIELDS','REFERENCE_MISMATCH'].includes(e.message);
 rtLog_('Errors',item.id,permanent?e.message:'MAIL_PROCESS_FAILED');
 if(permanent)reviewed.add(item.id);else failed=true;
 }}token=list.nextPageToken;
 }while(token);
 // Reviewed malformed/legacy mail stays in Gmail and Errors for manual recovery.
 // Transient failures keep the cursor; they must not silently lose a request.
 if(!failed)p.setProperty('MAIL_SCAN_UNTIL',String(start));
 }finally{lock.releaseLock();}
}
function rtOnEdit(e){
 if(!e||e.range.getSheet().getName()!=='Leads'||e.range.getColumn()>16||e.range.getLastColumn()<16)return;
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{const s=e.range.getSheet();for(let r=Math.max(2,e.range.getRow());r<=e.range.getLastRow();r++){
 const row=s.getRange(r,1,1,25).getValues()[0];if(!row[0])continue;
 const next=rtStatusDates(row[15],row,new Date());s.getRange(r,17,1,3).setValues([next.slice(16,19)]);rtLog_('Journal',row[0],'STATUS_'+row[15]);
 }}finally{lock.releaseLock();}
}
function rtInstallTriggers(){
 if(PropertiesService.getScriptProperties().getProperty('IMPORT_ENABLED')!=='true')throw Error('Verify import before installing triggers');
 const handlers=ScriptApp.getProjectTriggers().map(x=>x.getHandlerFunction());
 if(!handlers.includes('rtImportMail'))ScriptApp.newTrigger('rtImportMail').timeBased().everyMinutes(5).create();
 if(!handlers.includes('rtOnEdit'))ScriptApp.newTrigger('rtOnEdit').forSpreadsheet(rtBook_()).onEdit().create();
}
function rtAddManualLead(){const s=rtBook_().getSheetByName('Leads'),row=Array(25).fill('');row[0]=Utilities.getUuid();row[1]=new Date();row[8]='Unknown';row[15]='New';row[20]='Not prepared';row[22]=false;row[23]=false;row[24]=false;s.appendRow(row);}
