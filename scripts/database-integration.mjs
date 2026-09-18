import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHmac } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
if (process.env.SPM_DISPOSABLE_DATABASE !== '1') throw new Error('Run through scripts/verify-database.sh with its disposable database');
const gateway=createServer(async(req,res)=>{
  try {
    const chunks=[]; for await(const chunk of req)chunks.push(chunk);
    const response=await fetch('http://127.0.0.1:55438'+req.url.replace(/^\/rest\/v1/,''),{method:req.method,headers:{authorization:req.headers.authorization??'',prefer:req.headers.prefer??'','content-type':'application/json'},body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
    res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  } catch(error){res.writeHead(502);res.end(String(error));}
});
await new Promise(resolve=>gateway.listen(0,'127.0.0.1',resolve));
gateway.unref();
process.env.SUPABASE_URL = `http://127.0.0.1:${gateway.address().port}`;
const claims=[{alg:'HS256',typ:'JWT'},{role:'service_role',exp:Math.floor(Date.now()/1000)+3600}].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url')).join('.');
process.env.SUPABASE_KEY = claims+'.'+createHmac('sha256','disposable-test-secret-not-for-production-123').update(claims).digest('base64url');
const { getSupabaseClient } = await import(pathToFileURL(root+'dist/src/lib/data/supabase.js'));
const { syncSource } = await import(pathToFileURL(root+'dist/src/lib/ical/sync.js'));
const { runSyncJob } = await import(pathToFileURL(root+'dist/src/lib/jobs/sync.js'));
const client=getSupabaseClient();
async function checked(query) {const {data,error}=await query;if(error)throw error;return data;}
const props=await checked(client.from('properties').insert([{name:'Fixture A',slug:'fixture-a'},{name:'Fixture B',slug:'fixture-b'}]).select());
const sources=await checked(client.from('channel_sources').insert(props.map((p,i)=>({property_id:p.id,source_url:`https://fixture.invalid/${i}.ics`,refresh_rate:0}))).select());
const feed=(end='20261212')=>['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','UID:shared-external-uid@example.invalid','DTSTART;VALUE=DATE:20261210',`DTEND;VALUE=DATE:${end}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
const options={fetchFn:async()=>new Response(feed())};
for(const s of sources)assert.equal((await syncSource(s.id,options)).imported,1);
assert.equal((await syncSource(sources[0].id,options)).imported,0);
assert.equal((await syncSource(sources[0].id,{fetchFn:async()=>new Response(feed('20261213'))})).upserted,1);
const bookings=await checked(client.from('bookings').select('*'));
assert.equal(bookings.length,2);assert.notEqual(bookings[0].id,bookings[1].id);
assert.equal(bookings.find(b=>b.property_id===props[0].id).end_date,'2026-12-13');
assert.equal(bookings.find(b=>b.property_id===props[1].id).end_date,'2026-12-12');
const mappings=await checked(client.from('booking_mappings').select('*'));assert.equal(mappings.length,2);
// A lost mapping is repaired without duplicating its already persisted booking.
await checked(client.from('booking_mappings').delete().eq('channel_source_id',sources[0].id));
await syncSource(sources[0].id,options);
assert.equal((await checked(client.from('bookings').select('*'))).length,2);
await assert.rejects(()=>syncSource(sources[0].id,{fetchFn:async()=>new Response('unavailable',{status:503})}));
const runs=await checked(client.from('sync_runs').select('*'));assert.equal(runs.filter(r=>r.status==='failed').length,1);assert(runs.every(r=>r.finished_at));
assert.deepEqual((await runSyncJob()).results,[]);
console.log('PASS: real Postgres/PostgREST migrations, required SQL fields, source isolation, idempotent import, update, interrupted mapping repair, failure records, disabled-source exclusion.');

gateway.closeAllConnections(); gateway.close();
