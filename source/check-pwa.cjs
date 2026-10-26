const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),site=path.join(root,'dist/pwa'),offline=fs.readFileSync(path.join(root,'Potion-Maker.html'),'utf8'),html=fs.readFileSync(path.join(site,'index.html'),'utf8'),worker=fs.readFileSync(path.join(site,'service-worker.js'),'utf8'),manifest=JSON.parse(fs.readFileSync(path.join(site,'manifest.webmanifest'),'utf8'));
assert(!offline.includes('data-pmg-pwa'),'Standalone download must stay independent of service workers');
assert(html.includes('data-pmg-pwa')&&html.includes('rel="manifest"'));
assert.equal(manifest.id,'./');assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');assert.equal(manifest.display,'standalone');
for(const icon of manifest.icons){const bytes=fs.readFileSync(path.join(site,icon.src)),[w,h]=icon.sizes.split('x').map(Number);assert.equal(bytes.readUInt32BE(16),w);assert.equal(bytes.readUInt32BE(20),h);}
assert(manifest.icons.some(i=>i.purpose==='maskable'));
const version=html.match(/name="pmg-pwa-build" content="([a-f0-9]+)"/)[1];assert(worker.includes('const VERSION='+JSON.stringify(version)));
new vm.Script(worker);new vm.Script(fs.readFileSync(path.join(root,'source/pwa.js'),'utf8'));

const scope='https://example.test/PMG/',prefix='pmg-pwa:'+scope+':';
function environment(version,store=new Map(),failure=false,mismatch=false){
 const handlers={},messages=[],calls={claim:0,skip:0,fetch:0};
 const caches={async open(name){if(!store.has(name))store.set(name,new Map());const items=store.get(name);return{async match(key){return items.get(String(key))?.clone();},async put(key,response){items.set(String(key),response.clone());}};},async keys(){return[...store.keys()];},async delete(name){return store.delete(name);}};
 const self={registration:{scope},clients:{async matchAll(){return[{url:scope,postMessage:data=>messages.push(data)}];},async claim(){calls.claim++;}},async skipWaiting(){calls.skip++;},addEventListener(type,handler){handlers[type]=handler;}};
 const context=vm.createContext({self,caches,URL,Request,Response,Headers,Error,fetch:async request=>{calls.fetch++;const target=new URL(request.url||request);if(failure&&target.pathname.endsWith('index.html'))return new Response('failed',{status:503});return new Response(target.pathname.endsWith('index.html')?'<meta name="pmg-pwa-build" content="'+(mismatch?'wrong':version)+'">':'asset',{headers:{'Content-Type':target.pathname.endsWith('index.html')?'text/html':'application/octet-stream'}});}});
 vm.runInContext(fs.readFileSync(path.join(root,'source/service-worker.js'),'utf8').replace('__PWA_VERSION__',JSON.stringify(version)),context);
 async function event(type,extra={}){const work=[];handlers[type]({waitUntil:p=>work.push(p),...extra});await Promise.all(work);}
 async function fetch(request){let result;handlers.fetch({request,respondWith:p=>result=p});return result?await result:null;}
 return{store,calls,messages,event,fetch};
}
(async()=>{
 const a=environment('first');await a.event('install');assert.equal(a.calls.skip,0,'Never force a mid-game update');assert.equal(a.store.get(prefix+'first').size,6);
 await a.event('activate');assert.equal(a.calls.claim,1);
 const page=await a.fetch({url:scope+'?v=anything',method:'GET'});assert((await page.text()).includes('first'));assert.equal(a.calls.fetch,6,'Game navigation uses the complete cache');
 assert.equal(await a.fetch({url:'https://another.test/game',method:'GET'}),null);assert.equal(await a.fetch({url:scope+'save.pmgsave',method:'GET'}),null);
 let status;await a.event('message',{data:{type:'PMG_OFFLINE_STATUS'},ports:[{postMessage:s=>status=s}]});assert(status.ready);
 const failed=environment('failed',a.store,true);await assert.rejects(failed.event('install'));assert(a.store.has(prefix+'first'));assert(!a.store.has(prefix+'failed'));
 const mismatched=environment('mismatched',a.store,false,true);await assert.rejects(mismatched.event('install'));assert(!a.store.has(prefix+'mismatched'));
 a.store.set('unrelated-app-cache',new Map());const b=environment('second',a.store);await b.event('install');assert(a.store.has(prefix+'first'),'Old offline game stays until activation');await b.event('message',{data:{type:'PMG_ACTIVATE_UPDATE'}});assert.equal(b.calls.skip,1);await b.event('activate');assert(!a.store.has(prefix+'first'));assert(a.store.has('unrelated-app-cache'));
 a.store.get(prefix+'second').delete(scope+'icons/icon-192.png');await b.event('message',{data:{type:'PMG_OFFLINE_STATUS'},ports:[{postMessage:s=>status=s}]});assert(!status.ready);await b.event('message',{data:{type:'PMG_REPAIR_OFFLINE'}});await b.event('message',{data:{type:'PMG_OFFLINE_STATUS'},ports:[{postMessage:s=>status=s}]});assert(status.ready);
 console.log('Passed: install manifest/icons, independent offline HTML, complete versioned cache, cached navigation, explicit update activation, failed/mismatched update rollback, cache repair and scope-safe cleanup.');
})().catch(error=>{console.error(error);process.exitCode=1;});
