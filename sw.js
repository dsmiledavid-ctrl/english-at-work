// Works with no network, and a new version replaces the old one when it is published (the reader app's method, D496).
// The page is always fetched fresh when there is a network; sounds come from the copy kept on the device. Safari asks for a sound
// in parts ("Range"); a whole file in reply can leave it silent, so a part is cut from the kept copy and answered as a part (206).
const V = "eaw-22398521", FILES = ["./", "icon-180.png", "icon-192.png", "icon-512.png", "manifest.json", "sounds/s2a.mp3", "sounds/s2b.mp3", "sounds/s3.mp3", "sounds/s4.mp3", "sounds/say1.mp3", "sounds/say2.mp3", "sounds/say3.mp3", "sounds/say4.mp3", "sounds/say5.mp3", "sounds/say6.mp3", "sounds/say7.mp3", "sounds/say8.mp3", "sounds/say9.mp3", "sounds/say10.mp3", "sounds/say11.mp3"];
self.addEventListener("install", e => e.waitUntil(caches.open(V).then(c => c.addAll(FILES.map(f => new Request(f, {cache: "reload"})))).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("eaw-") && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") e.respondWith(fetch(e.request, {cache: "no-store"}).catch(() => caches.match("./", {ignoreSearch: true})));
  else e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(r => {
    const range = /^bytes=(\d*)-(\d*)$/.exec(e.request.headers.get("range") || "");
    if (!r) return fetch(e.request);
    if (!range || (!range[1] && !range[2])) return r;
    return r.arrayBuffer().then(buf => {
      const size = buf.byteLength, a = range[1] ? +range[1] : Math.max(0, size - +range[2]), b = range[1] && range[2] ? Math.min(+range[2], size - 1) : size - 1;
      if (a > b) return new Response(null, {status: 416, headers: {"Content-Range": "bytes */" + size}});
      return new Response(buf.slice(a, b + 1), {status: 206, statusText: "Partial Content", headers: {"Content-Type": r.headers.get("Content-Type") || "audio/mpeg",
        "Content-Range": "bytes " + a + "-" + b + "/" + size, "Content-Length": String(b - a + 1), "Accept-Ranges": "bytes"}});
    });
  }));
});
