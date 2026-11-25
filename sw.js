// Mesada de Marinna: funcionamento offline.
// A cada atualização do app, aumente o número da versão abaixo.
const VERSAO = 'mesada-v1';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n !== VERSAO).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // A página principal busca primeiro na internet (para pegar atualizações) e usa a cópia quando estiver offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(resp => {
      const copia = resp.clone();
      caches.open(VERSAO).then(c => c.put('./index.html', copia));
      return resp;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  // Os demais arquivos usam a cópia guardada.
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
