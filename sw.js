/* sw.js */
const CACHE = 'nova-v1';
const APP_SHELL = [
  '/', '/index.html', '/planning.html', '/coach.html', '/simulator.html', '/settings.html',
  '/manifest.webmanifest', '/sw-register.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      const res = await fetch(e.request);
      const url = new URL(e.request.url);
      if (url.origin === location.origin) {
        const cache = await caches.open(CACHE);
        cache.put(e.request, res.clone());
      }
      return res;
    } catch {
      const cached = await caches.match(e.request);
      return cached || caches.match('/index.html');
    }
  })());
});

// --- Checklist sync offline ---
const PENDING_KEY = 'nova-pending';
async function getPending(){ const c=await caches.open(CACHE); const r=await c.match(PENDING_KEY); return r? r.json():[]; }
async function setPending(list){ const c=await caches.open(CACHE); await c.put(PENDING_KEY,new Response(JSON.stringify(list),{headers:{'Content-Type':'application/json'}})); }
async function replayPending(){
  const list=await getPending(); const ok=[];
  for(const job of list){ try{ const r=await fetch(job.url,{method:'POST',headers:job.headers,body:job.body}); if(r.ok) ok.push(job.id);}catch{} }
  if(ok.length){ const next=list.filter(j=>!ok.includes(j.id)); await setPending(next); }
}

self.addEventListener('sync', e=>{ if(e.tag==='sync-checklist-pending') e.waitUntil(replayPending()); });
self.addEventListener('periodicsync', e=>{ if(e.tag==='sync-checklist') e.waitUntil(replayPending()); });

self.addEventListener('fetch', (event) => {
  const req=event.request;
  if(req.method==='POST' && req.url.includes('/api/toggle-task')){
    event.respondWith((async()=>{
      try{ return await fetch(req); }
      catch{
        const body=await req.clone().text(); const headers={}; req.headers.forEach((v,k)=>headers[k]=v);
        const jobs=await getPending();
        jobs.push({id:Date.now()+'-'+Math.random().toString(36).slice(2),url:req.url,headers,body});
        await setPending(jobs);
        if('sync' in self.registration){ try{ await self.registration.sync.register('sync-checklist-pending'); }catch{} }
        return new Response(JSON.stringify({ok:true,queued:true}),{status:202,headers:{'Content-Type':'application/json'}});
      }
    })());
  }
});

// --- Push notifications ---
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title:'Nova', body:'Rappel' };
  event.waitUntil(self.registration.showNotification(data.title || 'Nova', {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: data.data || {}
  }));
});
self.addEventListener('notificationclick', (event) => {
  const url=(event.notification.data && event.notification.data.url)||'/coach.html';
  event.notification.close();
  event.waitUntil((async()=>{
    const all=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of all){ if(c.url.includes(url)&&'focus'in c) return c.focus(); }
    return clients.openWindow(url);
  })());
});
