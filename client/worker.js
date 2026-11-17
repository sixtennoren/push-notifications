self.addEventListener("push", e => {
    const data = e.data.json();
    console.log("Push received...");
    self.registration.showNotification(data.title, {
        body: "This is your first push notification!",
        icon: "https://nodejs.org/static/images/logo.svg"
    });
});