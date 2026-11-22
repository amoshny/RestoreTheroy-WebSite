/* Shared pure logic. No customer data or credentials in this source. */
const RT_HEADERS = ['Lead ID','Created At','Customer Name','Phone','Email','Service','Vehicle','ZIP Code','Source','UTM Source','UTM Medium','UTM Campaign','GCLID','GBRAID','WBRAID','Status','Qualified At','Booked At','Paid At','Revenue','Google Ads Import Status','Notes','Ads Attribution Verified','Measurement Allowed','Test Lead'];
function rtSafeCell(value) { const s=String(value ?? '').slice(0,4000); return /^[=+@\-\t\r\n]/.test(s) ? "'"+s : s; }
function rtEnvelope(text,decode) {
 const hits=[...text.matchAll(/RTP1:([A-Za-z0-9+/=]{20,40000})/g)];
 if (!hits.length) throw Error('ENVELOPE_MISSING');
 const values=[...new Set(hits.map(x=>x[1]))];if(values.length!==1)throw Error('ENVELOPE_AMBIGUOUS');
 const x=JSON.parse(decode(values[0]));
 if(x.version!==1 || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(x.requestId||''))throw Error('INVALID_LEAD');
 if(!Number.isFinite(Date.parse(x.createdAt))||!x.customerName||!x.phone||!x.service)throw Error('INVALID_FIELDS');
 return x;
}
function rtLeadRow(x,receivedAt) {
 // Attribution supplied by a browser is a candidate, never independently verified Google Ads evidence.
 return [x.requestId,new Date(receivedAt),x.customerName,x.phone,x.email||'',x.service,x.vehicle||'',x.zip||'','Unknown',x.attribution_utm_source||'',x.attribution_utm_medium||'',x.attribution_utm_campaign||'',x.attribution_gclid||'',x.attribution_gbraid||'',x.attribution_wbraid||'','New','','','','','Not prepared',x.notes||'',false,x.measurementAllowed===true,x.testLead===true].map(v=>typeof v==='string'?rtSafeCell(v):v);
}
function rtStatusDates(status,row,now) {
 if(!['New','Qualified','Unqualified','Booked','Paid'].includes(status))throw Error('INVALID_STATUS');
 const result=row.slice();result[15]=status;
 // Booked/Paid never backfill qualification automatically.
 const target={Qualified:16,Booked:17,Paid:18}[status];
 if(target!==undefined&&!result[target])result[target]=now;
 return result;
}
function rtExportCandidate(row,evidence={}) {
 // Eligibility is not proof of ad origin: Google performs click/account matching.
 // The legacy Ads Attribution Verified checkbox is deliberately ignored.
 if(row[24]===true)return {reason:'Test lead'};
 if(!['Qualified','Booked','Paid'].includes(row[15]) || !(row[16] instanceof Date) || !Number.isFinite(row[16].getTime()))return {reason:'Not manually qualified'};
 if(row[23]!==true)return {reason:'Measurement not allowed'};
 if(!evidence.registeredLeadIds?.has(row[0]))return {reason:'No authenticated form notification'};
 if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(row[0]||''))return {reason:'Invalid lead reference'};
 if(!/^[A-Za-z0-9._~-]{5,200}$/.test(row[12]||''))return {reason:row[13]||row[14]?'BRAID held: Count One requires GCLID-only':'No usable GCLID'};
 const now=evidence.now||new Date();
 if(!(row[1] instanceof Date)||!Number.isFinite(row[1].getTime())||row[16]<row[1]||row[16]>now||now-row[16]>90*86400000)return {reason:'Invalid or expired qualification time'};
 return {leadId:row[0],gclid:row[12],qualifiedAt:row[16],orderId:'rt-qualified-'+row[0],matchStatus:'Candidate — Google matching pending'};
}

if(typeof module!=='undefined')module.exports={RT_HEADERS,rtSafeCell,rtEnvelope,rtLeadRow,rtStatusDates,rtExportCandidate};
