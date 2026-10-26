// Each complete release has its own cache. Failed updates never replace the active one.
const VERSION=__PWA_VERSION__;
const PREFIX='pmg-pwa:'+self.registration.scope+':';
const CACHE=PREFIX+VERSION;
const FILES=['index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-180.png'];
const url=file=>new URL(file,self.registration.scope).href;

async function notify(data){for(const client of await self.clients.matchAll({includeUncontrolled:true,type:'window'})){if(client.url.startsWith(self.registration.scope))client.postMessage(data);}}
async function complete(){const cache=await caches.open(CACHE);return (await Promise.all(FILES.map(file=>cache.match(url(file))))).every(Boolean);}
async function download(){
 const cache=await caches.open(CACHE);
 await Promise.all(FILES.map(async file=>{
  const request=new URL(url(file));request.searchParams.set('offline-build',VERSION);
  let response=await fetch(new Request(request,{cache:'reload'}));
  if(!response.ok||response.type==='opaque'||file==='index.html'&&!response.headers.get('Content-Type')?.includes('text/html'))throw Error('Incomplete offline download');
  if(file==='index.html'){
   const body=await response.text();
   if(!body.includes('<meta name="pmg-pwa-build" content="'+VERSION+'">'))throw Error('Release changed during download');
   const headers=new Headers(response.headers);headers.delete('Content-Encoding');headers.delete('Content-Length');
   response=new Response(body,{headers});
  }
  await cache.put(url(file),response);
 }));
}

self.addEventListener('install',event=>event.waitUntil((async()=>{
 try{
  await download();
  await notify({type:'PMG_OFFLINE_STATUS',ready:true,version:VERSION});
 }catch(error){await caches.delete(CACHE);await notify({type:'PMG_OFFLINE_STATUS',ready:false,error:'Offline download could not finish. Your previous offline version is unchanged.'});throw error;}
})()));

self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
 await notify({type:'PMG_OFFLINE_STATUS',ready:await complete(),version:VERSION});
})()));

self.addEventListener('message',event=>{
 if(event.data?.type==='PMG_ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());
 if(event.data?.type==='PMG_OFFLINE_STATUS')event.waitUntil((async()=>{event.ports[0]?.postMessage({ready:await complete(),version:VERSION});})());
 if(event.data?.type==='PMG_REPAIR_OFFLINE')event.waitUntil((async()=>{await notify({type:'PMG_OFFLINE_STATUS',preparing:true});try{await download();await notify({type:'PMG_OFFLINE_STATUS',ready:true,version:VERSION});}catch{await notify({type:'PMG_OFFLINE_STATUS',ready:false,error:'Offline repair did not finish. Reconnect and check for an app update before retrying.'});}})());
});

self.addEventListener('fetch',event=>{
 const request=event.request,target=new URL(request.url),root=new URL(self.registration.scope);
 if(request.method!=='GET'||target.origin!==root.origin)return;
 const game=target.pathname===root.pathname||target.pathname===new URL(url('index.html')).pathname;
 const file=FILES.find(file=>new URL(url(file)).pathname===target.pathname);
 if(!game&&!file)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),cached=await cache.match(url(game?'index.html':file));
  if(cached)return cached;
  try{return await fetch(request);}catch(error){
   if(!game)throw error;
   return new Response('<!doctype html><meta name="viewport" content="width=device-width"><title>Potion Maker — reconnect</title><h1>Connect to restore your offline copy</h1><p>The browser no longer has this game cached. Reconnect and reopen Potion Maker. Your saved progress is separate from these offline files.</p>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
  }
 })());
});
