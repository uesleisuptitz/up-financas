const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

function registerValidSW(swUrl: string) {
  navigator.serviceWorker.register(swUrl).catch((error) => {
    console.error("Não foi possível registrar o service worker:", error);
  });
}

function checkValidServiceWorker(swUrl: string) {
  fetch(swUrl, { headers: { "Service-Worker": "script" } })
    .then((response) => {
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl);
      }
    })
    .catch(() => undefined);
}

export function register() {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

  const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
  if (publicUrl.origin !== window.location.origin) return;

  window.addEventListener("load", () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    if (isLocalhost) {
      checkValidServiceWorker(swUrl);
    } else {
      registerValidSW(swUrl);
    }
  });
}
