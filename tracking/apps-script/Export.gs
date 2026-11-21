// Native Data Manager feed preparation only. This script NEVER calls Google Ads.
function rtPrepareExport() {
 const props=PropertiesService.getScriptProperties();
 if(props.getProperty('EXPORT_ENABLED')!=='true')throw Error('Export disabled until Data Manager mapping and account reviewed');
 const id=props.getProperty('EXPORT_SHEET_ID');if(!id||id===props.getProperty('LEADS_SHEET_ID'))throw Error('Use a separate PRIVATE export workbook with no customer contacts');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try {
 const feed=SpreadsheetApp.openById(id).getSheets()[0];
 const headers=['Google Click ID','Conversion Name','Conversion Time','Order ID'];
 if(!feed.getLastRow())feed.appendRow(headers);
 if(JSON.stringify(feed.getRange(1,1,1,4).getValues()[0])!==JSON.stringify(headers))throw Error('EXPORT_SCHEMA_MISMATCH');
 const ids=new Set(feed.getLastRow()>1?feed.getRange(2,4,feed.getLastRow()-1,1).getValues().flat():[]);
 const s=rtBook_().getSheetByName('Leads');if(s.getLastRow()<2)return;
 const rows=s.getRange(2,1,s.getLastRow()-1,RT_HEADERS.length).getValues();
 rows.forEach((row,i)=>{
 const candidate=rtExportCandidate(row);
 if(candidate.reason){
  if(row[20]==='Prepared — check Ads diagnostics')rtLog_('Errors',row[0],'EXPORTED_LEAD_CHANGED_REVIEW_ADS');
  else s.getRange(i+2,21).setValue(candidate.reason);
  return;
 }
 if(!ids.has(candidate.orderId)){
  // ISO with explicit UTC offset is unambiguous across PST/PDT. Owner timestamps display in LA.
  const time=Utilities.formatDate(candidate.qualifiedAt,'America/Los_Angeles',"yyyy-MM-dd HH:mm:ssXXX");
  feed.appendRow([candidate.gclid,'RT — Qualified Lead',time,candidate.orderId]);ids.add(candidate.orderId);
  rtLog_('Export Ledger',candidate.leadId,'PREPARED_NOT_CONFIRMED_BY_ADS');
 }
 s.getRange(i+2,21).setValue('Prepared — check Ads diagnostics');
 });
 }finally{lock.releaseLock();}
}
