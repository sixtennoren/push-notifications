self.addEventListener("push", e => {
    const data = e.data ? e.data.json() : {};
    console.log("Push received...", data);
    e.waitUntil(
        self.registration.showNotification(data.title || "Notification", {
            body: data.body || "",
            icon: "https://nodejs.org/static/images/logo.svg"
        })
    );
});
