self.addEventListener("push", e => {
    const data = e.data ? e.data.json() : {};
    console.log("Push received...", data);
    e.waitUntil(
        self.registration.showNotification(data.title || "Notification", {
            body: data.body || "",
            icon: data.icon || "/icons/icon-192.png", // big image next to the text (ignored on iOS)
            badge: "/icons/badge-96.png"             // small monochrome status-bar icon (Android)
        })
    );
});
