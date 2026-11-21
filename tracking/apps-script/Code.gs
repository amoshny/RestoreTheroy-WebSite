// Private, owner-run Apps Script. NO doGet/doPost or web-app deployment.
// Requires Advanced Gmail service; read-only OAuth scope, no Gmail modification.
function rtBook_() {
 const id=PropertiesService.getScriptProperties().getProperty('LEADS_SHEET_ID');
 if(!id)throw Error('Set LEADS_SHEET_ID');return SpreadsheetApp.openById(id);
}
function rtSetup() {
 const book=rtBook_();book.setSpreadsheetTimeZone('America/Los_Angeles');
 let sheet=book.getSheetByName('Leads');if(!sheet)sheet=book.insertSheet('Leads');
 if(sheet.getLastRow())throw Error('Setup refuses to overwrite existing data');
 sheet.getRange(1,1,1,RT_HEADERS.length).setValues([RT_HEADERS]).setFontWeight('bold').setBackground('#173c28').setFontColor('#ffffff');
 sheet.setFrozenRows(1);sheet.getRange(1,1,1000,RT_HEADERS.length).createFilter();
 sheet.getRange(2,16,999,1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['New','Qualified','Unqualified','Booked','Paid'],true).setAllowInvalid(false).build());
 sheet.getRange(2,23,999,3).insertCheckboxes();
 sheet.getRange(2,2,999,1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
 sheet.getRange(2,17,999,3).setNumberFormat('yyyy-mm-dd hh:mm:ss');
 sheet.getRange(2,20,999,1).setNumberFormat('$0.00');sheet.autoResizeColumns(1,RT_HEADERS.length);
 sheet.getRange(1,23).setNote('Owner verifies ad origin using reliable records. UTM alone is insufficient. Do not tick for unknown SMS/calls.');
 sheet.getRange(1,24).setNote('Recorded permission at submission; a later withdrawal must also be honored before exporting.');
 ['Journal','Errors','Export Ledger'].forEach(name=>{if(!book.getSheetByName(name)){const s=book.insertSheet(name);s.appendRow(['At','Reference','Result']);s.setFrozenRows(1);}});
 // Warning protection prevents accidental timestamp edits; this is not an access-control boundary.
 sheet.getRange('Q:S').protect().setDescription('Automation timestamps; do not edit').setWarningOnly(true);
}
function rtLog_(tab,reference,code) {rtBook_().getSheetByName(tab).appendRow([new Date(),String(reference||'').slice(0,100),code]);}
function rtDecode_(data) {return Utilities.newBlob(Utilities.base64Decode(data)).getDataAsString('UTF-8');}
function rtMimeText_(part) {
 let texts=[];
 if(part.body&&part.body.data)texts.push(Utilities.newBlob(Utilities.base64DecodeWebSafe(part.body.data)).getDataAsString('UTF-8'));
 (part.parts||[]).forEach(p=>texts=texts.concat(rtMimeText_(p)));return texts;
}
function rtImportMail() {
 const props=PropertiesService.getScriptProperties();
 if(props.getProperty('IMPORT_ENABLED')!=='true')throw Error('Import disabled until sender/format verified');
 const sender=props.getProperty('VERIFIED_MAIL_SENDER');if(!/^[a-z0-9._+\-]+@[a-z0-9.\-]+$/i.test(sender||''))throw Error('Verify sender from actual FormSubmit email');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try {
 const sheet=rtBook_().getSheetByName('Leads');
 const ids=new Set(sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues().flat():[]);
 // Read-only mailbox query; include all mail states. No deleting/marking read/labels.
 const cursor=props.getProperty('MAIL_SCAN_UNTIL');
 const after=cursor?Math.max(0,Number(cursor)-86400):Math.floor(Date.now()/1000)-7*86400;
 const start=Math.floor(Date.now()/1000);
 let page;let failed=false;
 do {
 const listing=Gmail.Users.Messages.list('me',{q:'from:'+sender+' subject:"Restore Theory" after:'+after,maxResults:50,pageToken:page});
 for(const item of listing.messages||[]) {
  try {
   const mail=Gmail.Users.Messages.get('me',item.id,{format:'full'});
   const headers=mail.payload.headers||[],header=n=>(headers.find(h=>h.name.toLowerCase()===n)||{}).value||'';
   const from=header('from').match(/<([^>]+)>/)?.[1]||header('from').trim();
   if(from.toLowerCase()!==sender.toLowerCase()||!header('subject').includes('Booking request'))continue;
   // Require receiver-side DKIM authentication for the configured sender domain.
   const auth=headers.filter(h=>h.name.toLowerCase()==='authentication-results').map(h=>h.value).join(' ');
   const domain=sender.split('@')[1].replace(/\./g,'\\.');
   if(!new RegExp('dkim=pass[\\s\\S]*?header\\.(?:i=@|d=)'+domain+'(?:[\\s;]|$)','i').test(auth))throw Error('AUTH_REVIEW_REQUIRED');
   const lead=rtEnvelope(rtMimeText_(mail.payload).join('\n'),rtDecode_);
   if(!header('subject').includes(lead.requestId))throw Error('REFERENCE_MISMATCH');
   if(ids.has(lead.requestId))continue;
   sheet.appendRow(rtLeadRow(lead,new Date(Number(mail.internalDate))));ids.add(lead.requestId);
   rtLog_('Journal',lead.requestId,'REGISTERED_NEW');
  }catch(error){failed=true;rtLog_('Errors',item.id,['ENVELOPE_MISSING','AUTH_REVIEW_REQUIRED','REFERENCE_MISMATCH','INVALID_LEAD','INVALID_FIELDS','ENVELOPE_AMBIGUOUS'].includes(error.message)?error.message:'MAIL_PARSE_FAILED');}
 }
 page=listing.nextPageToken;
 }while(page);
 if(!failed)props.setProperty('MAIL_SCAN_UNTIL',String(start));
 }finally{lock.releaseLock();}
}
function rtOnEdit(e) {
 if(!e||e.range.getSheet().getName()!=='Leads'||e.range.getLastRow()<2)return;
 if(e.range.getColumn()>16||e.range.getLastColumn()<16)return;
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try {const s=e.range.getSheet();for(let r=Math.max(2,e.range.getRow());r<=e.range.getLastRow();r++){
 const row=s.getRange(r,1,1,RT_HEADERS.length).getValues()[0];
 const next=rtStatusDates(row[15],row,new Date());s.getRange(r,17,1,3).setValues([next.slice(16,19)]);
 rtLog_('Journal',row[0],'STATUS_'+row[15]);
 }}finally{lock.releaseLock();}
}
function rtInstallTriggers() {
 // Explicit owner action only after a manual successful import. Never duplicate triggers.
 const handlers=ScriptApp.getProjectTriggers().map(t=>t.getHandlerFunction());
 if(!handlers.includes('rtImportMail'))ScriptApp.newTrigger('rtImportMail').timeBased().everyMinutes(5).create();
 if(!handlers.includes('rtOnEdit'))ScriptApp.newTrigger('rtOnEdit').forSpreadsheet(rtBook_()).onEdit().create();
}
function rtAddManualLead() {
 const s=rtBook_().getSheetByName('Leads');
 const row=Array(RT_HEADERS.length).fill('');row[0]=Utilities.getUuid();row[1]=new Date();row[8]='Unknown';row[15]='New';row[20]='Not prepared';row[22]=false;row[23]=false;row[24]=false;s.appendRow(row);
}
