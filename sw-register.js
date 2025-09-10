// sw-register.js
(async () => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      if ('periodicSync' in reg) {
        try { await reg.periodicSync.register('sync-checklist', { minInterval: 6*60*60*1000 }); } catch {}
      }
      console.log('SW registered', reg.scope);
    } catch (e) {
      console.warn('SW registration failed', e);
    }
  }
})();
