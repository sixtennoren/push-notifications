const express = require("express");
const webpush = require("web-push");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

const publicVapidKey = "BMUCN1KmaOzTkG2k3tNhdQjJWNNWokLHXKt1k9oC3FoRuFopjVw7ZBUKy2YJIOsKyi4EmP5V3SEJzS9DCTFKBmk";
const privateVapidKey = "roxaa0f7EDksNRnAkYT3qREoWtpYZfp4NPqtHJJ364w";

webpush.setVapidDetails(
  process.env.DOMAIN || "mailto:demo@example.com",
  publicVapidKey,
  privateVapidKey
);

// In-memory subscription store, keyed by endpoint (lost on restart)
const subscriptions = new Map();

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.set(subscription.endpoint, subscription);
  console.log(`New subscription (${subscriptions.size} total)`);
  res.status(201).json({ count: subscriptions.size });
});

app.post("/fire", async (req, res) => {
  const payload = JSON.stringify({
    title: req.body.title || "Hello from Node.js!",
    body: req.body.body || "This is a push notification!",
  });

  let sent = 0;
  await Promise.all(
    [...subscriptions.values()].map(sub =>
      webpush
        .sendNotification(sub, payload)
        .then(() => sent++)
        .catch(err => {
          console.error("Push failed:", err.statusCode, err.body);
          // Subscription expired or unsubscribed: drop it
          if (err.statusCode === 404 || err.statusCode === 410) {
            subscriptions.delete(sub.endpoint);
          }
        })
    )
  );

  console.log(`Fired to ${sent}/${subscriptions.size} subscribers`);
  res.json({ sent, total: subscriptions.size });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
