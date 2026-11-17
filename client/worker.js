self.addEventListener("push", e => {
    const data = e.data ? e.data.json() : {};
    console.log("Push received...", data);
    e.waitUntil(
        self.registration.showNotification(data.title || "Notification", {
            body: data.body || "",
            icon: data.icon || "/icons/icon-192.png", // big image next to the text (ignored on iOS)
            badge: "/icons/badge-96.png",            // small monochrome status-bar icon (Android)
            // Notifications with the same tag replace each other, so each channel
            // keeps at most one notification instead of piling up.
            tag: data.channel ? "channel-" + data.channel : undefined,
            // Arbitrary data we get back when the notification is clicked
            data: { channel: data.channel || null }
        })
    );
});

self.addEventListener("notificationclick", e => {
    e.notification.close();
    const channel = e.notification.data && e.notification.data.channel;

    e.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

        // If the app is already open: focus it and tell it which channel was clicked
        if (windows.length > 0) {
            const client = windows[0];
            client.postMessage({ type: "notification-click", channel });
            return client.focus();
        }

        // Otherwise open it, passing the channel in the URL
        const url = channel ? "/?channel=" + encodeURIComponent(channel) : "/";
        return self.clients.openWindow(url);
    })());
});
