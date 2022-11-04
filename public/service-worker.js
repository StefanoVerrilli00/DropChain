const assets = [
    "css/style.css",
    "js/Functions.js",
    "js/main.js",
    "/files/logo-ipfs.png",
    "js/DownloadTrigger.js",
    "Views/home.html",
    "Views/ErrorDownload.ejs",
    "Views/SuccessDownload.ejs"
]

self.addEventListener("install",(e)=>{
    e.waitUntil(
        caches
            .open(assets)
            .then((cache)=>{
                return cache.addAll(assets)
            })
    );
});

self.addEventListener("fetch", function (evt) {
    evt.respondWith(
        caches.match(evt.request).then(function (response){
            return response || fetch(evt.request);
        })
    );
})