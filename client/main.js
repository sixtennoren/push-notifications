const publicVapidKey = "BMUCN1KmaOzTkG2k3tNhdQjJWNNWokLHXKt1k9oC3FoRuFopjVw7ZBUKy2YJIOsKyi4EmP5V3SEJzS9DCTFKBmk";

const statusEl = document.getElementById("status");

document.getElementById("subscribe").addEventListener("click", () => {
    subscribe().catch(err => {
        console.error(err);
        statusEl.textContent = "Error: " + err.message;
    });
});

async function subscribe() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        const isStandalone = window.navigator.standalone ||
            window.matchMedia("(display-mode: standalone)").matches;
        if (isIOS && !isStandalone) {
            throw new Error("On iOS: tap Share → 'Add to Home Screen', then open the app from the Home Screen icon and subscribe there (requires iOS 16.4+ and HTTPS).");
        }
        if (!window.isSecureContext) {
            throw new Error("Push requires HTTPS (or localhost).");
        }
        throw new Error("Push is not supported in this browser");
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        throw new Error("Notification permission was " + permission);
    }

    const register = await navigator.serviceWorker.register("/worker.js", { scope: "/" });
    await navigator.serviceWorker.ready;

    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    const res = await fetch("/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: { "content-type": "application/json" }
    });
    const { count } = await res.json();
    statusEl.textContent = `Subscribed! (${count} subscriber(s) on server)`;
}

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
