if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/yarrow-ai-server/service-worker.js")
    .then(() => console.log("✅ Service Worker enregistré"))
    .catch(err => console.error("❌ Erreur SW:", err));
}
