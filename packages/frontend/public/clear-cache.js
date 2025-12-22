// Script para limpar cache e service workers
(function() {
  // Limpar todos os service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }

  // Limpar todos os caches
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }

  // Forçar reload se versão antiga
  const currentVersion = 'v' + Date.now();
  const savedVersion = localStorage.getItem('app_version');

  if (savedVersion && savedVersion !== currentVersion) {
    localStorage.setItem('app_version', currentVersion);
    window.location.reload(true);
  } else if (!savedVersion) {
    localStorage.setItem('app_version', currentVersion);
  }
})();
