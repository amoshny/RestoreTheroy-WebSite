const {test}=require('node:test'),a=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../tracking/apps-script');
const source=fs.readFileSync(path.join(root,'lead-core.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'Code.gs'),'utf8');
test('export removes newly ineligible feed rows without claiming to retract previous Ads imports',()=>{
 const c=vm.createContext({console}),feedRows=[['Google Click ID','Conversion Name','Conversion Time','Order ID'],['OLD_ID','RT — Qualified Lead','2026-11-21 12:00:00-08:00','rt-qualified-old']],logs=[];
 vm.runInContext(source+'\n'+fs.readFileSync(path.join(root,'Export.gs'),'utf8'),c);
 const feed={getLastRow:()=>feedRows.length,getRange:(r,col,n,w)=>({getValues:()=>feedRows.slice(r-1,r-1+n).map(x=>x.slice(col-1,col-1+w))}),deleteRow:r=>feedRows.splice(r-1,1)};
 c.PropertiesService={getScriptProperties:()=>({getProperty:k=>({EXPORT_ENABLED:'true',EXPORT_SHEET_ID:'export',LEADS_SHEET_ID:'leads'})[k]})};
 c.SpreadsheetApp={openById:()=>({getSheets:()=>[feed]})};c.LockService={getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})};
 c.rtBook_=()=>({getSheetByName:()=>({getLastRow:()=>1})});c.rtLog_=(...x)=>logs.push(x);
 c.rtPrepareExport();a.equal(feedRows.length,1);a.equal(logs[0][2],'REMOVED_FROM_FEED_REVIEW_PRIOR_ADS_IMPORT');
});
